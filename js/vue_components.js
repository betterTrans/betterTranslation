
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
        <active_token></active_token>
        <dict_pane></dict_pane>
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
            }, [this.my_active_token]),
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

// 字典區塊
Vue.component('dict_pane', {
    props: [
        'active_token'
    ],
    /*
    template=: `
    <div id="dict_result">自己查單字</div>`
    */
    render(h) {
        return h('div', {
            attrs: {id: "dict_result", },
        }, '自己查單字')
    }
});
