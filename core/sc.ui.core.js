/*
 * sc.ui.core.js
 * @CreatedOn: 07-Apr-2016
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @description:SmartChartsNXT Core Library components. That contains ui functionality.
 */


/*-----------SmartChartsNXT UI functions------------- */

window.SmartChartsNXT.ui = {};
window.SmartChartsNXT.ui.dropShadow = function (parentID) {
    var shadow = document.querySelectorAll("#" + parentID + " svg #" + parentID + "-smartCharts-dropshadow");
    if (shadow.length < 1) {
        var strSVG = "";
        strSVG = "<filter id='" + parentID + "-smartCharts-dropshadow' height='130%'>";
        strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>";
        strSVG += "  <feOffset dx='2' dy='2' result='offsetblur'/>";
        strSVG += "  <feMerge>";
        strSVG += "    <feMergeNode/>";
        strSVG += "    <feMergeNode in='SourceGraphic'/>";
        strSVG += "  </feMerge>";
        strSVG += "</filter>";
        document.querySelector("#" + parentID + " svg").insertAdjacentHTML("beforeend", strSVG);
    }
    return "url(#" + parentID + "-smartCharts-dropshadow)";
}; /*End appendDropShadow()*/

/*function used to show/hide tooltip*/
window.SmartChartsNXT.ui.toolTip = function (targetElem, cPoint, color, line1, line2) {
    if (typeof cPoint === "string" && cPoint === "hide") {
        var toolTip = document.querySelector("#" + targetElem + " svg #toolTipContainer");
        if (toolTip) toolTip.style.display = "none";
        return;
    }
    var containerDiv = document.querySelector("#" + targetElem);
    var svgWidth = containerDiv.offsetWidth,
        svgHeight = containerDiv.offsetHeight;
    var strContents = "";

    /*Prevent call-by-sharing*/
    if (cPoint)
        cPoint = new $SC.geom.Point(cPoint.x, cPoint.y);

    if (line2 === "html") {
        strContents += line1;
    } else {
        strContents += "<table>";
        strContents += "<tr><td>" + line1 + "</td></tr>";
        if (line2)
            strContents += "<tr><td><b>" + line2 + "</b></td></tr>";
        strContents += "</table>";
    }

    var toolTip = document.querySelector("#" + targetElem + " svg #toolTipContainer");
    if (toolTip) toolTip.parentNode.removeChild(toolTip);

    var strSVG = "<g id='toolTipContainer' pointer-events='none'>";
    strSVG += "  <path id='toolTip'  filter='" + $SC.ui.dropShadow(targetElem) + "' fill='white' stroke='rgb(124, 181, 236)' fill='none' d='' stroke-width='1' opacity='0.9'></path>";
    strSVG += "  <g id='txtToolTipGrp' fill='#717171' font-family='Lato' >";

    strSVG += "<foreignobject id='toolTipHTML'>";
    strSVG += "<body xmlns='http://www.w3.org/1999/xhtml'>";
    strSVG += strContents;
    strSVG += "</body>";

    strSVG += "  </g>";
    strSVG += "</g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);
    toolTip = document.querySelector("#" + targetElem + " svg #toolTipContainer");

    var lineHeight = 20;
    var padding = 10;
    padding = 10;
    var temp = document.createElement("div");
    temp.innerHTML = strContents;
    temp.style.display = "inline-block";
    temp.style.visibility = 'hidden';
    document.getElementsByTagName("body")[0].appendChild(temp);
    var containBox = {
        width: temp.offsetWidth + 6,
        height: temp.offsetHeight
    };
    if (temp) temp.parentNode.removeChild(temp);
    var txtWidth = containBox.width;
    lineHeight = containBox.height;

    cPoint.y -= 20;
    var topLeft = new $SC.geom.Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - lineHeight - 10 - padding);
    var width = txtWidth + (2 * padding),
        height = lineHeight + (2 * padding);
    var d = [
        "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
        "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
        "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
        "L", cPoint.x + 10, cPoint.y,
        "L", cPoint.x, cPoint.y + 10,
        "L", cPoint.x - 10, cPoint.y,
        "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
        "Z"
    ];
    if (topLeft.x + width > svgWidth) {
        cPoint.x -= 20;
        cPoint.y += 20;
        topLeft = new $SC.geom.Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - (lineHeight) - 10 - (padding));
        topLeft.x -= (width / 2);
        topLeft.y += (height / 2);
        d = [
            "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
            "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
            "L", cPoint.x, cPoint.y - 10,
            "L", cPoint.x + 10, cPoint.y,
            "L", cPoint.x, cPoint.y + 10,
            "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
            "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
            "Z"
        ];
    } else if (topLeft.y < 0) {
        cPoint.y += 40;
        topLeft = new $SC.geom.Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y);
        d = [
            "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
            "L", cPoint.x - 10, cPoint.y,
            "L", cPoint.x, cPoint.y - 10,
            "L", cPoint.x + 10, cPoint.y,
            "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
            "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
            "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
            "Z"
        ];
    }

    var toolTipGrp = toolTip.querySelector("#txtToolTipGrp");
    var tooTipHTML = toolTipGrp.querySelector("#toolTipHTML"),
        textPos;
    if (tooTipHTML) {
        textPos = new $SC.geom.Point(topLeft.x + 5, topLeft.y + 5);
        tooTipHTML.setAttribute("x", textPos.x);
        tooTipHTML.setAttribute("y", textPos.y);
        tooTipHTML.setAttribute("width", containBox.width + padding);
        tooTipHTML.setAttribute("height", containBox.height + padding);
    }
    document.querySelector("#" + targetElem + " svg #toolTip").setAttribute("d", d.join(" "));
    document.querySelector("#" + targetElem + " svg #toolTip").setAttribute("stroke", color);

    toolTip.style.display = "block";

}; /*End showToolTip()*/


