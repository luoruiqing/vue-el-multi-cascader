<template>
  <span class="el-cascader" :class="[
      {
        'is-opened': menuVisible,
        'is-disabled': cascaderDisabled
      },
      cascaderSize ? 'el-cascader--' + cascaderSize : ''
    ]" @click="handleClick" @mouseenter="inputHover = true" @focus="inputHover = true" @mouseleave="inputHover = false" @blur="inputHover = false" ref="reference" v-clickoutside="v => menuVisible = false">
    <el-input ref="input" :readonly="readonly" :placeholder="is_current_selects ? undefined : placeholder" v-model="inputValue" @input="debouncedInputChange" @focus="ev => $emit('focus', ev)" @blur="ev => $emit('blur', ev)" :validate-event="false" :size="size" :disabled="cascaderDisabled" :class="{ 'is-focus': menuVisible }">
      <template slot="suffix">
        <i key="1" v-if="clearable && inputHover && inputValue" class="el-input__icon el-icon-circle-close el-cascader__clearIcon" @click="ev => { ev.stopPropagation(); inputValue = ''; init_options(value) }"></i>
        <i key="2" v-else class="el-input__icon el-icon-arrow-down" :class="{ 'is-reverse': menuVisible }"></i>
      </template>
    </el-input>
    <span class="el-cascader__label" v-show="inputValue === '' && is_current_selects">
      <template v-for="(label, index) in current_selects">
        {{ label }}{{suffix}}
        <span v-if="index < current_selects.length - 1" :key="index"> {{ separator }} </span>
      </template>
    </span>
  </span>
</template>

<script>
import Vue from 'vue';
import ElCascaderMenu from './menu';
import ElInput from 'element-ui/packages/input';
import Popper from 'element-ui/src/utils/vue-popper';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import emitter from 'element-ui/src/mixins/emitter';
import Locale from 'element-ui/src/mixins/locale';
import { t } from 'element-ui/src/locale';
import debounce from 'throttle-debounce/debounce';
import { digging, climb, deepcopy } from './utils.js'
import { generateId, escapeRegexpString, isIE, isEdge } from 'element-ui/src/utils/util';

const configurableProps = ['label', 'value', 'children', 'disabled', 'checked', '__LOADING__', '__HIDE__'];
const DEFAULT_OBJECT = {}

const popperMixin = {
  props: {
    placement: {
      type: String,
      default: 'bottom-start'
    },
    appendToBody: Popper.props.appendToBody,
    arrowOffset: Popper.props.arrowOffset,
    offset: Popper.props.offset,
    boundariesPadding: Popper.props.boundariesPadding,
    popperOptions: Popper.props.popperOptions
  },
  methods: Popper.methods,
  data: Popper.data,
  beforeDestroy: Popper.beforeDestroy
};

