
// This file is for the Chrome Extension build
// In the web preview, this code is not executed directly but serves as the source.

export {}; // Make this a module

declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "improve-text",
    title: "Improve with PrivatePen",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info: any, tab: any) => {
  if (info.menuItemId === "improve-text" && tab?.id) {
    // Open side panel
    chrome.sidePanel.open({ windowId: tab.windowId });
    // In a real app, we'd send the selection to the sidepanel via runtime.sendMessage
    setTimeout(() => {
        chrome.runtime.sendMessage({
            action: "AnalyzeSelection",
            text: info.selectionText
        });
    }, 500);
  }
});

chrome.commands.onCommand.addListener((command: string) => {
  if (command === "open-sidepanel") {
    // Logic to open sidepanel handled by manifest 'default_path' often, 
    // or explicit open call if specific context needed
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        if (tabs[0].id) {
             chrome.sidePanel.open({ windowId: tabs[0].windowId });
        }
    });
  }
});