/* Get point in global SVG space*/
window.SmartChartsNXT.ui.cursorPoint = function (targetElem, evt) {
    var svg = document.querySelector("#" + targetElem + " svg");
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}; /*End cursorPoint()*/


window.SmartChartsNXT.ui.appendMenu2 = function (targetElem, svgCenter, scaleX, scaleY) {
    scaleX = scaleX || 1;
    scaleY = scaleY || 1;
    var strSVG = "";
    strSVG += "<g id='smartCharts-menu2'>";
    strSVG += "  <path id='smartCharts-menu-icon' d='" + $SC.geom.describeRoundedRect(((svgCenter.x * 2) - 50 + (scaleX / 2)), (25 - (scaleY / 2)), 35, 30, 5).join(" ") + "' filter='" + $SC.ui.dropShadow(targetElem) + "' fill='white' stroke-width='0.5' stroke='#717171' style='cursor:pointer;' />";
    strSVG += " <g class='vBarIcon'>";
    strSVG += "  <line  x1='" + ((svgCenter.x * 2) - 45 + (scaleX / 2)) + "' y1='" + (32 - (scaleY / 2)) + "' x2='" + ((svgCenter.x * 2) - 20 + (scaleX / 2)) + "' y2='" + (32 - (scaleY / 2)) + "' style='stroke:#333;stroke-width:1;cursor:pointer;' />";
    strSVG += "  <line  x1='" + ((svgCenter.x * 2) - 45 + (scaleX / 2)) + "' y1='" + (39 - (scaleY / 2)) + "' x2='" + ((svgCenter.x * 2) - 20 + (scaleX / 2)) + "' y2='" + (39 - (scaleY / 2)) + "' style='stroke:#333;stroke-width:1;cursor:pointer;' />";
    strSVG += "  <line  x1='" + ((svgCenter.x * 2) - 45 + (scaleX / 2)) + "' y1='" + (46 - (scaleY / 2)) + "' x2='" + ((svgCenter.x * 2) - 20 + (scaleX / 2)) + "' y2='" + (46 - (scaleY / 2)) + "' style='stroke:#333;stroke-width:1;cursor:pointer;' />";
    strSVG += " </g>";
    strSVG += "</g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

    document.querySelector("#" + targetElem + " #smartCharts-menu2").addEventListener("click", onMenuClick);

    function onMenuClick(e) {
        e.stopPropagation();
        e.preventDefault();
        var strSVG = "<g id='smartsCharts-loader-container'>";
        strSVG += "<rect x='0' y='0' width='" + (svgCenter.x * 2) + "' height='" + (svgCenter.y * 2) + "' fill='#777' stroke='none' stroke-width='0' opacity='0.5'/>";
        strSVG += "<g id='loader-icon' style='display:none;' transform='translate(" + svgCenter.x + "," + (svgCenter.y - 40) + ") scale(0.6,0.6)'><rect x='0' y='0' width='100' height='100' fill='none' class='bk'></rect><g transform='translate(-20,-20)'><path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#fff'><animateTransform attributeName='transform' type='rotate' from='90 50 50' to='0 50 50' dur='1s' repeatCount='indefinite'></animateTransform></path></g><g transform='translate(20,20) rotate(15 50 50)'><path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#fff'><animateTransform attributeName='transform' type='rotate' from='0 50 50' to='90 50 50' dur='1s' repeatCount='indefinite'></animateTransform></path></g>";
        strSVG += "</g></g>";
        document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

        var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
        if (menuSidePanel.length > 0) {
            menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
        } else {
            var menuItemWidth = 100,
                menuHeight = 30,
                offSetX = 10,
                offSetY = 20; //offSetX = ((svgCenter.x)-350+(scaleX/2)),offSetY = (25-(scaleY/2));
            strSVG = "  <g id='smartCharts-menu-panel'>"; //(svgCenter.x*2)-50-offSetX
            strSVG += "  <path id='smartCharts-menu-container'  stroke='#09cef3'  fill='white' d='" + $SC.geom.describeRoundedRect(offSetX, offSetY, ((svgCenter.x * 2) - (2 * offSetX)), menuHeight, menuHeight / 2).join(" ") + "' stroke-width='1' fill-opacity='0.95'></path>";

            strSVG += " <rect class='main-menu-item save-as' x='" + (offSetX + 15) + "' y='" + offSetY + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
            strSVG += " <text class='main-menu-item save-as' fill='#555' x='" + (offSetX + 30) + "' y='" + (offSetY + 20) + "' font-family='Lato' style='cursor:pointer;'>Save As...</text>";

            strSVG += " <rect class='main-menu-item print' x='" + (offSetX + menuItemWidth + 17) + "' y='" + offSetY + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
            strSVG += " <text class='main-menu-item print' fill='#555' x='" + (offSetX + menuItemWidth + 45) + "' y='" + (offSetY + 20) + "' font-family='Lato' style='cursor:pointer;' >Print</text>";


            strSVG += " <g class='main-menu-item crossIcon'> ";
            var d = $SC.geom.describeRoundedRect(((svgCenter.x * 2) - (2 * offSetX) - 28), offSetY + 1, 28, 28, 5);
            strSVG += " <path  fill='red' d='" + d.join(" ") + "' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
            strSVG += "  <line  x1='" + (((svgCenter.x * 2) - (2 * offSetX) - 25)) + "' y1='" + (offSetY + 28) + "' x2='" + ((svgCenter.x * 2) - (2 * offSetX) - 3) + "' y2='" + (offSetY + 3) + "' stroke-width='2' stroke='#be0d0d' style='cursor:pointer;' />";
            strSVG += "  <line  x1='" + (((svgCenter.x * 2) - (2 * offSetX) - 25)) + "' y1='" + (offSetY + 3) + "' x2='" + ((svgCenter.x * 2) - (2 * offSetX) - 3) + "' y2='" + (offSetY + 28) + "' stroke-width='2' stroke='#be0d0d' style='cursor:pointer;' />";
            strSVG += " </g>";

            strSVG += "  </g>";
            document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

            var menuPanel = document.querySelector("#" + targetElem + " svg #smartCharts-menu-panel");
            menuPanel.setAttribute("transform", "translate(" + ((svgCenter.x * 2) - offSetX) + ",0)");

            /*Slide menu left direction*/
            var slideOffset = ((svgCenter.x * 2) - offSetX);
            var shiftBy = 0,
                shiftOffset = 8;
            var intervalId = setInterval(function () {
                if (slideOffset < 0) {
                    shiftBy += shiftOffset;
                    slideOffset += shiftBy;
                    shiftOffset /= 2;
                } else {
                    shiftBy += shiftOffset;
                    slideOffset -= shiftBy;
                    if (slideOffset < 0) {
                        shiftBy = 0;
                    }
                }
                if (menuPanel)
                    menuPanel.setAttribute("transform", "translate(" + (slideOffset) + ",0)");
                else
                    clearInterval(intervalId);
                if (slideOffset === 0 || shiftOffset < 0.1) {
                    menuPanel.setAttribute("transform", "translate(0,0)");
                    clearInterval(intervalId);
                }
            }, 60);

            var closeMenu = document.querySelector("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.crossIcon");
            closeMenu.addEventListener("click", function () {
                var loader = document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container");
                loader.parentNode.removeChild(loader);
                var menuPanel = document.querySelector("#" + targetElem + " #smartCharts-menu-panel");
                menuPanel.parentNode.removeChild(menuPanel);
            }, false);

            var printMenu = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.print");
            for (var i = 0; i < printMenu.length; i++) {
                printMenu[i].addEventListener("click", function () {
                    e.stopPropagation();
                    e.preventDefault();

                    document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container #loader-icon").style.display = "block";
                    var opts = {
                        width: svgCenter.x * 2,
                        height: svgCenter.y * 2,
                        srcElem: "#" + targetElem + " svg",
                        saveSuccess: function () {
                            document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "visible";
                            var loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
                            if (loaderContainter) loaderContainter.parentNode.removeChild(loaderContainter);
                        }
                    };
                    var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
                    if (menuSidePanel.length > 0)
                        menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
                    document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "hidden";
                    $SC.util.printChart(opts);

                }, false);
            }


            var saveAsMenu = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.save-as");
            for (var s = 0; s < saveAsMenu.length; s++) {
                saveAsMenu[s].addEventListener("click", onSaveAs, false);
            }


            function onSaveAs(e) {
                e.stopPropagation();
                e.preventDefault();
                var subMenuOffsetY = 100;
                var saveAsMenu = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel #smartCharts-saveas-submenu");
                if (saveAsMenu.length > 0) {
                    saveAsMenu[0].parentNode.removeChild(saveAsMenu[0]);
                    return;
                }

                var otherMenus = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel .sub-menu");
                for (var i = 0; i < otherMenus.length; i++)
                    otherMenus[0].parentNode.removeChild(otherMenus[0]);

                var subMenuCurveX = (offSetX + (menuItemWidth * 4) + 23);
                if (svgCenter.x <= 250)
                    subMenuCurveX = (offSetX + (menuItemWidth * 2) + 19);


                var submenuOffsetPath = [
                    "M", (offSetX + 15), (offSetY + menuHeight),
                    "L", (offSetX + menuItemWidth + 15), (offSetY + menuHeight),
                    "L", (offSetX + menuItemWidth + 15), (offSetY + menuHeight + (subMenuOffsetY / 2)),
                    "L", subMenuCurveX, (offSetY + menuHeight + subMenuOffsetY),
                    "L", (offSetX + 15), (offSetY + menuHeight + subMenuOffsetY),
                    "Z"
                ];


                strSVG = "  <g id='smartCharts-saveas-submenu' class='sub-menu'>";
                strSVG += "  <path id='smartCharts-menu-container'  stroke='#09cef3'  fill='white' d='" + $SC.geom.describeRoundedRect(offSetX + 15, (offSetY + menuHeight + subMenuOffsetY), (svgCenter.x <= 250 ? (menuItemWidth * 2) + 4 : (menuItemWidth * 4)), (svgCenter.x <= 250 ? (menuHeight * 3) : menuHeight), 2).join(" ") + "' stroke-width='1' fill-opacity='0.95'></path>";

                strSVG += "  <path stroke='#09cef3'  fill='#555' d='" + submenuOffsetPath.join(" ") + "' stroke-width='0' fill-opacity='0.4'></path>";

                strSVG += " <rect class='sub-menu-item' save-as='jpeg' x='" + (offSetX + 15) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
                strSVG += " <text class='sub-menu-item' save-as='jpeg' fill='#555' x='" + (offSetX + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >JPG</text>";

                strSVG += " <rect class='sub-menu-item' save-as='png' x='" + (offSetX + menuItemWidth + 17) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
                strSVG += " <text class='sub-menu-item' save-as='png' fill='#555' x='" + (offSetX + menuItemWidth + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >PNG</text>";

                if (svgCenter.x <= 250) {
                    strSVG += " <rect class='sub-menu-item' save-as='svg' x='" + (offSetX + 15) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
                    strSVG += " <text class='sub-menu-item' save-as='svg' fill='#555' x='" + (offSetX + 45) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;'>SVG</text>";

                    strSVG += " <rect class='sub-menu-item' save-as='pdf' x='" + (offSetX + menuItemWidth + 17) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
                    strSVG += " <text class='sub-menu-item' save-as='pdf' fill='#555' x='" + (offSetX + menuItemWidth + 45) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >PDF</text>";
                } else {
                    strSVG += " <rect class='sub-menu-item' save-as='svg' x='" + (offSetX + (menuItemWidth * 2) + 19) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
                    strSVG += " <text class='sub-menu-item' save-as='svg' fill='#555' x='" + (offSetX + (menuItemWidth * 2) + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;'>SVG</text>";

                    strSVG += " <rect class='sub-menu-item' save-as='pdf' x='" + (offSetX + menuItemWidth * 3 + 21) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
                    strSVG += " <text class='sub-menu-item' save-as='pdf' fill='#555' x='" + (offSetX + (menuItemWidth * 3) + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >PDF</text>";
                }
                strSVG += "  </g>";

                document.querySelector("#" + targetElem + " svg #smartCharts-menu-panel").insertAdjacentHTML("beforeend", strSVG);

                var saveAsSubmenus = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel #smartCharts-saveas-submenu .sub-menu-item");
                for (var i = 0; i < saveAsSubmenus.length; i++) {
                    saveAsSubmenus[i].addEventListener("click", function (e) {
                        e.stopPropagation();
                        e.preventDefault();

                        document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container #loader-icon").style.display = "block";

                        var saveAsType = e.target.getAttribute("save-as");
                        var opts = {
                            width: svgCenter.x * 2,
                            height: svgCenter.y * 2,
                            srcElem: "#" + targetElem + " svg",
                            type: saveAsType,
                            saveSuccess: function () {
                                document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "visible";
                                var loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
                                if (loaderContainter) loaderContainter.parentNode.removeChild(loaderContainter);
                            }
                        };
                        var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
                        if (menuSidePanel.length > 0)
                            menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
                        document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "hidden";
                        $SC.util.saveAsImage(opts);

                    }, false);
                }
            } /*End onSaveAs()*/ ;

        }

    }; /*End onMenuClick()*/

}; /*End appendMenu2()*/


window.SmartChartsNXT.ui.appendMenu = function (targetElem, svgCenter) {
    var strSVG = "";
    strSVG += "<g id='smartCharts-menu'>";
    strSVG += "  <path id='smartCharts-menu-icon' d='" + $SC.geom.describeRoundedRect(((svgCenter.x * 2) - 50), 20, 35, 30, 5).join(" ") + "' filter='" + $SC.ui.dropShadow(targetElem) + "' fill='white' stroke-width='0.5' stroke='#717171' />";
    strSVG += "  <line x1='" + ((svgCenter.x * 2) - 45) + "' y1='30' x2='" + ((svgCenter.x * 2) - 20) + "' y2='30' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='" + ((svgCenter.x * 2) - 45) + "' y1='35' x2='" + ((svgCenter.x * 2) - 20) + "' y2='35' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='" + ((svgCenter.x * 2) - 45) + "' y1='40' x2='" + ((svgCenter.x * 2) - 20) + "' y2='40' style='stroke:#333;stroke-width:1' />";
    strSVG += "</g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

    /*Bind menu events*/

    document.querySelector("#" + targetElem + " #smartCharts-menu ").addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var offSetX = 150,
            offSetY = 60,
            intervalId;
        var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
        if (menuSidePanel.length > 0) {
            menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
        } else {
            strSVG = "  <g id='smartCharts-menu-panel'>";
            strSVG += "  <rect class='menu-panel-elem' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (offSetY) + "' width='" + (offSetX) + "' height='" + (svgCenter.y * 2 - offSetY - 2) + "' fill='white' stroke-width='1' stroke='#333' />";
            strSVG += "  <rect class='menu-panel-elem' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#EEF' stroke-width='0' stroke='#333' />";
            strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (offSetY + 32) + "' font-family='Lato' >Download As...</text>";

            strSVG += "  <rect class='menu-panel-menu' save-as='jpeg' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (2 * offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#fff' stroke-width='0' stroke='#333' />";
            strSVG += "  <rect class='menu-panel-menu' save-as='png' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (3 * offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#fff' stroke-width='0' stroke='#333' />";
            strSVG += "  <rect class='menu-panel-menu' save-as='svg' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (4 * offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#fff' stroke-width='0' stroke='#333' />";


            strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (2 * offSetY + 32) + "' font-family='Lato' >JPEG</text>";
            strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (3 * offSetY + 32) + "' font-family='Lato' >PNG</text>";
            strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (4 * offSetY + 32) + "' font-family='Lato' >SVG</text>";

            strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (3 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (3 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";
            strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (4 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (4 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";
            strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (5 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (5 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";
            strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (6 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (6 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";

            strSVG += "  </g>";
            document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

            /*submenu bind event*/
            var menuPanel = document.querySelector("#" + targetElem + " #smartCharts-menu-panel");
            var submenus = menuPanel.querySelectorAll(".menu-panel-menu");
            for (var i = 0; i < submenus.length; i++) {
                submenus[i].addEventListener("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var saveAsType = e.target.getAttribute("save-as");
                    var opts = {
                        width: svgCenter.x * 2,
                        height: svgCenter.y * 2,
                        srcElem: "#" + targetElem + " svg",
                        type: saveAsType,
                        saveSuccess: function () {
                            document.querySelector("#" + targetElem + " #smartCharts-menu").style.visibility = "visible";
                        }
                    };
                    var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
                    if (menuSidePanel.length > 0)
                        menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
                    document.querySelector("#" + targetElem + " #smartCharts-menu").style.visibility = "hidden";
                    $SC.util.saveAsImage(opts);

                }, false);

                submenus[i].addEventListener("mouseenter", function (e) {
                    e.target.setAttribute("fill", "#d7d7ed");
                }, false);
                submenus[i].addEventListener("mouseleave", function (e) {
                    e.target.setAttribute("fill", "#fff");
                }, false);
            }

            menuPanel.style["transform"] = "translate(" + offSetX + "px," + 0 + "px)";

            var slideOffset = offSetX;
            var shiftBy = 1.1;
            intervalId = setInterval(function () {
                if (slideOffset < 0)
                    slideOffset = Math.round(slideOffset) + 4;
                else {
                    shiftBy += Math.pow(1.1, 2);
                    slideOffset -= shiftBy;
                }
                menuPanel = document.querySelector("#" + targetElem + " #smartCharts-menu-panel");
                if (menuPanel)
                    menuPanel.style["transform"] = "translate(" + (slideOffset) + "px," + 0 + "px)";
                else
                    clearInterval(intervalId);
                if (slideOffset === 0)
                    clearInterval(intervalId);
            }, 50);
        }
    }, false);
}; /*End appendMenu()*/