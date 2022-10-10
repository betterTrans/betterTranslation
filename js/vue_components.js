
var eventBus = new Vue(); 
Vue.prototype.$EventBus = eventBus;

//=============================================
// Vue component 組件（props in, event out!）
//=============================================

// 主面板
Vue.component('bt_panels', {
    props: [
        'sent_id',
        'active_token',
        'orig_htmls',
        'orig_texts',
        'tran_htmls',
        'tran_texts'
    ],
    /*
    template: `
    <div id="bt_panels">
        <bt_sent_panel
            :sent_id="sent_id"
            :orig_htmls="orig_htmls"
            :orig_texts="orig_texts"
            :tran_htmls="tran_htmls"
            :tran_texts="tran_texts"
        ></bt_sent_panel>
        <bt_token_panel
            :active_token="active_token"
            :orig_htmls="orig_htmls"
            :orig_texts="orig_texts"
            :tran_htmls="tran_htmls"
            :tran_texts="tran_texts"
        ></bt_token_panel>
    </div>`
    */
    render(h) {
        return h('div', {
            attrs: {id: "bt_panels", },
        },
        [
            h('bt_sent_panel', {
                props: {
                    sent_id: this.sent_id,
                    active_token: this.active_token,
                    orig_htmls: this.orig_htmls,
                    orig_texts: this.orig_texts,
                    tran_htmls: this.tran_htmls,
                    tran_texts: this.tran_texts,
                }
            }, []),
            h('bt_token_panel', {
                props: {
                    sent_id: this.sent_id,
                    active_token: this.active_token,
                    orig_htmls: this.orig_htmls,
                    orig_texts: this.orig_texts,
                    tran_htmls: this.tran_htmls,
                    tran_texts: this.tran_texts,
                }
            }, [])
        ])
    }
});

// 句子面板
Vue.component('bt_sent_panel', {
    props: [
        'sent_id',
        'active_token',
        'orig_htmls',
        'orig_texts',
        'tran_htmls',
        'tran_texts'
    ],
    /*
    template: `
    <div id="bt_sent_panel" class="bt_ponel ">
        <orig_sent
            :sent_id="sent_id"
            :orig_texts="orig_texts"
        ></orig_sent>
    </div>`
    */
    render(h) {
        return h('div', {
            class: ['bt_panel', 'bottom'],
            attrs: {id: "bt_sent_panel", },
        },
        [
            h('orig_sent', {
                props: {
                    sent_id: this.sent_id,
                    orig_texts: this.orig_texts,
                }
            }, [])
        ])
    }
});

// 原文句
Vue.component('orig_sent', {
    props: [
        'sent_id',
        'orig_texts',
    ],
    computed: {
        sent_index: function () {
            return parseInt(this.sent_id.replace('sent_',''))
        },
        sent_text: function () {
            return this.orig_texts[this.sent_index]
        },
        tokens: function () {
            split_symbol = this.sent_text.replace(/([a-zA-Z0-9])([.,!:])/g, '$1 $2')
            return split_symbol.split(' ')
        }
    },
    /**
    template: `
    <div id="orig_sent" style="margin: '20px';">
        <orig_token v-for="token in tokens"
            :token="token"
        ></orig_token>
    </div>`
    /**/
    render(h) {
        return h('div', {
                attrs: {id: "orig_sent", },
                style: { 'margin': '20px', },
            },
            this.tokens.map(token => h('orig_token', {
                props: {
                    token: token
                }
            }))
        )
    }
});

// 原文 token
Vue.component('orig_token', {
    props: [
        "token"
    ],
    methods: {
        activate: function (e) {
            e.target.classList.add('active');
        },
        deactivate: function (e) {
            e.target.classList.remove('active');
        },
        tokenClicked: function (e) {
            this.$EventBus.$emit('token-clicked', this.token);
            slideInPanel('bt_token_panel')
        },
        dict_search: function (e) {
            query_str = e.target.innerText;

            if (query_str.length > 0) {
                dictSearch(query_str)
            }
        },
    },
    /*
    template: `
    <span style="margin: '2px';"
        v-on:mouseover="activate"
        v-on:mouseout="deactivate"
        v-on:click="tokenClicked"
        v-on:dblclick="dict_search"
    >{{token}}</span>`
    */
    render(h) {
        return h('span', {
            style: {'margin': '2px'},
            on: {
                mouseover: this.activate,
                mouseout: this.deactivate,
                click: this.tokenClicked,
                dblclick: this.dict_search,
            },
        }, this.token)
    }
});

