import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
// https://vitejs.dev/config/
export default defineConfig({
    base: '/v3/designer/',
    build: {
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vue: ['vue'],
                    '@arco-design/web-vue': ['@arco-design/web-vue'],
                },
                globals: {
                    vue: 'Vue',
                }
            },
        },
        chunkSizeWarningLimit: 2000,
    },
    plugins: [vue(), vueJSX()]
})