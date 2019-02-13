"use strict";

import { Component } from "./pview";

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
 * transitionEnterDelay='1000' // How long the animation playes when new element added.
 * 
 * transitionExitDelay='300' // How long the animation playes when element removed.
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
  constructor(props) {
    super(props);
    this.prevExtChildren = []; 
    this.removedExtChildren = [];
    this.mergedExtChildren = [];
  }

  componentWillMount() {
    let childNodes = this.ref.node.childNodes;
    
    for (let i = 0; i < childNodes.length; i++) {
      let isNewChild = this.newExtChildren.findIndex(c => {
        return c.attributes.instanceId === this.mergedExtChildren[i].attributes.instanceId;
      }) >= 0;

      let isRemovedChild = this.removedExtChildren.findIndex(c => {
        return c.attributes.instanceId === this.mergedExtChildren[i].attributes.instanceId;
      }) >= 0;

      if(this.props.applyForNew){
        isNewChild && childNodes[i].classList.add(this.props.transitionName + '-enter');
      }else {
        childNodes[i].classList.add(this.props.transitionName + '-enter');
      }
      
      isRemovedChild && childNodes[i].classList.add(this.props.transitionName + '-exit');
    }
  }

  componentDidMount() {
    let childNodes = this.ref.node.childNodes;
    window.requestNextAnimationFrame(() => {
      for (let i = 0; i < childNodes.length; i++) {
        let isNewChild = this.newExtChildren.findIndex(c => {
          return c.attributes.instanceId === this.mergedExtChildren[i].attributes.instanceId;
        }) >= 0;

        let isRemovedChild = this.removedExtChildren.findIndex(c => {
          return c.attributes.instanceId === this.mergedExtChildren[i].attributes.instanceId;
        }) >= 0;

        childNodes[i].classList.add(this.props.transitionName + '-enter-active');
        isRemovedChild && childNodes[i].classList.add(this.props.transitionName + '-exit-active');

        
        (function(elem, tn, td){
          setTimeout(() => {
            elem.classList.remove(tn + '-enter', tn + '-enter-active');
          }, td || 0);
        })(childNodes[i], this.props.transitionName, this.props.transitionEnterDelay);
          
        
        if(isRemovedChild) {
          (function(elem, td){
            setTimeout(() => {
              elem.parentNode.removeChild(elem);
            }, td || 0);
          })(childNodes[i], this.props.transitionExitDelay);
        }
      }
    });

    this.prevExtChildren = this.props.extChildren || []; 
  }

  render() {
    this.newExtChildren = this.findNewChildren();
    this.removedExtChildren = this.findRemovedChildren();
    this.mergedExtChildren = this.mergeChildren();
    return (
      <g class='sc-transition-group'>
        {this.mergedExtChildren}
      </g>
    );
  }

  findNewChildren() {
    if(!this.props.extChildren) {
      return []; 
    }
    return this.props.extChildren.filter(v => {
      return this.prevExtChildren.findIndex(c => c.attributes.instanceId === v.attributes.instanceId) === -1;
    });
  }

  findRemovedChildren() {
    return this.prevExtChildren.filter(v => {
      if(!this.props.extChildren) {
        return true; 
      }
      return this.props.extChildren.findIndex(c => c.attributes.instanceId === v.attributes.instanceId) === -1;
    });
  }

  mergeChildren() {
    return (this.props.extChildren || []).concat(this.removedExtChildren);  
  }
}

export default TransitionGroup;