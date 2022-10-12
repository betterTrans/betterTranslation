/*
$(document).ready((e)=>{
    body0 = document.body.innerHTML;
})
*/

window.addEventListener('load', (e)=>{
    
})


// 回應【背景服務】或【彈出頁面】送過來的請求
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.cmd == 'tran_sent_html') {
        // 【背景服務】送來外部翻譯結果的話。。。
        if (message.data.tran_sent_html) {
            //document.body.innerHTML = message.data.tran_sent_html // 全文送譯，全文套入，是很浪費的做法
            // 譯文逐句套入
            var sent_nodes = new DOMParser().parseFromString(message.data.tran_sent_html, "text/html").body;
            var id2Tran_innerHTML = {}
            sent_nodes.querySelectorAll("sent").forEach((item,i)=>{
                //id2Tran_innerHTML[item.id] = item.innerHTML
                id2Tran_innerHTML[i] = item.innerHTML
            })
            document.querySelectorAll("sent").forEach((item,i)=>{
                //item.innerHTML = id2Tran_innerHTML[item.id]
                item.innerHTML = id2Tran_innerHTML[i]
            })
            translated = true
            // 備份譯文
            Alt3()
        }
    }
    else if (message.cmd in hotkey_handlers) { // 【背景服務】的快速鍵設定
        if (typeof hotkey_handlers[message.cmd] == 'function') {
            hotkey_handlers[message.cmd]();
        }
    }
    else if (message.cmd == 'save_term') {
        var active_token = message.data.active_token;
        var form_input = message.data.form_input;

        // 接下來會用到 saved_terms 這個全域變數，其結構請參見 global.js 。。。

        var changed = false
        // 先檢查此 token 是否已有舊記錄
        if (active_token in saved_terms) {
            // 再檢查舊記錄列表中是否已存在相同的解釋，不存在才須添加
            if (!(saved_terms[active_token].some(ele=>
                JSON.stringify(ele)==JSON.stringify(form_input)))) {
                saved_terms[active_token].push(form_input)
                changed = true
            }
        }
        // 此 token 根本沒記錄過，就直接建一個
        else {
            saved_terms[active_token] = [form_input]
            changed = true
        }

        if (changed) { // 有變動才進行更新
            // 把 saved_terms 存入 localStorage（直接覆蓋掉舊記錄）
            localStorage.setItem('saved_terms', JSON.stringify(saved_terms))
            // 更新 Vue 實體
            panels.$data.saved_terms = saved_terms;
            panels.$forceUpdate()
        }
    }
    else if (message.cmd == 'delete_term') {
        var active_token = message.data.active_token;
        var form_input = message.data.form_input;

        // 接下來會用到 saved_terms 這個全域變數，其結構請參見 global.js 。。。

        // 這個 token 已有舊記錄，才需要進行刪除
        if (active_token in saved_terms) {
            old_list = saved_terms[active_token]
            // 從舊記錄列表中篩選掉相應記錄（只留下不相同的其他記錄）
            new_list = old_list.filter(ele=>
                JSON.stringify(ele)!==JSON.stringify(form_input))

            if (new_list.length > 0) {
                saved_terms[active_token] = new_list
            }
            else {
                // 如果列表空了，就是沒有任何解釋記錄了，則此 token 記錄也要從 saved_terms 裡移除
                // delete saved_terms[active_token]
                // delete 似乎會造成 Vue 的聯動性斷掉。。。只好保留 [] 記錄
                saved_terms[active_token] = new_list
            }

            // 把 saved_terms 存入 localStorage（或是直接覆蓋掉舊記錄）
            localStorage.setItem('saved_terms', JSON.stringify(saved_terms))
            // 更新 Vue 實體
            panels.$data.saved_terms = saved_terms;
            panels.$forceUpdate()
        }
    }
    else if (message.cmd == 'return_syntax_result') {
        var sent_text = message.data.sent_text;
        var syntax_result = message.data.syntax_result;

        // 接下來會用到 syntax_results 這個全域變數，其結構請參見 global.js 。。。

        var changed = false
        // 先檢查此 token 是否已有舊記錄
        if (sent_text in syntax_results) {
            // 再檢查舊記錄是否與新紀錄相同，不相同才需更新
            if (JSON.stringify(syntax_results[sent_text])!==JSON.stringify(syntax_result)) {
                syntax_results[sent_text] = syntax_result   // 換成新的
                changed = true
            }
        }
        // 此句根本沒記錄過，就直接建一個
        else {
            syntax_results[sent_text] = syntax_result
            changed = true
        }

        if (changed) { // 有變動才進行更新
            // 把 syntax_results 存入 localStorage（直接覆蓋掉舊記錄）
            localStorage.setItem('syntax_results', JSON.stringify(syntax_results))
            // 更新 Vue 實體
            panels.$data.syntax_results = syntax_results;
            panels.$forceUpdate()
        }
    }
    else if (message.cmd == 'dict_search_result') {
        // 發出【外查字典】dict_search 的請求後，如果收到查詢結果，就用 vue 把查詢結果呈現出來
        showDict4Token(message.data);
    }
});

