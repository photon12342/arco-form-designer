<template>
    <a-col :span="24">
        <div class="_fd-row arco-row" :class="{'_fc-child-empty' : !$slots.default}" v-bind="$attrs">
            <slot name="default"></slot>
        </div>
    </a-col>

</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'fcRow',
    mounted() {
    }

});
</script>

<style>
._fd-row {
    width: 100%;
}
</style>
