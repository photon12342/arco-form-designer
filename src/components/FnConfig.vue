<template>
    <!-- 全局表单配置的设置事件 -->
    <div class="_fd-fn-list">
        <a-badge :count="eventNum">
            <a-button @click="hanleClick" size="small" type="primary" long>{{ t('event.title') }}</a-button>
        </a-badge>
        <a-modal class="_fd-fn-list-dialog" :title="t('event.title')" :visible="visible" unmount-on-close
                   :mask-closable="false"
                   render-to-body
                   @cancel="visible = false"
                   width="980px">
            <a-layout class="_fd-fn-list-con" style="height: 500px">
                <a-layout-sider :width="300">
                    <a-layout class="_fd-fn-list-l">
                        <a-layout-header class="_fd-fn-list-head" height="40px">
                            <span>
                                {{ t('event.list') }}
                            </span>
                        </a-layout-header>
                        <a-layout-content>
                            <a-menu
                                :selected-keys="defActive">
                                <a-menu-item v-for="(item, name) in event" :key="name">
                                    <div class="_fd-fn-list-method" @click.stop="edit(item)">
                                        <span>function<span>{{ name }}</span></span>
                                    </div>
                                </a-menu-item>
                            </a-menu>
                        </a-layout-content>
                    </a-layout>
                </a-layout-sider>
                <a-layout-content>
                    <a-layout class="_fd-fn-list-r">
                        <a-layout-header class="_fd-fn-list-head" height="40px" v-if="activeData">
                            <a-space>
                                <a-button size="small" @click="close">{{ t('props.cancel') }}</a-button>
                                <a-button size="small" type="primary" @click="save" color="#2f73ff">{{
                                        t('props.save')
                                    }}
                                </a-button>
                            </a-space>
                        </a-layout-header>
                        <a-layout-content v-if="activeData">
                            <FnEditor ref="fn" v-model="eventStr" :name="activeData.item.name"
                                      :args="activeData.item.args"/>
                        </a-layout-content>
                    </a-layout>
                </a-layout-content>
            </a-layout>
            <template #footer>
                <a-space>
                    <a-button size="small" @click="visible=false">{{ t('props.cancel') }}</a-button>
                    <a-button type="primary" size="small" @click="submit" color="#2f73ff">{{
                            t('props.ok')
                        }}
                    </a-button>
                </a-space>
            </template>
        </a-modal>
    </div>
</template>

<script>
import unique from '@form-create/utils/lib/unique';
import deepExtend from '@form-create/utils/lib/deepextend';
import {defineComponent} from 'vue';
import FnEditor from './FnEditor.vue';
import errorMessage from '../utils/message';

const PREFIX = '[[FORM-CREATE-PREFIX-';
const SUFFIX = '-FORM-CREATE-SUFFIX]]';

export default defineComponent({
    name: 'FnConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: [Object, undefined, null],
        eventConfig: {
            type: Array,
            default: () => []
        },
    },
    inject: ['designer'],
    components: {
        FnEditor,
    },
    data() {
        return {
            visible: false,
            activeData: null,
            defActive: [],
            event: {},
            cus: false,
            eventStr: '',
        };
    },
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        eventNum() {
            let num = 0;
            Object.keys(this.modelValue || {}).forEach(k => {
                if (this.modelValue[k]) {
                    num++;
                }
            });
            return num;
        },
    },
    watch: {
        visible(v) {
            this.event = v ? this.loadFN(deepExtend({}, this.modelValue || {})) : {};
            if (!v) {
                this.destroy();
            }
        },
    },
    methods: {
        hanleClick() {
            this.visible = true;
        },
        getArgs(item) {
            return item.args.join(', ');
        },
        loadFN(e) {
            const val = {};
            this.eventConfig.forEach(item => {
                const k = item.name;
                const fn = e[k] || '';
                val[k] = {
                    item, fn
                }
            });
            return val;
        },
        parseFN(e) {
            const on = {};
            Object.keys(e).forEach(k => {
                if (e[k].fn) {
                    on[k] = e[k].fn;
                }
            });
            return on;
        },
        edit(data) {
            data.key = unique();
            this.activeData = data;
            this.eventStr = data.fn || (PREFIX + `function ${data.item.name}(${this.getArgs(data.item)}){}` + SUFFIX);
            console.log('eventStr', this.eventStr);
            this.defActive = [data.item.name];
        },
        save() {
            if (this.$refs.fn.save()) {
                this.activeData.fn = this.eventStr;
                this.destroy();
            }
        },
        destroy() {
            this.activeData = null;
            this.defActive = [];
        },
        close() {
            this.destroy();
        },
        submit() {
            if (this.activeData) {
                return errorMessage(this.t('event.saveMsg'));
            }
            this.$emit('update:modelValue', this.parseFN(this.event));
            this.visible = false;
            this.destroy();
        },
    }
});
</script>

<style>
._fd-fn-list, ._fd-fn-list .arco-badge {
    width: 100%;
}

._fd-fn-list .arco-button {
    font-weight: 400;
    width: 100%;
    border-color: #2E73FF;
    color: #2E73FF;
}

._fd-fn-list-dialog .arco-modal-body {
    padding: 10px 20px;
}

._fd-fn-list-con .arco-layout {
    padding: 0;
}

._fd-fn-list-l, ._fd-fn-list-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid #ececec;
}

._fd-fn-list-head {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid #eee;
    background: #f8f9ff;
    align-items: center;
}

._fd-fn-list-head .arco-button.is-link {
    color: #2f73ff;
}

._fd-fn-list-r {
    border-left: 0 none;
}

._fd-fn-list-r ._fd-fn-list-head {
    justify-content: flex-end;
}

._fd-fn-list-l > .arco-layout-content, ._fd-fn-list-r > .arco-layout-content {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-fn-list-r > .arco-layout-content {
    flex-direction: column;
}

._fd-fn-list-l .arco-menu {
    padding: 0 10px 5px;
    border-right: 0 none;
    width: 100%;
    border-top: 0 none;
    overflow: auto;
}

._fd-fn-list-l .arco-menu-item.is-active {
    background: #e4e7ed;
    color: #303133;
}

._fd-fn-list-l .arco-menu-item {
    height: auto;
    line-height: 1em;
    border: 1px solid #ECECEC;
    border-radius: 5px;
    padding: 0;
    margin-top: 5px;
}

._fd-fn-list-method {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px 0;
    font-size: 14px;
    line-height: 1em;
    font-family: monospace;
    width: 100%;
    overflow: hidden;
    white-space: pre-wrap;
}

._fd-fn-list-method-info > span:first-child, ._fd-fn-list-method > span:first-child {
    color: #9D238C;
}

._fd-fn-list-method-info > span:first-child > span, ._fd-fn-list-method > span:first-child > span {
    color: #000;
    margin-left: 10px;
}

._fd-fn-list-con .CodeMirror {
    height: 100%;
    width: 100%;
}

._fd-fn-list-con .CodeMirror-wrap pre.CodeMirror-line {
    padding-left: 20px;
}
</style>
