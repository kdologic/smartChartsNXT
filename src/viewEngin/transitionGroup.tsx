'use strict';

import { IVnode } from './component.model';
import { Component } from './pview';
import { IObject } from './pview.model';

/**
 * transitionGroup.js
 * @createdOn:26-Apr-2018
 * @author:SmartChartsNXT
 * @description: This component will be used to create css transition on top of pView Library. Must use InstanceId as props to uniquely identify elements.
 * @extends Component
 *
 *
 * This component will be used to create css transition on top of pView Library.
 * Must use InstanceId as props to uniquely identify elements.
 *
 * It accept the following props :
 *
 * transitionName='box-effect' // Name of the transition.
 *
 * transitionEnterDelay='1000' // How long the animation play's when new element added.
 *
 * transitionExitDelay='300' // How long the animation play's when element removed.
 *
 * applyForNew=true //If true then transition only for new elements and if false then all the existing elements also.
 *
 * ${transition-name}-enter -- Apply this class just before mount.
 *
 * ${transition-name}-enter-active -- Apply this class after mount and remove after animation completed.
 *
 * ${transition-name}-exit -- Apply this class just before remove an element.
 *
 * ${transition-name}-exit-active -- Apply this class after remove an element and remove when transitionExitDelay completed.
 */

class TransitionGroup extends Component {
  prevExtChildren: IVnode[];
  removedExtChildren: IVnode[];
  mergedExtChildren: IVnode[];
  removedChildNodes: Node[];
  newExtChildren: IVnode[];

  constructor(props: IObject) {
    super(props);
    this.prevExtChildren = [];
    this.removedExtChildren = [];
    this.mergedExtChildren = [];
    this.removedChildNodes = [];
  }

  beforeMount() {
    this.newExtChildren = this.findNewChildren();
    this.removedExtChildren = this.findRemovedChildren();
    this.mergedExtChildren = this.mergeChildren();
    let childNodes = this.ref.node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      let isNewChild = this.newExtChildren.findIndex(c => {
        return c.attributes.instanceId === this.mergedExtChildren[i].attributes.instanceId;
      }) >= 0;

      let isRemovedChild = this.removedExtChildren.findIndex(c => {
        return c.attributes.instanceId === this.mergedExtChildren[i].attributes.instanceId;
      }) >= 0;

      if (this.props.applyForNew) {
        isNewChild && (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-enter');
      } else {
        (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-enter');
      }

      isRemovedChild && (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-exit');
    }
  }

  afterMount() {
    let childNodes = this.ref.node.childNodes;
    window.requestNextAnimationFrame(() => {

      for (let i = 0; i < childNodes.length; i++) {

        let isRemovedChild = this.removedExtChildren.findIndex(c => {
          return c.attributes.instanceId === this.mergedExtChildren[i].attributes.instanceId;
        }) >= 0;

        (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-enter-active');
        isRemovedChild && (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-exit-active');


        (function (elem, tn, td) {
          setTimeout(() => {
            elem && (elem as SVGElement).classList.remove(tn + '-enter', tn + '-enter-active');
          }, td || 0);
        })(childNodes[i], this.props.transitionName, this.props.transitionEnterDelay);


        if (isRemovedChild) {
          (function (elem, td) {
            setTimeout(() => {
              elem && elem.parentNode && elem.parentNode.removeChild(elem);
            }, td || 0);
          })(childNodes[i], this.props.transitionExitDelay);
        }
      }
    });

    this.prevExtChildren = this.props.extChildren || [];
  }

  beforeUpdate() {
    this.newExtChildren = this.findNewChildren();
    this.removedExtChildren = this.findRemovedChildren();
    this.mergedExtChildren = this.mergeChildren();
    for (let i = 0; i < this.removedChildNodes.length; i++) {
      this.removedChildNodes[i].parentNode.removeChild(this.removedChildNodes[i]);
    }
    this.removedChildNodes = this.findRemoveChildNodes();
  }

  afterUpdate() {
    let childNodes = this.ref.node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      let childInstId = (childNodes[i] as SVGElement).getAttribute('instanceId');
      let isNewChild = this.newExtChildren.findIndex(c => {
        return c.attributes.instanceId == childInstId;
      }) >= 0;

      if (this.props.applyForNew) {
        isNewChild && (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-enter');
      } else {
        (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-enter');
      }
    }
    for (let i = 0; i < this.removedChildNodes.length; i++) {
      (this.removedChildNodes[i] as SVGAElement).classList.add(this.props.transitionName + '-exit');
      this.ref.node.appendChild(this.removedChildNodes[i]);
    }

    window.requestNextAnimationFrame(() => {
      for (let i = 0; i < childNodes.length; i++) {
        (childNodes[i] as SVGElement).classList.add(this.props.transitionName + '-enter-active');

        (function (elem, tn, td) {
          setTimeout(() => {
            (elem as SVGElement).classList.remove(tn + '-enter', tn + '-enter-active');
          }, td || 0);
        })(childNodes[i], this.props.transitionName, this.props.transitionEnterDelay);
      }

      for (let i = 0; i < this.removedChildNodes.length; i++) {
        (this.removedChildNodes[i] as SVGAElement).classList.add(this.props.transitionName + '-exit-active');
        (function (elem, td) {
          setTimeout(() => {
            elem.parentNode.removeChild(elem);
          }, td || 0);
        })(this.removedChildNodes[i], this.props.transitionExitDelay);
      }
      this.removedChildNodes = [];
    });

    this.prevExtChildren = this.props.extChildren || [];
  }

  render() {
    return (
      <g class='sc-transition-group'>
        {this.props.extChildren}
      </g>
    );
  }

  findNewChildren() {
    if (!this.props.extChildren) {
      return [];
    }
    return this.props.extChildren.filter((v: IVnode) => {
      return this.prevExtChildren.findIndex(c => c.attributes.instanceId === v.attributes.instanceId) === -1;
    });
  }

  findRemovedChildren() {
    return this.prevExtChildren.filter(v => {
      if (!this.props.extChildren) {
        return true;
      }
      return this.props.extChildren.findIndex((c: IVnode) => c.attributes.instanceId === v.attributes.instanceId) === -1;
    });
  }

  findRemoveChildNodes() {
    let removedNode: Node[] = [];
    this.ref.node.childNodes.forEach((elem) => {
      if (!this.props.extChildren) {
        removedNode.push(elem.cloneNode(true));
        return;
      }
      if (this.props.extChildren.findIndex((c: IVnode) => c.attributes.instanceId === (elem as SVGElement).getAttribute('instanceId')) === -1) {
        removedNode.push(elem.cloneNode(true));
      }
    });
    return removedNode;
  }

  mergeChildren() {
    return (this.props.extChildren || []).concat(this.removedExtChildren);
  }
}

export default TransitionGroup;