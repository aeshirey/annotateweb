# AnnotateWeb - Web Page Note Taker

> This is a vibe-coded extension that more or less matches something I manually built back in ~2018. The goal is to have the ability to take notes within your browser that you can refer to later, and each note is associated with a regular expression that matches URLs. These notes are kept in [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), so they're private to you.
> 
> Now on to the AI slop!
> 
> -Adam

A Microsoft Edge browser extension that allows you to take markdown-formatted notes on any webpage with flexible URL pattern matching.

## Features

✨ **Core Features**
- 📝 Create, edit, and delete markdown notes for any webpage
- 🔗 Flexible URL matching with regex support
- 🏷️ Badge notification showing note count on extension icon
- 💾 Local storage - all notes stored privately in your browser
- 📤 Export all notes to JSON
- 📥 Import notes from JSON backup
- 🎨 Beautiful, modern UI with live markdown preview

✨ **Markdown Support**
- Headers, lists, bold, italic
- Links and code blocks
- Blockquotes and more
- Live preview while editing

✨ **URL Matching**
- Default: Exact URL match (excluding query parameters)
- Custom: Define regex patterns for flexible matching
- Match all pages on a domain, specific paths, or multiple domains

## Installation

### For End Users

**Option 1: Install from Browser Store (Recommended)**
- Coming soon! Extension will be available on Chrome Web Store and Microsoft Edge Add-ons

**Option 2: Manual Installation (Developer Mode)**
- See [Development Installation](#development-installation) below

### Development Installation

#### Step 1: Load Extension in Microsoft Edge

1. Open Microsoft Edge
2. Navigate to `edge://extensions/`
3. Enable **Developer mode** (toggle in bottom-left corner)
4. Click **Load unpacked**
5. Select the `AnnotateWeb` folder (this project directory)
6. The extension should now appear in your extensions list

#### Step 2: Pin the Extension (Optional but Recommended)

1. Click the Extensions icon in your toolbar (puzzle piece)
2. Find "AnnotateWeb" in the list
3. Click the pin icon to keep it visible in your toolbar

## Usage

### Creating a Note

1. Navigate to any webpage
2. Click the AnnotateWeb extension icon
3. Click **+ New Note**
4. Fill in:
   - **Title**: A descriptive title for your note
   - **URL**: Pre-filled with current page (read-only)
   - **URL Pattern** (optional): A regex pattern for matching multiple URLs
   - **Content**: Your note in markdown format
5. See live preview as you type
6. Click **Save**

### Viewing Notes

- Click the extension icon on any page
- Notes matching the current URL will be displayed
- Badge on icon shows count of notes for current page
- Notes are sorted by last modified date (newest first)

### Editing Notes

1. Click the ✏️ (edit) button on any note
2. Modify the content
3. Click **Save**

### Deleting Notes

1. Click the 🗑️ (delete) button on any note
2. Confirm the deletion

### Using URL Patterns (Advanced)

URL patterns let you match multiple pages with one note:

**Example patterns:**

1. **All pages on a domain:**
   ```
   ^https?://example\.com/.*
   ```
   Matches: https://example.com/page1, https://example.com/page2

2. **Specific path prefix:**
   ```
   ^https?://example\.com/docs/.*
   ```
   Matches: https://example.com/docs/guide, https://example.com/docs/api

3. **Multiple domains:**
   ```
   ^https?://(www\.)?(example|test)\.com/.*
   ```
   Matches: https://example.com/page, https://test.com/page

**Tips:**
- Leave pattern empty for exact URL matching (default)
- Click "Show examples" in the editor for more patterns
- Pattern validation shows if your regex is valid
- Use online regex testers (regex101.com) to test patterns

### Export/Import Notes

**Export:**
1. Click the **Export** button
2. Save the JSON file to your computer
3. File includes all notes with metadata

**Import:**
1. Click the **Import** button
2. Select a previously exported JSON file
3. Duplicate notes (same ID) are skipped
4. New notes are merged with existing ones

## File Structure

```
AnnotateWeb/
├── manifest.json           # Extension configuration
├── popup/
│   ├── popup.html         # User interface
│   ├── popup.css          # Styling
│   └── popup.js           # UI logic
├── background/
│   └── background.js      # Badge management
├── content/
│   └── content.js         # URL detection
├── lib/
│   ├── storage.js         # Storage operations
│   ├── urlMatcher.js      # URL matching logic
│   └── marked.min.js      # Markdown parser
├── icons/
│   ├── icon.svg           # Source icon
│   ├── icon16.png         # 16x16 icon
│   ├── icon32.png         # 32x32 icon
│   ├── icon48.png         # 48x48 icon
│   └── icon128.png        # 128x128 icon
└── README.md              # This file
```

## Browser Compatibility

**Primary Support:**
- ✅ Microsoft Edge (Chromium-based)

**Also Works:**
- ✅ Google Chrome
- ✅ Brave Browser
- ✅ Opera
- ✅ Any Chromium-based browser

**Note:** Uses Manifest V3 (latest standard)

## Data Storage

- All notes are stored locally using Chrome Storage API
- No data is sent to external servers
- Notes persist across browser sessions
- Notes are stored per browser profile
- Clearing extension data will delete all notes (export first!)

## Troubleshooting

### Extension doesn't load
- Make sure all icon PNG files exist in the `icons/` folder
- Check browser console (F12) for errors
- Verify you're using a Chromium-based browser

### Badge not showing
- Refresh the page after creating notes
- Check that the extension has proper permissions
- Try closing and reopening the browser

### Notes not appearing
- Verify the URL matches the note's URL pattern
- Check browser console for errors
- Try creating a new note on the current page

### Import/Export issues
- Ensure JSON file is properly formatted
- Check that exported file is not corrupted
- Try exporting again if import fails

## Distribution & Packaging

Want to package this extension for distribution? See [`PACKAGING.md`](PACKAGING.md) for detailed instructions on:
- Creating distribution packages for Chrome Web Store, Microsoft Edge Add-ons, and Firefox
- Store submission requirements and processes
- Self-distribution options
- Version management

**Quick Start:**
```bash
npm run package
```

This creates a `annotateweb-v1.0.0.zip` file ready for store submission.

## Development

### Testing Locally

1. Make changes to source files
2. Go to `edge://extensions/`
3. Click the refresh icon on the AnnotateWeb extension
4. Test your changes

### Debugging

- Open DevTools for popup: Right-click extension icon → Inspect
- View background script logs: `edge://extensions/` → Service worker → Inspect
- Check content script: F12 on any webpage → Console

## Privacy & Security

- ✅ No external network requests
- ✅ All data stored locally
- ✅ Markdown sanitization prevents XSS
- ✅ Regex validation for safety
- ✅ No tracking or analytics
- ✅ Open source - review the code yourself

## Limitations

- Notes are per-browser profile (not synced across devices)
- Storage limited by browser's local storage quota (~10MB)
- Cannot access notes on browser internal pages (chrome://, edge://)
- Regex patterns require basic knowledge of regular expressions

## Future Enhancements

Potential features for future versions:
- Cloud sync across devices
- Tags and categories
- Search functionality
- Rich text editor toolbar
- Dark mode theme
- Note sharing capabilities
- Browser sync support

## License

This project is provided as-is for personal use. Feel free to modify and customize for your needs.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the browser console for error messages
3. Ensure all files are present and properly formatted

## Version

Current version: 1.0.0

---

**Happy note-taking! 📝**
