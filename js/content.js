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
        // 備份翻譯後 HTML
        body1 = document.body.innerHTML;

        // 備份各句翻譯後文字
        document.querySelectorAll("sent").forEach((node, i)=>{
            tran_texts[i] = node.textContent
            tran_htmls[i] = node.innerHTML
            node.title = orig_texts[i]
        });

        console.log("Alt+3: 翻譯後各句備份、title 設定完成。\r\n提醒一下！接下來請關閉 Google 翻譯。")
    }
    else if (body0 && body1 && e.altKey && e.key=='ArrowUp') {
        // 切換原文、譯文
        translated = !translated
        if (translated) {
            document.body.innerHTML = body1;
            document.querySelectorAll("sent").forEach((node, i)=>{
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

                        var prev_len = len(node.innerHTML)
                        // prev_len = len(node.textContent)

                        node.innerHTML = `<textarea>${node.innerHTML}</textarea>`
                        // node.innerHTML = `<textarea>${node.textContent}</textarea>`

                        var textarea = node.querySelector("textarea")
                        textarea.cols = prev_len
                        textarea.style.height = `${textarea.scrollHeight}px`
                    }
                }
            });
            // console.log("Alt+上: 已切換為譯文，title 顯示原文。")
        }
        else {
            document.body.innerHTML = body0;
            document.querySelectorAll("sent").forEach((node, i)=>{
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
}

function len(str){
	return str.replace(/[^\x00-\xff]/g,"xx").length;
}

function confirmModification() {
    var prev_textarea = document.querySelector("sent textarea")
    if (prev_textarea) {
        var prev_sent = prev_textarea.parentNode
        if (prev_sent) {
            prev_sent.innerHTML = prev_textarea.value
        }

        // tran_htmls 和 tran_texts 裡相應的記錄也應該要更新
        // 但沒有 i 的資訊 ==》所以每個 sent 還是要有 id 以做為定位辨識
    }
}