// 詞語面板
Vue.component('bt_token_panel', {
    props: [
        'sent_id',
        'active_token',
        'orig_htmls',
        'orig_texts',
        'tran_htmls',
        'tran_texts'
    ],
    data () {
        return {
            my_active_token: this.active_token,
        }
    },
    created: function () {
        let self = this; 
        this.$EventBus.$on("token-clicked", function (token) { 
          self.my_active_token = token; 
        }); 
    },    
    /*
    template: `
    <div id="bt_token_panel" class="bt_ponel right">
        <active_token
            :active_token="active_token"
        ></active_token>
        <term_form
            :active_token="active_token"
        ></term_form>
        <dict_pane
            :active_token="active_token"
        ></dict_pane>
    </div>
    `
    */
    render(h) {
        return h('div', {
            class: ['bt_panel', 'right'],
            attrs: {id: "bt_token_panel", },
            style: {'width': '300px'}
        },
        [
            h('active_token', {
                props: {
                    active_token: this.my_active_token,
                }
            }),
            h('term_form', {
                props: {
                    active_token: this.my_active_token,
                }
            }),
            h('dict_pane', {
                props: {
                    active_token: this.my_active_token,
                }
            }, [])
        ])
    }
});

// 所選中詞語
Vue.component('active_token', {
    props: [
        'active_token'
    ],
    methods: {
        play_audio: function(e) {
            speak(this.active_token)
        },
    },
    /*
    template=: `
    <div id="voc_pos">
        <h2 style="text-align: center;">{{active_token}}
            <input id="play_audio" type="button" value="唸一下"
                v-on:clcik="play_audio" />
        </h2>
    </div>`
    */
    render(h) {
        return h('div', {
            attrs: {id: "voc_pos", },
        },
        [
            h('h2', {
                style: {'text-align': 'center'}
            }, [
                this.active_token,
                h('input', {
                    attrs: {
                        id: "play_audio",
                        type: "button",
                        value: "唸一下",
                    },
                    on: {
                        click: this.play_audio,
                    },
                }),
            ]),
        ])
    }
});

// 詞語表單
Vue.component('term_form', {
    props: [
        'active_token'
    ],
    /*
    template: `
        <div id="term_form">
            <div>原文 <input id="ot_text" type="text" name="ot_text" :value="action_token"/></div>
            <div>人譯 <input id="tt_text" type="text" name="tt_text" /></div>
            <div>機譯 <input id="mt_text" type="text" name="mt_text" /></div>
            <input id="term_submit" type="button" value="保存" @click="save_term" />
            <input id="term_delete" type="button" value="刪除" @click="delete_term" />
            <input id="implement_term_or_not" type="checkbox" name="implement_term_or_not" value="term_implemented"
                v-model="implement_term_or_not"
                @change="changeCheckbox" />
            自動代入
        </div>`
    */
    render(h) {
        var self = this;
        return h('div', {attrs: {id: "term_form"}}, [
            h('div', ['原文 ', h('input', { attrs: {id: "ot_text", type: "text", name: "ot_text", value: this.active_token } })]),
            h('div', ['人譯 ', h('input', { attrs: {id: "tt_text", type: "text", name: "tt_text"}})]),
            h('div', ['機譯 ', h('input', { attrs: {id: "mt_text", type: "text", name: "mt_text"}})]),
            h('input', {
                attrs: {id: "implement_term_or_not", type: "checkbox", name: 'implement_term_or_not', value: "term_implemented"},
                // 【v-model】
                // checkbox 的 v-model 要看 change 事件，同步 checked 的值
                /*
                domProps: {
                    checked: self.implement_term_or_not,   // 這相當於 v-bind：用 Vue.data 去設定 DOM 的 attr 屬性
                },
                on: {
                    change: e => {
                        self.implement_term_or_not = e.target.checked;  // 這相當於 v-model：用 DOM 的 attr 屬性去更新 Vue.data
                        self.$emit('change', e.target.value);  // 再送個事件出去，讓別處也可以得到通知
                        self.changeCheckbox();  // 這其實是去通知外面更新全域變數 ==》其實應該在別處接收事件通知，再進行此動作
                    },
                },
                */
            }),
            '自動代入',
            h('input', {
                attrs: {id: "term_submit", type: "button", value: "保存"},
                //on: {click: self.save_term },
            }),
            h('input', {
                attrs: {id: "term_delete", type: "button", value: "刪除"},
                //on: {click: self.delete_term },
            })
        ])
    }
});

// 字典區塊
Vue.component('dict_pane', {
    props: [
        'active_token'
    ],
    /*
    template=: `
    <div id="dict_result">=== 滑鼠雙擊查單字 ===</div>`
    */
    render(h) {
        return h('div', {
            attrs: {id: "dict_result", },
        }, '=== 滑鼠雙擊查單字 ===')
    }
});
