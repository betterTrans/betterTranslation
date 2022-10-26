
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
                    if (tran_sent_html) {
                        chrome.tabs.sendMessage(
                            sender.tab.id,
                            {
                                cmd: 'tran_sent_html',
                                data: {tran_sent_html: tran_sent_html}
                            }
                        );
                    }
                });
            }
            else {
                msg = '找不到 API_KEY...請先設定好您的 API_KEY！'
                console.log(msg)
                sendResponse(msg)
            }
        });
    }
    else if (message.cmd == "dict_search") {
        if ("query_str" in message.data) {
            // 把單詞送出去查詢詞義
            url = "https://tw.dictionary.search.yahoo.com/search?q="+encodeURIComponent(message.data.query_str);
            fetch(url)
            .then(r=>r.text())
            .then((response) => {
                // console.log(response)
                chrome.tabs.sendMessage(sender.tab.id, {cmd: 'dict_search_result', data: {
                    response: response,
                }});
            })
            .catch(e=>{
                // 與遠端連線出問題！！
                // console.error(e)
            });
        }
    }
    else if (message.cmd == 'save_term') {
        chrome.tabs.sendMessage(sender.tab.id, {cmd: 'save_term', data: message.data});
        simple_fetch('http://localhost/api/save_term', message.data)
        //*
        .then(function(response) {
            if (!response) {
                // 之前已先從 localStorage 快取資料來使用了。
                // 向外部取資料沒成功的話，就用 localStorage 裡的資料即可。

                // 但其實【本機】資料已修改，但【遠端】沒修改到，照說應該在可連線時檢查兩邊的資料並進行同步操作才對！！
                // 最好當然是能【自動同步更新】，但如果太麻煩，也可以採用【被動觸發同步更新】做為階段性的做法
                chrome.tabs.sendMessage(sender.tab.id, { cmd: 'fetch_fail_use_localStorage' });
            }
        })
        //*/
    }
    else if (message.cmd == 'delete_term') {
        chrome.tabs.sendMessage(sender.tab.id, {cmd: 'delete_term', data: message.data});
        simple_fetch('http://localhost/api/delete_term', message.data)
        //*
        .then(function(response) {
            if (!response) {
                // 之前已先從 localStorage 快取資料來使用了。
                // 向外部取資料沒成功的話，就用 localStorage 裡的資料即可。

                // 但其實【本機】資料已修改，但【遠端】沒修改到，照說應該在可連線時檢查兩邊的資料並進行同步操作才對！！
                // 最好當然是能【自動同步更新】，但如果太麻煩，也可以採用【被動觸發同步更新】做為階段性的做法
                chrome.tabs.sendMessage(sender.tab.id, { cmd: 'fetch_fail_use_localStorage' });
            }
        })
        //*/
    }
    else if (message.cmd == 'get_terms') {
        if ("tokens" in message.data) {
            simple_fetch('http://localhost/api/get_terms', message.data)
            .then(function(response) {
                if (response) {
                    // 把詞語結果送回【原始頁面】
                    chrome.tabs.sendMessage(sender.tab.id, {
                        cmd: 'return_terms',
                        data: {
                            saved_terms: response['saved_terms'],
                        }
                    });
                }
                else {
                    chrome.tabs.sendMessage(sender.tab.id, { cmd: 'fetch_fail_use_localStorage' });
                }
            })
        }
    }
    else if (message.cmd == "get_syntax_result") {  //取回句子的語法分析結果
        if ("sentence" in message.data) {
            // 把句子送出去進行語法分析
            simple_fetch('http://localhost/api/syntax', message.data)
            .then(function(response) {
                if (response) {
                    // 把語法分析結果送回【原始頁面】
                    chrome.tabs.sendMessage(sender.tab.id, {
                        cmd: 'return_syntax_result',
                        data: {
                            sent_text: message.data.sentence,
                            syntax_result: response,
                        }
                    });
                }
                else {
                    chrome.tabs.sendMessage(sender.tab.id, { cmd: 'fetch_fail_use_localStorage' });
                }
            })
        }
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command=='Alt0') {
        chrome.tabs.create({url: "chrome://extensions/configureCommands"});
    }
    else {  // 其他的送往 content.js 進行處理
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {cmd: command});
        });
    }
});

async function getGoogleTranslationV2(api_key, text, tar_lang='zh-TW') {
    return fetch(`https://translation.googleapis.com/language/translate/v2?key=${api_key}`, 
        {method: 'post', body: JSON.stringify({ q: text, target: tar_lang })})
    .then(r=>r.json())
    .then(r=>r.data.translations[0].translatedText)
    .catch(e=>console.error(e));
}

async function simple_fetch(url, data) {
    return fetch(url, {
        method: 'POST',
        body: new URLSearchParams({data: JSON.stringify(data)}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    })
    .then(r=>r.text())
    .then(r=>JSON.parse(r))
    .catch(e=>{
        // 與遠端連線出問題！！（或是 .text()、JSON.parse() 出問題。。。）
        // console.error(e)
        // 出錯沒關係，不丟錯，後面也接不到錯，程式碼會繼續往下走，但後面的 then 不會有 response 可用（其值會是 undefined）。。。
        // 這樣的做法下，此 function 自己的錯自己 catch。
        // 這裡並不中斷執行、但也不做任何提醒 —— 需要的話，還是可透過 response 來分辨成敗
        // 外面的錯則靠外面自己去 catch！
    })
}