document.onkeydown = (e) =>{
    // 預設快速鍵設定（如果 chrome.commands 設定了同樣的快速鍵組合，這裡就不會執行動作喲）
    var hotkey_cmd = ((e.ctrlKey)?'Ctrl':'')
                    + ((e.altKey)?'Alt':'')
                    + ((e.shiftKey)?'Shift':'')
                    + ((e.key)?e.key.replace('Arrow','').replace('Escape','Esc'):'');

    if (hotkey_cmd in hotkey_handlers) {
        if (typeof hotkey_handlers[hotkey_cmd] == 'function') {
            hotkey_handlers[hotkey_cmd]();
        }
    }
}

//=========================
// 快速鍵函式
//=========================
hotkey_handlers = {
    'Alt1':  Alt1,
    'Alt2': Alt2,
    'Alt3': Alt3,
    'Alt9': Alt9,
    'AltShift$': AltShift$,
    'AltUp': switchTranslation, // AltUp,
    'CtrlEnter': CtrlEnter,
    'CtrlUp': ()=>{nextSent(-1)}, // CtrlUp, // 處理函式若需要用到參數，可以採用此寫法。
    'CtrlDown': nextSent, // CtrlDown,
    'Esc': cancelModification, // Esc,
}
function Alt1(){
    // 分句
    if (!document.body.innerHTML.match(/<\/sent>/)) {
        document.body.innerHTML = addSentTag2HTML(document.body.innerHTML);
    }

    // 備份原始 HTML（先分句再備份，因為後面會用到的是分句後的 HTML）
    body0 = document.body.innerHTML;

    // 備份各句原始文字
    document.querySelectorAll("sent").forEach((node, i)=>{
        orig_texts[i] = node.textContent
        orig_htmls[i] = node.innerHTML
    });

    // 保存到 localStorage
    upsertValueByPath('orig_texts_by_path', path, orig_texts)
    upsertValueByPath('orig_htmls_by_path', path, orig_htmls)

    console.log("Alt+1: 原始 HTML 分句備份完成。")
}
function Alt2(){
    // 自動捲動頁面

    var init_pos = document.body.scrollTop; 	// 起始位置：從【最頂端位置】開始
    var interval_ms = 100; // 每次滾動間隔時間（ms）
    var scroll_distance = 100; // 每次滾動距離（px）

    // 設定週期性動作，直到抵達頁面尾端為止
    var autoscroll = setInterval( () => {
            window.scrollTo(0, init_pos = init_pos  + scroll_distance );
            if (init_pos > document.body.scrollHeight) {
                clearInterval(autoscroll);  // 超過頁面總高度就結束
                console.log("Alt+2: 自動捲動頁面完成。")
            }
        }, interval_ms);
}
function Alt3(){
// 先移除 Google 翻譯所加上的雙層 font 標籤
    document.body.innerHTML = removeDoubleFontTagOfGoogleTranslation(document.body.innerHTML)

    // 備份翻譯後 HTML
    body1 = document.body.innerHTML;

    // 備份各句翻譯後文字
    document.querySelectorAll("sent").forEach((node, i)=>{
        tran_texts[i] = node.textContent
        tran_htmls[i] = node.innerHTML
        // 添加 title
        node.title = orig_texts[i]
    });

    // 保存到 localStorage
    upsertValueByPath('tran_texts_by_path', path, tran_texts)
    upsertValueByPath('tran_htmls_by_path', path, tran_htmls)

    console.log("Alt+3: 翻譯後各句備份、title 設定完成。\r\n提醒一下！接下來請關閉 Google 翻譯。")
}
function Alt9(){
    togglePanel('bt_sent_panel')
    togglePanel('bt_token_panel')
}
function AltShift$() {
    // console.log("一鍵翻譯")
    // 進行分句、備份原文
    Alt1()
    // var sent_html = document.body.innerHTML  // 全文送譯太浪費了
    // 把需要進行翻譯的各句連成一氣
    var sent_html = ''
    document.querySelectorAll("sent").forEach((item)=>{
        sent_html += item.outerHTML
    })
    chrome.runtime.sendMessage({
        cmd: 'get_google_translation_V2',
        data: {sent_html: sent_html}
    });
}
/*
function AltUp(){
    // 切換原文、譯文
    switchTranslation();
}
*/
function CtrlEnter(){
    prev_sent_id = confirmModification();

    // 如果沒有開啟任何編輯頁面，就開啟之前最後修改的那個編輯頁面
    if (!prev_sent_id) {
        prev_sent_id = getValueByPath('prev_sent_id_by_path', path, 'sent_0')
        var node = document.querySelector(`sent#${prev_sent_id}`)
        if (node) {
            switchToModification(node)
        }
    }
}
/*
function Esc(){
    cancelModification();
}
function CtrlUp(){
    nextSent(-1);
}
function CtrlDown(){
    nextSent();
}
*/

