// 全域變數
var api_key = null    // 設為全域變數，稍後向外部請求翻譯時還會用到。
chrome.storage.local.get('api_key', r => {
    api_key = r.api_key
});

// 回應【網頁內容】或【彈出頁面】送過來的請求
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.cmd == 'api_key') {
        api_key = message.data.api_key
        chrome.storage.local.set({api_key: api_key})
        sendResponse(api_key);    // 再把同樣的 api_key 當做回應送回去
    }
    else if (message.cmd == 'remove_api_key') {
        api_key = null
        chrome.storage.local.remove('api_key')
    }
    else if (message.cmd == 'get_google_translation_V2') {
        var sent_html = message.data.sent_html

        if (api_key) {
            getGoogleTranslationV2(api_key, sent_html)
            .then((tran_sent_html)=> {
                // 取得譯文之後...
                // 再次運用 sendMessage 機制，把譯文送回去。
                // 不過這次不需要再用 chrome.tabs.query()，
                // 因為我們從 sender 就知道請求是誰送過來的，翻譯結果當然要送回去給它才對。
                chrome.tabs.sendMessage(sender.tab.id, {cmd: 'tran_sent_html', data: {tran_sent_html: tran_sent_html}}, (response) => {
                    // 其實送回翻譯結果，就不用再關注回應了。最多就是確認那邊有收到而已。
                    console.log(response)
                });
            })
            sendResponse('已向外部請求翻譯。。。')
        }
        else {
            sendResponse('API_KEY 是空的。。。請先設定正確的 API_KEY！')
        }
    }
});

async function getGoogleTranslationV2(api_key, text, tar_lang='zh-TW') {
    promise = fetch(`https://translation.googleapis.com/language/translate/v2?key=${api_key}`, 
        {method: 'post', body: JSON.stringify({ q: text, target: tar_lang })})
    .then(r=>r.json())
    .then(r=>r.data.translations[0].translatedText);

    return promise
}