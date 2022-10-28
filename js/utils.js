
function len(str){
	return str.replace(/[^\x00-\xff]/g,"xx").length;
}

function removeDoubleFontTagOfGoogleTranslation(html_str) {
    re_google_double_font_tag_1 = /\<font style\=\"vertical\-align\: inherit\;\"\>(.*?)\<\/font\>/g
    // re_google_double_font_tag_2 = /\<font style\=\"vertical\-align\: inherit\;\"\>\<font style\=\"vertical\-align\: inherit\;\"\>(.*?)\<\/font\>\<\/font\>/g
    html_str = html_str
        .replace(re_google_double_font_tag_1, '$1')
        .replace(re_google_double_font_tag_1, '$1')  // 會有兩層，所以清理兩次

    return html_str
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

function obj_in_list(obj={}, list=[]) {
    var obj_str = JSON.stringify(obj)
    var obj_in_list = null
    for (i in list) {
        item = list[i]
        item_str = JSON.stringify(item)
        if (item_str==obj_str) {
            obj_in_list = i
            break
        }
    }
    return obj_in_list
}

function html2text(str) {
    var tmp_div = document.createElement('div')
    tmp_div.innerHTML = str
    return tmp_div.textContent
}

function getHtmlFromTextarea(str) {
    var tmp_div = document.createElement('div')
    tmp_div.innerHTML = str
    var tmp_textarea = tmp_div.querySelector('textarea')
    return tmp_textarea ? tmp_textarea.value : ''
}

// 把 data 下載到 file 中
function download(data, filename, type='text/plain;charset=utf-8') {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

// 取得當下日期時間字串
function getDateString() {
    var dt = new Date();
    yy = dt.getFullYear();
    mm = dt.getMonth() + 1;
    mm = (mm < 10 ? '0' : '') + mm;
    dd = ('0' + dt.getDate()).slice(-2);
    hh = ('0' + dt.getHours()).slice(-2);
    min = ('0' + dt.getMinutes()).slice(-2);
    sec = ('0' + dt.getSeconds()).slice(-2);

    return yy + '-' + mm + '-' + dd + '-' + hh + '-' + min + '-' + sec 
}