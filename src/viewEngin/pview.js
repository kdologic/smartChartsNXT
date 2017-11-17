
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
  
  if(component.eventStack && component.eventStack instanceof Array){
    component.eventStack.forEach(evt => evt());
  }

  return component;
}

/** Render Virtual DOM to the real DOM */
function renderDOM(vnode) {
  let svgNS = "http://www.w3.org/2000/svg";
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return { node: document.createTextNode(vnode), children: [], eventStack: []};
  }
  let component = {
    node: undefined,
    children: [],
    eventStack: []
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
    vnode.attributes.children = vnode.children;
    let objComp = new vnode.nodeName(vnode.attributes);
    let renderedComp = renderDOM(objComp.getVirtualNode());

    ({ node: component.node, children: component.children } = renderedComp);
    component.eventStack.push.apply(component.eventStack, renderedComp.eventStack);
    component.self = objComp;
    ({ node: objComp.ref.node, children: objComp.ref.children} = component);

  } else if (typeof vnode.nodeName === 'function') {
    ({ node: component.node, children: component.children } = renderDOM(vnode.nodeName(vnode.attributes)));
  } else {
    throw new TypeError('RenderDOM method accepts html node or function with render method or class extends Component', vnode);
  }

  /* loop for childrens */
  (vnode.children || []).forEach((c) => {
    let childComp = renderDOM(c);

    if (childComp.self && typeof childComp.self.componentWillMount === 'function') {
      childComp.self.componentWillMount.call(childComp.self);
    }

    component.children.push(childComp);
    component.node.appendChild(childComp.node);
    if(childComp.eventStack && childComp.eventStack instanceof Array) {
      component.eventStack.push.apply(component.eventStack, childComp.eventStack);
    }
    if (childComp.self && typeof childComp.self.componentDidMount === 'function') {
      component.eventStack.push(childComp.self.componentDidMount.bind(childComp.self));
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
  return { nodeName, attributes: attributes|| {}, children };
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
function detectDiff(vnode1, vnode2) {
  return !(JSON.stringify(vnode1) === JSON.stringify(vnode2));
}

/**
 * Component Class is the base class of all PView reusable component class. 
 * All components must extends this Component class. And they should have render method. 
 */

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
    return this.vnode = this.render();
  }

  update() {
    let vnodeNow = this.render();
    vnodeNow.children = vnodeNow.children || [];
    vnodeNow.children.push(...(this.props.children || []));
    if (detectDiff(this.vnode, vnodeNow)) {
      this.vnode = vnodeNow;
      let parent = this.ref.node.parentNode;
      let oldNode = this.ref.node; 
      let renderedComp = renderDOM(this.vnode); 
      ({ node: this.ref.node, children: this.ref.children } = renderedComp);
      let component = mountTo({ node: renderedComp.node, children: renderedComp.children, self: this, eventStack: renderedComp.eventStack}, parent, 'rnode', oldNode);
    }
  }

  render() {
    return (<g> child must override this render method </g>);
  }
}

export { mountTo, Component };
