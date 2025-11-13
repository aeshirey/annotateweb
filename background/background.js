// Background Service Worker - Manages badge updates
importScripts('../lib/storage.js');

const storage = new StorageManager();

// URL Matcher functionality (inline since we can't import ES6 modules in service worker)
class URLMatcher {
  cleanUrl(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (error) {
      console.error('Invalid URL:', url);
      return url;
    }
  }

  matches(note, currentUrl) {
    // If note has a custom URL pattern (regex), use it
    if (note.urlPattern && note.urlPattern.trim() !== '') {
      return this.matchesPattern(note.urlPattern, currentUrl);
    }

    // Default behavior: exact match without query params and hash
    const cleanCurrentUrl = this.cleanUrl(currentUrl);
    const cleanNoteUrl = this.cleanUrl(note.url);
    return cleanCurrentUrl === cleanNoteUrl;
  }

  matchesPattern(pattern, url) {
    try {
      const regex = new RegExp(pattern);
      return regex.test(url);
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error);
      return false;
    }
  }
}

const urlMatcher = new URLMatcher();

// Update badge when tab is activated or updated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  updateBadgeForTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only update when URL changes
  if (changeInfo.url) {
    updateBadgeForTab(tabId);
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateBadge') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        updateBadgeForTab(tabs[0].id);
      }
    });
    sendResponse({ success: true });
  } else if (message.action === 'getNotesCount') {
    getNotesCountForUrl(message.url).then(count => {
      sendResponse({ count });
    });
    return true; // Keep channel open for async response
  }
});

// Update badge for a specific tab
async function updateBadgeForTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      // Don't show badge on browser internal pages
      chrome.action.setBadgeText({ text: '', tabId });
      return;
    }

    const count = await getNotesCountForUrl(tab.url);
    
    if (count > 0) {
      chrome.action.setBadgeText({
        text: count.toString(),
        tabId
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#4CAF50',
        tabId
      });
    } else {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Get count of notes for a URL
async function getNotesCountForUrl(url) {
  try {
    const notes = await storage.getAllNotes();
    const matchingNotes = notes.filter(note => urlMatcher.matches(note, url));
    return matchingNotes.length;
  } catch (error) {
    console.error('Error getting notes count:', error);
    return 0;
  }
}

// Initialize badge on extension load
chrome.runtime.onInstalled.addListener(() => {
  console.log('AnnotateWeb extension installed');
  
  // Update badge for all tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        updateBadgeForTab(tab.id);
      }
    });
  });
});

// Update all badges when storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.notes) {
    // Notes were updated, refresh all badges
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          updateBadgeForTab(tab.id);
        }
      });
    });
  }
});