/** 
 * config.js
 * @version:1.0.0
 * @createdOn:12-Dec-2017
 * @author:SmartChartsNXT
 * @description:This will be the default Pie chart config for load in BaseChart.
 */
"use strict";

export default function() {
  let self = this; 
  return {
    minWidth: (!self.props.opts.legends || self.props.opts.legends.enable !== false) && (self.props.opts.legends.float === 'left' || self.props.opts.legends.float === 'right') ? 500 : 300,
    minHeight: (!self.props.opts.legends || self.props.opts.legends.enable !== false) && (self.props.opts.legends.float === 'top' || self.props.opts.legends.float === 'bottom') ? 500 : 400
  };
}