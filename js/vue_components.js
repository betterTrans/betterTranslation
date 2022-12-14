
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
        'input',
        'orig_htmls',
        'orig_texts',
        'tran_htmls',
        'tran_texts',
        'saved_terms',
        'syntax_results'
    ],
    /*
    template: `
    <div id="bt_panels">
        <bt_sent_panel
            :sent_id="sent_id"
            :active_token="active_token"
            :input="input"
            :orig_htmls="orig_htmls"
            :orig_texts="orig_texts"
            :tran_htmls="tran_htmls"
            :tran_texts="tran_texts"
            :saved_terms="saved_terms"
            :syntax_results="syntax_results"
        ></bt_sent_panel>
        <bt_token_panel
            :active_token="active_token"
            :orig_htmls="orig_htmls"
            :orig_texts="orig_texts"
            :tran_htmls="tran_htmls"
            :tran_texts="tran_texts"
            :saved_terms="saved_terms"
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
                    input: this.input,
                    orig_htmls: this.orig_htmls,
                    orig_texts: this.orig_texts,
                    tran_htmls: this.tran_htmls,
                    tran_texts: this.tran_texts,
                    saved_terms: this.saved_terms,
                    syntax_results: this.syntax_results,
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
                    saved_terms: this.saved_terms,
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
        'input',
        'orig_htmls',
        'orig_texts',
        'tran_htmls',
        'tran_texts',
        'saved_terms',
        'syntax_results'
    ],
    data: function () {
        return {
            input_tag_simplized: true,  // 預設簡化標籤
            input_tag_list: {},
        }
    },
    computed: {
        sents_count: function() { return Object.keys(orig_htmls).length },
        sent_index: function () { return parseInt(this.sent_id.replace('sent_','')) },
        orig_tag_list: function() { return this.getTagList(this.orig_htmls[this.sent_index]) },
        input_tag: function() {
            if (/\<[a-zA-Z0-9]+\s*([^\>])*\>/.test(this.input)) {  // 如果有 <tag> 頭的話。。。
                this.input_tag_list = this.getTagList(this.input);
            }
            return {
                simplized_input: this.getTagSimplizedInput(this.input, this.input_tag_list),
                restored_input: this.getTagRestoredInput(this.input, this.input_tag_list),
            }
        },
        tag_btn_label: function() { return this.input_tag_simplized ? "還原標籤" : "簡化標籤" },
    },
    methods: {
        closeSentPanel: function () {
            togglePanel("bt_sent_panel", 'bottom');
        },
        switchTextarea: function () {
            feature_switch.input_in_panel = !feature_switch.input_in_panel
            // 向外發出訊息，請求更新界面（不可直接在此執行 switchToModification()，focus 會找不到 textarea）
            chrome.runtime.sendMessage({
                cmd:'reset_modification_inteface', 
                data:{sent_id: this.sent_id},
            })
        },
        switchTagSimplize: function () {
            this.input_tag_simplized = !this.input_tag_simplized
        },
        // 簡化標籤處理：取出 tag 標籤列表
        getTagList: function(html, recursive_times) {
            var tag_list = {};
            if (/\<[a-zA-Z0-9]+\s*([^\>])*\>/.test(this.input)) {  // 如果有 <tag> 頭的話。。
                recursive_times = recursive_times || 0;
                var max_recursive_times = 10; // 避免陷入結構過深 stackoverflow 的情況。。。
                if (recursive_times > max_recursive_times) return {};

                // 先把 HTML 轉成物件
                var htmlObj = document.createElement('div');
                htmlObj.innerHTML = html;

                // 從物件中取出 tag 子標籤
                for (var i = 0; i < htmlObj.children.length; i++) {
                    var ele = htmlObj.children[i];
                    tag_list[i] = ele;
                    // 如果還有子標籤的話。。。
                    if (ele.children.length > 0) {
                        var children_tag_list = this.getTagList(ele.innerHTML, recursive_times++);
                        for (var j in children_tag_list) {
                            tag_list[i + '_' + j] = children_tag_list[j];
                        }
                    }
                }
            }
            return tag_list;
        },
        node2tagHeadTail: function(node) {
            var tagHeadTail = {}
            if (node.outerHTML) {
                var tag_head = node.outerHTML.match(/^\<[a-zA-Z0-9]+\s*([^\>])*\>/);
                tag_head = tag_head && tag_head[0];
                var tag_tail = node.outerHTML.match(/\<\/[a-zA-Z0-9]+\>$/);
                tag_tail = tag_tail && tag_tail[0];
                tagHeadTail = {
                    tag_head: tag_head,
                    tag_tail: tag_tail,
                }
            }
            return tagHeadTail
        },
        // 簡化標籤處理：根據 tag 標籤列表，進行文字簡化
        getTagSimplizedInput: function(input, tag_list) {
            if (/\<[a-zA-Z0-9]+\s*([^\>])*\>/.test(input)) {  // 如果有 <tag> 頭的話。。。
                // 簡化標簽
                for (var k in tag_list) {
                    var tagHeadTail = this.node2tagHeadTail(tag_list[k]);
                    if (tagHeadTail.tag_head && tagHeadTail.tag_tail) { // 頭尾都有才做替換
                        input = input // 這種做法遇到多層的相同 tag 會有問題==》待改進
                            .replace(tagHeadTail.tag_head, '{' + k + '}')
                            .replace(tagHeadTail.tag_tail, '{/' + k + '}');
                    }
                }
            }
            return input;
        },
        // 簡化標籤處理：根據 tag 標籤列表，還原簡化前文字
        getTagRestoredInput: function(input, tag_list) {
            if (/\{[0-9_]+\}/.test(input)) {  // 如果有 {編號} 頭的話。。。
                // 簡化標簽
                for (var k in tag_list) {
                    var tagHeadTail = this.node2tagHeadTail(tag_list[k]);
                    if (tagHeadTail.tag_head && tagHeadTail.tag_tail) { // 頭尾都有才做替換
                        input = input // 這種做法遇到多層的相同 tag 會有問題==》待改進
                            .replace('{' + k + '}', tagHeadTail.tag_head)
                            .replace('{/' + k + '}', tagHeadTail.tag_tail);
                    }
                }
            }
            return input;
        },
    },
    /*
    template: `
    <div id="bt_sent_panel" class="bt_ponel ">
        <div id="bt_sent_panel_head">
            <button v-on:click="closeSentPanel" title="收合面板">V</button>
            <button v-on:click="switchTextarea" title="切換編輯框">[]</button>
            句子編號：#{{sent_id}} / {{sents_count}}
            <button v-on:click="switchTagSimplize" title="切換簡化標籤">{{tag_btn_label}}</button>
        </div>
        <orig_sent
            :sent_id="sent_id"
            :orig_texts="orig_texts"
            :saved_terms="saved_terms"
            :syntax_results="syntax_results"
        ></orig_sent>
        <textarea id="sent_editor_in_panel" class="sent_editor">
            {{input}}
        <textarea>
    </div>`
    */
    render(h) {
        return h('div', {
            class: ['bt_panel', 'bottom'],
            attrs: {id: "bt_sent_panel", },
        },
        [
            h('div', {
                attrs: {id: "bt_sent_panel_head", },
            }, [
                h('button', {
                    attrs: {title: "收合面板"},
                    on: { click: this.closeSentPanel }
                }, 'V'),
                h('button', {
                    attrs: {title: "切換編輯框"},
                    on: { click: this.switchTextarea }
                }, '[ ]'),
                ` 句子編號：#${this.sent_id} / ${this.sents_count} `,
                h('button', {
                    attrs: {title: "切換標籤簡化"},
                    on: { click: this.switchTagSimplize }
                }, this.tag_btn_label),
            ]),
            h('orig_sent', {
                props: {
                    sent_id: this.sent_id,
                    orig_texts: this.orig_texts,
                    saved_terms: this.saved_terms,
                    syntax_results: this.syntax_results,
                }
            }, []),
            (feature_switch.input_in_panel)?
            h('textarea', {
                class: ["sent_editor"],
                attrs: {
                    id: "sent_editor_in_panel",
                    name: this.sent_id,
                },
                domProps: {
                    // value: this.input,   // 這相當於 v-bind：用 Vue.data 去設定 DOM 的 attr 屬性
                    value: this.input_tag_simplized ?
                        this.input_tag.simplized_input :
                        this.input_tag.restored_input
                },
                // 【v-model】
                // textarea 的 v-model 要看 input 事件，同步 value 的值
                on: {
                    input: e => {
                        this.input = e.target.value;  // 這相當於 v-model：用 DOM 的 attr 屬性去更新 Vue.data
                        document.querySelector(`#${this.sent_id}`).innerHTML =
                            this.input_tag_simplized ? this.input_tag.restored_input : this.input   // 直接去改外部相應的內文？？！！
                        // this.$emit('input_changed', this.input);  // 再送個事件出去，讓別處也可以得到通知
                    },
                },
            })
            :''
        ])
    }
});

