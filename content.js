var data = {
    url: null,
    page: null
};

document.addEventListener("contextmenu", (event) => {
    data.url = event.target.childNodes[0].getAttribute("src")
    data.page = event.target.getAttribute("index")
}, true);

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request == "getClickedElement") {
        if (data.url) {
            sendResponse(data)
            data.url = null
            data.page = null
        } else {
            alert("文泉学堂下载器：解析图片数据失败。")
        }
    }
});
