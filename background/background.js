// 全域變數
var api_key = null    // 設為全域變數，稍後向外部請求翻譯時還會用到。
// 回應【網頁內容】或【彈出頁面】送過來的請求
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.cmd == 'api_key') {
        api_key = message.data.api_key
        sendResponse(api_key);    // 再把同樣的 api_key 當做回應送回去
    }
});
