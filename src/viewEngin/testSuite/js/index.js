'use strict';

/**index.js */

import { mountTo } from './../../pview';

const modules = {
  AnimationTestApp: require('./animationTestApp').default,
  RenderingTestApp: require('./renderingTestApp').default,
  AttrUpdateApp: require('./attrUpdateApp').default,
  MorphingTestApp: require('./morphingTestApp').default
};

window.loadModule = function(moduleName, targetNode) {
  targetNode = document.querySelector('#'+targetNode);
  let AppModule = modules[moduleName];
  if(targetNode && moduleName in modules) {
    let app = mountTo(<AppModule width={targetNode.offsetWidth} height={targetNode.offsetHeight} />, targetNode);
  }
};