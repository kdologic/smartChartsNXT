/**
 * transitionGroup.js
 * @version:2.0.0
 * @createdOn:26-Apr-2016
 * @author:SmartChartsNXT
 * @description: This component will be used to create css transition on top of pView Lib. 
 */

"use strict";

import { Component } from "./pview";

class TransitionGroup extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    let childNodes = this.ref.node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      childNodes[i].classList.add(this.props.transitionName + '-enter');
    }
  }

  componentDidMount() {
    let childNodes = this.ref.node.childNodes;
    window.requestNextAnimationFrame(() => {
      for (let i = 0; i < childNodes.length; i++) {
        childNodes[i].classList.add(this.props.transitionName + '-enter-active');
      }
    });
  }

  render() {
    return (
      <g class='transition-group'>
        {this.props.extChildren}
      </g>
    );
  }
}

export default TransitionGroup;