//=========================
// 公用函式
//=========================
function len(str){
	return str.replace(/[^\x00-\xff]/g,"xx").length;
}

function switchToModification(node) {
    var prev_len = len(node.innerHTML)
    // prev_len = len(node.textContent)

    // 詞語替換
    var old_innerHTML = node.innerHTML
    var orig_text = orig_texts[parseInt(node.id.replace('sent_',''))]
    var split_symbol = orig_text.replace(/([a-zA-Z0-9])([.,!;:\?])/g, '$1 $2')
    var tokens = split_symbol.split(' ')
    var saved_tokens = Object.keys(saved_terms)
    var terms2replace = tokens.filter(ele=>saved_tokens.includes(ele))
    var new_innerHTML = old_innerHTML
    for (var i in terms2replace) {
        var term = terms2replace[i]
        var exps = saved_terms[term]
        for (var j in exps) {
            var exp = exps[j]
            if (exp.mt_text.length>0 && exp.tt_text.length>0) {
                new_innerHTML = new_innerHTML.replace(exp.mt_text, exp.tt_text)
            }
        }
    }

    node.innerHTML = `<textarea>${new_innerHTML}</textarea>`
    // node.innerHTML = `<textarea>${node.innerHTML}</textarea>`
    // node.innerHTML = `<textarea>${node.textContent}</textarea>`

    var textarea = node.querySelector("textarea")
    textarea.cols = prev_len
    textarea.style.height = `${textarea.scrollHeight}px`
    textarea.focus()

    setPanels({
        node: node,
        active_token: '',
        orig_htmls: orig_htmls,
        orig_texts: orig_texts,
        tran_htmls: tran_htmls,
        tran_texts: tran_texts,
        saved_terms: saved_terms,
        syntax_results: syntax_results,
    });
    slideInPanel('bt_sent_panel')
}

function confirmModification() {
    var prev_sent_id = null
    var prev_textarea = document.querySelector("sent textarea")
    if (prev_textarea) {
        var prev_sent = prev_textarea.parentNode
        if (prev_sent) {
            prev_sent_id = prev_sent.id
            prev_sent.innerHTML = prev_textarea.value
            // 保存修改
            i = parseInt(prev_sent_id.replace('sent_',''))
            tran_texts[i] = prev_sent.textContent
            tran_htmls[i] = prev_sent.innerHTML
            // 保存到 localStorage
            upsertValueByPath('tran_texts_by_path', path, tran_texts)
            upsertValueByPath('tran_htmls_by_path', path, tran_htmls)

            upsertValueByPath('prev_sent_id_by_path', path, prev_sent_id)
        }
    }

    slideOutPanel('bt_sent_panel')

    return prev_sent_id
}

function cancelModification() {
    var prev_sent_id = null
    var prev_textarea = document.querySelector("sent textarea")
    if (prev_textarea) {
        var prev_sent = prev_textarea.parentNode
        if (prev_sent) {
            prev_sent_id = prev_sent.id
            i = parseInt(prev_sent_id.replace('sent_',''))
            prev_sent.innerHTML = tran_htmls[i]

            // 保存到 localStorage
            upsertValueByPath('prev_sent_id_by_path', path, prev_sent_id)
        }
    }

    slideOutPanel('bt_sent_panel')

    return prev_sent_id
}

function removeDoubleFontTagOfGoogleTranslation(html_str) {
    re_google_double_font_tag = /\<font style\=\"vertical\-align\: inherit\;\"\>\<font style\=\"vertical\-align\: inherit\;\"\>(.*?)\<\/font\>\<\/font\>/g
    html_str = html_str.replace(re_google_double_font_tag, '$1')

    return html_str
}

