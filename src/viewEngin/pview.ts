'use strict';

/**
 * pview.js
 * @CreatedOn: 20-Sep-2017
 * @author: Kausik Dey
 * @version: 1.0.0
 * @description:This will create a View Engin Aka - pView, for render JSX virtual DOM to a real DOM.
 * 'virtual DOM'? It's just JSON - each 'VNode' is an object with 3 properties. nodeName, Attributes, children
 * The whole process (JSX -> VDOM -> DOM) in one step
 *
 * TODO: If the first element in jsx is a component type then behave incorrectly, Need to fix this.
 */
const Polyfills = require('./shims/polyfills');
const config = require('./config').default;
const merge = require('deepmerge');
const fastdom = require('fastdom');

declare global {
  interface Window {
      __h__:any;
  }
}

export interface IComponent {
  node: any,
  children: any,
  eventStack: any,
  self?: any
}

export interface IAttrDiff {
  $added: any,
  $deleted: any,
  $updated: any,
  $object: any,
  $unchanged: any,
  length?: number
}

export interface INodeDiff {
  type: string,
  attributes?: IAttrDiff
}

/**
 * MountTo will render virtual DOM Into Real DOM and add append element into the real DOM
 * @param {Object} node - It will be a real DOM node or Virtual node which can be mount.
 * @param {Object} targetNode - This will be the target DOM where actually mount will done.
 * @param {String} nodeType - This flag decide node variable having real node or virtual node ['vnode' | 'rnode'].
 * @param {Object} oldNode - This is a optional param. It is used to replace a node without removing other child of parent node.
 * @param {Object} ctx Pass the existing context.
 * @param {Boolean} emptyBeforeMount Empty the target node before mount when true.
 * @returns {SVGElement} A component object.
 * */
function mountTo(node: any, targetNode: HTMLElement, nodeType: string = 'vnode', oldNode: HTMLElement | null = null, ctx: any = {}, emptyBeforeMount: boolean = true): IComponent | SVGElement {

  if (!node) {
    throw new TypeError('Invalid vnode in render component');
  } else if (!targetNode) {
    throw new TypeError('Invalid target in render component');
  }

  let component = (nodeType === 'rnode' ? node : renderDOM.call({ context: ctx }, node));

  if (component.self && typeof component.self.beforeMount === 'function') {
    component.self.beforeMount.call(component.self);
  }

  if (!oldNode) {
    if (nodeType === 'vnode' && emptyBeforeMount) {
      targetNode.innerHTML = '';
    }
    targetNode.appendChild(component.node);
  } else {
    targetNode.replaceChild(component.node, oldNode);
  }

  if (component.eventStack && component.eventStack instanceof Array) {
    component.eventStack.forEach((evt: any) => evt());
    delete component.eventStack;
  }

  if (component.self && typeof component.self.afterMount === 'function') {
    component.self.afterMount.call(component.self);
  }

  return component;
}
/**
 * Render virtual node into real DOM node in memory.
 * @param {Object} vnode Virtual Node object.
 * @returns {Object} Real DOM node.
 */
