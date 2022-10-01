window.addEventListener('DOMContentLoaded', ()=> {

    // 向 content-script 索取快速鍵相關資訊
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {cmd: 'get_hotkeys_desc', data: {}}, (hotkeys_desc) => {
            showHotkeyDescOnPopup(hotkeys_desc)
        });
    });

    // 在彈出頁面上顯示 API_KEY 資訊
    showAPI_KEYOnPopup()

    // 點擊【送出】按鍵的話...
    document.querySelector("#api_key_confirm_button").onclick = e =>{
        var api_key = document.querySelector("#api_key_input_text").value
        chrome.storage.local.set({api_key: api_key}, showAPI_KEYOnPopup);
    }

    // 在輸入框按下【Enter】的話...
    document.querySelector("#api_key_input_text").onkeydown = e => {
        if (e.key == 'Enter') {
            var api_key = e.target.value
            chrome.storage.local.set({api_key: api_key}, showAPI_KEYOnPopup);
        }
    }

    // 點擊【清除】按鍵的話...
    document.querySelector("#api_key_clear_button").onclick = e =>{
        chrome.storage.local.remove('api_key', showAPI_KEYOnPopup);
    }
})

function showHotkeyDescOnPopup(hotkeys_desc) {
    if (hotkeys_desc) {
        var ul=document.querySelector('ul#hotkey_desc')
        ul.innerHTML = ''   // 先清除原來的內容。。。
        hotkeys_desc.forEach(item=>{
            ul.innerHTML += "<li>" + item + "</li>"
        })
    }
}

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