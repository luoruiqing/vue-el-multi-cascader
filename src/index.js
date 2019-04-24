import MultiCascader from './packages/multi-cascader/index.js';
// ...如果还有的话继续添加

const components = [
    MultiCascader,
    // ...如果还有的话继续添加
]

const install = function (Vue, opts = {}) {
    components.map(component => {
        Vue.component(component.name, component);
    })
}

/* 支持使用标签的方式引入 */
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    install,
    MultiCascader,
    // ...如果还有的话继续添加
}