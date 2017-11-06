
"use strict";

/*
 * pview.js
 * @CreatedOn: 20-Sep-2017
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @Description:This will create a View Engin Aka - pView, for render JSX virtual DOM to a real DOM. 
 * "virtual DOM"? It's just JSON - each "VNode" is an object with 3 properties. nodeName, Attributes, children
 * The whole process (JSX -> VDOM -> DOM) in one step
 */

 
/** 
 * mountTo will render virtual DOM Into Real DOM and add append element into the real DOM 
 * @param {object} node - It will be a real DOM node or Virtual node which can be mount.
 * @param {object} targetNode - This will be the target DOM where actually mount will done.
 * @param {string='vnode'} nodeType - This flag decide node variable having real node or virtual node ['vnode' | 'rnode'].
 * @param {object=null} oldNode - This is a optional param. It is used to replace a node without removing other child of parent node. 
 * @return {object} will be the component object. 
 * */
function mountTo(node, targetNode, nodeType = 'vnode', oldNode = null) {
  if (!node || !targetNode) {
    throw new TypeError('Invalid vnode or target in render component');
  }
  let component = (nodeType === 'rnode' ? node : renderDOM(node));

  if (component.self && typeof component.self.componentWillMount === 'function') {
    component.self.componentWillMount.call(component.self);
  }

  if(!oldNode) {
    targetNode.innerHTML = '';
    targetNode.appendChild(component.node); 
  } else {
    targetNode.replaceChild(component.node, oldNode); 
  }
  
  if (component.self && typeof component.self.componentDidMount === 'function') {
    component.self.componentDidMount.call(component.self);
  }

  return component;
}

/** Render Virtual DOM to the real DOM */
function renderDOM(vnode) {
  var svgNS = "http://www.w3.org/2000/svg";
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return { node: document.createTextNode(vnode) };
  }
  let component = {
    node: undefined,
    children: []
  };
  if (typeof vnode.nodeName === 'string') {
    component.node = document.createElementNS(svgNS, vnode.nodeName);
    Object.keys(vnode.attributes || {}).forEach(key => {
      let attrVal = ((k) => {
        switch (k) {
          case 'style': return parseStyleProps(vnode.attributes[k]);
          case 'events': return parseEventsProps(vnode.attributes[k], component.node);
          default: return vnode.attributes[k];
        }
      })(key);
      component.node.setAttribute(key, attrVal);
    });

  } else if (typeof vnode.nodeName === 'function' && isNativeClass(vnode.nodeName, vnode.nodeName.constructor)) {
    let objComp = new vnode.nodeName(vnode.attributes);
    ({ node: component.node, children: component.children } = renderDOM(objComp.getVirtualNode()));
    component.self = objComp;
    ({ node: objComp.ref.node, children: objComp.ref.children } = component);

  } else if (typeof vnode.nodeName === 'function') {
    ({ node: component.node, children: component.children } = renderDOM(vnode.nodeName(vnode.attributes)));

  } else {
    throw new TypeError('RenderDOM method accepts html node or function or class with render mothod');
  }
  (vnode.children || []).forEach((c) => {
    let childComp = renderDOM(c);

    if (childComp.self && typeof childComp.self.componentWillMount === 'function') {
      childComp.self.componentWillMount.call(childComp.self);
    }

    component.children.push(childComp);
    component.node.appendChild(childComp.node);

    if (childComp.self && typeof childComp.self.componentDidMount === 'function') {
      childComp.self.componentDidMount.call(childComp.self);
    }
  });

  return component;
}

/** hyperscript generator, gets called by transpiled JSX */
window.__h__ = window.__h__ || 
function(nodeName, attributes, ...args) {
  args = args.filter((v) => {
    return !!v;
  });
  let children = args.length ? [].concat(...args) : null;
  return { nodeName, attributes, children };
};

/** convert style JSON into string, gets called by transpiled JSX */
function parseStyleProps(objStyle) {
  if (typeof objStyle === "string") {
    return objStyle;
  }
  let sArr = [];
  Object.keys(objStyle).forEach(key => {
    sArr.push(`${key.replace(/([A-Z]+)/g, $1 => '-' + $1.toLowerCase())}:${objStyle[key]}`);
  });
  return sArr.join(';');
}

/** this method will attach events with real DOM */
function parseEventsProps(events, node) {
  Object.keys(events).forEach((e) => {
    node.addEventListener(e, events[e], false);
  });
  return Object.keys(events).join();
}

/** This will return true if instace is es6 class type  */
function isNativeClass(instance, Constructor) {
  return !!instance.toString().match(/_classCallCheck/);
}

/** This will return false if two node are exual other return true */
function detectDiff(vNode1, vNode2) {
  return !(JSON.stringify(vNode1) === JSON.stringify(vNode2));
}

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
    this.ref = {};
  }

  setState(stateParams) {
    if (typeof stateParams === 'function') {
      stateParams = stateParams.call(this, this.state);
    }
    Object.keys(stateParams).forEach(key => {
      this.state[key] = stateParams[key];
    });
    this.update();
  }

  getVirtualNode() {
    return this.vNode = this.render();
  }

  update() {
    let vNodeNow = this.render();
    if (detectDiff(this.vNode, vNodeNow)) {
      this.vNode = vNodeNow;
      let parent = this.ref.node.parentNode;
      let oldNode = this.ref.node; 
      ({ node: this.ref.node, children: this.ref.children } = renderDOM(this.vNode));
      mountTo({ node: this.ref.node, children: this.ref.children, self: this }, parent, 'rnode', oldNode);
    }
  }
}

export { mountTo, Component };
