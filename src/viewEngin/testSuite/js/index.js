"use strict";

/**index.js */

import { mountTo } from "./../../pview";
import AttrUpdateApp from "./attrUpdateApp";

const modules = {
  ClickerApp: require("./clickerApp").default,
  RenderingTestApp: require("./renderingTestApp").default,
  AttrUpdateApp: require("./attrUpdateApp").default
};

window.loadModule = function(moduleName, targetNode) {
  targetNode = document.querySelector("#"+targetNode);
  let AppModule = modules[moduleName];
  if(targetNode && moduleName in modules) {
    let app = mountTo(<AppModule width={targetNode.offsetWidth} height={targetNode.offsetHeight} />, targetNode);
  }
};