// 原文句
Vue.component('orig_sent', {
    props: [
        'sent_id',
        'orig_texts',
        'saved_terms',
        'syntax_results'
    ],
    computed: {
        sent_index: function () {
            return parseInt(this.sent_id.replace('sent_',''))
        },
        sent_text: function () {
            return this.orig_texts[this.sent_index]
        },
        syntax_result: function () {
            syntaxed_sent = Object.keys(this.syntax_results)
            if (syntaxed_sent.includes(this.sent_text)) {
                // console.log('直接使用現成的語法分析結果')
                // console.log(this.syntax_results[this.sent_text])
                return this.syntax_results[this.sent_text]
            }
            else {
                // console.log('去外部取回語法分析結果')
                // 如果沒保存過語法分析結果，就要去外部取回
                chrome.runtime.sendMessage({ cmd: 'get_syntax_result', data: {
                        sentence: this.orig_texts[this.sent_index],
                    }
                });
                // 取回語法分析結果需要花點時間，這裡先把值設定為空的 null
                return null
            }
        },
        tokens: function () {
            var tokens;
            if (this.syntax_result) {
                tokens = this.syntax_result.tokens

                // 取得語法分析後的 tokens 之後，還要去外部取回 svced_terms
                token_strs = []
                for (var i in tokens) {
                    token_strs.push(tokens[i].text.content)
                }
                chrome.runtime.sendMessage({cmd: 'get_terms', data: {tokens: token_strs} })
            }
            else {
                split_symbol = this.sent_text.replace(/([a-zA-Z0-9])([.,!;:\?])/g, '$1 $2')
                tokens = split_symbol.split(' ')
            }

            return tokens
        },
    },
    /**
    template: `
    <div id="orig_sent" style="margin: '20px';">
        <orig_token
            v-for="(token, i) in tokens"
            :index="i"
            :token="token"
            :saved_terms="saved_terms"
            :syntax_result="syntax_result"
        ></orig_token>
    </div>`
    /**/
    render(h) {
        return h('div', {
                attrs: {id: "orig_sent", },
                style: { 'margin': '20px', },
            },
            this.tokens.map((token, i) => h('orig_token', {
                props: {
                    index: i,
                    token: token,
                    saved_terms: this.saved_terms,
                    syntax_result: this.syntax_result,
                }
            }))
        )
    }
});

