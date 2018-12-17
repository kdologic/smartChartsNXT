"use strict";

/**
 * index.js
 * @createdOn: 10-Jul-2017
 * @author: SmartChartsNXT
 * @version: 2.0.0
 * @description: Entry point for the chart libraray. 
 * 
 * Using namespace SmartChartsNXT
 */

import Core  from "./core/chart.core"; 

const SmartChartsNXT = new Core(); 

export default SmartChartsNXT;

if (typeof window !== 'undefined') {
	window.SmartChartsNXT = SmartChartsNXT;
}