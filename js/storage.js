
//===============
// localStorage 相關函式
//===============
function getValueByPath(key, path, default_value = null) {
    var item = JSON.parse(localStorage.getItem(key))
    return (item && path in item) ? item[path]:default_value
}

function upsertValueByPath(key, path, value) {
    var value_in_storage = JSON.parse(localStorage.getItem(key))
    value_in_storage = (value_in_storage) ? value_in_storage : {};
    value_in_storage[path] = value
    localStorage.setItem(key, JSON.stringify(value_in_storage))
}

// 從 localStorage 取得翻譯資料
function getTranslationsFromLocalStorage(all_path=true) {

    if (all_path) {
        orig_texts_by_path = localStorage.getItem('orig_texts_by_path')
        orig_texts_by_path = orig_texts_by_path?JSON.parse(orig_texts_by_path):{}
        orig_htmls_by_path = localStorage.getItem('orig_htmls_by_path')
        orig_htmls_by_path = orig_htmls_by_path?JSON.parse(orig_htmls_by_path):{}
        tran_texts_by_path = localStorage.getItem('tran_texts_by_path')
        tran_texts_by_path = tran_texts_by_path?JSON.parse(tran_texts_by_path):{}
        tran_htmls_by_path = localStorage.getItem('tran_htmls_by_path')
        tran_htmls_by_path = tran_htmls_by_path?JSON.parse(tran_htmls_by_path):{}
        tmp_orig_tran_by_path = localStorage.getItem('tmp_orig_tran_by_path')
        tmp_orig_tran_by_path = tmp_orig_tran_by_path?JSON.parse(tmp_orig_tran_by_path):{}
        prev_sent_id_by_path = localStorage.getItem('prev_sent_id_by_path')
        prev_sent_id_by_path = prev_sent_id_by_path?JSON.parse(prev_sent_id_by_path):{}
    }
    else {
        orig_texts = getValueByPath('orig_texts_by_path', path, {})
        orig_htmls = getValueByPath('orig_htmls_by_path', path, {})
        tran_texts = getValueByPath('tran_texts_by_path', path, {})
        tran_htmls = getValueByPath('tran_htmls_by_path', path, {})
        tmp_orig_tran = getValueByPath('tmp_orig_tran_by_path', path, [])
        prev_sent_id = getValueByPath('prev_sent_id_by_path', path, [])
    }

    /*
    saved_terms = localStorage.getItem('saved_terms')
    saved_terms = saved_terms?JSON.parse(saved_terms):{}
    syntax_results = localStorage.getItem('syntax_results')
    syntax_results = syntax_results?JSON.parse(syntax_results):{}
    //*/

    translations = {
        host: window.location.host,
        origin: window.location.origin,
        path: path,
        // saved_terms: saved_terms,
        // syntax_results: syntax_results,
    }

    if (all_path) {
        translations['orig_texts_by_path'] = orig_texts_by_path
        translations['orig_htmls_by_path'] = orig_htmls_by_path
        translations['tran_texts_by_path'] = tran_texts_by_path
        translations['tran_htmls_by_path'] = tran_htmls_by_path
        translations['tmp_orig_tran_by_path'] = tmp_orig_tran_by_path
        translations['prev_sent_id_by_path'] = prev_sent_id_by_path
    }
    else {
        translations['orig_texts'] = orig_texts
        translations['orig_htmls'] = orig_htmls
        translations['tran_texts'] = tran_texts
        translations['tran_htmls'] = tran_htmls
        translations['tmp_orig_tran'] = tmp_orig_tran
        translations['prev_sent_id'] = prev_sent_id
    }

    return translations
}

// 把翻譯資料存入 localStorage
function setTranslationsFromLocalStorage(translations) {
    if (window.location.host == translations.host   // 替換掉【整個網域】裡的翻譯記錄
        && 'orig_texts_by_path' in translations
        && 'orig_htmls_by_path' in translations
        && 'tran_texts_by_path' in translations
        && 'tran_htmls_by_path' in translations
        && 'tmp_orig_tran_by_path' in translations
        && 'prev_sent_id_by_path' in translations
    ) {
        localStorage.setItem('orig_texts_by_path', JSON.stringify(translations.orig_texts_by_path))
        localStorage.setItem('orig_htmls_by_path', JSON.stringify(translations.orig_htmls_by_path))
        localStorage.setItem('tran_texts_by_path', JSON.stringify(translations.tran_texts_by_path))
        localStorage.setItem('tran_htmls_by_path', JSON.stringify(translations.tran_htmls_by_path))
        localStorage.setItem('tmp_orig_tran_by_path', JSON.stringify(translations.tmp_orig_tran_by_path))
        localStorage.setItem('prev_sent_id_by_path', JSON.stringify(translations.prev_sent_id_by_path))
    }
    else if (path == translations.path  // 替換掉【網頁】裡的翻譯記錄
        && 'orig_texts' in translations
        && 'orig_htmls' in translations
        && 'tran_texts' in translations
        && 'tran_htmls' in translations
        && 'tmp_orig_tran' in translations
        && 'prev_sent_id' in translations
    ) {
        // 保存到 localStorage
        upsertValueByPath('orig_texts_by_path', path, translations.orig_texts)
        upsertValueByPath('orig_htmls_by_path', path, translations.orig_htmls)
        upsertValueByPath('tran_texts_by_path', path, translations.tran_texts)
        upsertValueByPath('tran_htmls_by_path', path, translations.tran_htmls)
        upsertValueByPath('tmp_orig_tran_by_path', path, translations.tmp_orig_tran)
        upsertValueByPath('prev_sent_id_by_path', path, translations.prev_sent_id)
    }
    else {
        alert('匯入的翻譯資料有誤！')
    }
}

// 從 localStorage 取得詞語資料
function getTermsSyntaxsFromLocalStorage() {

    saved_terms = localStorage.getItem('saved_terms')
    saved_terms = saved_terms?JSON.parse(saved_terms):{}
    syntax_results = localStorage.getItem('syntax_results')
    syntax_results = syntax_results?JSON.parse(syntax_results):{}

    terms_syntaxs = {
        host: window.location.host,
        origin: window.location.origin,
        path: path,
        saved_terms: saved_terms,
        syntax_results: syntax_results,
    }

    return terms_syntaxs
}

// 把詞語資料存入 localStorage
function setTermsSyntaxsFromLocalStorage(terms_syntaxs) {
    if (
        'saved_terms' in terms_syntaxs
        && 'syntax_results' in terms_syntaxs
        // && window.location.host == terms_syntaxs.host   // 替換掉【整個網域】裡的翻譯記錄
    ) {
        // 直接覆蓋掉舊記錄 —— 這是很珍貴的記錄，不應該輕易覆蓋掉。應該與舊記錄整併起來才對！！
        localStorage.setItem('saved_terms', JSON.stringify(terms_syntaxs.saved_terms))
        localStorage.setItem('syntax_results', JSON.stringify(terms_syntaxs.syntax_results))
    }
    else {
        alert('匯入的詞語資料有誤！')
    }
}