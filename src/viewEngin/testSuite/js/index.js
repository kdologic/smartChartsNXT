"use strict";

/**index.js */

import { mountTo } from "./../../pview";

const modules = {
  ClickerApp: require("./clickerApp").default,
  RenderingTestApp: require("./renderingTestApp").default
};

window.loadModule = function(moduleName, targetNode) {
  targetNode = document.querySelector("#"+targetNode);
  let AppModule = modules[moduleName];
  if(targetNode && moduleName in modules) {
    let app = mountTo(<AppModule width={targetNode.offsetWidth} height={targetNode.offsetHeight} />, targetNode);
  }
};