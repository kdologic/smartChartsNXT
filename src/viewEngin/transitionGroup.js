

"use strict";

/**
 * transitionGroup.js
 * @version:2.0.0
 * @createdOn:26-Apr-2018
 * @author:SmartChartsNXT
 * @description: This component will be used to create css transition on top of pView Library. 
 *               Must use InstanceId as props to uniquely identify elements.
 */

import { Component } from "./pview";

/**This component will be used to create css transition on top of pView Library. 
 * Must use InstanceId as props to uniquely identify elements.
 * 
 * It accept the following props :
 * 
 * transitionName='box-effect' // Name of the transition.
 * transitionEnterDelay='1000' // How long the animation playes when new element added.
 * transitionExitDelay='300' // How long the animation playes when element removed.
 * applyForNew=true // Apply transition only for new elements OR all the existing elements also.
 * 
 * @extends Component
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