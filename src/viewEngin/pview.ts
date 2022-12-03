'use strict';

const Polyfills = require('./shims/polyfills');
import deepmerge from 'deepmerge';
import { config } from './config';
import { ElementTypeNS, IObject, IPrototype, NodeType } from './pview.model';
import { IVnode, IComponent, IReferenceNode } from './component.model';
import { Component } from './component';

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

/**
 * MountTo will render virtual DOM Into Real DOM and add append element into the real DOM
 * @param {IVnode} node - It will be a real DOM node or Virtual node which can be mount.
 * @param {HTMLElement | SVGElement} targetNode - This will be the target DOM where actually mount will done.
 * @param {NodeType} nodeType - This flag decide node variable having real node or virtual node ['vnode' | 'rnode'].
 * @param {HTMLElement | null} oldNode - This is a optional param. It is used to replace a node without removing other child of parent node.
 * @param {IObject} ctx Pass the existing context.
 * @param {Boolean} emptyBeforeMount Empty the target node before mount when true.
 * @returns {SVGElement} A component object.
 * */
export function mountTo(node: IVnode, targetNode: HTMLElement | SVGElement, nodeType: NodeType = 'vnode', oldNode: HTMLElement | null = null, ctx: IObject = {}, emptyBeforeMount: boolean = true): IComponent {

  if (!node) {
    throw new TypeError('Invalid JSX in render component');
  } else if (!targetNode) {
    throw new TypeError('Invalid target in render component');
  }

  let component: IComponent = (nodeType === 'rnode' ? node : renderDOM.call({ context: ctx }, node));

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
 * @param {IVnode} vnode Virtual Node object.
 * @returns {IComponent} Real DOM node.
 */
export function renderDOM(vnode: IVnode): IComponent {
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
    let typeNS: ElementTypeNS = config.svgNS;
    if (vnode.nodeName.match('x-')) {
      typeNS = config.htmlNS;
      vnode.nodeName = vnode.nodeName.replace('x-', '');
    }
    component.node = document.createElementNS(typeNS, vnode.nodeName) as (SVGElement | HTMLElement | Text);
    Object.keys(vnode.attributes || {}).forEach(key => {
      let attrVal = ((k) => {
        switch (k) {
          case 'style': return parseStyleProps(vnode.attributes[k]);
          case 'events': return parseEventsProps(vnode.attributes[k], component.node);
          default: return vnode.attributes[k];
        }
      })(key);

      if ((component.node instanceof HTMLElement || component.node instanceof SVGElement) && attrVal !== undefined) {
        component.node.setAttribute(key, attrVal);
      }
    });
  }
  else if (typeof vnode.nodeName === 'function' && isNativeClass(vnode.nodeName)) { /* when vnode is a class constructor of type pview component */
    vnode.attributes.extChildren = vnode.children;
    /* eslint-disable-next-line babel/no-invalid-this */
    (vnode.nodeName as IPrototype).prototype.context = this.context || {};
    /* eslint-disable-next-line new-cap*/
    let objComp: Component = new vnode.nodeName(vnode.attributes);
    let objChildContext: IObject = _extends({}, (objComp as any).context, (typeof objComp.passContext === 'function' ? objComp.passContext() : {}));
    let renderedComp: IComponent = renderDOM.call({ context: objChildContext }, objComp.getVirtualNode());

    component.self = objComp;
    component.node = renderedComp.node;
    component.children = renderedComp.children;
    component.eventStack.push.apply(component.eventStack, renderedComp.eventStack);
    objComp.setRef({
      node: component.node,
      children: component.children
    });
    return component;
  } else if (vnode.nodeName instanceof Component && vnode.nodeName.getRef()?.node) { /* when vnode is type of object which is previously constructed */
    let objComp: Component = vnode.nodeName;
    /* eslint-disable-next-line babel/no-invalid-this */
    (objComp as any).__proto__.context = this.context || {};
    let objChildContext: IObject = _extends({}, (objComp as any).context, (typeof objComp.passContext === 'function' ? objComp.passContext() : {}));
    let subNodes: IVnode = objComp.getVirtualNode();

    if (subNodes.children && subNodes.children.length) {
      _replaceClassWithObject(subNodes, objComp.getRef(), true);
    }

    let renderedComp: IComponent = renderDOM.call({ context: objChildContext }, subNodes);
    objComp.setExternalChildren(vnode.children as IVnode[]);
    component.self = objComp;
    component.node = renderedComp.node;
    component.children = renderedComp.children;
    component.eventStack.push.apply(component.eventStack, renderedComp.eventStack);
    objComp.setRef({
      node: component.node,
      children: component.children
    });
    return component;
  } else if (typeof vnode.nodeName === 'function' && !isNativeClass(vnode.nodeName)) { /* when vnode is type normal function */
    ({ node: component.node, children: component.children } = renderDOM.call({}, vnode.nodeName(vnode.attributes)));
  } else {
    throw new TypeError('RenderDOM method accepts html node or function with render method or class extends Component');
  }

  /* loop for children */
  (vnode.children || []).forEach((c) => {
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
 */
export function _replaceClassWithObject(subNodes: IVnode, refs: IReferenceNode, replaceChildren: boolean): void {
  try {
    for (let i = 0; i < subNodes.children.length; i++) {
      let subNode = subNodes.children[i] as IVnode;
      let refChildObj = undefined;
      for (let c = 0; c < refs.children.length; c++) {
        let refChild = refs.children[c];
        if (refChild && refChild.self && typeof subNode.nodeName === 'function' && refChild.self instanceof subNode.nodeName) {
          /* Match instanceId for support multiple instance of same component type under same parent node */
          if (refChild.self.getProps().instanceId === subNode.attributes.instanceId) {
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

export function _rearrangeOldVNodes(oldVNode: IVnode, newVNode: IVnode, ref: IReferenceNode): void {
  if (oldVNode.children instanceof Array && newVNode.children instanceof Array) {
    for (let c = 0; c < newVNode.children.length; c++) {
      let nVNode = newVNode.children[c] as IVnode;
      for (let i = 0; i < oldVNode.children.length; i++) {
        let oVNode = oldVNode.children[i] as IVnode;
        if (oVNode.attributes && oVNode.attributes.instanceId !== undefined && nVNode.attributes && oVNode.attributes.instanceId === nVNode.attributes.instanceId) {
          if (Math.max(i, c) < oldVNode.children.length) {
            let node = oldVNode.children[i];
            oldVNode.children[i] = oldVNode.children[c];
            oldVNode.children[c] = node;
            let refChild: IReferenceNode = ref.children[i];
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
 * @param  {any[]} args Children of the element that passed as args.
 * @returns {IVnode} virtual dom object of element
 */
export function __h__(nodeName: string, attributes: IObject, ...args: any[]): IVnode {
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
export function _extends(dest: IObject, ...args: IObject[]): IObject {
  const overwriteMerge = (destinationArray: any[], sourceArray: any[], options: any) => sourceArray;
  if (!dest) {
    return {};
  } else if (args.length === 0) {
    return dest;
  } else {
    return dest = deepmerge.all([dest, ...args], { 'arrayMerge': overwriteMerge });
  }
}

/**
 * Convert style JSON into string, gets called by transpile JSX
 * @param {string | IObject} objStyle style json object
 * @returns {string} return string of css
 */
export function parseStyleProps(objStyle: string | IObject): string {
  if (typeof objStyle === 'string') {
    return objStyle;
  }
  let styleArray: string[] = [];
  Object.keys(objStyle).forEach(key => {
    if (typeof objStyle[key] === 'undefined') {
      return;
    }
    if (objStyle[key].old !== undefined && objStyle[key].old !== null && objStyle[key].new !== undefined && objStyle[key].new !== null) {
      styleArray.push(`${key.replace(/([A-Z])/g, $1 => '-' + $1.toLowerCase())}:${objStyle[key].new};`);
    } else {
      styleArray.push(`${key.replace(/([A-Z])/g, $1 => '-' + $1.toLowerCase())}:${objStyle[key]};`);
    }
  });
  return styleArray.join('');
}

/**
 * Attach events with real DOM.
 * @param {IObject} events JSON List of events.
 * @param {SVGElement | HTMLElement | Text} node Real DOM Element.
 * @returns {string} Returns List of attached events as string.
 */
export function parseEventsProps(events: IObject, node: SVGElement | HTMLElement | Text): string {
  Object.keys(events).forEach((e) => {
    if (events[e].new !== undefined && events[e].new !== null && events[e].old !== undefined && events[e].old !== null) {
      (node as any)._addEventListener(e, events[e].new, false);
      node.removeEventListener(e, events[e].old);
    } else {
      (node as any)._addEventListener(e, events[e], false);
    }
  });
  return Object.keys(events).join();
}

/**
 * This will return true if instance is es6 class type.
 * @param {any} _class Object of a class to test.
 * @returns {boolean} true if it's a class instance otherwise returns false.
 */
export function isNativeClass(_class: any): boolean {
  return _class.prototype.__proto__.constructor.name === 'Component';
}

export { Component };