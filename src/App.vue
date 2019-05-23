<template>
  <!--  -->
  <div class="mail">
    <div class="left">
      <pre>{{ optionsStr }}</pre>
    </div>
    <div class="right">
      <h2>多选级联筛选器</h2>
      <pre>
        基于element-ui框架开发, 支持多选, 搜索等, Git地址:  https://github.com/luoruiqing/vue-el-multi-cascader
      </pre>
      <h4>选项:</h4>
      <el-form ref="form" label-width="80px">
        <el-form-item label="常规">
          <el-checkbox v-model="disabled" class="f1">禁用</el-checkbox>
          <div class="fx">
            <span class="label ">placeholder:</span>
            <el-input v-model="placeholder"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="附加">
          <div class="fx">
            <span class="label">间隔符:</span>
            <el-input v-model="separator" class="text"></el-input>
          </div>
          <div class="fx">
            <span class="label">后缀:</span>
            <el-input v-model="suffix" class="text"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="过滤">
          <el-checkbox v-model="filterable">启用</el-checkbox>
          <el-checkbox v-model="clearable">清空按钮</el-checkbox>
          <span class="label">去抖延时:</span>
          <el-input-number v-model="debounce" :min="0" :max="10000" :step="1000" label="请输入"></el-input-number>
        </el-form-item>
        <el-form-item label="弹出方式">
          <el-radio-group v-model="expandTrigger">
            <el-radio-button label="click"></el-radio-button>
            <el-radio-button label="hover"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="屏幕遮挡">
          <el-checkbox v-model="test">测试</el-checkbox>
        </el-form-item>
        <el-form-item label="异步">
          active-item-change方法会返回原始对象, 设置该对象的loading=true, 完成异步后设置为false即可, 添加子节点直接写入对象的children内即可.
        </el-form-item>
        <el-form-item label="样例">
          <span v-if="test">尝试贴在屏幕边缘 -----------------------------------></span>
          <MultiCascader v-model="options" :debounce="debounce" :separator="separator" :expand-trigger="expandTrigger" :filterable="filterable" :clearable="clearable" :before-filter="beforeFilter" :disabled="disabled" @active-item-change="activeItemChange" @blur="blur" @focus="focus" :placeholder="placeholder">
          </MultiCascader>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