// 原文 token
Vue.component('orig_token', {
    props: [
        "index",
        "token",
        "saved_terms",
        "syntax_result",
    ],
    computed: {
        key: function () {
            return `bt_t${this.index}`
        },
        is_root: function () {
            return (this.syntax_result)?
                (this.index == this.token.dependencyEdge.headTokenIndex ? 'root' : '') : ''
        },
        pos: function () {
            // tagDict 是全域變數，定義詞性的中文名稱
            return (this.syntax_result)? tagDict[this.token.partOfSpeech.tag] : ''
            // partOfSpeech 底下還有 mood、number、person、tense 等屬性，可參酌使用
        },
        role: function () {
            // dependencyDict 是全域變數，定義各單詞在句中所扮演角色的中文名稱
            return (this.syntax_result)? dependencyDict[this.token.dependencyEdge.label] : ''
            // dependencyEdge 底下還有 headTokenIndex 記錄著父節點的 index，可參酌使用
        },
        lemma: function () {
            // dependencyDict 是全域變數，定義各單詞在句中所扮演角色的中文名稱
            return (this.syntax_result)? this.token.lemma : ''
        },
        ot_text: function () {
            return (this.syntax_result)? this.token.text.content : this.token
        },
        tt_text: function () {
            return (Object.keys(this.saved_terms).includes(this.ot_text)
                && this.saved_terms[this.ot_text].length > 0 )?
                this.saved_terms[this.ot_text][0].tt_text : '　'
        },
        mt_text: function () {
            return (Object.keys(this.saved_terms).includes(this.ot_text)
                && this.saved_terms[this.ot_text].length > 0 )?
                this.saved_terms[this.ot_text][0].mt_text : '　'
        },
        token_title: function () {
            return (this.pos.length > 0) ?
                `【${this.pos}】` + ((this.pos != this.role)?`做為【${this.role}】`:'') : ''
        }
    },
    methods: {
        activate: function (e) {
            e.target.classList.add('active');
        },
        deactivate: function (e) {
            e.target.classList.remove('active');
        },
        tokenClicked: function (e) {
            this.$EventBus.$emit('token-clicked', this.ot_text);
            slideInPanel('bt_token_panel')
        },
        dict_search: function (e) {
            query_str = e.target.textContent;

            if (query_str.length > 0) {
                dictSearch(query_str)
            }
        },
    },
    /*
    template: `
    <div :id="key" class="orig_token"
        :class="[is_root]"
        v-on:mouseover="activate"
        v-on:mouseout="deactivate"
        v-on:click="tokenClicked"
        v-on:dblclick="dict_search">
        <div class="partOfSpeech tag">{{pos}}</div>
        <div class="dependencyEdge label">{{role}}</div>
        <div class="lemma">{{lemma}}</div>
        <div class="ot_text" :title="token_title">{{ot_text}}</div>
        <div class="tt_text" :title="token_title">{{tt_text}}</div>
        <div class="mt_text">{{mt_text}}</div>
    </div>`
    */
    render(h) {
        return h('div', {
            attrs: {id: this.key},
            class: `orig_token ${this.is_root}`,
            on: {
                mouseover: this.activate,
                mouseout: this.deactivate,
                click: this.tokenClicked,
                dblclick: this.dict_search,
            },
        }, [
            h('div', {
                class: `partOfSpeech tag`,
            }, this.pos),
            h('div', {
                class: `dependencyEdge label`,
            }, this.role),
            h('div', {
                class: `lemma`,
            }, this.lemma),
            h('div', {
                class: `ot_text`,
                attrs: {title: this.token_title}
            }, this.ot_text),
            h('div', {
                class: `tt_text`,
                attrs: {title: this.token_title}
            }, this.tt_text),
            h('div', {
                class: `mt_text`
            }, this.mt_text)
        ])
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
            split_symbol = this.sent_text.replace(/([a-zA-Z0-9])([.,!;:\?])/g, '$1 $2')
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
            chrome.runtime.sendMessage({ cmd: 'save_term', data: {
                    active_token: this.active_token,
                    form_input: this.getTermForm()
                }
            });
        },
        delete_term: function () {
            // 真正送出片語時， ot_text 有可能被修改過。。。如果被人工修改，其他參數可能都會變得不一樣。。。所以應該要檢查一下。。。
            chrome.runtime.sendMessage({ cmd: 'delete_term', data: {
                    active_token: this.active_token,
                    form_input: this.getTermForm()
               }
            });
        }
    },
    /*
    template: `
        <div id="term_form">
            <div>原文 <input id="ot_text" type="text" name="ot_text" :value="action_token"/></div>
            <div>機譯 <input id="mt_text" type="text" name="mt_text" /></div>
            <div>人譯 <input id="tt_text" type="text" name="tt_text" /></div>
            <input id="term_submit" type="button" value="保存" @click="save_term" />
            <input id="term_delete" type="button" value="刪除" @click="delete_term" />
        </div>`
    */
    render(h) {
        var self = this;
        return h('div', {attrs: {id: "term_form"}}, [
            h('div', ['原文 ', h('input', { attrs: {id: "ot_text", type: "text", name: "ot_text", value: this.active_token } })]),
            h('div', ['機譯 ', h('input', { attrs: {id: "mt_text", type: "text", name: "mt_text"}})]),
            h('div', ['人譯 ', h('input', { attrs: {id: "tt_text", type: "text", name: "tt_text"}})]),
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
    computed: {
        saved_tokens_in_this_sent: function () {
            tmp_list = Object.keys(this.saved_terms)
            tmp_list2 = tmp_list.filter(token=>this.tokens.includes(token))
            return tmp_list2
        },
    },
    /*
    template: `
        <div id="terms_list">
            <div v-for="term in saved_terms">
                {{term.ot_text}}：{{term.mt_text}}==》{{term.tt_text}}
            </div>
        </div>`
    */
    render(h) {
        var self = this;
        // var tokens = Object.keys(this.saved_terms)
        return h('div',
            {attrs: {id: "terms_list"}},
            this.saved_tokens_in_this_sent.map(token => {
                exp0 = this.saved_terms[token][0]
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
