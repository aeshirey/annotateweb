// Popup UI Controller
import URLMatcher from '../lib/urlMatcher.js';

const storage = new StorageManager();
const urlMatcher = new URLMatcher();

let currentUrl = '';
let editingNoteId = null;

// DOM Elements
const listView = document.getElementById('listView');
const editView = document.getElementById('editView');
const notesList = document.getElementById('notesList');
const emptyState = document.getElementById('emptyState');
const notesCount = document.getElementById('notesCount');
const pageUrlElement = document.getElementById('pageUrl');

// Buttons
const newNoteBtn = document.getElementById('newNoteBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const exportMenuBtn = document.getElementById('exportMenuBtn');
const importMenuBtn = document.getElementById('importMenuBtn');
const importFileInput = document.getElementById('importFileInput');
const backBtn = document.getElementById('backBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const showExamplesBtn = document.getElementById('showExamplesBtn');

// Form elements
const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteUrl = document.getElementById('noteUrl');
const urlPattern = document.getElementById('urlPattern');
const noteContent = document.getElementById('noteContent');
const markdownPreview = document.getElementById('markdownPreview');
const patternValidation = document.getElementById('patternValidation');
const patternExamples = document.getElementById('patternExamples');
const examplesList = document.getElementById('examplesList');
const editTitle = document.getElementById('editTitle');

// Initialize
async function init() {
  try {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tab.url;
    
    // Display current URL
    const cleanUrl = urlMatcher.getCleanUrlForStorage(currentUrl);
    pageUrlElement.textContent = cleanUrl;
    pageUrlElement.title = currentUrl;
    
    // Load and display notes
    await loadNotes();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load regex examples
    loadRegexExamples();
  } catch (error) {
    console.error('Initialization error:', error);
    notesList.innerHTML = '<div class="loading">Error loading extension</div>';
  }
}

// Load and display notes for current URL
async function loadNotes() {
  try {
    const notes = await storage.getNotesForUrl(currentUrl);
    
    if (notes.length === 0) {
      notesList.style.display = 'none';
      emptyState.style.display = 'block';
      notesCount.textContent = '0 notes for this page';
    } else {
      notesList.style.display = 'block';
      emptyState.style.display = 'none';
      notesList.innerHTML = notes.map(note => createNoteCard(note)).join('');
      notesCount.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''} for this page`;
      
      // Add event listeners to note cards
      notes.forEach(note => {
        const editBtn = document.querySelector(`[data-edit-id="${note.id}"]`);
        const deleteNoteBtn = document.querySelector(`[data-delete-id="${note.id}"]`);
        
        if (editBtn) {
          editBtn.addEventListener('click', () => editNote(note.id));
        }
        if (deleteNoteBtn) {
          deleteNoteBtn.addEventListener('click', () => deleteNote(note.id));
        }
      });
    }
    
    // Notify background script to update badge
    chrome.runtime.sendMessage({ action: 'updateBadge' });
  } catch (error) {
    console.error('Error loading notes:', error);
    notesList.innerHTML = '<div class="loading">Error loading notes</div>';
  }
}

// Create HTML for a note card
function createNoteCard(note) {
  const timeAgo = getTimeAgo(new Date(note.lastModified));
  const preview = renderMarkdownPreview(note.content);
  const hasPattern = note.urlPattern && note.urlPattern.trim() !== '';
  
  return `
    <div class="note-card">
      <div class="note-header">
        <div class="note-title">${escapeHtml(note.title)}</div>
        <div class="note-actions">
          <button class="note-action-btn" data-edit-id="${note.id}" title="Edit">✏️</button>
          <button class="note-action-btn" data-delete-id="${note.id}" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="note-meta">
        Last modified: ${timeAgo}${hasPattern ? ' • Custom URL pattern' : ''}
      </div>
      <div class="note-preview">${preview}</div>
    </div>
  `;
}

// Render markdown preview (full content)
function renderMarkdownPreview(markdown) {
  try {
    const html = marked.parse(markdown);
    return html;
  } catch (error) {
    return escapeHtml(markdown);
  }
}

// Strip HTML tags
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get time ago string
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

// Setup event listeners
function setupEventListeners() {
  newNoteBtn.addEventListener('click', createNewNote);
  
  // Settings menu toggle
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
  });
  
  // Close settings menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
      settingsMenu.style.display = 'none';
    }
  });
  
  // Settings menu actions
  exportMenuBtn.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
    exportNotes();
  });
  
  importMenuBtn.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
    importFileInput.click();
  });
  
  importFileInput.addEventListener('change', importNotes);
  
  backBtn.addEventListener('click', showListView);
  cancelBtn.addEventListener('click', showListView);
  saveBtn.addEventListener('click', saveNote);
  deleteBtn.addEventListener('click', deleteCurrentNote);
  
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });
  
  // URL pattern validation
  urlPattern.addEventListener('input', validateUrlPattern);
  
  // Markdown preview
  noteContent.addEventListener('input', updateMarkdownPreview);
  
  // Show/hide regex examples
  showExamplesBtn.addEventListener('click', () => {
    patternExamples.style.display = 
      patternExamples.style.display === 'none' ? 'block' : 'none';
  });
}

// Load regex examples
function loadRegexExamples() {
  const examples = urlMatcher.getExamplePatterns();
  examplesList.innerHTML = examples.map(ex => `
    <li>
      <strong>${ex.description}</strong>
      <code>${ex.pattern}</code>
      <div class="example">${ex.example}</div>
    </li>
  `).join('');
}

// Validate URL pattern
function validateUrlPattern() {
  const pattern = urlPattern.value.trim();
  const validation = urlMatcher.validatePattern(pattern);
  
  patternValidation.textContent = validation.message;
  patternValidation.className = `validation-message ${validation.valid ? 'valid' : 'invalid'}`;
  
  if (pattern === '') {
    patternValidation.style.display = 'none';
  } else {
    patternValidation.style.display = 'block';
  }
}

// Update markdown preview
function updateMarkdownPreview() {
  const content = noteContent.value;
  if (content.trim() === '') {
    markdownPreview.innerHTML = '<p class="text-muted">Start typing to see preview...</p>';
  } else {
    try {
      const html = marked.parse(content);
      markdownPreview.innerHTML = html;
    } catch (error) {
      markdownPreview.innerHTML = '<p class="text-muted">Error rendering preview</p>';
    }
  }
}

// Show list view
function showListView() {
  listView.style.display = 'block';
  editView.style.display = 'none';
  editingNoteId = null;
  noteForm.reset();
  patternExamples.style.display = 'none';
  loadNotes();
}

// Create new note
function createNewNote() {
  editingNoteId = null;
  editTitle.textContent = 'New Note';
  deleteBtn.style.display = 'none';
  
  noteTitle.value = '';
  noteUrl.value = urlMatcher.getCleanUrlForStorage(currentUrl);
  urlPattern.value = '';
  noteContent.value = '';
  
  updateMarkdownPreview();
  validateUrlPattern();
  
  listView.style.display = 'none';
  editView.style.display = 'block';
  noteTitle.focus();
}

// Edit existing note
async function editNote(id) {
  const note = await storage.getNoteById(id);
  if (!note) {
    alert('Note not found');
    return;
  }
  
  editingNoteId = id;
  editTitle.textContent = 'Edit Note';
  deleteBtn.style.display = 'inline-block';
  
  noteTitle.value = note.title;
  noteUrl.value = note.url;
  urlPattern.value = note.urlPattern || '';
  noteContent.value = note.content;
  
  updateMarkdownPreview();
  validateUrlPattern();
  
  listView.style.display = 'none';
  editView.style.display = 'block';
  noteTitle.focus();
}

// Save note
async function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  const pattern = urlPattern.value.trim();
  
  if (!title || !content) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Validate pattern if provided
  if (pattern) {
    const validation = urlMatcher.validatePattern(pattern);
    if (!validation.valid) {
      alert('Invalid URL pattern: ' + validation.message);
      return;
    }
  }
  
  try {
    if (editingNoteId) {
      // Update existing note
      await storage.updateNote(editingNoteId, {
        title,
        content,
        urlPattern: pattern || null
      });
    } else {
      // Create new note
      await storage.addNote({
        url: noteUrl.value,
        title,
        content,
        urlPattern: pattern || null
      });
    }
    
    showListView();
  } catch (error) {
    console.error('Error saving note:', error);
    alert('Error saving note. Please try again.');
  }
}

// Delete current note (from edit view)
async function deleteCurrentNote() {
  if (!editingNoteId) return;
  
  if (confirm('Are you sure you want to delete this note?')) {
    await deleteNote(editingNoteId);
    showListView();
  }
}

// Delete a note
async function deleteNote(id) {
  if (confirm('Are you sure you want to delete this note?')) {
    try {
      await storage.deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note. Please try again.');
    }
  }
}

// Export notes
async function exportNotes() {
  try {
    const json = await storage.exportNotes();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotateweb-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting notes:', error);
    alert('Error exporting notes. Please try again.');
  }
}

// Import notes
async function importNotes(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const result = await storage.importNotes(text, 'skip');
    
    if (result.success) {
      alert(`Successfully imported ${result.imported} note(s)${result.skipped > 0 ? `. Skipped ${result.skipped} duplicate(s)` : ''}.`);
      await loadNotes();
    } else {
      alert('Error importing notes: ' + result.error);
    }
  } catch (error) {
    console.error('Error importing notes:', error);
    alert('Error importing notes. Please check the file format.');
  } finally {
    importFileInput.value = '';
  }
}

// Initialize on load
init();