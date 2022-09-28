
// 發出 message，向 content-script 索取資訊
chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
{
    chrome.tabs.sendMessage(tabs[0].id, {cmd: 'get_hotkeys_desc', data: {}}, (hotkeys_desc) => {
        // 從 content-script 那邊收到回應。。。
        var ul=document.querySelector('ul#hotkey_desc')
        ul.innerHTML = ''   // 先清除原來的內容。。。
        hotkeys_desc.forEach(item=>{
            ul.innerHTML += "<li>" + item + "</li>"
        })
    });
});