function renderDOM(vnode: any): IComponent {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return { node: document.createTextNode(vnode as string), children: [], eventStack: [] };
  }
  let component: IComponent = {
    node: undefined,
    children: [],
    eventStack: []
  };
  /* when vnode is string like - any tag [text, svg, line, path etc.] */
  if (typeof vnode.nodeName === 'string') {
    let typeNS = config.svgNS;
    if (vnode.nodeName.match('x-')) {
      typeNS = config.htmlNS;
      vnode.nodeName = vnode.nodeName.replace('x-', '');
    }
    component.node = document.createElementNS(typeNS, vnode.nodeName);
    Object.keys(vnode.attributes || {}).forEach(key => {
      let attrVal = ((k) => {
        switch (k) {
          case 'style': return parseStyleProps(vnode.attributes[k]);
          case 'events': return parseEventsProps(vnode.attributes[k], component.node);
          default: return vnode.attributes[k];
        }
      })(key);

      if (attrVal !== undefined) {
        component.node.setAttribute(key, attrVal);
      }
    });
  } else if (typeof vnode.nodeName === 'function' && isNativeClass(vnode.nodeName)) { /* when vnode is a class constructor of type pview component */
    vnode.attributes.extChildren = vnode.children;
    /* eslint-disable-next-line babel/no-invalid-this */
    vnode.nodeName.prototype.context = this.context || {};
    /* eslint-disable-next-line new-cap*/
    let objComp = new vnode.nodeName(vnode.attributes);
    let objChildContext = _extends({}, objComp.context, (typeof objComp.passContext === 'function' ? objComp.passContext() : {}));
    let renderedComp = renderDOM.call({ context: objChildContext }, objComp.getVirtualNode());

    component.self = objComp;
    ({ node: component.node, children: component.children } = renderedComp);
    component.eventStack.push.apply(component.eventStack, renderedComp.eventStack);
    ({ node: objComp.ref.node, children: objComp.ref.children } = component);

    return component;
  } else if (typeof vnode.nodeName === 'object' && vnode.nodeName.ref) { /* when vnode is type of object which is previously constructed */
    let objComp = vnode.nodeName;
    /* eslint-disable-next-line babel/no-invalid-this */
    objComp.__proto__.context = this.context || {};
    let objChildContext = _extends({}, objComp.context, (typeof objComp.passContext === 'function' ? objComp.passContext() : {}));
    let subNodes = vnode.fromUpdate ? objComp.vnode : objComp.getVirtualNode();

    if (subNodes.children && subNodes.children.length) {
      _replaceClassWithObject(subNodes, objComp.ref, true);
    }

    let renderedComp = renderDOM.call({ context: objChildContext }, subNodes);
    objComp.props.extChildren = vnode.children;
    component.self = objComp;
    ({ node: component.node, children: component.children } = renderedComp);
    component.eventStack.push.apply(component.eventStack, renderedComp.eventStack);
    ({ node: objComp.ref.node, children: objComp.ref.children } = component);

    return component;
  } else if (typeof vnode.nodeName === 'function') { /* when vnode is type normal function */
    ({ node: component.node, children: component.children } = renderDOM.call({}, vnode.nodeName(vnode.attributes)));
  } else {
    throw new TypeError('RenderDOM method accepts html node or function with render method or class extends Component');
  }

  /* loop for children */
  (vnode.children || []).forEach((c: any) => {
    /* eslint-disable-next-line babel/no-invalid-this */
    let childComp = renderDOM.call(({ context: this.context } || {}), c);

    if (childComp.self && typeof childComp.self.beforeMount === 'function') {
      childComp.self.beforeMount.call(childComp.self);
    }

    component.children.push(childComp);
    component.node.appendChild(childComp.node);

    if (childComp.eventStack && childComp.eventStack instanceof Array) {
      component.eventStack.push.apply(component.eventStack, childComp.eventStack);
      delete childComp.eventStack;
    }

    if (childComp.self && typeof childComp.self.afterMount === 'function') {
      component.eventStack.push(childComp.self.afterMount.bind(childComp.self));
    }
  });

  return component;
}

/**
 * Method will recursively replace the virtual class with real object which previously constructed to avoid constructor call during
 * component update.
 * @param {Object} subNodes Virtual nodes with component class.
 * @param {Object} refs Real object that previously constructed.
 * @param {Object} replaceChildren Replace all classes of its children recursively.
 * @returns {undefined} void
 */
