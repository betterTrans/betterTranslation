//==================================
// Panel 面板相關函式
//==================================

function slideInPanel(id, duration = '300ms', overlay = false) {
    var panel = document.querySelector("div#" + id);
    if (panel && !(panel.classList.contains('on'))) {
        panel.classList.remove('off');
        panel.classList.add('on');

        panel.style['transition-duration'] = duration;
        panel.style.transform = 'translate(0px, 0px)'
        
        if (!overlay) {
            if (panel.classList.contains('top')) {
                /* // 更好的做法，應該先取原來的 margin 值
                orig_margin = document.body.style['margin-top'];
                new_margin = (orig_margin + size) + 'px';
                */
                document.body.style['margin-top'] = (panel.offsetHeight + 10) + 'px';    // 面板滑入後，margin 調為 (size+10) px
            } else if (panel.classList.contains('right')) {
                document.body.style['margin-right'] = (panel.offsetWidth + 10) + 'px';    // 面板滑入後，margin 調為 (size+10) px
            } else if (panel.classList.contains('bottom')) {
                // document.body.style['margin-bottom'] = (panel.offsetHeight+10)+'px';    // 面板滑入後，margin 調為 (size+10) px
                // margin 不一定有用，既然 edit_div 一定是 body 最後一個 div，就用它的 height 來設定更有效
                document.querySelector("#bt_panels").style.height = (panel.offsetHeight + 50) + 'px';    // 面板滑入後，下方 #edit_div 的 height 調為 (size+10) px
            } else if (panel.classList.contains('left')) {
                document.body.style['margin-left'] = (panel.offsetWidth + 10) + 'px';    // 面板滑入後，margin 調為 (size+10) px
            }
            //===============showActiveSent();   // 內文排版會改變，所以最好再重新顯示正確的內文定位
        }
    }
}

function slideOutPanel(id, duration = '300ms', overlay = false) {
    var panel = document.querySelector("div#" + id);
    if (panel && !(panel.classList.contains('off'))) {
        panel.classList.remove('on')
        panel.classList.add('off');

        if (panel.classList.contains('top')) {
            movement = `0px, -${panel.offsetHeight+20}px`;
        } else if (panel.classList.contains('bottom')) {
            movement = `0px, ${panel.offsetHeight+20}px`;
        } else if (panel.classList.contains('right')) {
            movement = `${panel.offsetWidth+20}px,  0px`;
        } else if (panel.classList.contains('left')) {
            movement = `-${panel.offsetWidth+20}px, 0px`;
        }
        
        panel.style['transition-duration'] = duration;
        panel.style.transform = 'translate(' + movement + ')'

        if (!overlay) {
            if (panel.classList.contains('top')) {
                document.body.style['margin-top'] = '';
            } else if (panel.classList.contains('right')) {
                document.body.style['margin-right']= '';
            } else if (panel.classList.contains('bottom')) {
                // document.body.style['margin-bottom'] = '';    // 面板滑出後，移除 margin 設定
                // margin 不一定有用，但既然 #bt_panels 一定是 body 最後一個 div，就用它的 height 來設定更有效
                document.querySelector("#bt_panels").style.height = '';
            } else if (panel.classList.contains('left')) {
                document.body.style['margin-left'] = '';
            }
            //=============== showActiveSent();   // 內文排版會改變，所以最好再重新顯示正確的內文定位
        }
    }
}

function togglePanel(id) {
    var panel = document.querySelector("div#" + id);
    if (panel) {
        if (panel.classList.contains('on')) {
            slideOutPanel(id);
        } else {
            slideInPanel(id);
        }
    }
}

var panels = null
function setPanels(data) {
    if (panels) {
        panels.$data.sent_id = data.node?data.node.id:'sent_0'
    }
    else {
        panels = new Vue({
            data () {
                return {
                    sent_id: data.node?data.node.id:'sent_0',
                    active_token: data.active_token?data.active_token:'book',
                    orig_htmls: data.orig_htmls?data.orig_htmls:{},
                    orig_texts: data.orig_texts?data.orig_texts:{},
                    tran_htmls: data.tran_htmls?data.tran_htmls:{},
                    tran_texts: data.tran_texts?data.tran_texts:{}
                }
            },
            /*
            template: `
            <bt_panels
                :prop_sent_id="sent_id"
                :active_token="active_token"
                :prop_orig_htmls="orig_htmls"
                :prop_orig_texts="orig_texts"
                :prop_tran_htmls="tran_htmls"
                :prop_tran_texts="tran_texts"
            ></bt_panels>`
            */
            render(h) {
                return h('bt_panels', {
                    props: {
                        sent_id: this.sent_id,
                        active_token: this.active_token,
                        orig_htmls: this.orig_htmls,
                        orig_texts: this.orig_texts,
                        tran_htmls: this.tran_htmls,
                        tran_texts: this.tran_texts,
                    }
                })
            }
        })

        // 面板主區塊
        var panels_div = document.querySelector("div#bt_panels")
        // 檢查有沒有主面板，沒有就建立之
        if (!panels_div) {
            panels_div = document.createElement("div");
            panels_div.id = "bt_panels"
            document.body.append(panels_div)
        }
        panels.$mount(panels_div);
    }

    return panels
}

// 顯示外部查詢字典的結果
function showDict4Token(dictResult) {
    var result = dictResult.response;

    var el = new DOMParser().parseFromString(result, "text/html").body;    // html 會用 html、head、body 打包起來。        

    var search_result = el.querySelector('ol.searchCenterMiddle');
    if (search_result) {
        var exp = search_result.querySelector('div.p-rel');

        if (exp) {
            exp.querySelectorAll("ul > li > p").forEach((item)=>{
                item.style.display = 'none'
            }); // 先把例句隱藏起來
        }
    }

    document.querySelector("#dict_result").innerHTML = exp.innerHTML;

    /*
    // 設定例句切換顯示
    document.querySelector("#dict_result").find('li').click(function () {
        $(this).find('h4 ~ span').toggle('300', "swing");
    });
    */
}