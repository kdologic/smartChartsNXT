"use strict";

import Core  from "./core/chart.core"; 

/**
 * index.js
 * @createdOn: 10-Jul-2017
 * @author: SmartChartsNXT
 * @description: Entry point for the chart libraray. 
 * 
 * Using namespace SmartChartsNXT
 */

const SmartChartsNXT = new Core(); 

export default SmartChartsNXT;

if (typeof window !== 'undefined') {
	window.SmartChartsNXT = SmartChartsNXT;
}