function _replaceClassWithObject(subNodes: any, refs: any, replaceChildren: any) {
  try {
    for (let i = 0; i < subNodes.children.length; i++) {
      let subNode = subNodes.children[i];
      let refChildObj = undefined;
      for (let c = 0; c < refs.children.length; c++) {
        let refChild = refs.children[c];
        if (refChild && refChild.self && typeof subNode.nodeName === 'function' && refChild.self instanceof subNode.nodeName) {
          /* Match instanceId for support multiple instance of same component type under same parent node */
          if (refChild.self.props.instanceId === subNode.attributes.instanceId) {
            subNode.class = subNode.nodeName;
            subNode.nodeName = refChild.self;
            refChildObj = refChild;
            break;
          }
        }
      }
      if (typeof subNode.nodeName === 'object') {
        if (replaceChildren && subNode.nodeName.vnode.children && subNode.nodeName.vnode.children.length && refChildObj && refChildObj.self && refChildObj.self.ref && refChildObj.self.ref.children.length) {
          _replaceClassWithObject(subNode.nodeName.vnode, refChildObj.self.ref, replaceChildren);
        }
      } else if (replaceChildren && subNode.children && subNode.children.length && refs.children && refs.children[i]) {
        _replaceClassWithObject(subNode, refs.children[i], replaceChildren);
      }
    }
  } catch (ex) {
    throw ex;
  }
}

function _rearrangeOldVNodes(oldVNode: any, newVNode: any, ref: any) {
  if (oldVNode.children instanceof Array && newVNode.children instanceof Array) {
    for (let c = 0; c < newVNode.children.length; c++) {
      let nVNode = newVNode.children[c];
      for (let i = 0; i < oldVNode.children.length; i++) {
        let oVNode = oldVNode.children[i];
        if (oVNode.attributes && oVNode.attributes.instanceId !== undefined && nVNode.attributes && oVNode.attributes.instanceId === nVNode.attributes.instanceId) {
          if (Math.max(i, c) < oldVNode.children.length) {
            let node = oldVNode.children[i];
            oldVNode.children[i] = oldVNode.children[c];
            oldVNode.children[c] = node;
            let refChild = ref.children[i];
            ref.children[i] = ref.children[c];
            ref.children[c] = refChild;
            break;
          }
        }
      }
    }
  }
}

/**
 * Hyperscript generator, gets called by transpile JSX.
 * @param {String} nodeName Name of the element like: rect, path or <Custom-component>
 * @param {Array} attributes Array of attribute of the element
 * @param  {...any} args Children of the element that passed as args.
 * @returns {Object} virtual dom object of element
 */
export function __h__(nodeName: string, attributes: any[], ...args: any[]) {
  args = args.filter((v) => {
    return !!v;
  });
  const children = args.length ? [].concat(...args) : null;
  return { nodeName, attributes: attributes || {}, children };
}
window.__h__ = window.__h__ || __h__;

/**
 * Merges the enumerable properties of two or more objects deeply.
 * It will modify the destination object.
 * Ref: https://www.npmjs.com/package/deepmerge.
 * @param  {any} dest Destination object which will be extends by rest of the paramter objects.
 * @param  {...any} args Array of source object.
 * @return {Object} Merged object.
 */
function _extends(dest: any, ...args: any[]) {
  const overwriteMerge = (destinationArray: any[], sourceArray: any[], options: any) => sourceArray;
  if (!dest) {
    return {};
  } else if (args.length === 0) {
    return dest;
  } else {
    return dest = merge.all([dest, ...args], { 'arrayMerge': overwriteMerge });
  }
}

/**
 * Convert style JSON into string, gets called by transpile JSX
 * @param {JSON} objStyle style json object
 * @returns {String} return string of css
 */
function parseStyleProps(objStyle: any) {
  if (typeof objStyle === 'string') {
    return objStyle;
  }
  let sArr: any = [];
  Object.keys(objStyle).forEach(key => {
    if (typeof objStyle[key] === 'undefined') {
      return;
    }
    if (objStyle[key].old !== undefined && objStyle[key].old !== null && objStyle[key].new !== undefined && objStyle[key].new !== null) {
      sArr.push(`${key.replace(/([A-Z])/g, $1 => '-' + $1.toLowerCase())}:${objStyle[key].new};`);
    } else {
      sArr.push(`${key.replace(/([A-Z])/g, $1 => '-' + $1.toLowerCase())}:${objStyle[key]};`);
    }
  });
  return sArr.join('');
}

