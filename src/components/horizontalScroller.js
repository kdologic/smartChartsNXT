/*
 * horizontalScroller.js
 * @Version:1.0.0
 * @CreatedOn:14-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: This components will create a Horizontal Scroll area for the chart. 
 */

"use strict";

let Event = require("./../core/event");

class HorizontalScroller {

    constructor() {}

    createScrollBox(objChart, chartDOM, targetElem, posX, posY, scrollBoxWidth, scrollBoxHeight) {
        let strSVG = "";
        strSVG += "<g id='hChartScrollerCont'></g>";
        strSVG += "<rect id='sliderLeftOffset' x='" + posX + "' y='" + posY + "' width='0' height='" + scrollBoxHeight + "' fill= 'rgba(128,179,236,0.5)'  fill-opacity=0.7 style='stroke-width:0.1;stroke:#717171;' \/>";
        strSVG += "<rect id='sliderRightOffset' x='" + (posX + scrollBoxWidth) + "' y='" + posY + "' width='0' height='" + scrollBoxHeight + "' fill = 'rgba(128,179,236,0.5)' fill-opacity=0.7 style='stroke-width:0.1;stroke:#717171;' \/>";

        let outerContPath = [
            "M", posX, (posY + 10),
            "L", posX, posY,
            "L", (posX + scrollBoxWidth), posY,
            "L", (posX + scrollBoxWidth), (posY + 10)
        ];

        strSVG += "<path stroke='#333' fill='none' d='" + outerContPath.join(" ") + "' stroke-width='1' opacity='1'></path>";
        strSVG += "<rect id='outerFrame' x='" + posX + "' y='" + (posY) + "' width='" + scrollBoxWidth + "' height='" + scrollBoxHeight + "' style='fill:none;stroke-width:0.1;stroke:none;' \/>";
        strSVG += "<path id='sliderLeft' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "<path id='sliderRight' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";

        strSVG += "<g id='sliderLeftHandle' style='cursor: ew-resize;'>";
        strSVG += "  <rect id='sliderLSelFrame' x=''  y='" + (posY - scrollBoxHeight) + "' width='10' height='" + (scrollBoxHeight*2) + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
        strSVG += "  <path id='slideLSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "  <path id='slideLSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "</g>";

        strSVG += "<g id='sliderRightHandle' style='cursor: ew-resize;'>";
        strSVG += "  <rect id='sliderRSelFrame' x=''  y='" + (posY - scrollBoxHeight) + "' width='10' height='" + (scrollBoxHeight*2) + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
        strSVG += "  <path id='slideRSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "  <path id='slideRSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "</g>";
        chartDOM.querySelector("#" + targetElem).insertAdjacentHTML("beforeend", strSVG);

    }
}

module.exports = HorizontalScroller; 