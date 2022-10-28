
window.addEventListener('DOMContentLoaded', ()=> {

    // 呈現快速鍵相關資訊
    chrome.commands.getAll().then(hotkey_list=>{
        if (hotkey_list) {
            var ul=document.querySelector('ul#hotkey_desc')
            ul.innerHTML = ''   // 先清除原來的內容。。。
            hotkey_list.forEach(item=>{
                ul.innerHTML += `<li>【${item.name}】：${item.description}</li>`
            })
        }
    })

    // 點擊【自定義快速鍵】按鍵
    document.querySelector("a#customize_hotkey").onclick = e =>{
        chrome.tabs.create({url: "chrome://extensions/configureCommands"});
    }

    // 點擊【匯出譯句】按鍵
    document.querySelector("#export_translations").onclick = e =>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currTab = tabs[0];
            if (currTab) {
              chrome.tabs.sendMessage(currTab.id, {cmd: 'export_translations'})
            }
        })
    }

    // 點擊【匯入譯句】按鍵
    document.getElementById("import_translations").onclick = function () {
        document.getElementById("import_translations_selector").click()
    }
    document.getElementById("import_translations_selector").onchange = function () {
        file = this.files[0]
        readFile_sendCmd(file, 'import_translations')
    }

    // 點擊【匯出詞語】按鍵
    document.querySelector("#export_terms").onclick = e =>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currTab = tabs[0];
            if (currTab) {
              chrome.tabs.sendMessage(currTab.id, {cmd: 'export_terms'})
            }
        })
    }

    // 點擊【匯入詞語】按鍵
    document.querySelector("#import_terms").onclick = e =>{
        document.getElementById("import_terms_selector").click()
    }
    document.getElementById("import_terms_selector").onchange = function () {
        file = this.files[0]
        readFile_sendCmd(file, 'import_terms')
    }

    // 在彈出頁面上顯示 API_KEY 資訊
    showAPI_KEYOnPopup()

    // 點擊【送出】按鍵
    document.querySelector("#api_key_confirm_button").onclick = e =>{
        var api_key = document.querySelector("#api_key_input_text").value
        chrome.storage.local.set({api_key: api_key}, showAPI_KEYOnPopup);
    }

    // 在輸入框按下【Enter】
    document.querySelector("#api_key_input_text").onkeydown = e => {
        if (e.key == 'Enter') {
            var api_key = e.target.value
            chrome.storage.local.set({api_key: api_key}, showAPI_KEYOnPopup);
        }
    }

    // 點擊【清除】按鍵
    document.querySelector("#api_key_clear_button").onclick = e =>{
        chrome.storage.local.remove('api_key', showAPI_KEYOnPopup);
    }
})

function showAPI_KEYOnPopup() {
    chrome.storage.local.get('api_key', r => {
        var div = document.querySelector("#current_api_key")
        if (r.api_key) {
            var partial_api_key = (r.api_key.length>5)? r.api_key.substring(0,5)+'......' : r.api_key
            div.innerHTML = `目前 API_KEY：${partial_api_key}`
        }
        else {
            div.innerHTML = '目前尚未設定 API_KEY。。。'
        }
    })
}

function readFile_sendCmd(file, cmd) {
    // 建立
    const fr = new FileReader()
    // 設定
    fr.onload = function (e) {
        // console.log(e.target.result, JSON.parse(fr.result))
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {cmd: cmd, data:{file: fr.result}})
            }
        });
    }
    // 執行
    fr.readAsText(file);
}