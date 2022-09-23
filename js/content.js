var body0 = null
var body1 = null
var orig_texts = {}
var tran_texts = {}
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
            });
            console.log("Alt+上: 已切換為譯文，title 顯示原文。")
        }
        else {
            document.body.innerHTML = body0;
            document.querySelectorAll("sent").forEach((node, i)=>{
                node.title = tran_texts[i]
            });
            console.log("Alt+上: 已切換為原文，title 顯示譯文。")
        }
    }
}