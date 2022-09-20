var body0 = null
var body1 = null
translated = false

/*
$(document).ready((e)=>{
    body0 = document.body.innerHTML;
})
*/

document.onkeydown = (e) =>{
    if (e.altKey && e.key=='1') {
        // 備份原始 HTML

        body0 = document.body.innerHTML;
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
                }
            }, interval_ms);
    }
    else if (e.altKey && e.key=='3') {
        // 備份翻譯後 HTML

        body1 = document.body.innerHTML;
    }
    else if (body0 && body1 && e.altKey && e.key=='ArrowUp') {
        // 切換原文、譯文
        
        translated = !translated
        if (translated) {
            document.body.innerHTML = body1;
        }
        else {
            document.body.innerHTML = body0;
        }
    }
}