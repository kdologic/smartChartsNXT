"use strict";

/**index.js */

import { mountTo } from "./../../pview";
import ClickerApp from "./clickerApp"; 

let targetNode = document.querySelector("#app");
let app = mountTo(<ClickerApp width={targetNode.offsetWidth} height={targetNode.offsetHeight} />, document.querySelector("#app"));