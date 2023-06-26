import fastdom from "fastdom";
import { IComponent, IComponentProps, IReferenceNode, IVnode } from "./component.model";
import { config } from "./config";
import { mountTo, parseEventsProps, parseStyleProps, renderDOM, _extends, _rearrangeOldVNodes, _replaceClassWithObject } from "./pview";
import { IAttrDiff, INodeDiff, IObject } from "./pview.model";

/**
 * Component Class is an abstract base class of all PView reusable component class.
 * All custom components must extends this Component class. And they should have implement the render method.
 */

export abstract class Component<T = IComponentProps> {
  public props: T;
  public state: IObject;
  public ref: IReferenceNode | null;
  public vnode: IVnode;

  constructor(props: T) {
    this.props = props;
    this.state = {};
    this.ref = {
      node: null,
      children: []
    };
  }

  /**
   * Fires when setting new state of a component.
   * @param {IObject} stateParams Update that state from this object.
   * @returns {IVnode | false} Virtual Node tree of the component.
   */
  setState(stateParams: IObject): IVnode | false {
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
   * @returns {IVnode} Virtual node of the component.
   */
  getVirtualNode(): IVnode {
    return this.vnode = this.render();
  }

  /**
   * 
   * @returns {IReferenceNode} Returns reference node of real DOM
   */
  public getRef(): IReferenceNode {
    return this.ref;
  }

  /**
   * 
   * @param {IReferenceNode} ref Set Reference real node of component
   */
  public setRef(ref: IReferenceNode): void {
    this.ref = ref;
  }

  /**
   * Get prop object of the component
   * @returns Props of the component
   */
  public getProps(): IObject {
    return this.props;
  }

  /**
   * External children will be set on the props to project into the component structure
   * @param {IVnode[]} extChildren External children vNode
   */
  public setExternalChildren(extChildren: IVnode[]): void {
    (this.props as IComponentProps).extChildren = extChildren;
  }

  /**
   * Compare nodeName, attributes to detect exact changes
   * @param {IVnode} oldVNode Old virtual node tree of the component.
   * @param {IVnode} newVNode New virtual node tree of the component.
   * @returns {INodeDiff} A diff object with type.
   */
  _detectDiff(oldVNode: IVnode, newVNode: IVnode): INodeDiff {
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
   * @param {IObject} obj1 First object to compare.
   * @param {IObject} obj2 Second object to compare with First object.
   * @param {number} level Number of hierarchical level to compare also will run (undefined for compare all levels).
   * @param {string[]} ignoreList Will ignore those attributes from this list.
   * @returns {IAttrDiff} A diff object with detail of attribute differences.
   */
  _attrDiff(obj1: IObject, obj2: IObject, level: number, ignoreList: string[] = []): IAttrDiff {
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
   * @param {any[]} array An array which need to de-duplicate.
   * @returns {any[]} An array of unique elements.
   */
  arrayUnique(array: any[]): any[] {
    let a: any[] = array.concat();
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
   * @param {IVnode} oldVNode Previous virtual node that rendered.
   * @param {IVnode} newVNode Newly created virtual node that constructed recent update after passing new props.
   * @param {IComponent} ref Object reference of the component.
   * @param {IObject} context Combination of existing self context and new context that passed from parent.
   * @returns {IAttrDiff | boolean} Returns Attribute difference object or false
   */
  _reconcile(oldVNode: IVnode, newVNode: IVnode, ref: IReferenceNode, context: IObject = {}): INodeDiff | boolean {
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
        Object.getPrototypeOf(ref.self).context = context;
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
        if (newVNode.nodeName instanceof Component && oldVNode.nodeName instanceof Component) {
          this._reconcile(oldVNode.nodeName.vnode, newRenderedVnode, ref.self.ref, context);
          newVNode.nodeName.vnode = newRenderedVnode;
          ref.children = ref.self.ref.children;
          if (ref && ref.self && typeof ref.self.afterUpdate === 'function') {
            ref.self.afterUpdate(oldVNode.attributes);
          }
          return false;
        } else if (typeof newVNode.nodeName === 'string' && !(ref.node instanceof Text)) {
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
          if (oldVNode.nodeName instanceof Component && newVNode.nodeName instanceof Component) {
            child = Math.max(oldVNode.children.length, newVNode.children.length);
            reconcileDiff = this._reconcile(oldVNode.nodeName.vnode, newRenderedVnode, ref.self.ref, _extends({}, context));
            ref.children = ref.self.ref.children;
          } else {
            reconcileDiff = this._reconcile(oldVNode.children[child] as IVnode, newVNode.children[child] as IVnode, ref.children[child], _extends({}, context));

            if (ref.children[child].children instanceof Array && ref.children[child].children.length) {
              ref.children[child].children = ref.children[child].children.filter((v) => v != undefined);
            }
          }
          if (typeof reconcileDiff == 'object' && reconcileDiff.type === 'NODE_NAME_DIFF') {
            this._removeOldNode(child, oldVNode, ref);
            if (typeof (newVNode.children[child] as IVnode).nodeName === 'object' && typeof (newVNode.children[child] as IVnode).class === 'function') {
              (newVNode.children[child] as IVnode).nodeName = (newVNode.children[child] as IVnode).class;
              delete (newVNode.children[child] as IVnode).class;
            }
            this._createNewNode(child, newVNode, ref, context);
          }
          if (typeof reconcileDiff == 'object' && reconcileDiff.type === 'NODE_TEXT_DIFF') {
            this._updateTextNode(child, newVNode, ref);
          }
          if (ref.children instanceof Array && ref.children.length) {
            ref.children = ref.children.filter((v) => v != undefined);
          }
        } else if (!oldVNode.children[child]) {
          if (typeof (newVNode.children[child] as IVnode).nodeName === 'object' && typeof (newVNode.children[child] as IVnode).class === 'function') {
            (newVNode.children[child] as IVnode).nodeName = (newVNode.children[child] as IVnode).class;
            delete (newVNode.children[child] as IVnode).class;
          }
          this._createNewNode(child, newVNode, ref, context);
        } else {
          this._removeOldNode(child, oldVNode, ref);
        }
      }
      if (ref.children instanceof Array && ref.children.length) {
        ref.children = ref.children.filter((v) => v != undefined);
      }
    }
    if (newVNode.nodeName instanceof Component) {
      newVNode.nodeName.vnode = newRenderedVnode;
      if (typeof ref.self.afterUpdate === 'function' && oldVNode.nodeName instanceof Component) {
        ref.self.afterUpdate(oldVNode.nodeName.getProps());
      }
    }
  }

  /**
   * Update internal text node
   * @param {number} nodePos Index of node in virtual node children list.
   * @param {IVnode} newVNode Newly rendered virtual node.
   * @param {IReferenceNode} ref Object reference of component.
   */
  _updateTextNode(nodePos: number = 0, newVNode: IVnode, ref: IReferenceNode): void {
    const newText = newVNode.children[nodePos] as string;
    if (typeof newText !== 'object') {
      ref.node.textContent = newText;
      ref.children[nodePos].node = ref.node.childNodes[nodePos] as Text;
    }
  }

  /**
   * Render and Mount new DOM node.
   * @param {number} nodePos Index of node in virtual node children list.
   * @param {IVnode} newVNode Newly rendered virtual node.
   * @param {IReferenceNode} ref Object reference of component.
   * @param {IObject} context Combination of existing self context and new context that passed from parent.
   * @returns {IComponent | SVGElement} A component object OR real DOM node.
   */
  _createNewNode(nodePos: number = 0, newVNode: IVnode, ref: IReferenceNode, context: IObject): IComponent {
    let newComponent = renderDOM.call({ context: context || {} }, newVNode.children[nodePos]);
    ref.children.splice(nodePos, 0, newComponent);
    if (ref.node instanceof HTMLElement || ref.node instanceof SVGElement) {
      return mountTo(newComponent, ref.node, 'rnode', undefined, context);
    }
  }

  /**
   * Remove the old node from DOM and Object reference.
   * @param {number} nodePos Index of node in virtual node children list.
   * @param {IVnode} oldVNode Previously rendered virtual node.
   * @param {IReferenceNode} ref Object reference of component.
   */
  _removeOldNode(nodePos: number = 0, oldVNode: IVnode, ref: IReferenceNode): void {
    let destroyableNode = oldVNode.children[nodePos] as IVnode, destroyableObj;
    if (typeof destroyableNode === 'string' || typeof destroyableNode === 'number') {
      ref.node.textContent = '';
    }
    if (destroyableNode.nodeName instanceof Component) {
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

    if (destroyableNode.nodeName instanceof Component) {
      if (destroyableNode.nodeName.getRef().node.parentNode) {
        (destroyableNode.nodeName.getRef().node as any)._clearEventListeners();
        destroyableNode.nodeName.getRef().node.parentNode.removeChild(destroyableNode.nodeName.getRef().node);
      }
    } else if (typeof destroyableNode.nodeName === 'string') {
      if (ref.children[nodePos] && ref.children[nodePos].node.parentNode) {
        (ref.children[nodePos].node as any)._clearEventListeners();
        ref.children[nodePos].node.parentNode.removeChild(ref.children[nodePos].node);
      }
    }
    ref.children[nodePos] = undefined;
  }

  /**
   * Update only attribute of existing DOM node.
   * @param {SVGElement | HTMLElement} dom DOM reference on the node.
   * @param {IAttrDiff} attrChanges Attributes to be modify.
   */
  _updateAttr(dom: SVGElement | HTMLElement, attrChanges: IAttrDiff): void {
    let groups: string[] = ['$added', '$updated', '$object'];
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
   * @returns {IVnode | false} Virtual Node tree of the component.
   */
  public update(): IVnode | false {
    let compName: string;
    if (config.debug && config.debugRenderTime) {
      compName = Object.getPrototypeOf(this).constructor.name;
      /* eslint-disable-next-line no-console */
      console.time(compName + ' update');
    }

    if (typeof this.shouldUpdate === 'function' && !this.shouldUpdate(this.props)) {
      return false;
    }

    if (typeof this.beforeUpdate === 'function') {
      this.beforeUpdate(this.props);
    }

    let vnodeNow: IVnode = this.render();
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
  public passContext?(): IObject

  /**
   * Abstract method that child must override - return virtual DOM of the component.
   * @returns {Object} JSX object of the component that will be rendered and mount.
   */
  public abstract render(): IVnode

  /* eslint-disable no-unused-vars */
  /**
   * Lifecycle event - fires just before passing props into a pre-exist Component.
   * @param {Object} nextProps New set of props.
   * @returns void.
   */
  public propsWillReceive?(nextProps: IObject): void

  /**
   * Lifecycle event - fires before the mounting component on parent DOM.
   * @param {Object} nextProps New set of props.
   * @returns void.
   */
  public beforeMount?(nextProps: IObject): void

  /**
   * Lifecycle event - fires after the component mounted on parent DOM.
   * @param {Object} nextProps New set of props.
   * @returns void.
   */
  public afterMount?(nextProps: IObject): void

  /**
   * Call before render and determine component update
   * @param {Object} nextProps Next set of props that will receive by component.
   * @returns {boolean} Return boolean true or false.
   */
  public shouldUpdate?(nextProps: IObject): boolean

  /**
   * Lifecycle event - fires before the component update on parent DOM.
   * @param {Object} nextProps set of props that was there before update that component.
   * @returns void.
   */
  public beforeUpdate?(nextProps: IObject): void

  /**
   * Lifecycle event - fires after the component update on parent DOM.
   * @param {Object} prevProps set of props that was there before update that component.
   * @returns void.
   */
  public afterUpdate?(prevProps: IObject): void

  /**
   * Lifecycle event - fires before the component unmounted from parent DOM.
   * @returns void.
   */
  public beforeUnmount?(): void

}
