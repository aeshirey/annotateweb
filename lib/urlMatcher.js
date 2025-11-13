// URL Matcher - Handles URL matching logic with regex support
export default class URLMatcher {
  constructor() {
    // Clean URL by removing query parameters and hash
    this.cleanUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      } catch (error) {
        console.error('Invalid URL:', url);
        return url;
      }
    };
  }

  // Check if a note matches the given URL
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

  // Test if URL matches a regex pattern
  matchesPattern(pattern, url) {
    try {
      const regex = new RegExp(pattern);
      return regex.test(url);
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error);
      return false;
    }
  }

  // Validate a regex pattern
  validatePattern(pattern) {
    if (!pattern || pattern.trim() === '') {
      return { valid: true, message: 'No pattern specified (will use exact URL match)' };
    }

    try {
      new RegExp(pattern);
      return { valid: true, message: 'Valid regex pattern' };
    } catch (error) {
      return { valid: false, message: `Invalid regex: ${error.message}` };
    }
  }

  // Get example patterns for user reference
  getExamplePatterns() {
    return [
      {
        description: 'Match all pages on a domain',
        pattern: '^https?://example\\.com/.*',
        example: 'Matches: https://example.com/page1, https://example.com/page2'
      },
      {
        description: 'Match specific path prefix',
        pattern: '^https?://example\\.com/docs/.*',
        example: 'Matches: https://example.com/docs/guide, https://example.com/docs/api'
      },
      {
        description: 'Match multiple domains',
        pattern: '^https?://(www\\.)?(example|test)\\.com/.*',
        example: 'Matches: https://example.com/page, https://test.com/page'
      },
      {
        description: 'Match any HTTPS page',
        pattern: '^https://.*',
        example: 'Matches: all HTTPS URLs'
      }
    ];
  }

  // Clean URL for storage (remove query and hash)
  getCleanUrlForStorage(url) {
    return this.cleanUrl(url);
  }
}