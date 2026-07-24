chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id || !tab.url || !/^https?:/.test(tab.url)) return;

  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["src/styles.css"],
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content.js"],
    });
  } catch (error) {
    console.warn("Alignment Guides could not run on this page.", error);
  }
});
