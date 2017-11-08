/*
 * icon.js
 * @CreatedOn: 07-Nov-2017
 * @author: SmartChartsNXT
 * @version: 1.0.0
 * @description:This is a factory class to provide different icont types. 
 */

"use strict";

import { Component } from "./../../viewEngin/pview";

class Icon {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <g>
        {this.selectIcon(this.props.type, this.props.width, this.props.height)}
      </g>
    );
  }

  selectIcon(type='dafault', width=20, height=20, color='#777'){

  }
}