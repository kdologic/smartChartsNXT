"use strict";

/** 
 * pview.js
 * @CreatedOn: 20-Sep-2017
 * @author: Kausik Dey
 * @version: 1.0.0
 * @description:This will create a View Engin Aka - pView, for render JSX virtual DOM to a real DOM. 
 * "virtual DOM"? It's just JSON - each "VNode" is an object with 3 properties. nodeName, Attributes, children
 * The whole process (JSX -> VDOM -> DOM) in one step
 * 
 * TODO: If the first element in jsx is a component type then behave incorrecly, Need to fix this. 
 */

import ployfills from "./shims/polyfills";
 
/** 
 * mountTo will render virtual DOM Into Real DOM and add append element into the real DOM 
 * @param {object} node - It will be a real DOM node or Virtual node which can be mount.
 * @param {object} targetNode - This will be the target DOM where actually mount will done.
 * @param {string='vnode'} nodeType - This flag decide node variable having real node or virtual node ['vnode' | 'rnode'].
 * @param {object=null} oldNode - This is a optional param. It is used to replace a node without removing other child of parent node. 
 * @return {object} will be the component object. 
 * */
function mountTo(node, targetNode, nodeType = 'vnode', oldNode = null, ctx = {}) {

  if (!node) {
    throw new TypeError('Invalid vnode in render component');
  }else if(!targetNode) {
    throw new TypeError('Invalid target in render component');
  }

  let component = (nodeType === 'rnode' ? node : renderDOM.call({context: ctx} , node));

  if (component.self && typeof component.self.componentWillMount === 'function') {
    component.self.componentWillMount.call(component.self);
  }

  if(!oldNode) {
    if(nodeType === 'vnode') {
      targetNode.innerHTML = '';
    }
    targetNode.appendChild(component.node); 
  } else {
    targetNode.replaceChild(component.node, oldNode); 
  }
  
  if(component.eventStack && component.eventStack instanceof Array) {
    component.eventStack.forEach(evt => evt());
  }

  if (component.self && typeof component.self.componentDidMount === 'function') {
    component.self.componentDidMount.call(component.self);
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
  /* when vnode is string like - any tag [text, svg, line, path etc.] */
  if (typeof vnode.nodeName === 'string') {
    let isHtml = vnode.nodeName.match('html-'); 
    component.node = isHtml ? document.createElement(vnode.nodeName.substring('html-'.length)) : document.createElementNS(svgNS, vnode.nodeName);
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
  } 
  /* when vnode is a class constructor of type pview component */
  else if (typeof vnode.nodeName === 'function' && isNativeClass(vnode.nodeName, vnode.nodeName.constructor)) {
    vnode.attributes.extChildren = vnode.children;
    vnode.nodeName.prototype.context = this.context || {}; 
    let objComp = new vnode.nodeName(vnode.attributes);
    let objChildContext = Object.assign({}, objComp.context, (typeof objComp.passContext === 'function' ? objComp.passContext() : {}));
    let renderedComp = renderDOM.call({context: objChildContext}, objComp.getVirtualNode());
    
    component.self = objComp;
    ({ node: component.node, children: component.children } = renderedComp);
    component.eventStack.push.apply(component.eventStack, renderedComp.eventStack);
    ({ node: objComp.ref.node, children: objComp.ref.children} = component);

    return component;
  }
  /* when vnode is type of object which is previously constructed */
  else if (typeof vnode.nodeName === "object" && vnode.nodeName.ref) {
    let objComp = vnode.nodeName;
    objComp.__proto__.context = this.context || {}; 
    let objChildContext = Object.assign({}, objComp.context, (typeof objComp.passContext === 'function' ? objComp.passContext() : {}));
    let subNodes = vnode.fromUpdate ? objComp.vnode : objComp.getVirtualNode(); 
    
    if(subNodes.children && subNodes.children.length) {
      _replaceClassWithObject(subNodes, objComp.ref, true);
    }

    let renderedComp = renderDOM.call({context: objChildContext}, subNodes);
    objComp.props.extChildren = vnode.children; 
    component.self = objComp;
    ({ node: component.node, children: component.children } = renderedComp);
    component.eventStack.push.apply(component.eventStack, renderedComp.eventStack);
    ({ node: objComp.ref.node, children: objComp.ref.children} = component);
    
    return component; 
  }
  /* when vnode is type normal function */
  else if (typeof vnode.nodeName === 'function') {
    ({ node: component.node, children: component.children } = renderDOM(vnode.nodeName(vnode.attributes)));
  } 
  else {
    throw new TypeError('RenderDOM method accepts html node or function with render method or class extends Component', vnode);
  }

  /* loop for childrens */
  (vnode.children || []).forEach((c) => {
    let childComp = renderDOM.call(({context: this.context} || {}), c);

    if (childComp.self && typeof childComp.self.componentWillMount === 'function') {
      childComp.self.componentWillMount.call(childComp.self);
    }

    component.children.push(childComp);
    component.node.appendChild(childComp.node);

    if(childComp.eventStack && childComp.eventStack instanceof Array) {
      component.eventStack.push.apply(component.eventStack, childComp.eventStack);
    }

    if (childComp.self && typeof childComp.self.componentDidMount === 'function') {
      component.eventStack.unshift(childComp.self.componentDidMount.bind(childComp.self));
    }
  });

  return component;
}

/**
 * Method will recursively replace the vitual class with real object which previously constructed to avoid constructor call during 
 * component update. 
 * @param {*} subNodes Virtual nodeds with component class.
 * @param {*} refs Real object that previously constructed.
 * @param {*} replaceChildren Replace all classes of its children recursively.
 */
function _replaceClassWithObject(subNodes, refs, replaceChildren) {
  try {
    for (let i = 0; i < subNodes.children.length; i++) {
      let subNode = subNodes.children[i];
      let refChldObj = undefined;
      for (let c = 0; c < refs.children.length; c++) {
        let refChld = refs.children[c];
        if (refChld.self && typeof subNode.nodeName === 'function' && refChld.self instanceof subNode.nodeName) {
          /* Match instaceId for support multiple instace of same component type under same parent node */
          if(refChld.self.props.instanceId === subNode.attributes.instanceId) {
            subNode.nodeName = refChld.self;
            refChldObj = refChld;
            break;
          }
        }
      }
      if(typeof subNode.nodeName === 'object') {
        if (replaceChildren && subNode.nodeName.vnode.children && subNode.nodeName.vnode.children.length && refChldObj && refChldObj.self && refChldObj.self.ref && refChldObj.self.ref.children.length) {
          _replaceClassWithObject(subNode.nodeName.vnode, refChldObj.self.ref, replaceChildren);
        }
      }else if (replaceChildren && subNode.children && subNode.children.length && refs.children && refs.children[i]) {
        _replaceClassWithObject(subNode, refs.children[i], replaceChildren);
      }
    }
  } catch (ex) {
    throw ex;
  }
}

/** 
 * Hyperscript generator, gets called by transpiled JSX 
 */
window.__h__ = window.__h__ || 
function(nodeName, attributes, ...args) {
  args = args.filter((v) => {
    return !!v;
  });
  let children = args.length ? [].concat(...args) : null;
  return { nodeName, attributes: attributes|| {}, children };
};

/**
 * convert style JSON into string, gets called by transpiled JSX
 * @param {JSON} objStyle style json object
 * @returns {String} return string of css
 */
function parseStyleProps(objStyle) {
  if (typeof objStyle === "string") {
    return objStyle;
  }
  let sArr = [];
  Object.keys(objStyle).forEach(key => {
    sArr.push(`${key.replace(/([A-Z]+)/g, $1 => '-' + $1.toLowerCase())}:${objStyle[key]};`);
  });
  return sArr.join('');
}

/**
 * Attach events with real DOM 
 * @param {*} events JSON List of events
 * @param {*} node Real DOM Element
 * @return {String} Returns List of attached events as string 
 */
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

  /** Fires when setting new state of a component.*/
  setState(stateParams) {
    if (typeof stateParams === 'function') {
      stateParams = stateParams.call(this, this.state);
    }
    stateParams && Object.keys(stateParams).forEach(key => {
      this.state[key] = stateParams[key];
    });
    return this.update();
  }

  /**
   * Fetch virtual node of a component by calling its render function and assign it into vnode property
   * @returns {virtual node} retrun its virtual node
   */
  getVirtualNode() {
    return this.vnode = this.render();
  }

 
  /**
   * Compare nodeName, attributes to detect exact changes
   * @param {*} oldVNode 
   * @param {*} newVNode 
   */
  _detectDiff(oldVNode, newVNode) {
    if(typeof oldVNode === 'string' && typeof newVNode === 'string' && oldVNode !== newVNode) {
      return {type: 'NODE_TEXT_DIFF'};
    }
    if(oldVNode.nodeName === newVNode.nodeName) {
      let attrChanges = {};
      for(let attr in newVNode.attributes) {
        if(JSON.stringify(oldVNode.attributes[attr]) !== JSON.stringify(newVNode.attributes[attr])) {
          attrChanges[attr] = newVNode.attributes[attr];
        }
      }
      if(Object.keys(attrChanges).length) {
        return {type: 'NODE_ATTR_DIFF', attributes: attrChanges};
      }else {
        return {type: 'NODE_NO_DIFF'};
      }
    }else {
      return {type: 'NODE_NAME_DIFF'};
    }
  }

  /**
   * Traverse virtual node and Heuristic O(n) compare with old node to minimize DOM update.
   * @param {*} oldVNode 
   * @param {*} newVNode 
   * @param {*} ref 
   * @param {*} context 
   */
  _reconsile(oldVNode, newVNode, ref, context={}) {
    let newRenderedVnode = undefined; 

    if (newVNode.children && newVNode.children.length) {
      _replaceClassWithObject(newVNode, ref, true);
    }

    if(ref.self && typeof ref.self.passContext === 'function') {
      context = Object.assign({}, context, ref.self.passContext());
    }

    if(typeof newVNode.nodeName === 'object') {
      if (ref.self && typeof ref.self.propsWillReceive === 'function') {
        let newProps = Object.assign({}, ref.self.props, newVNode.attributes, { extChildren: newVNode.children });
        ref.self.propsWillReceive.call(ref.self, newProps);
        ref.self.props = newProps; 
      }
      if(ref.self) {
        ref.self.__proto__.context = context; 
        newRenderedVnode = ref.self.render();
      }
    }

    let differ = this._detectDiff(oldVNode, newVNode);

    switch(differ.type) {
      case 'NODE_ATTR_DIFF': 
        if(typeof newVNode.nodeName === 'object') {
          this._reconsile(oldVNode.nodeName.vnode, newRenderedVnode, ref.self.ref);
        }else if(typeof newVNode.nodeName === 'string') {
          for(let attr in differ.attributes) {
            this._updateAttr(ref.node, attr, differ.attributes[attr]);
          }
        }
      break;
      case 'NODE_TEXT_DIFF':
      case 'NODE_NAME_DIFF': 
        return differ;
      default:
      case 'NODE_NO_DIFF': 
        break;
    }
    
    if(typeof oldVNode === 'object' && typeof newVNode === 'object') {
      oldVNode.children = oldVNode.children || [];
      newVNode.children = newVNode.children || [];
      
      for(let child = 0; child < Math.max(oldVNode.children.length, newVNode.children.length); child++) {
        if(oldVNode.children[child] && newVNode.children[child]) {
          let reconsileDiff; 
          if(typeof oldVNode.nodeName === 'object' && typeof newVNode.nodeName === 'object') {
            reconsileDiff = this._reconsile(oldVNode.nodeName.vnode, newVNode.nodeName.render(), ref.self.ref, JSON.parse(JSON.stringify(context)));
          }else {
            reconsileDiff = this._reconsile(oldVNode.children[child], newVNode.children[child], ref.children[child], JSON.parse(JSON.stringify(context)));
            
            if(ref.children[child].children instanceof Array && ref.children[child].children.length) {
              ref.children[child].children = ref.children[child].children.filter(v => v != undefined);
            }
          }
          if(reconsileDiff && reconsileDiff.type === 'NODE_NAME_DIFF') {
            this._removeOldNode(child, oldVNode, ref);
            this._createNewNode(child, newVNode, ref, context);
          }
          if(reconsileDiff && reconsileDiff.type === 'NODE_TEXT_DIFF') {
            this._updateTextNode(child, newVNode, ref);
          }
          if(ref.children instanceof Array && ref.children.length) {
            ref.children = ref.children.filter(v => v != undefined);
          }
        }else if(!oldVNode.children[child]) {
          this._createNewNode(child, newVNode, ref, context);
        }else {
          this._removeOldNode(child, oldVNode, ref);
        }
      }
    }
    if(typeof newVNode.nodeName === 'object') {
      newVNode.nodeName.vnode = newRenderedVnode;
    }
  }

  _updateTextNode(nodePos=0, newVNode, ref) {
    console.log('update text node', newVNode.children[nodePos]);
    let newText = newVNode.children[nodePos];
    if(typeof newText === 'string') {
      ref.node.textContent = newText;
      ref.children[nodePos].node = ref.node.childNodes[nodePos];
    }
  }

  _createNewNode(nodePos=0, newVNode, ref, context) {
    console.log('create new node');
    let newComponent = renderDOM.call({ context: context || {} }, newVNode.children[nodePos]);
    ref.children.splice(nodePos+1, 0, newComponent);   
    
    return mountTo(newComponent, ref.node, 'rnode', undefined, context);
  }

  _removeOldNode(nodePos=0, oldVNode, ref) {
    console.log('destroy old node');
    let destroyableNode = oldVNode.children[nodePos];
    if(typeof destroyableNode.nodeName === 'object') {
      if (typeof destroyableNode.nodeName.componentWillUnmount === 'function') {
        destroyableNode.nodeName.componentWillUnmount.call(destroyableNode.nodeName);
      }
      destroyableNode.nodeName.ref.node.parentNode.removeChild(destroyableNode.nodeName.ref.node);
    }else if(typeof destroyableNode.nodeName === 'string') {
      ref.children[nodePos].node.parentNode.removeChild(ref.children[nodePos].node);
    }
    ref.children[nodePos] = undefined;
  }

  _updateAttr(dom, attr, val) {
    console.log('update attr', attr, val);
    dom.setAttribute(attr, val); 
  }

  /**
   * Fires when we want to re-render a component
   * @returns {Object} Component type object
   */
  update() {
    console.time('update');
    
    let vnodeNow = this.render();
    let objContext = Object.assign({}, this.context, (typeof this.passContext === 'function' ? this.passContext() : {}));
    if (this.vnode.children && this.vnode.children.length) {
      _replaceClassWithObject(this.vnode, this.ref, true);
    }
    this._reconsile(this.vnode, vnodeNow, this.ref, objContext); 
    this.vnode = vnodeNow;

    console.timeEnd('update');
  }

  /** 
   * Interface that child may override - returns context that will pass on child context 
   */
  passContext() {
    return {} ;
  }

  /** 
   * Interface that child must override - return virtual DOM of the component 
   */
  render() {
    return (<g> Your component should override this render method </g>);
  }

  /**
   * Lifecycle event - fires just before passing props into a pre-exist Component
   * @param {Object} nextProps New set of props
   */
  propsWillReceive(nextProps) {}

  /** 
   * Lifecycle event - fires before the mounting component on parent DOM 
   */
  componentWillMount() {}

  /** 
   * Lifecycle event - fires after the component mounted on parent DOM 
   */
  componentDidMount() {}

  /** 
   * Lifecycle event - fires before the component unmounted from parent DOM 
   */
  componentWillUnmount() {}

  /* TODO : Will add these lifecycle hooks 

    May depricate propsWillReceive(nextProps) and introduce getDerivedStateFromProps(props, state)
    shouldComponentUpdate(nextProps, nextState)
    getSnapshotBeforeUpdate(prevProps, prevState)
    componentDidUpdate(prevProps, prevState, snapshot)
  */

}

export { mountTo, renderDOM, Component, parseStyleProps };