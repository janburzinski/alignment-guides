# Alignment Guides

A lightweight Chrome/Chromium extension for checking visual alignment directly on any web page.

## Features

- Drag horizontal guides from the top ruler.
- Drag vertical guides from the left ruler.
- Reposition any guide by dragging it.
- Dragging an automatic guide pins it as a manual guide.
- Double-click a guide to remove it.
- **Auto align** is a live mode that finds frequently shared edges and centers among visible page elements.
- Live guides update after scrolling, resizing, font loading, and page DOM or style changes.
- Runs only when activated for the current page; no broad site access is required.

## Install in Helium or Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder.
5. Pin **Alignment Guides** and click its toolbar icon on any `http` or `https` page.

Clicking the toolbar icon again removes the overlay.

## Development

There is no build step. After changing a file, click the reload button on the extension card in `chrome://extensions`, then reactivate it on the page.
