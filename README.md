<p align="center">
    <a href="https://www.form-create.com">
        <img width="300" alt="FormCreate" src="https://static.form-create.com/file/img/info-logo2.png">
    </a>
</p>

<p align="center">
    <a href="https://www.form-create.com/" target="_blank">官网</a>
    <span>&nbsp;|&nbsp;</span>
    <a href="https://view.form-create.com/" target="_blank">帮助文档</a>
    <span>&nbsp;|&nbsp;</span>
    <a href="https://form-create.com/v3/designer/" target="_blank">在线演示</a>
</p>

<p align="center">
  <a href="https://github.com/xaboy/form-create" target="_blank"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="TIM" /></a>
  <a href="https://github.com/xaboy/form-create" target="_blank"><img src="https://img.shields.io/npm/dt/@form-create/designer.svg" alt="dt" /></a>
</p>

**这个是 Vue3 版本**

**arco-form-designer 是基于 [@form-create/arco-design](https://github.com/xaboy/form-create) 实现的表单设计器组件。可以通过拖拽的方式快速创建表单，提高开发者对表单的开发效率，节省开发者的时间。**

**本项目基于 form-create-designer 这个项目开发 ，将UI框架更改为 [arco.design] (https://arco.design/vue/docs/start) ，做出的更改如下：**

- element-plus -> arco.design
- 增加了表单属性栏的伸缩功能

## 特点
- 使用JSON数据生成表单
- 支持扩展自定义组件
- 内置36个常用的表单组件和布局组件
- 提供丰富的表单操作API
- 支持子表单和分组
- 支持事件配置
- 支持表格布局
- 支持表单验证
- 支持多语言

![demo1](/examples/demo.png)

## 引入

**NodeJs:**

```shell
npm install arco-form-designer
```

```js
import formCreate from '@form-create/arco-design'
import FcDesigner from '@form-create/designer'

app.use(formCreate)
app.use(FcDesigner)
```

## 使用

```html
<fc-designer ref="designer"/>
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2021-present xaboy
