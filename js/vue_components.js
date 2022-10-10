
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
        'tran_texts',
        'saved_terms'
    ],
    data () {
        return {
            data_saved_terms: this.saved_terms,
        }
    },
    created: function () {
        let self = this;
        this.$EventBus.$on("terms_list-updated", function (saved_terms) {
          self.data_saved_terms = saved_terms;
        });
    },
    /*
    template: `
    <div id="bt_panels">
        <bt_sent_panel
            :sent_id="sent_id"
            :orig_htmls="orig_htmls"
            :orig_texts="orig_texts"
            :tran_htmls="tran_htmls"
            :tran_texts="tran_texts"
            :saved_terms="data_saved_terms"
        ></bt_sent_panel>
        <bt_token_panel
            :active_token="active_token"
            :orig_htmls="orig_htmls"
            :orig_texts="orig_texts"
            :tran_htmls="tran_htmls"
            :tran_texts="tran_texts"
            :saved_terms="data_saved_terms"
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
                    saved_terms: this.data_saved_terms,
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
                    saved_terms: this.data_saved_terms,
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
        'tran_texts',
        'saved_terms'
    ],
    /*
    template: `
    <div id="bt_sent_panel" class="bt_ponel ">
        <orig_sent
            :sent_id="sent_id"
            :orig_texts="orig_texts"
            :saved_terms="saved_terms"
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
                    saved_terms: this.saved_terms,
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
        'saved_terms'
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
        'tran_texts',
        'saved_terms'
    ],
    data () {
        return {
            data_active_token: this.active_token,
        }
    },
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
    created: function () {
        let self = this; 
        this.$EventBus.$on("token-clicked", function (token) { 
          self.data_active_token = token;
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
            :saved_terms="saved_terms"
        ></term_form>
        <terms_list
            :active_token="active_token"
            :tokens="tokens"
            :saved_terms="saved_terms"
        ></terms_list>
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
                    active_token: this.data_active_token,
                }
            }),
            h('term_form', {
                props: {
                    active_token: this.data_active_token,
                    saved_terms: this.saved_terms,
                }
            }),
            h('terms_list', {
                props: {
                    active_token: this.data_active_token,
                    tokens: this.tokens,
                    saved_terms: this.saved_terms,
                }
            }),
            h('dict_pane', {
                props: {
                    active_token: this.data_active_token,
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
        'active_token',
        'saved_terms'
    ],
    methods: {
        getTermForm: function () {
            return {
                ot_text: document.querySelector("#term_form input#ot_text").value,
                tt_text: document.querySelector("#term_form input#tt_text").value,
                mt_text: document.querySelector("#term_form input#mt_text").value,
            }
        },
        save_term: function () {
            var form_input = this.getTermForm();

            // 接下來會用到 saved_terms 這個全域變數，其結構請參見 global.js 。。。
            // 但若直接操作全域變數，那送進來的 saved_terms 呢？？？

            var changed = false
            // 先檢查此 token 是否已有舊記錄
            if (this.active_token in saved_terms) {
                // 再檢查舊記錄列表中是否已存在相同的解釋，不存在才須添加
                if (!(saved_terms[this.active_token].some(ele=>
                    JSON.stringify(ele)==JSON.stringify(form_input)))) {
                    saved_terms[this.active_token].push(form_input)
                    changed = true
                }
            }
            // 此 token 根本沒記錄過，就直接建一個
            else {
                saved_terms[this.active_token] = [form_input]
                changed = true
            }

            if (changed) { // 有變動才進行更新
                // 把 saved_terms 存入 localStorage（直接覆蓋掉舊記錄）
                localStorage.setItem('saved_terms', JSON.stringify(saved_terms))
                // 發出事件，通知資料變更
                this.$EventBus.$emit('terms_list-updated', saved_terms);
            }

        },
        delete_term: function () {
            // 真正送出片語時， ot_text 有可能被修改過。。。如果被人工修改，其他參數可能都會變得不一樣。。。所以應該要檢查一下。。。

            var form_input = this.getTermForm();

            // 這個 token 已有舊記錄，才需要進行刪除
            if (this.active_token in saved_terms) {
                old_list = saved_terms[this.active_token]
                // 從舊記錄列表中篩選掉相應記錄（只留下不相同的其他記錄）
                new_list = old_list.filter(ele=>
                    JSON.stringify(ele)!==JSON.stringify(form_input))

                if (new_list.length > 0) {
                    saved_terms[this.active_token] = new_list
                }
                else {
                    // 如果列表空了，就是沒有任何解釋記錄了，則此 token 記錄也要從 saved_terms 裡移除
                    // delete saved_terms[this.active_token]
                    // delete 似乎會造成 Vue 的聯動性斷掉。。。只好保留 [] 記錄
                    saved_terms[this.active_token] = new_list
                }self.data_saved_terms = saved_terms;

                // 把 saved_terms 存入 localStorage（或是直接覆蓋掉舊記錄）
                localStorage.setItem('saved_terms', JSON.stringify(saved_terms))
                // 發出事件，通知資料變更
                this.$EventBus.$emit('terms_list-updated', saved_terms);
            }
        }
    },
    /*
    template: `
        <div id="term_form">
            <div>原文 <input id="ot_text" type="text" name="ot_text" :value="action_token"/></div>
            <div>人譯 <input id="tt_text" type="text" name="tt_text" /></div>
            <div>機譯 <input id="mt_text" type="text" name="mt_text" /></div>
            <input id="term_submit" type="button" value="保存" @click="save_term" />
            <input id="term_delete" type="button" value="刪除" @click="delete_term" />
        </div>`
    */
    render(h) {
        var self = this;
        return h('div', {attrs: {id: "term_form"}}, [
            h('div', ['原文 ', h('input', { attrs: {id: "ot_text", type: "text", name: "ot_text", value: this.active_token } })]),
            h('div', ['人譯 ', h('input', { attrs: {id: "tt_text", type: "text", name: "tt_text"}})]),
            h('div', ['機譯 ', h('input', { attrs: {id: "mt_text", type: "text", name: "mt_text"}})]),
            h('input', {
                attrs: {id: "term_submit", type: "button", value: "保存"},
                on: {click: self.save_term },
            }),
            h('input', {
                attrs: {id: "term_delete", type: "button", value: "刪除"},
                on: {click: self.delete_term },
            })
        ])
    }
});