export default {
  name: 'ElMultiCascader',

  directives: { Clickoutside },

  mixins: [popperMixin, emitter, Locale],

  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },

  components: {
    ElInput
  },

  props: {
    props: {
      type: Object,
      default() {
        return {
          children: 'children',
          label: 'label',
          value: 'value',
          disabled: 'disabled'
        };
      }
    }, // 配置选项
    value: { type: Array, required: true }, // options
    disabled: { type: Boolean, default: false },
    size: { type: String, default: '' },

    placeholder: { type: String, default() { return t('el.cascader.placeholder') } },

    separator: { type: String, default: '/' }, // 选项分隔符
    suffix: { type: String, default: '项' }, // 后缀字符

    filterable: { type: Boolean, default: false }, // 是否可搜索选项
    clearable: { type: Boolean, default: false }, // 是否支持清空选项
    beforeFilter: { type: Function, default: () => (() => { }) }, // 过滤前的钩子函数

    expandTrigger: { type: String, default: 'click' }, // 次级菜单的展开方式

    popperClass: { type: String, default: '' }, // 自定义浮层类名	
    debounce: { type: Number, default: 300 }, // 搜索关键词输入的去抖延迟，毫秒
    hoverThreshold: { type: Number, default: 500 } // XXX 鼠标停留延时
  },

  data() {
    return {
      options: [], // value的拷贝
      menu: null, // 子组件
      debouncedInputChange() { },
      menuVisible: false,  // 菜单展开状态
      inputHover: false,
      inputValue: '',
      flatOptions: null,
      id: generateId(),
      current_selects: [], // 当前选中各层级的个数
    };
  },

  computed: {
    is_current_selects() {
      return this.current_selects.filter(i => i).length
    },
    _elFormItemSize() {
      return (this.elFormItem || DEFAULT_OBJECT).elFormItemSize;
    },
    cascaderSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || DEFAULT_OBJECT).size;
    },
    cascaderDisabled() {
      return this.disabled || (this.elForm || DEFAULT_OBJECT).disabled;
    },
    readonly() {
      return !this.filterable || (!isIE() && !isEdge() && !this.menuVisible);
    }
  },

  watch: {
    expandTrigger(value) {
      this.menu.expandTrigger = value
    },
    menuVisible(value) {
      this.menu.visible = value;
      this.inputValue = ''; // 打开或者关闭都清除输入框内容
      if (value) {
        this.init_options(this.value)
        this.$nextTick(this.updatePopper);
      }
      this.$emit('visible-change', value);
    },
    value: { deep: true, immediate: true, handler: 'init_options' } // 更新值
  },

  methods: {
    init_menu() {
      this.menu = new Vue(ElCascaderMenu).$mount();
      this.menu.props = this.props;
      this.menu.expandTrigger = this.expandTrigger;
      // this.menu.changeOnSelect = this.changeOnSelect;
      this.menu.popperClass = this.popperClass;
      this.menu.hoverThreshold = this.hoverThreshold;
      this.popperElm = this.menu.$el;
      this.menu.$on('pick', this.handlePick);
      this.menu.$on('activeItemChange', (value) => {
        this.$nextTick(this.updatePopper); // 更新窗口, 防止超出屏幕
        this.$emit('active-item-change', value);
      });
      this.menu.$on('menuLeave', this.doDestroy); // 销毁
    },
    init_options(value) {
      this.options = deepcopy(value) // 拷贝并保留源
      const last_branchs = [] // 获取所有叶节点之前的一个节点, 用于反向半勾选
      this.current_selects = []

      digging(this.options, (option, root, level) => {
        // 初始化
        configurableProps.forEach(prop => option[prop] = option[this.props[prop] || prop]) // 属性初始化
        Object.assign(option, {
          children: option.children || [], root: root,
          checked: (root || DEFAULT_OBJECT).checked || option.checked || false // 初始化勾选状态
        })
        // 附加项
        this.current_selects[level] = this.current_selects[level] || 0 // 初始化选中数量
        if (option.checked) this.current_selects[level] += 1 // 更新选中数量
        if ((!option.children || !option.children.length) && option.root) last_branchs.push(root)// 没有子节点, 将上一个枝节点收集
        // 搜索逻辑
        if (this.inputValue && !option.children.length) { // 叶节点
          if (climb(option).filter(o => o.label.indexOf(this.inputValue) > -1).length) {// 任意节点命中
            climb(option, o => o.__HIDE__ = false) // 从叶节点开始都不隐藏
          } else {
            climb(option, o => o.__HIDE__ = o.__HIDE__ === undefined ? true : o.__HIDE__) // 关闭展示
          }
        }
      })
      this.$nextTick(_ => {
        new Set(last_branchs).forEach(last_branch => this.menu.ChangeIndeterminate(last_branch))
        this.menu.options = this.options
      }) // 更新半勾选
    },
    handlePick(value) {
      digging(this.options, option => option.__source__.checked = option.checked) // 更新到源数据勾选状态
      this.$emit('input', [...this.value]); // ! 改变对象的引用触发更新
      this.$emit('change', value.__source__);
      this.$nextTick(this.updatePopper);
    },
    handleClick() {
      if (this.cascaderDisabled) return;
      this.$refs.input.focus();
      this.menuVisible = this.filterable || !this.menuVisible
    },
    handleInputChange(input_string) { // 处理输入的搜索
      if (!this.menuVisible) return;
      this.init_options(this.value)
    },
  },
  created() {

    this.debouncedInputChange = debounce(this.debounce, value => {
      const before = this.beforeFilter(value); // 钩子函数返回内容才重新渲染, 可以是异步方法
      const execute = () => this.$nextTick(() => this.handleInputChange(value)) // 执行过滤
      if (before && before.then) {
        before.then(execute);
      } else if (before !== false) { // false不过滤
        execute()
      }
    });
  },
  mounted() { this.init_menu() },  // 保持两个组件周期一致
};
</script>
