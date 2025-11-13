// Content Script - Runs on all web pages
// Detects URL changes and communicates with background script

// Send current URL to background script when page loads
function notifyPageLoad() {
  chrome.runtime.sendMessage({
    action: 'updateBadge',
    url: window.location.href
  });
}

// Listen for URL changes (for single-page applications)
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    notifyPageLoad();
  }
});

// Start observing
observer.observe(document, { subtree: true, childList: true });

// Initial notification
notifyPageLoad();

// Listen for history API changes
window.addEventListener('popstate', notifyPageLoad);

// Intercept pushState and replaceState
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
  originalPushState.apply(this, args);
  notifyPageLoad();
};

history.replaceState = function(...args) {
  originalReplaceState.apply(this, args);
  notifyPageLoad();
};