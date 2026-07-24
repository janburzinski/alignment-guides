# Alignment Guides

A tiny, open-source browser extension for checking visual alignment directly on any web page. It has no dependencies, build step, tracking, or network requests.

## Install with an agent

Copy and paste this prompt into an agent that can control your computer:

> Install https://github.com/janburzinski/alignment-guides as an unpacked extension in my preferred browser and verify it on a normal web page.

## Install manually

1. [Download this repository](https://github.com/janburzinski/alignment-guides/archive/refs/heads/main.zip) and unzip it, or clone it with `git clone https://github.com/janburzinski/alignment-guides.git`.
2. Open `chrome://extensions` in Chrome, Helium, Brave, Edge, or another Chromium browser.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the repository folder containing `manifest.json`.
5. Pin **Alignment Guides**, open any regular `http` or `https` page, and click the toolbar icon.

Keep the repository folder after installation—the browser loads the extension from that location. To update a cloned copy, run `git pull` and click the extension's reload button on `chrome://extensions`.

## Use it

- Drag from the top ruler for a horizontal guide or from the left ruler for a vertical guide.
- Use **+ Vertical** or **+ Horizontal** to create a centered guide.
- Drag any guide to reposition it; double-click it to remove it.
- Turn on **Auto align** to find shared edges and centers among visible elements. Automatic guides update as the page changes, scrolls, resizes, or finishes loading fonts.
- Click **Clear** to remove all guides, or click the extension icon again to close the overlay.

Browser-internal pages such as `chrome://extensions` and extension-store pages do not allow extensions to inject tools. Use Alignment Guides on a normal website instead.

## Permissions and privacy

Alignment Guides requests only `activeTab` and `scripting`. It can inspect the current page only after you click its toolbar icon. Everything runs locally in your browser; it does not collect, store, or transmit data.

## Development

There are no dependencies and no build step. Edit the files in `src/`, then click the reload button on the extension card in `chrome://extensions` and reactivate it on the page.

Contributions and bug reports are welcome. Please keep changes focused and preserve the extension's dependency-free setup.

## License

[MIT](LICENSE) © Jan Burzinski
