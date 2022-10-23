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