/**
 * Attach events with real DOM.
 * @param {*} events JSON List of events.
 * @param {*} node Real DOM Element.
 * @returns {String} Returns List of attached events as string.
 */
function parseEventsProps(events: any, node: any) {
  Object.keys(events).forEach((e) => {
    if (events[e].new !== undefined && events[e].new !== null && events[e].old !== undefined && events[e].old !== null) {
      node._addEventListener(e, events[e].new, false);
      node.removeEventListener(e, events[e].old);
    } else {
      node._addEventListener(e, events[e], false);
    }
  });
  return Object.keys(events).join();
}

/**
 * This will return true if instance is es6 class type.
 * @param {Object} instance Object of a class to test.
 * @returns {Boolean} true if it's a class instance otherwise returns false.
 */
function isNativeClass(instance: any) {
  return instance.prototype.__proto__.constructor.name === 'Component';
}

/**
 * Component Class is the base class of all PView reusable component class.
 * All components must extends this Component class. And they should have render method.
 */

abstract class Component {
  protected props: IPropsModel;
  protected ref: any
  protected state: any;
  private vnode: any;

  constructor(props: IPropsModel) {
    this.props = props;
    this.state = {};
    this.ref = {};
  }

  /**
   * Fires when setting new state of a component.
   * @param {Object} stateParams Update that state from this object.
   * @returns {Object} Virtual Node tree of the component.
   */
  setState(stateParams: any): any {
    if (typeof stateParams === 'function') {
      stateParams = stateParams.call(this, this.state);
    }
    stateParams && Object.keys(stateParams).forEach(key => {
      this.state[key] = stateParams[key];
    });
    return this.update();
  }

  /**
   * Fetch virtual node of a component by calling its render function and assign it into vnode property.
   * @returns {Object} Virtual node of the component.
   */
  getVirtualNode() {
    return this.vnode = this.render();
  }

  /**
   * Compare nodeName, attributes to detect exact changes
   * @param {Object} oldVNode Old virtual node tree of the component.
   * @param {Object} newVNode New virtual node tree of the component.
   * @returns {Object} A diff object with type.
   */
  _detectDiff(oldVNode: any, newVNode: any): INodeDiff {
    if (typeof oldVNode !== 'object' && typeof newVNode !== 'object') {
      if (oldVNode !== newVNode) {
        return { type: 'NODE_TEXT_DIFF' };
      } else {
        return { type: 'NODE_NO_DIFF' };
      }
    }
    if (oldVNode.nodeName === newVNode.nodeName && oldVNode.attributes.instanceId === newVNode.attributes.instanceId) {
      let attrDiff: IAttrDiff = this._attrDiff(oldVNode.attributes, newVNode.attributes, 1, ['extChildren']);
      if (attrDiff.length) {
        return { type: 'NODE_ATTR_DIFF', attributes: attrDiff };
      } else {
        return { type: 'NODE_NO_DIFF' };
      }
    } else {
      return { type: 'NODE_NAME_DIFF' };
    }
  }