// 換句
function nextSent(nth = 1) {
    var new_sent_id = null
    // 先處理好之前的 sent，並取得其 sent_id
    var prev_sent_id = confirmModification()

    if (prev_sent_id) {
        // 再設定下一個要處理的 sent
        new_sent_id = `sent_${parseInt(prev_sent_id.replace('sent_','')) + nth}`
        new_sent = document.querySelector(`sent#${new_sent_id}`)

        if (new_sent) {
            switchToModification(new_sent)
        }
        else {
            console.log('移動已經到了盡頭。。。')
        }
    }
    else {
        // console.log('要開始編輯翻譯，請按下【Ctrl+Shift】，再點擊您要修改的句子。')
        // 如果沒有開啟任何編輯頁面，就開啟之前最後修改的那個編輯頁面
        prev_sent_id = getValueByPath('prev_sent_id_by_path', path, 'sent_0')
        var node = document.querySelector(`sent#${prev_sent_id}`)
        if (node) {
            switchToModification(node)
        }
    }

    slideOutPanel('bt_token_panel')

    return new_sent_id
}

// 切換原文、譯文
function switchTranslation() {

    // 分句了嗎？
    if (!document.body.innerHTML.match(/<\/sent>/)) {
        document.body.innerHTML = addSentTag2HTML(document.body.innerHTML);
    }

    // 取用 localStorage 裡的資料
    orig_texts = getValueByPath('orig_texts_by_path', path, {})
    orig_htmls = getValueByPath('orig_htmls_by_path', path, {})
    tran_texts = getValueByPath('tran_texts_by_path', path, {})
    tran_htmls = getValueByPath('tran_htmls_by_path', path, {})
    saved_terms = localStorage.getItem('saved_terms')
    saved_terms = saved_terms?JSON.parse(saved_terms):{}
    syntax_results = localStorage.getItem('syntax_results')
    syntax_results = syntax_results?JSON.parse(syntax_results):{}

    // 套入各句內容
    translated = !translated
    if (translated) {
        if (body1) {
            document.body.innerHTML = body1;
        }

        document.querySelectorAll("sent").forEach((node, i)=>{
            node.id = `sent_${i}`
            if (tran_htmls && i in tran_htmls) {
                node.innerHTML = tran_htmls[i]
            }
            if (orig_texts && i in orig_texts) {
                node.title = orig_texts[i]
            }
            node.onmouseenter = e => e.target.classList.add('active');
            node.onmouseleave = e => e.target.classList.remove('active');
            node.onclick = e => {
                if (e.shiftKey && e.ctrlKey) {
                    e.stopPropagation(); // 事件不再繼續往後傳，阻斷後面的事件（capture&bubble；往下抓往上冒）
                    e.preventDefault(); // 阻斷預設行為=》例如點擊 link 不會前往該 url

                    // 先處理之前別處的 textarea
                    confirmModification();

                    // 再處理自己此處的 textarea
                    switchToModification(node);

                }
            }
        });
        // console.log("Alt+上: 已切換為譯文，title 顯示原文。")
    }
    else {
        if (body0) {
            document.body.innerHTML = body0;
        }

        document.querySelectorAll("sent").forEach((node, i)=>{
            node.id = `sent_${i}`
            if (orig_htmls && i in orig_htmls) {
                node.innerHTML = orig_htmls[i]
            }
            if (tran_texts && i in tran_texts) {
                node.title = tran_texts[i]
            }
            node.onmouseenter = e => e.target.classList.add('active');
            node.onmouseleave = e => e.target.classList.remove('active');
        });
        // console.log("Alt+上: 已切換為原文，title 顯示譯文。")
    }
}

// 到外部去查詢，再用 onMessage 的 'dict_search_result' 收取結果，再進行後續處理
function dictSearch(query_str) {
    chrome.runtime.sendMessage({
        cmd: 'dict_search', data: {
            query_str: query_str,
        }
    });
}

const synth = window.speechSynthesis; // 語言控制器，載入需要耗時，所以先在這裡載入
function speak(msg) {
    // synth 是全域變數，會耗時，不過等到執行這個函式時，應該已經執行完畢了
    var voices = synth.getVoices();
    var msgToSpeak = new SpeechSynthesisUtterance();
    msgToSpeak.voice = voices.find(voice=>voice.name==='Google US English');
    // msgToSpeak.voice = voices.find(voice=>voice.name==='Google 國語（臺灣）');
    msgToSpeak.text = msg;
    synth.speak(msgToSpeak);
}