'use strict';

import { IVnode } from './component.model';
import { Component, parseStyleProps } from './pview';
import { IObject } from './pview.model';

/**
 * style.js
 * @createdOn:02-May-2018
 * @author:SmartChartsNXT
 * @description: This component will create a style element into dom.
 * @extends Component
 */

class Style extends Component {
  constructor(props: IObject) {
    super(props);
  }

  render(): IVnode {
    return (
      <style>
        {this.props.src && this.jsonToCss(this.props.src)}
        {this.props.extChildren && this.props.extChildren.length && this.jsonToCss(this.props.extChildren[0])}
      </style>
    );
  }
  /**
   * Convert a JSON object into String of CSS.
   * @param {Object} json  A JSON object.
   * @returns {String} String of CSS.
   */
  jsonToCss(json: IObject): string {
    let strCSS = '';
    for (let selector in json) {
      strCSS += selector + ' {' + parseStyleProps(json[selector]) + ' } \n';
    }
    return strCSS;
  }
}

export default Style;