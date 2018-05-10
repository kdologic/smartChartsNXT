"use strict";

/**
 * style.js
 * @version:2.0.0
 * @createdOn:02-May-2018
 * @author:SmartChartsNXT
 * @description: This component will create a style element into dom. 
 */

import { Component, parseStyleProps } from "./pview";


/** This will create a style element in DOM 
 * @extends Compoent
*/
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
  /**
   * Convert a JSON object into String of CSS
   * @param {any} json  A JSON object
   * @returns {string} String of CSS 
   */
  jsonToCss(json) {
    let strCSS = ''; 
    for(let selector in json) {
      strCSS += selector + " {" + parseStyleProps(json[selector]) + " } \n";
    }
    return strCSS; 
  }
}

export default Style;