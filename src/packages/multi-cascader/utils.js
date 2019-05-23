
const copyArray = (arr, props) => {
  if (!arr || !Array.isArray(arr) || !props) return arr;
  const result = [];
  const configurableProps = ['__IS__FLAT__OPTIONS', 'label', 'value', 'disabled'];
  const childrenProp = props.children || 'children';
  arr.forEach(item => {
    const itemCopy = {};
    configurableProps.forEach(prop => {
      let name = props[prop];
      let value = item[name];
      if (value === undefined) {
        name = prop;
        value = item[name];
      }
      if (value !== undefined) itemCopy[name] = value;
    });
    if (Array.isArray(item[childrenProp])) {
      itemCopy[childrenProp] = copyArray(item[childrenProp], props);
    }
    result.push(itemCopy);
  });
  return result;
};


export function deepcopy(object, reference = true) {
  // 拷贝对象, 同时保留对象的引用
  let result = {};
  if (Array.isArray(object)) {
    result = object.map(obj => deepcopy(obj))
  } else if (Object.prototype.toString.call(object) === '[object Object]') {
    Object.keys(object).forEach(k => result[k] = deepcopy(object[k]))
    if (reference) {
      result.__source__ = object
    }
  } else {
    result = object
  }
  return result

}

export function digging(leaf, callback, level = 0, children_key = 'children', root = undefined, copy = false, relation = false) {
  // 下钻嵌套树形数据 本节点, 父亲节点
  let leafs // 当前节点的所有子节点
  if (Array.isArray(leaf)) { // 当前节点是列表
    leafs = leaf // 兼容类型, 子节点是第一个参数, 并没有父节点
  } else { // 非列表类型, 只有一个根节点
    callback(leaf, root, level) // 调用, 每层等级加1
    level = level + 1
    leafs = leaf[children_key] || [] // 获取子节点
    root = leaf // 当前节点变成了子节点的根
  }
  leafs.forEach(leaf => digging(leaf, callback, level, children_key, root, copy, relation)) // 展开当前节点的子节点
}

export function climb(root, callback = () => { }, level = 0, key = 'root') {
  // 上钻父节点
  const branch = []
  while (root) {
    callback(root, level)
    branch.push(root)
    root = root[key]
    level = level + 1
  }
  return branch
}
export default {
  digging,
  climb,
  deepcopy,
}