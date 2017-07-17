/*
 * grid.js
 * @Version:1.0.0
 * @CreatedOn:14-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: This components will create a grid for the chart. 
 */

"use strict";

class Grid {

    constructor(targetElem, chartType) {
        this.targetElem = targetElem;
        this.chartType = chartType;
    }

    createGrid(objChart, chartSVG, posX, posY, gridBoxWidth, gridBoxHeight, gridHeight, TgridCount) {
        this.objChart = objChart; 
        this.chartSVG = chartSVG; 
        let d;
        let hGrid = this.chartSVG.querySelector("#hGrid");
        if (hGrid) {
            hGrid.parentNode.removeChild(hGrid);
        }

        let strGrid = "";
        strGrid += "<g id='hGrid' >";
        for (let gridCount = 0; gridCount < TgridCount - 1; gridCount++) {
            d = ["M", posX, posY + (gridCount * gridHeight), "L", posX + gridBoxWidth, posY + (gridCount * gridHeight)];
            strGrid += "<path fill='none' d='" + d.join(" ") + "' stroke='#D8D8D8' stroke-width='1' stroke-opacity='1'></path>";
        }
        d = ["M", posX, posY, "L", posX, posY + gridBoxHeight + 10];
        strGrid += "<rect id='gridRect' x='" + posX + "' y='" + posY + "' width='" + gridBoxWidth + "' height='" + gridBoxHeight + "' pointer-events='all' style='fill:none;stroke-width:0;stroke:#717171;' \/>";
        strGrid += "<path id='gridBoxLeftBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
        d = ["M", posX, posY + gridBoxHeight + 1, "L", posX + gridBoxWidth, posY + gridBoxHeight + 1];
        strGrid += "<path id='gridBoxBottomBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
        strGrid += "</g>";
        this.chartSVG.insertAdjacentHTML("beforeend", strGrid);
    } /*End createGrid()*/
}

module.exports = Grid;