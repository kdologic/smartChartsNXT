/**
 * style.js
 * @version:2.0.0
 * @createdOn:02-May-2018
 * @author:SmartChartsNXT
 * @description: This component will append style into dom. 
 */

"use strict";

import { Component, parseStyleProps } from "./pview";

class Style extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <style>
        {this.props.extChildren && this.props.extChildren.length && this.jsonToCss(this.props.extChildren[0])}
      </style>
    );
  }

  jsonToCss(json) {
    let strCSS = ''; 
    for(let selector in json) {
      strCSS += selector + " {" + parseStyleProps(json[selector]) + " } \n";
    }
    return strCSS; 
  }
}

export default Style;