  /**
   * Get a diff json by comparing two JSON objects.
   * @param {Object} obj1 First object to compare.
   * @param {Object} obj2 Second object to compare with First object.
   * @param {Number} level Number of hierarchical level to compare also will run (undefined for compare all levels).
   * @param {Array} ignoreList Will ignore those attributes from this list.
   * @returns {Object} A diff object with detail of attribute differences.
   */
  _attrDiff(obj1: any, obj2: any, level: number, ignoreList: any[] = []) {
    let diff: IAttrDiff = {
      $added: {},
      $deleted: {},
      $updated: {},
      $object: {},
      $unchanged: {}
    };
    let properties = this.arrayUnique(Object.keys(obj1).concat(Object.keys(obj2)));
    for (let key = 0; key < properties.length; key++) {
      let p = properties[key];
      if (obj1[p] === undefined || obj1[p] === null) {
        diff.$added[p] = obj2[p];
      } else if (obj2[p] === undefined || obj2[p] === null) {
        diff.$deleted[p] = obj1[p];
      } else {
        if (ignoreList.indexOf(p) >= 0) {
          diff.$unchanged[p] = obj2[p];
        } else if (typeof obj1[p] === 'object' && typeof obj1[p] === 'object') {
          if (obj1[p] instanceof Array || obj2[p] instanceof Array) {
            diff.$updated[p] = {
              'new': obj2[p],
              'old': obj1[p]
            };
          } else if (level == undefined || level > 0) {
            diff.$object[p] = this._attrDiff(obj1[p], obj2[p], level !== undefined ? level - 1 : level, ignoreList);
          } else {
            diff.$updated[p] = {
              'new': obj2[p],
              'old': obj1[p]
            };
          }
        } else if (obj1[p] !== obj2[p]) {
          diff.$updated[p] = {
            'new': obj2[p],
            'old': obj1[p]
          };
        } else {
          diff.$unchanged[p] = obj2[p];
        }
      }
    }

    diff.length = (Object.keys(diff.$added).length + Object.keys(diff.$deleted).length + Object.keys(diff.$updated).length);
    for (let key in diff.$object) {
      diff.length += (diff.$object[key].length || 0);
    }
    return diff;
  }

  /**
   * Compare and return an unique array with elements.
   * @param {Array} array An array which need to de-duplicate.
   * @returns {Array} An array of unique elements.
   */
  arrayUnique(array: any[]) {
    let a = array.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  }

