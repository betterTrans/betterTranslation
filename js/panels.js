//==================================
// Panel 面板相關函式
//==================================
function createPanel(id, position = 'bottom', display=true, size = '300px', background_color = '', z_index = 0, opacity = 0) {

    // 面板主區塊
    var panels = document.querySelector("div#bt_panels")
    // 檢查有沒有主面板，沒有就建立之
    if (!panels) {
        panels = document.createElement("div");
        panels.id = "bt_panels"
        document.body.append(panels)
    }

    var panel = panels.querySelector("div#" + id)
    // 檢查有沒有這個子面板，沒有就建立之
    if (!panel) {

        panel = document.createElement("div");
        panel.id = id;
        panel.classList.add('bt_panel')

        // 只要根據 position 設定好 class，就會自動擺放到正確位置
        panel.classList.add(position)
        // 根據 size 設定面板大小
        if (position === 'left' || position === 'right') {
            panel.style.width =  size;
        }
        else if (position === 'top' || position === 'bottom') {
            panel.style.height = size;
        }

        // 其他設定：背景顏色、層高度、捲軸、透明度、
        if (background_color) panel.style['background-color'] = background_color;
        if (z_index) panel.style['z-index'] = z_index;
        if (opacity) panel.style.opacity = opacity;

        panels.appendChild(panel);

    }

    if (!display) slideOutPanel(id, '0ms')  // 預設先滑出面板

    return panel
}

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

var vm = null
function showInSentPanel(data) {
    app_div = document.querySelector("#bt_sent_panel div#app")
    if (!app_div) {
        app_div = document.createElement('div')
        app_div.id = 'app'

        document.querySelector("#bt_sent_panel").append(app_div)
    }

    sent_id =  data.node?data.node.id:0
    orig_htmls =  data.orig_htmls?data.orig_htmls:{}
    orig_texts =  data.orig_texts?data.orig_texts:{}
    tran_htmls =  data.tran_htmls?data.tran_htmls:[]
    tran_texts =  data.tran_texts?data.tran_texts:[]

    if (vm) {
        vm.$data.sent_id = sent_id
    }
    else {
        vm = Vue.createApp({
            data () {
                return {
                    sent_id: sent_id,
                    orig_htmls: orig_htmls,
                    orig_texts: orig_texts,
                    tran_htmls: tran_htmls,
                    tran_texts: tran_texts
                }
            },
            computed: {
                sent_index: function () {
                    return parseInt(this.sent_id.replace('sent_',''))
                }
            },
            render() {
                return Vue.h('div', {
                    id: "app",
                    style: { 'margin': '20px', },
                }, [
                    this.orig_texts[this.sent_index]
                ])
            }
            //template: '<div id="app">{{orig_texts[sent_index]}}</div>'
        }).mount(app_div);
    }
}