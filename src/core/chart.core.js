/*
 * chart.core.js
 * @CreatedOn:10-Jul-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @Description:SmartChartsNXT Core Library components. That contains common functionality.
 */

"use strict";

let polyfills = require("./../shims/polyfills");
let AreaChart = require("./../coordinateCharts/areaChart/areaChart"); 
let LineChart = require("./../coordinateCharts/lineChart/lineChart"); 
let PieChart = require("./../slicedCharts/pieChart/pieChart"); 

const preLoaderImg = "<svg width='135' height='140' viewBox='0 0 135 140' xmlns='http://www.w3.org/2000/svg' fill='#555'> <rect y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='30' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='60' width='15' height='140' rx='6'> <animate attributeName='height' begin='0s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='90' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='120' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect></svg>";

class Core {
    constructor() {
        this.nameSpaceReadyStatus = false;
        this.AreaChart = AreaChart; 
        this.LineChart = LineChart; 
        this.PieChart = PieChart; 
        this.initCore();
    }

    initCore() {
        let self = this;
        self.addFont(function (event) {
            //self.appendChartTypeNamespace();
            self.nameSpaceReadyStatus = true;
        });
    } /*End initLib()*/

    addFont(cb) {
        let fontLink = document.createElement("link");
        fontLink.href = "https://fonts.googleapis.com/css?family=Lato:400,700";
        fontLink.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(fontLink);
        if (typeof cb === "function") {
            fontLink.addEventListener('load', function (e) {
                cb(e);
            }, false);
        }
    } /*End addFont()*/

    ready(successBack) {
        let self = this;
        /* strat polling for the ready state*/
        let statusCheck = setInterval(function () {
            if (self.nameSpaceReadyStatus) {
                clearInterval(statusCheck);
                if (typeof successBack === "function") {
                    var startTime = window.performance.now();

                    successBack.call(self);

                    let endTitme = window.performance.now();
                    console.log("Time elapsed for chart: %c" + (endTitme-startTime) + " Ms", "color:green");
                }
            }
        }, 100);
    } /*End ready()*/
}

module.exports = Core; 