/*
 * build.core.js
 * @CreatedOn: 10-Jul-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @Description:It will provide the build description of chart libraray. 
 */


/* Using namespace SmartChartsNXT */

"use strict";
let CoreChart = require("./core/smartChartsNXT.core"); 
let SmartChartsNXT = new CoreChart(); 

module.exports = SmartChartsNXT;

if (typeof window !== 'undefined') {
	window.SmartChartsNXT = SmartChartsNXT;
	window.$SC = SmartChartsNXT; 
}