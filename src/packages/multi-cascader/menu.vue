<script>
import { isDef } from 'element-ui/src/utils/shared';
import scrollIntoView from 'element-ui/src/utils/scroll-into-view';
import { generateId } from 'element-ui/src/utils/util';
import ElCheckbox from 'element-ui/packages/checkbox';
import { digging, climb, deepcopy } from './utils.js'


export function ChangeIndeterminate(current_point) { // 初始化半勾选状态
  climb(current_point, point => {
    const checked = point.children || []
    const checked_length = checked.filter(l => l.checked).length
    point.checked = checked.length ? checked_length === checked.length : point.checked  // 本节点被选中子节点均被选中
    if (point.checked) {
      point.indeterminate = false
    } else { // 当前节点未选中
      point.indeterminate = !!checked.filter(l => l.checked || l.indeterminate).length // 所有次级节点有任何一个选中或半选中
    }
  })
}
const EVENTS = { click: 'click', hover: 'mouseenter' } // 事件对应

export default {
  name: 'ElCascaderMenu',

  data() {
    return {
      options: [],
      props: {},
      visible: false,
      activeValue: [],
      value: [],
      expandTrigger: 'click',
      changeOnSelect: false,
      popperClass: '',
      hoverTimer: 0,
      clicking: false,
      id: generateId(),
      selected: [0,], // 选中的项目数量
      uptime: null, // 用于触发render
    };
  },

  computed: {
    activeOptions: { // 当前路径要展示的内容
      get() {
        const loadActiveOptions = (options, activeOptions = []) => {
          const level = activeOptions.length;
          activeOptions[level] = options;
          let active = this.activeValue[level];
          if (isDef(active)) {
            options = options.filter(option => option.value === active)[0];
            if (options && options.children.length) {
              loadActiveOptions(options.children, activeOptions);
            }
          }
          return activeOptions;
        };
        return loadActiveOptions(this.options);
      }
    }
  },

  methods: {
    ChangeIndeterminate,

    select(item, menuIndex) {
      const checked = !item.checked
      digging(item, option => {
        option.checked = checked
        option.indeterminate = false
      }) // 向下全选中, 清除模糊
      this.ChangeIndeterminate(item)
      this.$emit('pick', item);
    },
    handleMenuLeave() { this.$emit('menuLeave') },
    activeItem(item, menuIndex) {
      const len = this.activeOptions.length;
      this.activeValue.splice(menuIndex, len, item.value);
      this.$emit('activeItemChange', this.activeValue);
    },
  },

  render(h) {
    const {
      options,
      activeValue,
      activeOptions,
      visible,
      expandTrigger,
      popperClass,
      hoverThreshold,
      uptime
    } = this;

    const menus = this._l(activeOptions, (menu, menuIndex) => {
      let isFlat = false;
      const menuId = `menu-${this.id}-${menuIndex}`;
      const ownsId = `menu-${this.id}-${menuIndex + 1}`;
      const items = this._l(menu, item => {
        if (item.__HIDE__) return;
        const events = { on: {} };

        // if (item.__IS__FLAT__OPTIONS) isFlat = true;

        if (!item.disabled) {      // 未禁用
          if (item.children.length) {
            const triggerHandler = () => {
              if (this.visible) { this.activeItem(item, menuIndex) }
            };
            events.on[EVENTS[expandTrigger]] = triggerHandler;
          }
        }
        const checkbox_events = {
          on: {
            change: () => {
              this.select(item)
              this.uptime = new Date()
            }
          },
        }

        return (
          <li
            class={{
              'el-cascader-menu__item': true,
              'el-cascader-checked': item.checked,
              'is-active': item.value === activeValue[menuIndex],
              'is-disabled': item.disabled
            }}
            ref={item.value === activeValue[menuIndex] ? 'activeItem' : null}
            {...events}
            tabindex={item.disabled ? null : -1}
            role="menuitem"
            aria-haspopup={!!item.children.length}
            aria-expanded={item.value === activeValue[menuIndex]}
            aria-owns={!item.children ? null : ownsId}
          >
            <ElCheckbox {...checkbox_events} value={item.checked} indeterminate={item.indeterminate} disabled={item.disabled}></ElCheckbox>
            {item.label || item.value}
            {!item.children.length ? '' :
              <i class={{
                "extensible": true,
                "el-icon-arrow-right": !item.__LOADING__ || item.children.length,
                "el-icon-loading": item.__LOADING__,
              }}></i>
            }
          </li>
        );
      });

      return (
        <ul
          class={{
            'el-cascader-menu': true,
            'el-cascader-menu--flexible': isFlat
          }}
          refInFor
          ref="menus"
          role="menu"
          id={menuId}
        >
          {items}
        </ul>
      );
    });


    return (
      <transition name="el-zoom-in-top" on-after-leave={this.handleMenuLeave}>
        <div
          v-show={visible}
          class={[
            'el-cascader-menus el-popper',
            popperClass
          ]}
          ref="wrapper"
        >
          <div x-arrow class="popper__arrow"></div>
          {menus}
        </div>
      </transition>
    );
  }
};
</script>
<style scoped>
.extensible {
  float: right;
  color: #c0c4cc;
}
.el-checkbox {
  margin-right: 8px;
}
</style>
