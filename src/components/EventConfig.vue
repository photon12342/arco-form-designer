<template>
    <!-- 表单组件的设置事件 -->
    <div class="_fd-event">
        <a-badge :count="eventNum" style="width: 100%">
            <a-button size="small" type="primary" long @click="visible=true">{{ t('event.title') }}</a-button>
        </a-badge>
        <a-modal class="_fd-event-dialog" :title="t('event.title')" :visible="visible" 
                    unmount-on-close
                    :mask-closable="false"
                    @cancel="visible=false"
                    render-to-body
                   width="980px">
            <a-layout class="_fd-event-con" style="height: 500px">
                <a-layout-sider :width="300">
                    <a-layout class="_fd-event-l">
                        <a-layout-header class="_fd-event-head" height="40px">
                            <a-dropdown popper-class="_fd-event-dropdown" trigger="click" size="default"
                                         :placement="'bottom-start'">
                              <span class="el-dropdown-link">
                                <a-button link type="primary" size="default">
                                    {{ t('event.create') }}
                                </a-button>
                              </span>
                                <template #content>
                                    <a-doption v-for="name in eventName" :key="name" @click="add(name)">
                                        <div class="_fd-event-item">
                                            <span>{{ name }}</span>
                                        </div>
                                    </a-doption>
                                    <a-doption :divided="eventName.length > 0" @click="cusEvent">
                                        <div>{{ t('props.custom') }}</div>
                                    </a-doption>
                                </template>
                            </a-dropdown>
                        </a-layout-header>
                        <a-layout-content>
                            <a-menu
                                :default-active="defActive"
                                v-model="activeData">
                                <template v-for="(item, name) in event">
                                    <template v-if="Array.isArray(item)">
                                        <template v-for="(event, index) in item" :key="name + index">
                                            <a-menu-item :index="name + index">
                                                <div class="_fd-event-title"
                                                     @click.stop="edit({name, item, index})">
                                                    <div class="_fd-event-method">
                                                        <span>function<span>{{
                                                                name
                                                            }}</span></span>
                                                    </div>
                                                    <i class="fc-icon icon-delete"
                                                       @click.stop="rm({name, item, index})"></i>
                                                </div>
                                            </a-menu-item>
                                        </template>
                                    </template>
                                    <a-menu-item v-else :index="name + 0">
                                        <div class="_fd-event-title" @click.stop="edit({name})">
                                            <div class="_fd-event-method">
                                                        <span>function<span>{{
                                                                name
                                                            }}</span></span>
                                            </div>
                                            <i class="fc-icon icon-delete" @click.stop="rm({name})"></i>
                                        </div>
                                    </a-menu-item>
                                </template>
                                <a-menu-item v-if="cus" style="padding-left: 10px;" index="custom">
                                    <div class="_fd-event-title" @click.stop>
                                        <a-input type="text" v-model="cusValue" size="default"
                                                  @keydown.enter="addCus"
                                                  :placeholder="t('event.placeholder')">
                                        </a-input>
                                        <div>
                                            <i class="fc-icon icon-add" @click.stop="addCus"></i>
                                            <i class="fc-icon icon-delete" @click.stop="closeCus"></i>
                                        </div>
                                    </div>
                                </a-menu-item>
                            </a-menu>
                        </a-layout-content>
                    </a-layout>
                </a-layout-sider>
                <a-layout-content>
                    <a-layout class="_fd-event-r">
                        <a-layout-header class="_fd-event-head" height="40px" v-if="activeData">
                            <div><a target="_blank" href="https://form-create.com/v3/instance">{{t('form.document')}}</a></div>
                            <div>
                                <a-button size="small" @click="close">{{ t('props.cancel') }}</a-button>
                                <a-button size="small" type="primary" @click="save" color="#2f73ff">{{
                                        t('props.save')
                                    }}
                                </a-button>
                            </div>
                        </a-layout-header>
                        <a-layout-content v-if="activeData">
                            <FnEditor ref="fn" v-model="eventStr" body :name="activeData.name"
                                      :args="fnArgs"
                                      style="height: 519px;"/>
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
import is from '@form-create/utils/lib/type';
import {defineComponent} from 'vue';
import FnEditor from './FnEditor.vue';
import errorMessage from '../utils/message';
import {getInjectArg} from '../utils';

const $T = '$FNX:';

const isFNX = v => {
    return is.String(v) && v.indexOf($T) === 0;
};

