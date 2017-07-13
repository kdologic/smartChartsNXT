/*
 * horizontalLabels.js
 * @Version:1.0.0
 * @CreatedOn:13-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: This components will create a Horizontal Labels for the chart. 
 */

"use strict";

let Event = require("./../core/event");

class HorizontalLabels {

    constructor() {}

    createHorizontalLabel(objChart, chartDOM, posX, posY, componentWidth, componentHeight, categories, scaleX) {
        let self = this;
        let hTextLabel = chartDOM.querySelector("#hTextLabel");
        if (hTextLabel) {
            hTextLabel.parentNode.removeChild(hTextLabel);
        }
        let interval = scaleX || (componentWidth / categories.length);
        /*if there is too much categories then discard some categories*/
        if (interval < 30) {
            let newCategories = [];
            let skipLen = Math.ceil(30 / interval);

            for (let i = 0; i < categories.length; i += skipLen) {
                newCategories.push(categories[i]);
            }
            categories = newCategories;
            interval *= skipLen;
        }
        let strText = "<g id='hTextLabel'>";
        for (let hText = 0; hText < categories.length; hText++) {
            let x = (posX + (hText * interval) + (interval / 2));
            let y = (posY + 20);
            if (x > (posX + componentWidth)) {
                break;
            }
            strText += "<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='" + categories[hText] + "' x='" + x + "' y='" + y + "' >";
            strText += "  <tspan  font-size='12' >" + categories[hText] + "<\/tspan>";
            strText += "</text>";
        }

        for (let hText = 0; hText < categories.length; hText++) {
            let x = (posX + (hText * interval) + (interval));
            let y = (posY);
            if (x > (posX + componentWidth)) {
                break;
            }
            let d = ["M", x, y, "L", x, (y + 10)];
            strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
        }
        strText += "</g>";
        chartDOM.insertAdjacentHTML("beforeend", strText);

        /*bind hover event*/
        let hTextLabels = chartDOM.querySelectorAll("#hTextLabel text");

        for (let i = 0; i < hTextLabels.length; i++) {
            hTextLabels[i].addEventListener("mouseenter", function (e) {
                e.stopPropagation();
                //fire Event Hover
                let onHoverEvent = new Event("onHTextLabelHover", {
                    srcElement: chartDOM,
                    originEvent: e
                });
                objChart.event.dispatchEvent(onHoverEvent);
            }, false);

            hTextLabels[i].addEventListener("mouseleave", function (e) {
                e.stopPropagation();
                //fire Event mouseLeave
                let onMouseLeaveEvent = new Event("onHTextLabelMouseLeave", {
                    srcElement: chartDOM,
                    originEvent: e
                });
                objChart.event.dispatchEvent(onMouseLeaveEvent);
            }, false);
        }

    } /*End createHorizontalLabel()*/
}

module.exports = HorizontalLabels;