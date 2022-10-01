
// 回應【網頁內容】或【彈出頁面】送過來的請求
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.cmd == 'get_google_translation_V2') {
        var sent_html = message.data.sent_html
        
        chrome.storage.local.get('api_key', r => {
            if (r.api_key) {
                // 注意！Promise 裡的 Promise。。。Promise chain...
                return getGoogleTranslationV2(r.api_key, sent_html)
                .then((tran_sent_html)=> {
                    // 取得譯文之後...
                    // 再次運用 sendMessage 機制，把譯文送回去。
                    // 不過這次不需要再用 chrome.tabs.query()，
                    // 因為我們從 sender 就知道請求是誰送過來的，翻譯結果當然要送回去給它才對。
                    chrome.tabs.sendMessage(
                        sender.tab.id,
                        {
                            cmd: 'tran_sent_html',
                            data: {tran_sent_html: tran_sent_html}
                        }
                    );
                })
            }
            else {
                msg = '找不到 API_KEY...請先設定好您的 API_KEY！'
                console.log(msg)
                sendResponse(msg)
            }
        });
    }
});

async function getGoogleTranslationV2(api_key, text, tar_lang='zh-TW') {
    promise = fetch(`https://translation.googleapis.com/language/translate/v2?key=${api_key}`, 
        {method: 'post', body: JSON.stringify({ q: text, target: tar_lang })})
    .then(r=>r.json())
    .then(r=>r.data.translations[0].translatedText);

    return promise
}