// Storage Manager - Handles all Chrome Storage API operations
class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'notes';
  }

  // Get all notes from storage
  async getAllNotes() {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  // Save all notes to storage
  async saveAllNotes(notes) {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: notes });
      return true;
    } catch (error) {
      console.error('Error saving notes:', error);
      return false;
    }
  }

  // Add a new note
  async addNote(note) {
    const notes = await this.getAllNotes();
    const newNote = {
      id: this.generateId(),
      url: note.url,
      urlPattern: note.urlPattern || null,
      title: note.title,
      content: note.content,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    notes.push(newNote);
    await this.saveAllNotes(notes);
    return newNote;
  }

  // Update an existing note
  async updateNote(id, updates) {
    const notes = await this.getAllNotes();
    const index = notes.findIndex(note => note.id === id);
    if (index === -1) {
      return null;
    }
    notes[index] = {
      ...notes[index],
      ...updates,
      lastModified: new Date().toISOString()
    };
    await this.saveAllNotes(notes);
    return notes[index];
  }

  // Delete a note
  async deleteNote(id) {
    const notes = await this.getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    await this.saveAllNotes(filteredNotes);
    return filteredNotes.length < notes.length;
  }

  // Get notes matching a URL
  async getNotesForUrl(url) {
    const notes = await this.getAllNotes();
    const URLMatcher = new (await import('./urlMatcher.js')).default();
    const matchingNotes = notes.filter(note => 
      URLMatcher.matches(note, url)
    );
    // Sort by lastModified descending (most recent first)
    return matchingNotes.sort((a, b) => 
      new Date(b.lastModified) - new Date(a.lastModified)
    );
  }

  // Get a single note by ID
  async getNoteById(id) {
    const notes = await this.getAllNotes();
    return notes.find(note => note.id === id);
  }

  // Export all notes as JSON
  async exportNotes() {
    const notes = await this.getAllNotes();
    return JSON.stringify(notes, null, 2);
  }

  // Import notes from JSON
  async importNotes(jsonString, mergeStrategy = 'skip') {
    try {
      const importedNotes = JSON.parse(jsonString);
      
      // Validate structure
      if (!Array.isArray(importedNotes)) {
        throw new Error('Invalid format: expected an array of notes');
      }

      const existingNotes = await this.getAllNotes();
      const existingIds = new Set(existingNotes.map(n => n.id));
      
      let addedCount = 0;
      const validNotes = importedNotes.filter(note => {
        // Validate required fields
        if (!note.id || !note.url || !note.title || !note.content) {
          return false;
        }
        
        // Handle duplicates based on strategy
        if (existingIds.has(note.id)) {
          if (mergeStrategy === 'skip') {
            return false;
          } else if (mergeStrategy === 'replace') {
            // Remove existing note
            const index = existingNotes.findIndex(n => n.id === note.id);
            if (index !== -1) {
              existingNotes.splice(index, 1);
            }
          }
        }
        addedCount++;
        return true;
      });

      const mergedNotes = [...existingNotes, ...validNotes];
      await this.saveAllNotes(mergedNotes);
      
      return {
        success: true,
        imported: addedCount,
        skipped: importedNotes.length - addedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate unique ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clear all notes (for testing)
  async clearAllNotes() {
    await this.saveAllNotes([]);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}