# AnnotateWeb - Quick Start Guide

## Installation

### 1. Load in Edge
1. Open Edge → `edge://extensions/`
2. Enable "Developer mode" (bottom-left)
3. Click "Load unpacked"
4. Select this folder (`AnnotateWeb`)
5. Done! ✅

### 2. Test It
1. Visit any webpage (e.g., https://example.com)
2. Click the AnnotateWeb icon in your toolbar
3. Click "+ New Note"
4. Write a note with markdown
5. Click "Save"
6. See the badge showing "1" on the icon

## Basic Usage

### Create Note
1. Click extension icon
2. Click "+ New Note"
3. Fill in title and content (markdown supported)
4. Click "Save"

### Edit Note
- Click ✏️ on any note
- Make changes
- Click "Save"

### Delete Note
- Click 🗑️ on any note
- Confirm deletion

### Export/Import
- **Export:** Click "Export" button → Save JSON file
- **Import:** Click "Import" button → Select JSON file

## Markdown Examples

```markdown
# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

1. Numbered item
2. Another item

[Link text](https://example.com)

`code snippet`

> Blockquote
```

## URL Pattern Examples

**Leave empty** for exact URL match (default)

**Match entire domain:**
```regex
^https?://example\.com/.*
```

**Match specific path:**
```regex
^https?://example\.com/docs/.*
```

**Match multiple domains:**
```regex
^https?://(example|test)\.com/.*
```

Click "Show examples" in the editor for more patterns!

## Troubleshooting

**Extension won't load?**
- Make sure icon PNG files exist in `icons/` folder
- Check Developer mode is enabled
- Try refreshing the extensions page

**Badge not showing?**
- Refresh the webpage
- Close and reopen the browser

**Notes not appearing?**
- Check the URL matches your note's URL pattern
- Try creating a new note on the current page

## File Locations

```
AnnotateWeb/
├── manifest.json          # Extension config
├── popup/                 # User interface
├── background/            # Badge logic
├── content/               # URL detection
├── lib/                   # Core utilities
└── icons/                 # Extension icons
```

## Need Help?

1. Check README.md for full documentation
2. Check browser console (F12) for errors

---

**That's it! Start taking notes on any webpage! 📝**