  /**
   * Traverse virtual node and Heuristic O(n) compare with old node to minimize DOM update.
   * @param {Object} oldVNode Previous virtual node that rendered.
   * @param {Object} newVNode Newly created virtual node that constructed recent update after passing new props.
   * @param {Object} ref Object reference of the component.
   * @param {Object} context Combination of existing self context and new context that passed from parent.
   * @returns {IAttrDiff | boolean}
   */
  _reconcile(oldVNode: any, newVNode: any, ref: any, context: any = {}): INodeDiff | boolean {
    let newRenderedVnode = undefined;

    if (newVNode.children && newVNode.children.length) {
      _replaceClassWithObject(newVNode, ref, true);
      _rearrangeOldVNodes(oldVNode, newVNode, ref);
    }

    if (ref && ref.self && typeof ref.self.passContext === 'function') {
      context = _extends({}, context, ref.self.passContext());
    }

    if (typeof newVNode.nodeName === 'object') {
      newVNode.attributes.extChildren = newVNode.children;
      let newProps = _extends({}, ref.self ? ref.self.props : {}, newVNode.attributes);

      if (ref && ref.self && typeof ref.self.propsWillReceive === 'function') {
        ref.self.propsWillReceive.call(ref.self, newProps);
      }

      if (ref && ref.self && typeof ref.self.shouldUpdate === 'function') {
        let shouldUpdate = ref.self.shouldUpdate(newProps);
        if (!shouldUpdate) {
          ref.self.props = newProps;
          return false;
        }
      }

      if (ref && ref.self) {
        ref.self.__proto__.context = context;
      }

      if (ref && ref.self && typeof ref.self.beforeUpdate === 'function') {
        ref.self.beforeUpdate.call(ref.self, newProps);
      }

      if (ref && ref.self) {
        ref.self.props = newProps;
      }

      if (ref && ref.self) {
        newRenderedVnode = ref.self.render();
      }
    }

    let differ: INodeDiff = this._detectDiff(oldVNode, newVNode);

    switch (differ.type) {
      case 'NODE_ATTR_DIFF':
        if (typeof newVNode.nodeName === 'object') {

          this._reconcile(oldVNode.nodeName.vnode, newRenderedVnode, ref.self.ref, context);
          newVNode.nodeName.vnode = newRenderedVnode;
          ref.children = ref.self.ref.children;
          if (ref && ref.self && typeof ref.self.afterUpdate === 'function') {
            ref.self.afterUpdate(oldVNode.attributes);
          }
          return false;
        } else if (typeof newVNode.nodeName === 'string') {
          this._updateAttr(ref.node, differ.attributes);
        }
        break;
      case 'NODE_TEXT_DIFF':
      case 'NODE_NAME_DIFF':
        return differ;
      default:
      case 'NODE_NO_DIFF':
        break;
    }

    if (typeof oldVNode === 'object' && typeof newVNode === 'object') {
      oldVNode.children = oldVNode.children || [];
      newVNode.children = newVNode.children || [];

      for (let child = 0; child < Math.max(oldVNode.children.length, newVNode.children.length); child++) {
        if (oldVNode.children[child] && newVNode.children[child]) {
          let reconcileDiff: INodeDiff | boolean;
          if (typeof oldVNode.nodeName === 'object' && typeof newVNode.nodeName === 'object') {
            child = Math.max(oldVNode.children.length, newVNode.children.length);
            reconcileDiff = this._reconcile(oldVNode.nodeName.vnode, newRenderedVnode, ref.self.ref, _extends({}, context));
            ref.children = ref.self.ref.children;
          } else {
            reconcileDiff = this._reconcile(oldVNode.children[child], newVNode.children[child], ref.children[child], _extends({}, context));

            if (ref.children[child].children instanceof Array && ref.children[child].children.length) {
              ref.children[child].children = ref.children[child].children.filter((v: any) => v != undefined);
            }
          }
          if (typeof reconcileDiff == 'object' && reconcileDiff.type === 'NODE_NAME_DIFF') {
            this._removeOldNode(child, oldVNode, ref);
            if (typeof newVNode.children[child].nodeName === 'object' && typeof newVNode.children[child].class === 'function') {
              newVNode.children[child].nodeName = newVNode.children[child].class;
              delete newVNode.children[child].class;
            }
            this._createNewNode(child, newVNode, ref, context);
          }
          if (typeof reconcileDiff == 'object' && reconcileDiff.type === 'NODE_TEXT_DIFF') {
            this._updateTextNode(child, newVNode, ref);
          }
          if (ref.children instanceof Array && ref.children.length) {
            ref.children = ref.children.filter((v: any) => v != undefined);
          }
        } else if (!oldVNode.children[child]) {
          if (typeof newVNode.children[child].nodeName === 'object' && typeof newVNode.children[child].class === 'function') {
            newVNode.children[child].nodeName = newVNode.children[child].class;
            delete newVNode.children[child].class;
          }
          this._createNewNode(child, newVNode, ref, context);
        } else {
          this._removeOldNode(child, oldVNode, ref);
        }
      }
      if (ref.children instanceof Array && ref.children.length) {
        ref.children = ref.children.filter((v: any) => v != undefined);
      }
    }
    if (typeof newVNode.nodeName === 'object') {
      newVNode.nodeName.vnode = newRenderedVnode;
      if (typeof ref.self.afterUpdate === 'function') {
        ref.self.afterUpdate(oldVNode.nodeName.props);
      }
    }
  }

  /**
   * Update internal text node
   * @param {Number} nodePos Index of node in virtual node children list.
   * @param {Object} newVNode Newly rendered virtual node.
   * @param {Object} ref Object reference of component.
   * @returns {undefined} void
   */
  _updateTextNode(nodePos: number = 0, newVNode: any, ref: any) {
    let newText = newVNode.children[nodePos];
    if (typeof newText !== 'object') {
      ref.node.textContent = newText;
      ref.children[nodePos].node = ref.node.childNodes[nodePos];
    }
  }

