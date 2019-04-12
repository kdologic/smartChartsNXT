"use strict";


import { Component } from "./../viewEngin/pview";
import Style from "./../viewEngin/style";

/**
 * commonStyles.js
 * @createdOn:09-Apr-2019
 * @author:SmartChartsNXT
 * @description: This components will create common styles for chart.
 * @extends Component 
 */

class CommonStyles extends Component{
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g class="sc-common-styles">
        <Style>
          {{
            ".smartcharts-nxt .focus-in" : {
              "stroke": "blue",
              "stroke-width": 1
            }
          }}
        </Style>
      </g>
    );
  }
}

export default CommonStyles; 