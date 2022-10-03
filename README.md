# betterTranslation 更好的翻譯！！

想藉由自己逐步開發的翻譯平台工具，進行網頁翻譯工作。

這是 2022 年 9 月我參加 iT 邦鐵人賽的專案。
有興趣的話，請前往 [鐵人賽專區](https://ithelp.ithome.com.tw/users/20115241/ironman/5205?page=1) 就能看到相關的文章喲 ^_^

## 安裝

1. 打開 Chrome 瀏覽器，進入【管理擴充功能】
    - 可以點擊網址列旁邊的【擴充功能】圖示，選擇【管理擴充功能】
    - 也可以直接在網址列輸入「chrome://extensions/」 
2. 開啟畫面右上角的【開發人員模式】
3. 點擊畫面左上角的【載入未封裝項目】
4. 選取本專案的目錄，再按下【選擇資料夾】
5. 安裝完成。

## 使用提示：

點擊網址列右邊的【擴充功能】，應該可以看到我們這個擴充功能的圖示（可以用圖釘釘選）。點擊圖示就可以看到可使用的快速鍵與相應說明。

## 一般使用流程：

1. 開啟想要翻譯的網頁
2. 按下【Alt+1】，對網頁進行分句，並備份原文資料。
3. 使用瀏覽器的 Google 翻譯功能，將網頁翻譯成中文（或其它語言）。
4. 先點擊一下網頁，再按下【Alt+2】，就會自動捲動頁面，完成整個頁面的翻譯。
5. 整個頁面捲動完畢後，按下【Alt+3】，即可備份譯文資料。
6. 重整頁面（按下 Ctrl+R 或 Ctrl+F5）。

===== 以上流程只需執行一次。將來只需執行之後的流程 =====

> 20221003 更新：只要在外掛圖標的彈出頁面中輸入 Google 翻譯的 API_KEY，就可以跳過以上步驟，直接按下「Alt+Shift+4」即可一鍵完成翻譯囉！

7. 按下【Alt+上】，即可切換原文、譯文。
    - 此時若把滑鼠游標移動到句子上方，片刻就會顯示出句子的另一種語言喲。
8. 按下【Ctrl+Enter】，或使用【Ctrl+Shitf+點擊】點選想要修改翻譯的句子，即可進入翻譯編輯模式。
9. 按下【Ctrl+下】，即可確認所修改的譯文，並切換到下一句。按下【Ctrl+上】可切換到上一句。
10. 在譯文編輯模式下，按下【Ctrl+Enter】可確認所修改的譯文，並退出譯文編輯模式。
11. 在譯文編輯模式下，按下【Esc】可取消所修改的譯文，並退出譯文編輯模式。
12. 每個網頁都會記錄最後修改的句子位置。將來任何時候回來查看網頁，按下【Alt+上】就能切換譯文，按下【Ctrl+Enter】就可以從上次修改位置繼續修改。

## 目前的限制：

1. 主要針對【靜態頁面】，若有動態內容，每次重新載入的內容都不相同，之前保存或修改的譯文就派不上用場了。
    - 為了解決此問題，目前有幾個還不成熟的想法。有空再談囉。