  /**
   * Render and Mount new DOM node.
   * @param {Number} nodePos Index of node in virtual node children list.
   * @param {Object} newVNode Newly rendered virtual node.
   * @param {Object} ref Object reference of component.
   * @param {Object} context Combination of existing self context and new context that passed from parent.
   * @returns {Object} A component object.
   */
  _createNewNode(nodePos: number = 0, newVNode: any, ref: any, context: any): IComponent | SVGElement {
    let newComponent = renderDOM.call({ context: context || {} }, newVNode.children[nodePos]);
    ref.children.splice(nodePos, 0, newComponent);

    return mountTo(newComponent, ref.node, 'rnode', undefined, context);
  }

  /**
   * Remove the old node from DOM and Object reference.
   * @param {Number} nodePos Index of node in virtual node children list.
   * @param {Object} oldVNode Previously rendered virtual node.
   * @param {Object} ref Object reference of component.
   * @returns {undefined} void
   */
  _removeOldNode(nodePos: number = 0, oldVNode: any, ref: any) {
    let destroyableNode = oldVNode.children[nodePos], destroyableObj;
    if (typeof destroyableNode === 'string' || typeof destroyableNode === 'number') {
      ref.node.textContent = '';
    }
    if (typeof destroyableNode.nodeName === 'object') {
      destroyableObj = destroyableNode.nodeName;
      destroyableNode = destroyableNode.nodeName.vnode;
    }

    if (destroyableObj && typeof destroyableObj.beforeUnmount === 'function') {
      destroyableObj.beforeUnmount.call(destroyableObj);
    }

    if (destroyableNode.children && destroyableNode.children instanceof Array) {
      for (let c = 0; c < destroyableNode.children.length; c++) {
        if (ref.children[nodePos]) {
          this._removeOldNode(c, destroyableNode, ref.children[nodePos]);
        }
      }
    }

    if (typeof destroyableNode.nodeName === 'object') {
      if (destroyableNode.nodeName.ref.node.parentNode) {
        destroyableNode.nodeName.ref.node._clearEventListeners();
        destroyableNode.nodeName.ref.node.parentNode.removeChild(destroyableNode.nodeName.ref.node);
      }
    } else if (typeof destroyableNode.nodeName === 'string') {
      if (ref.children[nodePos] && ref.children[nodePos].node.parentNode) {
        ref.children[nodePos].node._clearEventListeners();
        ref.children[nodePos].node.parentNode.removeChild(ref.children[nodePos].node);
      }
    }
    ref.children[nodePos] = undefined;
  }

  /**
   * Update only attribute of existing DOM node.
   * @param {Object} dom DOM reference on the node.
   * @param {Object} attrChanges Attributes to be modify.
   * @returns {undefined} void
   */
  _updateAttr(dom: SVGElement, attrChanges: IAttrDiff) {
    let groups = ['$added', '$updated', '$object'];
    groups.forEach((group: keyof IAttrDiff) => {
      Object.keys(attrChanges[group]).forEach((key) => {
        let attrVal = ((k) => {
          switch (k) {
            case 'style':
              let styles = '';
              if (typeof attrChanges[group][k] === 'object') {
                groups.forEach((grp) => {
                  styles += parseStyleProps(attrChanges[group][k][grp]);
                });
                styles += parseStyleProps(attrChanges[group][k].$unchanged);
              } else {
                styles = attrChanges[group][k];
              }
              return styles;
            case 'events':
              let evtNames = Object.keys(attrChanges[group][k].$unchanged);
              groups.forEach((grp) => {
                evtNames = evtNames.concat(parseEventsProps(attrChanges[group][k][grp], dom).split(','));
              });
              Object.keys(attrChanges[group][k].$deleted).forEach((evt) => {
                dom.removeEventListener(evt, attrChanges[group][k].$deleted[evt]);
              });
              return evtNames.filter(v => !!v).join();
            default:
              if (attrChanges[group][k] === undefined) {
                return undefined;
              }
              if (attrChanges[group][k].old !== undefined && attrChanges[group][k].new !== undefined) {
                return attrChanges[group][k].new;
              } else {
                return attrChanges[group][k];
              }
          }
        })(key);

        if (attrVal === undefined) {
          fastdom.mutate(() => {
            dom.removeAttribute(key);
          });
        } else {
          fastdom.mutate(() => {
            dom.setAttribute(key, attrVal);
          });
        }
      });
    });
    Object.keys(attrChanges.$deleted).forEach(key => {
      let attr = ((k) => {
        switch (k) {
          case 'events':
            dom.removeEventListener(k, attrChanges.$deleted[k]);
            return k;
          default: return k;
        }
      })(key);
      dom.removeAttribute(attr);
    });
  }

