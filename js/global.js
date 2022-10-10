var body0 = null
var body1 = null
var orig_texts = {}
var tran_texts = {}
var orig_htmls = {}
var tran_htmls = {}
var translated = false
var path = window.location.pathname + window.location.search


var saved_terms = {}    // 此變數用來保存可替換的詞語記錄，結構如下：
/*
saved_terms = {
    token#1 : [  // 以 token 為索引
        {第一種解釋},
        {第二種解釋},
        ...
    ]
    ...
}
*/
