const MENU_ID = "WQ_DOWNLOADER"

chrome.contextMenus.create({
  id: MENU_ID,
  title: "下载当前页面",
  documentUrlPatterns: [
    "https://lib-tsinghua.wqxuetang.com/*", 
    "https://wqxuetang.com/*"
  ]
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.tabs.sendMessage(tab.id, "getClickedElement", { frameId: info.frameId }, (data) => {
    if (info.menuItemId != MENU_ID) { return }
    if (data.url) {
      var url = tab.url
      var numIndex = 1
      while (!isNaN(parseInt(url.substring(url.length - numIndex, url.length)))) {
        numIndex++
      }
      const bookId = url.substring(url.length - numIndex + 1, url.length)
      chrome.downloads.download({
        url: data.url,
        filename: "文泉学堂-" + bookId + "-" + data.page + ".jpeg"
      });
    }
  });
})
