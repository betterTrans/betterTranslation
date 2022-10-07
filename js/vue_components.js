//=============================================
// Vue component 組件
//=============================================

// 原文句
Vue.component('orig_sent', {
    props: [
        'sent_id',
        'orig_htmls',
        'orig_texts',
        'tran_htmls',
        'tran_texts'
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
                id: "orig_sent",
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
            //this.$EventBus.$emit('token-clicked', this.token);
            slideInPanel('bt_token_panel')
            token_panel = document.querySelector('#bt_token_panel')
            token_panel.innerHTML = `<h2 style="text-align: center;">${e.target.innerText}</h2>`
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
