# vue-el-multi-cascader
### 基于element-ui实现的多选级联组件, 支持多选级联, loading等多种操作

## install
```
npm install vue-el-multi-cascader
```

### run
```
npm run serve
```


<!-- - [x] 支持多选
- [x] 支持异步加载loading
- [-] 兼容常规单选
+ [] 支持正向checked(父级选中,子级都选中)
+ [] 支持反向checked(父子级都使用自身的check状态) -->

### use
```
import Vue from 'vue'
import Element from 'element-ui'
import App from './App.vue'
import ElMultiCascader from 'vue-el-multi-cascader'
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.config.devtools = true


Vue.use(Element)
Vue.use(ElMultiCascader)

new Vue({
    el: '#app',
    components: { App },
    template: '<App/>'
})
```

```
<ElMultiCascader v-model="options"></ElMultiCascader>
```

<!-- ### Run your tests
```
npm run test
``` -->

<!-- ### Lints and fixes files
```
npm run lint
``` -->

<!-- ### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/). -->
