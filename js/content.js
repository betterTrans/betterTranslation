var body0 = null
var body1 = null
var orig_texts = {}
var tran_texts = {}
var orig_htmls = {}
var tran_htmls = {}
translated = false

/*
$(document).ready((e)=>{
    body0 = document.body.innerHTML;
})
*/

document.onkeydown = (e) =>{
    if (e.altKey && e.key=='1') {

        // 分句
        document.body.innerHTML = addSentTag2HTML(document.body.innerHTML);

        // 備份原始 HTML（先分句再備份，因為後面會用到的是分句後的 HTML）
        body0 = document.body.innerHTML;

        // 備份各句原始文字
        document.querySelectorAll("sent").forEach((node, i)=>{
            orig_texts[i] = node.textContent
            orig_htmls[i] = node.innerHTML
            localStorage.setItem('orig_texts', JSON.stringify(orig_texts))
            localStorage.setItem('orig_htmls', JSON.stringify(orig_htmls))
        });

        console.log("Alt+1: 原始 HTML 分句備份完成。")

    }
    else if (e.altKey && e.key=='2') {
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
    else if (e.altKey && e.key=='3') {
        // 先移除 Google 翻譯所加上的雙層 font 標籤
        document.body.innerHTML = removeDoubleFontTagOfGoogleTranslation(document.body.innerHTML)
        
        // 備份翻譯後 HTML
        body1 = document.body.innerHTML;

        // 備份各句翻譯後文字
        document.querySelectorAll("sent").forEach((node, i)=>{
            tran_texts[i] = node.textContent
            tran_htmls[i] = node.innerHTML
            localStorage.setItem('tran_texts', JSON.stringify(tran_texts))
            localStorage.setItem('tran_htmls', JSON.stringify(tran_htmls))
            // 添加 title
            node.title = orig_texts[i]
        });

        console.log("Alt+3: 翻譯後各句備份、title 設定完成。\r\n提醒一下！接下來請關閉 Google 翻譯。")
    }
    else if (e.altKey && e.key=='ArrowUp') {
        // 切換原文、譯文
        // 分句了嗎？
        if (!document.body.innerHTML.match(/<\/sent>/)) {
            document.body.innerHTML = addSentTag2HTML(document.body.innerHTML);
        }
        
        // 取用 localStorage 裡的資料
        orig_texts = JSON.parse(localStorage.getItem('orig_texts'))
        orig_htmls = JSON.parse(localStorage.getItem('orig_htmls'))
        tran_texts = JSON.parse(localStorage.getItem('tran_texts'))
        tran_htmls = JSON.parse(localStorage.getItem('tran_htmls'))
        // 套入各句內容
        translated = !translated
        if (translated) {
            if (body1) {
                document.body.innerHTML = body1;
            }
            document.querySelectorAll("sent").forEach((node, i)=>{
                node.id = `sent_${i}`
                node.innerHTML = tran_htmls[i]
                node.title = orig_texts[i]
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
                node.innerHTML = orig_htmls[i]
                node.title = tran_texts[i]
                node.onmouseenter = e => e.target.classList.add('active');
                node.onmouseleave = e => e.target.classList.remove('active');
            });
            // console.log("Alt+上: 已切換為原文，title 顯示譯文。")
        }
    }
    else if (e.ctrlKey && e.key=='Enter') {
        confirmModification();
    }
    else if (e.ctrlKey && e.key=='ArrowUp') {
        nextSent(-1);
    }
    else if (e.ctrlKey && e.key=='ArrowDown') {
        nextSent();
    }
}

function len(str){
	return str.replace(/[^\x00-\xff]/g,"xx").length;
}

function switchToModification(node) {
    var prev_len = len(node.innerHTML)
    // prev_len = len(node.textContent)

    node.innerHTML = `<textarea>${node.innerHTML}</textarea>`
    // node.innerHTML = `<textarea>${node.textContent}</textarea>`

    var textarea = node.querySelector("textarea")
    textarea.cols = prev_len
    textarea.style.height = `${textarea.scrollHeight}px`
    textarea.focus()
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
            localStorage.setItem('tran_texts', JSON.stringify(tran_texts))
            localStorage.setItem('tran_htmls', JSON.stringify(tran_htmls))
        }

        // tran_htmls 和 tran_texts 裡相應的記錄也應該要更新
        // 但沒有 i 的資訊 ==》所以每個 sent 還是要有 id 以做為定位辨識
    }

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
        console.log('要開始編輯翻譯，請按下【Ctrl+Shift】，再點擊您要修改的句子。')
    }

    return new_sent_id
}