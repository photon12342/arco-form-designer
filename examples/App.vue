<template>
    <div id="app">
        <fc-designer ref="designer" :config="config" :handle="handle" :locale="locale">
            <template #handle>
                <a-dropdown-button size="small">
                    导入
                    <template #icon>
                        <icon-down />
                        </template>
                    <template #content>
                        <a-doption @click="setJson">导入JSON</a-doption>
                        <a-doption @click="setOption">导入Options</a-doption>
                    </template>
                </a-dropdown-button>
                <a-dropdown-button size="small">
                    导出
                    <template #icon>
                        <icon-down />
                    </template>
                    <template #content>
                        <a-doption @click="showJson">生成JSON</a-doption>
                        <a-doption @click="showOption">生成Options</a-doption>
                    </template>
                </a-dropdown-button>
            </template>
        </fc-designer>
        <a-modal :title="title[type]" :visible="state" class="_fc-t-dialog">
            <div ref="editor" v-if="state"></div>
            <span style="color: red;" v-if="err">输入内容格式有误!</span>
            <template #footer v-if="type > 2">
                <span slot="footer" class="dialog-footer">
            <a-button @click="state = false" size="small">取 消</a-button>
            <a-button type="primary" @click="onOk" size="small">确 定</a-button>
          </span>
            </template>
        </a-modal>
    </div>
</template>

<script>
import jsonlint from 'jsonlint-mod';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/vue/vue';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/addon/mode/overlay';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/selection/selection-pointer';
import 'codemirror/mode/handlebars/handlebars';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/pug/pug';

import is from '@form-create/utils/lib/type';
import formCreate from '@form-create/arco-design';
import ZhCn from "../src/locale/zh-cn";
import En from "../src/locale/en";

const CACHE_KEY = 'fc-config-$101';
const TITLE = ['生成规则', '表单规则', '生成组件', '设置生成规则', '设置表单规则'];

