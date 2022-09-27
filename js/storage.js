
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
