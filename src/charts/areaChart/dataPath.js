/**
 * dataPath.js
 * @version:2.0.0
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create a curved line path to plot the points of data. 
 */

"use strict";

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";

class DataPath extends Component{
  constructor(props) {
      super(props);
  }
  
  render() {
    return (
      <g class='sc-data-path'></g>
    );
  }

}

export default DataPath;