export default defineComponent({
    name: 'EventConfig',
    emits: ['update:modelValue'],
    props: {
        modelValue: [Object, undefined, null],
        componentName: '',
        eventName: {
            type: Array,
            default: () => []
        }
    },
    inject: ['designer'],
    components: {
        FnEditor,
    },
    data() {
        return {
            visible: false,
            activeData: null,
            val: null,
            defActive: 'no',
            event: {},
            cus: false,
            cusValue: '',
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
                num += Array.isArray(this.modelValue[k]) ? this.modelValue[k].length : 1;
            });
            return num;
        },
        fnArgs() {
            return [getInjectArg(this.t)];
        }
    },
    watch: {
        visible(v) {
            this.event = v ? this.loadFN(deepExtend({}, this.modelValue || {})) : {};
            if (!v) {
                this.destroy();
                this.closeCus();
            }
        },
    },
    methods: {
        addCus() {
            const val = this.cusValue && this.cusValue.trim();
            if (val) {
                this.closeCus();
                this.add(val);
            }
        },
        closeCus() {
            this.cus = false;
            this.cusValue = '';
        },
        cusEvent() {
            this.cus = true;
        },
        loadFN(e) {
            const val = {};
            Object.keys(e).forEach(k => {
                if (Array.isArray(e[k])) {
                    const data = [];
                    e[k].forEach(v => {
                        if (isFNX(v)) {
                            data.push(v.replace($T, ''));
                        } else if (is.Function(v) && isFNX(v.__json)) {
                            data.push(v.__json.replace($T, ''));
                        } else if (v && v.indexOf('$GLOBAL:') === 0) {
                            data.push(v);
                        }
                    });
                    val[k] = data;
                } else if (isFNX(e[k])) {
                    val[k] = [e[k].replace($T, '')];
                } else if (is.Function(e[k]) && isFNX(e[k].__json)) {
                    val[k] = [e[k].__json.replace($T, '')];
                } else if (e[k] && e[k].indexOf('$GLOBAL:') === 0) {
                    val[k] = [e[k]];
                }
            });
            return val;
        },
        parseFN(e) {
            const on = {};
            Object.keys(e).forEach(k => {
                const lst = [];
                e[k].forEach((v, i) => {
                    lst[i] = v.indexOf('$GLOBAL:') !== 0 ? ($T + v) : v;
                });
                if (lst.length > 0) {
                    on[k] = lst.length === 1 ? lst[0] : lst;
                }
            });
            return on;
        },
        add(name) {
            let data = {};
            if (Array.isArray(this.event[name])) {
                this.event[name].push('');
                data = {
                    name,
                    item: this.event[name],
                    index: this.event[name].length - 1,
                };
            } else if (this.event[name]) {
                const arr = [this.event[name], ''];
                this.event[name] = arr;
                data = {
                    name,
                    item: arr,
                    index: 1,
                };
            } else {
                const arr = [''];
                this.event[name] = arr;
                data = {
                    name,
                    item: arr,
                    index: 0,
                };
            }
            if (!this.activeData) {
                this.edit(data);
            }
        },
        edit(data) {
            data.key = unique();
            if (data.item) {
                this.val = data.item[data.index];
            } else {
                this.val = this.event[data.name];
            }
            this.activeData = data;
            this.eventStr = this.val;
            this.defActive = data.name + (data.index || 0);
        },
        save() {
            if (!this.$refs.fn.save()) {
                return;
            }
            const str = this.eventStr;

            if (this.activeData.item) {
                this.activeData.item[this.activeData.index] = str;
            } else {
                this.event[this.activeData.name] = str;
            }
            this.destroy();
        },
        rm(data) {
            if (data.index !== undefined) {
                data.item.splice(data.index, 1);
            } else {
                this.$delete(this.event, data.name);
            }
            if (this.defActive === (data.name + (data.index || 0))) {
                this.destroy();
            }
        },
        destroy() {
            this.activeData = null;
            this.val = null;
            this.defActive = 'no';
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
            this.closeCus();
        },
    },
    beforeCreate() {
        window.$inject = {
            $f: {},
            rule: [],
            self: {},
            option: {},
            inject: {},
            args: [],
        };
    }
});
</script>

<style>

._fd-event .arco-button {
    font-weight: 400;
    width: 100%;
    border-color: #2E73FF;
    color: #2E73FF;
}

._fd-event .arco-badge {
    width: 100%;
}

._fd-event-dialog .arco-modal-body {
    padding: 10px 20px;
}

._fd-event-con .arco-layout-content {
    padding: 0;
}

._fd-event-l, ._fd-event-r {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    border: 1px solid #ececec;
}

._fd-event-dropdown .arco-dropdown-menu {
    max-height: 500px;
    overflow: scroll;
}

._fd-event-head {
    display: flex;
    padding: 5px 15px;
    border-bottom: 1px solid #eee;
    background: #f8f9ff;
    align-items: center;
}

._fd-event-head .arco-button.is-link {
    color: #2f73ff;
}

._fd-event-r {
    border-left: 0 none;
}

._fd-event-r ._fd-event-head {
    justify-content: space-between;
}

._fd-event-l > .arco-layout-content, ._fd-event-r > .arco-layout-content {
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
}

._fd-event-r > .arco-layout-content {
    flex-direction: column;
}

._fd-event-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 250px;
    font-size: 14px;
    overflow: hidden;
    white-space: pre-wrap;
}

._fd-event-l .arco-menu {
    padding: 0 10px 5px;
    border-right: 0 none;
    width: 100%;
    border-top: 0 none;
    overflow: auto;
}

._fd-event-l .arco-menu-item.is-active {
    background: #e4e7ed;
    color: #303133;
}

._fd-event-l .arco-menu-item {
    height: auto;
    line-height: 1em;
    border: 1px solid #ECECEC;
    border-radius: 5px;
    padding: 0;
    margin-top: 5px;
}

._fd-event-method {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 225px;
    font-size: 14px;
    font-family: monospace;
    color: #9D238C;
    overflow: hidden;
    white-space: pre-wrap;
}

._fd-event-method > span:first-child, ._fd-fn-list-method > span:first-child {
    color: #9D238C;
}

._fd-event-method > span:first-child > span, ._fd-fn-list-method > span:first-child > span {
    color: #000;
    margin-left: 10px;
}

._fd-event-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 0;
}

._fd-event-title .fc-icon {
    margin-right: 6px;
    font-size: 18px;
    color: #282828;
}

._fd-event-title .arco-input {
    width: 200px;
}

._fd-event-title .arco-input-wrapper {
    box-shadow: none;
}

._fd-event-title .arco-menu-item.is-active i {
    color: #282828;
}

._fd-event-con .CodeMirror {
    height: 100%;
    width: 100%;
}

._fd-event-con .CodeMirror-wrap pre.CodeMirror-line {
    padding-left: 20px;
}
</style>