import MultiCascader from './packages/multi-cascader/index.vue';
import { generateId } from 'element-ui/src/utils/util';
export default {
  name: 'app',
  components: {
    MultiCascader
  },
  data() {
    return {
      disabled: false,
      size: 'mini',
      placeholder: undefined,

      separator: '/', // 分隔符
      suffix: '项',

      filterable: true,
      clearable: true,
      debounce: 500,

      expandTrigger: 'hover',

      optionsStr: '{}',

      test: false,

      options: [
        {
          value: 'zhinan',
          label: '指南',
          children: [
            {
              value: 'shejiyuanze',
              label: '设计原则',
              children: [{
                value: 'yizhi',
                label: '一致',
                children: [],
              }, {
                value: 'fankui',
                label: '反馈',
                disabled: true,
              }, {
                value: 'xiaolv',
                label: '效率',
              }, {
                value: 'kekong',
                label: '可控',
              }]
            }, {
              value: 'daohang',
              label: '导航',
              children: [{
                value: 'cexiangdaohang',
                label: '侧向导航'
              }, {
                value: 'dingbudaohang',
                label: '顶部导航'
              }]
            }]
        }, {
          value: 'zujian',
          label: '组件',

          children: [
            {
              value: 'basic',
              label: 'Basic',
              children: [{
                value: 'layout',
                label: 'Layout 布局'
              }, {
                value: 'color',
                label: 'Color 色彩'
              }, {
                value: 'typography',
                label: 'Typography 字体'
              }, {
                value: 'icon',
                label: 'Icon 图标'
              }, {
                value: 'button',
                label: 'Button 按钮'
              }]
            }, {
              value: 'form',
              label: 'Form',
              children: [{
                value: 'radio',
                label: 'Radio 单选框'
              }, {
                value: 'checkbox',
                label: 'Checkbox 多选框'
              }, {
                value: 'input',
                label: 'Input 输入框'
              }, {
                value: 'input-number',
                label: 'InputNumber 计数器'
              }, {
                value: 'select',
                label: 'Select 选择器'
              }, {
                value: 'cascader',
                label: 'Cascader 级联选择器'
              }, {
                value: 'switch',
                label: 'Switch 开关'
              }, {
                value: 'slider',
                label: 'Slider 滑块'
              }, {
                value: 'time-picker',
                label: 'TimePicker 时间选择器'
              }, {
                value: 'date-picker',
                label: 'DatePicker 日期选择器'
              }, {
                value: 'datetime-picker',
                label: 'DateTimePicker 日期时间选择器'
              }, {
                value: 'upload',
                label: 'Upload 上传'
              }, {
                value: 'rate',
                label: 'Rate 评分'
              }, {
                value: 'form',
                label: 'Form 表单'
              }]
            }, {
              value: 'data',
              label: 'Data',
              children: [{
                value: 'table',
                label: 'Table 表格'
              }, {
                value: 'tag',
                label: 'Tag 标签'
              }, {
                value: 'progress',
                label: 'Progress 进度条'
              }, {
                value: 'tree',
                label: 'Tree 树形控件'
              }, {
                value: 'pagination',
                label: 'Pagination 分页'
              }, {
                value: 'badge',
                label: 'Badge 标记'
              }]
            }, {
              value: 'notice',
              label: 'Notice',
              children: [{
                value: 'alert',
                label: 'Alert 警告'
              }, {
                value: 'loading',
                label: 'Loading 加载'
              }, {
                value: 'message',
                label: 'Message 消息提示'
              }, {
                value: 'message-box',
                label: 'MessageBox 弹框'
              }, {
                value: 'notification',
                label: 'Notification 通知'
              }]
            }, {
              value: 'navigation',
              label: 'Navigation',
              children: [{
                value: 'menu',
                label: 'NavMenu 导航菜单'
              }, {
                value: 'tabs',
                label: 'Tabs 标签页'
              }, {
                value: 'breadcrumb',
                label: 'Breadcrumb 面包屑'
              }, {
                value: 'dropdown',
                label: 'Dropdown 下拉菜单'
              }, {
                value: 'steps',
                label: 'Steps 步骤条'
              }]
            }, {
              value: 'others',
              label: 'Others',
              children: [{
                value: 'dialog',
                label: 'Dialog 对话框'
              }, {
                value: 'tooltip',
                label: 'Tooltip 文字提示'
              }, {
                value: 'popover',
                label: 'Popover 弹出框'
              }, {
                value: 'card',
                label: 'Card 卡片'
              }, {
                value: 'carousel',
                label: 'Carousel 走马灯'
              }, {
                value: 'collapse',
                label: 'Collapse 折叠面板'
              }]
            }]
        }, {
          value: 'ziyuan',
          label: '资源',
          children: [
            {
              value: 'axure',
              label: 'Axure Components'
            }, {
              value: 'sketch',
              label: 'Sketch Templates'
            }, {
              value: 'jiaohu',
              label: '组件交互文档',
            }]
        }]
    };
  },
  methods: {
    beforeFilter(value) {
      console.log('输入的关键字', value)
    },
    activeItemChange(option) {
      console.log('点击或展开了', option.label)
      option.loading = true
    },
    blur() {
      console.log('失去焦点')
    },
    focus() {
      console.log('获取焦点')
    },
  },
  watch: {
    options: {
      deep: true,
      immediate: true,
      handler() {
        this.optionsStr = JSON.stringify(this.options, null, 4)
      }
    }
  },
  mounted() {
    setTimeout(_ => {
      // this.options = []
    }, 3000)
  },
}
</script>
<style scoped>
.fx {
  display: flex;
}
.f1 {
  flex: 1;
}
.mail {
  height: 100vh;
  display: flex;
}
.right,
.left {
  width: 100%;
  text-overflow: ellipsis;
  overflow-y: auto;
  flex: 1;
}
.label {
  width: 80px;
  text-align: right;
  margin-right: 5px;
}
</style>
