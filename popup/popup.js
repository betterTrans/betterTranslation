chrome.storage.local.get('api_key', r => {
    api_key = r.api_key
    if (api_key) {
        var partial_api_key = (api_key.length>5)? api_key.substring(0,5)+'......' : api_key
        document.querySelector("#current_api_key").innerHTML = `目前 API_KEY：${partial_api_key}`
    }
})


// 發出 message，向 content-script 索取資訊
chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
{
    chrome.tabs.sendMessage(tabs[0].id, {cmd: 'get_hotkeys_desc', data: {}}, (hotkeys_desc) => {
        // 從 content-script 那邊收到回應。。。
        if (hotkeys_desc) {
            var ul=document.querySelector('ul#hotkey_desc')
            ul.innerHTML = ''   // 先清除原來的內容。。。
            hotkeys_desc.forEach(item=>{
                ul.innerHTML += "<li>" + item + "</li>"
            })
        }
    });
});

// 點擊【送出】按鍵的話...
document.querySelector("#api_key_confirm_button").onclick = e =>{
    var api_key = document.querySelector("#api_key_input_text").value
    sendAPIKEY2Background(api_key)
}

// 在輸入框按下【Enter】的話...
document.querySelector("#api_key_input_text").onkeydown = e => {
    if (e.key == 'Enter') {
        var api_key = e.target.value
        sendAPIKEY2Background(api_key)
    }
}

// 點擊【清除】按鍵的話...
document.querySelector("#api_key_clear_button").onclick = e =>{
    chrome.storage.local.remove('api_key',()=>{
        document.querySelector("#current_api_key").innerHTML = '目前尚未設定 API_KEY。。。'
    });
    chrome.runtime.sendMessage({cmd: 'remove_api_key'});
}

// 把 API_KEY 送往背景服務
function sendAPIKEY2Background(api_key) {
    chrome.runtime.sendMessage({cmd: 'api_key', data: {api_key: api_key}}, (response) => {
        // background.js 那邊確實收到 API_KEY 的話，會把 API_KEY 再送回來。
        if (response == api_key){
            var partial_api_key = (api_key.length>5)? api_key.substring(0,5)+'......' : api_key
            document.querySelector("#current_api_key").innerHTML = `目前 API_KEY：${partial_api_key}`
        }
    });
}