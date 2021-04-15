const DOWNLOAD_CURRENT_MENU = "DOWNLOAD_CURRENT_MENU"
const DOWNLOAD_ALL_MENU = "DOWNLOAD_ALL_MENU"

const patterns = [
  "https://lib-tsinghua.wqxuetang.com/*",
  "https://wqxuetang.com/*"
]

chrome.contextMenus.create({
  id: DOWNLOAD_CURRENT_MENU,
  title: "下载当前页面",
  documentUrlPatterns: patterns
})

var stop = false

chrome.contextMenus.create({
  id: DOWNLOAD_ALL_MENU,
  title: "下载所有",
  documentUrlPatterns: patterns,
  contexts: ["all"]
})


chrome.contextMenus.onClicked.addListener((info, tab) => {
  const bookId = getBookId(tab.url)

  if (info.menuItemId == DOWNLOAD_CURRENT_MENU) {
    chrome.tabs.sendMessage(tab.id, {name: "getClickedElement"}, null, (data) => {
      if (data.url) {
        chrome.downloads.download({
          url: data.url,
          filename: "文泉学堂-" + bookId + "-" + data.page + "页.jpeg"
        });
      }
    });
  } else if (info.menuItemId == DOWNLOAD_ALL_MENU) { 
    var port = chrome.tabs.connect(tab.id, { name: "downloadAll" })

    if (stop) {
      reverseDownloadState(true)
      port.postMessage({
        stop: true
      })
      return
    }

    port.postMessage({stop: false})

    port.onMessage.addListener((message, _) => {
      if (message.finished) {
        reverseDownloadState(true)
      }
      if (message.url) {
        chrome.downloads.download({
          url: message.url,
          filename: "文泉学堂-" + bookId + "/" + message.index + ".jpeg"
        });
      }
    })

    reverseDownloadState(false)

  }

})

getBookId = (url) => {
  var numIndex = 1
  while (!isNaN(parseInt(url.substring(url.length - numIndex, url.length)))) {
    numIndex++
  }
  const bookId = url.substring(url.length - numIndex + 1, url.length)
  return bookId
}

reverseDownloadState = (_stop) => {
  if (_stop) {
    chrome.contextMenus.update(DOWNLOAD_ALL_MENU, {
      title: "下载所有",
      documentUrlPatterns: patterns,
      contexts: ["all"]
    }, () => { stop = false })
  } else {
    chrome.contextMenus.update(DOWNLOAD_ALL_MENU, {
      title: "停止下载",
    }, () => { stop = true })
  }
}

chrome.tabs.onUpdated.addListener(() => {
  reverseDownloadState(true)
})