export default {
    name: 'app',
    data() {
        return {
            state: false,
            value: null,
            title: TITLE,
            editor: null,
            err: false,
            type: -1,
            autoSaveId: null,
            lang:'cn',
            locale: null,
            topImg: true,
            config: {
                fieldReadonly: false,
                showSaveBtn: true,
                showDevice: false,
            },
            handle: [
                // {
                //     label: '中英切换',
                //     handle: () => {
                //         this.changeLocale();
                //     },
                // },
            ],
        };
    },
    watch: {
        state(n) {
            if (!n) {
                this.value = null;
                this.err = false;
            }
        },
        value() {
            this.load();
        }
    },
    methods: {
        getCache() {
            function def() {
                return {opt: null, rule: null};
            }

            try {
                let cache = localStorage.getItem(CACHE_KEY);
                if (!cache) {
                    return def();
                }
                cache = JSON.parse(cache);
                cache.rule = formCreate.parseJson(cache.rule);
                cache.opt.submitBtn = false;
                return cache;
            } catch (e) {
                return def();
            }
        },
        setCache({opt, rule}) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                opt,
                rule: formCreate.toJson(rule)
            }));
        },
        loadAutoSave() {
            const s = this.autosave;
            if (s === false) return;
            this.autoSaveId = setInterval(() => {
                this.setCache({opt: this.$refs.designer.getOption(), rule: this.$refs.designer.getRule()});
            }, is.Number(s) ? s : 2000);
        },
        changeLocale() {
            if (this.lang === 'cn') {
                this.locale = En;
                this.lang = 'en';
            } else {
                this.locale = ZhCn;
                this.lang = 'cn';
            }
        },
        load() {
            let val;
            if (this.type === 2) {
                val = this.value;
            }else if(this.type === 0){
                val = formCreate.toJson(this.value, 2);
            }else{
                val = JSON.stringify(this.value, null, 2);
            }
            this.$nextTick(() => {
                this.editor = CodeMirror(this.$refs.editor, {
                    lineNumbers: true,
                    mode: this.type === 2 ? {name: 'vue'} : 'application/json',
                    gutters: ['CodeMirror-lint-markers'],
                    lint: true,
                    line: true,
                    tabSize: 2,
                    lineWrapping: true,
                    value: val || ''
                });
                this.editor.on('blur', () => {
                    this.err = this.editor.state.lint.marked.length > 0;
                });
            });
        },
        onValidationError(e) {
            this.err = e.length !== 0;
        },
        showJson() {
            this.state = true;
            this.type = 0;
            this.value = this.$refs.designer.getRule();
        },
        showOption() {
            this.state = true;
            this.type = 1;
            this.value = this.$refs.designer.getOption();
        },
        showTemplate() {
            this.state = true;
            this.type = 2;
            this.value = this.makeTemplate();
        },
        setJson() {
            this.state = true;
            this.type = 3;
            this.value = [];
        },
        setOption() {
            this.state = true;
            this.type = 4;
            this.value = {form: {}};
        },
        onOk() {
            if (this.err) return;
            const json = this.editor.getValue();
            let val = JSON.parse(json);
            if (this.type === 3) {
                if (!Array.isArray(val)) {
                    this.err = true;
                    return;
                }
                this.$refs.designer.setRule(formCreate.parseJson(json));
            } else {
                if (!is.Object(val) || !val.form) {
                    this.err = true;
                    return;
                }
                this.$refs.designer.setOption(val);
            }
            this.state = false;
        },
        makeTemplate() {
            const rule = this.$refs.designer.getRule();
            const opt = this.$refs.designer.getOption();
            return `<template>
  <form-create
    v-model="fapi"
    :rule="rule"
    :option="option"
    @submit="onSubmit"
  ></form-create>
</template>

<script>
import formCreate from "@form-create/arco-design";

export default {
  data () {
    return {
        fapi: null,
        rule: formCreate.parseJson('${formCreate.toJson(rule).replaceAll('\\', '\\\\')}'),
        option: formCreate.parseJson('${JSON.stringify(opt)}')
    }
  },
  methods: {
    onSubmit (formData) {
      //todo 提交表单
    }
  }
}
<\/script>`;
        }
    },
    mounted() {
        const cache = this.getCache();
        if (cache.rule) {
            this.$refs.designer.setRule(cache.rule);
        }
        if (cache.opt) {
            this.$refs.designer.setOption(cache.opt);
        }
        this.$nextTick(() => {
            this.loadAutoSave();
        });
    },
    beforeDestroy() {
        const id = this.autoSaveId;
        id && clearInterval(id);
    },
    beforeCreate() {
        window.jsonlint = jsonlint;
    }
};


</script>

<style>

:focus-visible {
    outline: 0 none;
}

.top_img {
    cursor: pointer;
}

._fc-t-header {
    height: 60px;
    margin: 0 20px;
    position: relative;
    display: flex;
    align-items: center;
    cursor: default;
}

._fc-t-logo {
    height: 26px;
}

._fc-t-name {
    display: inline-block;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin-left: 5px;
}

._fc-t-menu {
    position: absolute;
    right: 0;
}

._fc-t-menu i {
    font-size: 12px;
}


body {
    min-height: 100vh;
    padding: 0;
    margin: 0;
    display: flex !important;
    flex-direction: column !important;
}

#app {
    display: flex;
    flex-direction: column;
    flex: 1;
}


._fc-t-dialog .CodeMirror {
    height: 450px;
}

._fc-t-dialog .CodeMirror-line {
    line-height: 16px !important;
    font-size: 13px !important;
}

.CodeMirror-lint-tooltip {
    z-index: 2021 !important;
}

._fc-t-dialog .arco-modal-body {
    padding: 0px 20px;
}

._fc-zz {
    background-image: -webkit-linear-gradient(left, #cd7f32, #d81159 10%, #ffbc42 20%, #75d701 30%, #30a9de 40%, #d81159 60%, #ffbc42 70%, #75d701 80%, #30a9de 90%, #cd7f32);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    background-size: 200% 100%;
    -webkit-animation: flowlight 5s linear infinite;
    animation: flowlight 5s linear infinite;
    font-weight: 700;
}

@keyframes flowlight {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: -100% 0;
    }
}

@-webkit-keyframes flowlight {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: -100% 0;
    }
}

.pro-version{
    color: #cd7f32!important;
    font-weight: 600;
}
</style>