// 已儲存詞語列表
Vue.component('terms_list', {
    props: [
        'active_token',
        'tokens',
        'saved_terms'
    ],
    data () {
        return {
            data_saved_terms: this.saved_terms
        }
    },
    created: function () {
        let self = this;
        this.$EventBus.$on("terms_list-updated", function (saved_terms) {
          self.data_saved_terms = saved_terms;
        });
    },
    computed: {
        saved_tokens_in_this_sent: function () {
            tmp_list = Object.keys(this.data_saved_terms)
            tmp_list2 = tmp_list.filter(token=>this.tokens.includes(token))
            return tmp_list2
        },
    },
    /*
    template: `
        <div id="terms_list">
            <div v-for="term in data_saved_terms">
                {{term.ot_text}}：{{term.mt_text}}==》{{term.tt_text}}
            </div>
        </div>`
    */
    render(h) {
        var self = this;
        console.log(111,this.data_saved_terms)
        // var tokens = Object.keys(this.data_saved_terms)
        return h('div',
            {attrs: {id: "terms_list"}},
            this.saved_tokens_in_this_sent.map(token => {
                exp0 = this.data_saved_terms[token][0]
                // 因為可能有 [] 空記錄，所以要判斷一下。。。
                // 之所以會有空記錄，是因為 delete 掉空記錄似乎會造成 Vue 即時資料更新失效。。。
                if (exp0) {
                    return h('div',
                        `${exp0.ot_text}：${exp0.mt_text}==》${exp0.tt_text}`
                    )
                }
                else {
                    return ''
                }
            })
        )
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
