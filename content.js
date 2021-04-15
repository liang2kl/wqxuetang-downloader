var data = {
    url: null,
    page: null
};

document.addEventListener("contextmenu", (event) => {
    data.url = event.target.childNodes[0].getAttribute("src");
    data.page = event.target.getAttribute("index")
}, true);

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request == "getClickedElement") {
        sendResponse(data);
    }
});