  /**
   * Fires when we want to re-render a component
   * @returns {Object} Virtual Node tree of the component.
   */
  update() {
    let compName: string;
    if (config.debug && config.debugRenderTime) {
      compName = Object.getPrototypeOf(this).constructor.name;
      /* eslint-disable-next-line no-console */
      console.time(compName + ' update');
    }

    if (typeof this.shouldUpdate === 'function' && !this.shouldUpdate(this.props)){
      return false;
    }

    if (typeof this.beforeUpdate === 'function') {
      this.beforeUpdate(this.props);
    }

    let vnodeNow = this.render();
    let objContext = _extends({}, (this as any).context, (typeof this.passContext === 'function' ? this.passContext() : {}));
    if (this.vnode.children && this.vnode.children.length) {
      _replaceClassWithObject(this.vnode, this.ref, true);
    }
    this._reconcile(this.vnode, vnodeNow, this.ref, objContext);

    if (typeof this.afterUpdate === 'function') {
      this.afterUpdate(this.props);
    }

    if (config.debug && config.debugRenderTime) {
      /* eslint-disable-next-line no-console */
      console.timeEnd(compName + ' update');
    }

    return this.vnode = vnodeNow;
  }

  /**
   * Interface that child may override - returns context that will pass on child context.
   * @returns {Object} A json object that will be pass as context to children components.
   */
  protected passContext?(): Record<string, any>

  /**
   * Interface that child must override - return virtual DOM of the component.
   * @returns {Object} JSX object of the component that will be rendered and mount.
   */
  protected abstract render(): any

  /* eslint-disable no-unused-vars */
  /**
   * Lifecycle event - fires just before passing props into a pre-exist Component.
   * @param {Object} nextProps New set of props.
   * @returns void.
   */
  protected propsWillReceive?(nextProps: IPropsModel): void

  /**
   * Lifecycle event - fires before the mounting component on parent DOM.
   * @param {Object} nextProps New set of props.
   * @returns void.
   */
  protected beforeMount?(nextProps: IPropsModel): void

  /**
   * Lifecycle event - fires after the component mounted on parent DOM.
   * @param {Object} nextProps New set of props.
   * @returns void.
   */
  protected afterMount?(nextProps: IPropsModel): void

  /**
   * Call before render and determine component update
   * @param {Object} nextProps Next set of props that will receive by component.
   * @returns {boolean} Return boolean true or false.
   */
  protected shouldUpdate?(nextProps: IPropsModel): boolean

  /**
   * Lifecycle event - fires before the component update on parent DOM.
   * @param {Object} nextProps set of props that was there before update that component.
   * @returns void.
   */
  protected beforeUpdate?(nextProps: IPropsModel): void

  /**
   * Lifecycle event - fires after the component update on parent DOM.
   * @param {Object} prevProps set of props that was there before update that component.
   * @returns void.
   */
  protected afterUpdate?(prevProps: IPropsModel): void

  /**
   * Lifecycle event - fires before the component unmounted from parent DOM.
   * @returns void.
   */
  protected beforeUnmount?(): void

}

interface IPropsModel {
  [key: string]: any
}

export { mountTo, renderDOM, Component, parseStyleProps };