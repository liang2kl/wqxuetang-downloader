const DOWNLOAD_CURRENT_MENU = "DOWNLOAD_CURRENT_MENU"
const DOWNLOAD_ALL_MENU = "DOWNLOAD_ALL_MENU"
const DOWNLOAD_FROM_MENU = "DOWNLOAD_FROM_MENU"
const DOWNLOAD_FROM_CURRENT_MENU = "DOWNLOAD_FROM_CURRENT_MENU"
const TRY_FIX_MENU = "TRY_FIX_MENU"

const patterns = [
  "https://lib-tsinghua.wqxuetang.com/*",
  "https://wqxuetang.com/*"
]

var stop = false

chrome.contextMenus.create({
  id: DOWNLOAD_CURRENT_MENU,
  title: "下载当前页面",
  documentUrlPatterns: patterns
})


chrome.contextMenus.create({
  id: DOWNLOAD_ALL_MENU,
  title: "下载所有",
  documentUrlPatterns: patterns,
  contexts: ["all"]
})

chrome.contextMenus.create({
  id: DOWNLOAD_FROM_MENU,
  title: "从特定页面开始下载",
  documentUrlPatterns: patterns,
  contexts: ["all"],
})

chrome.contextMenus.create({
  id: DOWNLOAD_FROM_CURRENT_MENU,
  title: "从当前页面开始下载",
  documentUrlPatterns: patterns,
  contexts: ["all"],
})

chrome.contextMenus.create({
  id: TRY_FIX_MENU,
  title: "继续下载（若遇到停止下载的情况）",
  documentUrlPatterns: patterns,
  contexts: ["all"],
  enabled: false
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const bookId = getBookId(tab.url)

  if (info.menuItemId == DOWNLOAD_CURRENT_MENU) {
    chrome.tabs.sendMessage(tab.id, { name: "getClickedElement" }, null, (data) => {
      if (data.url) {

        chrome.downloads.download({
          url: data.url,
          filename: "文泉学堂-" + bookId + "-" + data.page + "页.jpeg"
        });
      }
    });
  } else {
    var port = chrome.tabs.connect(tab.id, { name: "downloadAll" })

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

    if (info.menuItemId == DOWNLOAD_ALL_MENU) {
      if (stop) {
        reverseDownloadState(true)
        port.postMessage({
          stop: true
        })
        return
      }

      port.postMessage({ stop: false })
      reverseDownloadState(false)

    } else if (info.menuItemId == TRY_FIX_MENU) {
      port.postMessage({
        forceResume: true
      })
    } else if (info.menuItemId == DOWNLOAD_FROM_MENU) {
      port.postMessage({ stop: false, from: true })
      reverseDownloadState(false)
    } else if (info.menuItemId == DOWNLOAD_FROM_CURRENT_MENU) {
      port.postMessage({ stop: false, fromCurrent: true })
      reverseDownloadState(false)
    }
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
    chrome.contextMenus.update(TRY_FIX_MENU, {
      enabled: false
    })
    chrome.contextMenus.update(DOWNLOAD_FROM_MENU, {
      enabled: true
    })
    chrome.contextMenus.update(DOWNLOAD_FROM_CURRENT_MENU, {
      enabled: true
    })

  } else {
    chrome.contextMenus.update(DOWNLOAD_ALL_MENU, {
      title: "停止下载",
    }, () => { stop = true })
    chrome.contextMenus.update(TRY_FIX_MENU, {
      enabled: true
    })
    chrome.contextMenus.update(DOWNLOAD_FROM_MENU, {
      enabled: false
    })
    chrome.contextMenus.update(DOWNLOAD_FROM_CURRENT_MENU, {
      enabled: false
    })
  }
}

chrome.tabs.onUpdated.addListener(() => {
  reverseDownloadState(true)
})