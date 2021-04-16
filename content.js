var data = {
  url: null,
  page: null
};

var stop = false

var loadingIndex = -1

document.addEventListener("contextmenu", (event) => { data = dataOfChildNode(event.target) }, true);

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.name == "getClickedElement") {
    if (data.url) {
      sendResponse(data)
      data.url = null
      data.page = null
    } else {
      alert("文泉学堂下载器：解析图片数据失败。")
    }
  } else if (request.name == "resumeDownload") {
    if (loadingIndex !== -1) {
      forceResume = true
    }
    sendResponse(null)
  }
});

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name == "downloadAll")

  port.onMessage.addListener((message, _) => {
    if (message.forceResume) {
      const currentIndex = loadingIndex
      loadingIndex = -1
      downloadImg(currentIndex, port)
      return
    }

    if (message.stop) {
      stop = true
    } else {
      stop = false
      downloadImg(1, port)
    }
  })
})

function downloadImg(index, port) {
  if (stop) {
    return
  }
  const children = getChildren()
  if (index === children.length - 2) {
    port.postMessage({ finished: true })
    return
  }
  var child = children[index]
  window.scroll(0, findPos(child));
  const data = dataOfChildNode(child)

  if (isValidImgSrc(data.url)) {
    console.log("valid")

    download(data.url, index, port)
    downloadImg(index + 1, port)
  } else {
    console.log("invalid, loading..." + index)
    loadingIndex = index;
    var observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type == "attributes") {
          const newData = dataOfChildNode(child)

          console.log("mutated")
          if (isValidImgSrc(newData.url)) {
            console.log("loading completed")
            observer.disconnect()

            if (loadingIndex !== -1) {
              loadingIndex = -1
              download(newData.url, index, port)
              downloadImg(index + 1, port)
            }
          }
        }
      })
    })

    observer.observe(child, {
      attributes: true
    })

  }
}

function getChildren() {
  var pageBox = document.getElementById("pagebox")
  return pageBox.childNodes
}

function download(url, index, port) {
  console.log("request download")
  port.postMessage({
    url: url,
    index: index
  })
}

function dataOfChildNode(node) {
  return {
    url: node.childNodes[0].getAttribute("src"),
    page: node.getAttribute("index")
  }
}

function isValidImgSrc(src) {
  if (!src) { return false }
  const image = new Image()
  image.src = src
  if (image.width > 400) { return true }
  else { return false }
}

function findPos(obj) {
  var currentTop = 0
  if (obj.offsetParent) {
    do {
      currentTop += obj.offsetTop
    } while (obj = obj.offsetParent)
    return [currentTop]
  }
}