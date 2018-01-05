/**
 * ui.core.js
 * @CreatedOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @version: 1.1.0
 * @description:SmartChartsNXT Core Library components. That contains ui functionality.
 */

/*-----------SmartChartsNXT UI functions------------- */

"use strict";

import Point from './point';
import Geom from './geom.core'; 

class UiCore {
  constructor() {}

  /*  ** depricated ** */
  // dropShadow(shadowId) {
  //   return (
  //     <defs>
  //       <filter id={shadowId} height='130%'>
  //         <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>
  //           <feOffset dx='2' dy='2' result='offsetblur'/>
  //             <feMerge><feMergeNode/>
  //           <feMergeNode in='SourceGraphic'/>
  //         </feMerge>
  //       </filter>
  //     </defs>
  //   );
  // } 

  dropShadow(shadowId) {
    return (
      <defs>
        <filter xmlns="http://www.w3.org/2000/svg" id={shadowId} height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0"/> 
          <feOffset dx="4" dy="4" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
    );
  }

  // radialShadow(gradId, cx, cy, fx, fy, r) {
  //   return (
  //     <defs>
  //       <radialGradient id={gradId} cx={cx} cy={cy} fx={fx} fy={fy} r={r} gradientUnits="userSpaceOnUse">
  //         <stop offset="0%" style="stop-color:#fff;stop-opacity:0.06"></stop>
  //         <stop offset="83%" style="stop-color:#fff;stop-opacity:0.2"></stop>
  //         <stop offset="95%" style="stop-color:#fff;stop-opacity:0"></stop>
  //       </radialGradient>
  //     </defs>
  //   );
  // }
  /** Create radial gradient
   * @param {string} gradId - identifire of this gradient
   * @param {number} cx - center x 
   * @param {number} cy - center y
   * @param {number} fx - offset x
   * @param {number} fy - offset y
   * @param {number} r -  radius
   * @param {Array} gradArr - Array of number or object. 
   * Example --
   * gradArr = [0.1, -0.06, 0.9] or 
   * gradArr = [{offset:0, opacity:0.06},{offset:83, opacity:0.2},{offset:95, opacity:0}]
   * (-) negative indicates darker shades
   * 
  */
  radialShadow(gradId, cx, cy, fx, fy, r, gradArr) {
    return (
      <defs>
        <radialGradient id={gradId} cx={cx} cy={cy} fx={fx} fy={fy} r={r} gradientUnits="userSpaceOnUse">
          {gradArr.map((grad, i) =>{
            let offset = i/gradArr.length*100;
            let opacity = grad; 
            let color = '#fff'; 
            if(typeof grad === 'object'){
              offset = grad.offset !== 'undefined' ? grad.offset : offset; 
              opacity = grad.opacity  !== 'undefined' ? grad.opacity : opacity; 
              if(opacity < 0) {
                color = '#000'; 
                opacity = Math.abs(opacity); 
              }
            }
            return <stop offset={`${offset}%`} stop-color={color} stop-opacity={opacity}></stop>;
          })}
        </radialGradient>
      </defs>
    );
  }

  getScaledFontSize(totalWidth, scale, maxSize) {
    let fSize = totalWidth / scale;
    return fSize < maxSize ? fSize : maxSize;
  }

  /** Returns true if it is a touch device 
   * @return {boolean}
  */
  isTouchDevice() {
    return "ontouchstart" in document.documentElement;
  }

  /* Get point in global SVG space*/
  cursorPoint(targetElem, evt) {
    if (typeof targetElem === "string") {
      targetElem = document.querySelector("#" + targetElem + " svg");
    }
    let pt = targetElem.createSVGPoint();
    pt.x = evt.clientX || evt.touches[0].clientX;
    pt.y = evt.clientY || evt.touches[0].clientY;
    return pt.matrixTransform(targetElem.getScreenCTM().inverse());
  } /*End cursorPoint()*/


  appendMenu2(targetElem, svgCenter, scaleX, scaleY, chartObj) {
    scaleX = scaleX || 1;
    scaleY = scaleY || 1;
    let strSVG = "";
    strSVG += "<g id='smartCharts-menu2'>";
    strSVG += "  <path id='smartCharts-menu-icon' d='" + Geom.describeRoundedRect(((svgCenter.x * 2) - 50 + (scaleX / 2)), (25 - (scaleY / 2)), 35, 30, 5).join(" ") + "' pointer-events='all' fill='none' stroke-width='0.5' opacity='0' stroke='#717171' style='cursor:pointer;' />";
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
      let strSVG = "<g id='smartsCharts-loader-container'>";
      strSVG += "<rect x='0' y='0' width='" + (svgCenter.x * 2) + "' height='" + (svgCenter.y * 2) + "' fill='#777' stroke='none' stroke-width='0' opacity='0.5'/>";
      strSVG += "<g id='loader-icon' style='display:none;' transform='translate(" + svgCenter.x + "," + (svgCenter.y - 40) + ") scale(0.6,0.6)'><rect x='0' y='0' width='100' height='100' fill='none' class='bk'></rect><g transform='translate(-20,-20)'><path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#fff'><animateTransform attributeName='transform' type='rotate' from='90 50 50' to='0 50 50' dur='1s' repeatCount='indefinite'></animateTransform></path></g><g transform='translate(20,20) rotate(15 50 50)'><path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#fff'><animateTransform attributeName='transform' type='rotate' from='0 50 50' to='90 50 50' dur='1s' repeatCount='indefinite'></animateTransform></path></g>";
      strSVG += "</g></g>";
      document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

      let menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
      if (menuSidePanel.length > 0) {
        menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
      } else {
        let menuItemWidth = 100,
          menuHeight = 30,
          offSetX = 10,
          offSetY = 20; //offSetX = ((svgCenter.x)-350+(scaleX/2)),offSetY = (25-(scaleY/2));
        strSVG = "  <g id='smartCharts-menu-panel'>"; //(svgCenter.x*2)-50-offSetX
        strSVG += "  <path id='smartCharts-menu-container'  stroke='#09cef3'  fill='white' d='" + Geom.describeRoundedRect(offSetX, offSetY, ((svgCenter.x * 2) - (2 * offSetX)), menuHeight, menuHeight / 2).join(" ") + "' stroke-width='1' fill-opacity='0.95'></path>";

        strSVG += " <rect class='main-menu-item save-as' x='" + (offSetX + 15) + "' y='" + offSetY + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
        strSVG += " <text class='main-menu-item save-as' fill='#555' x='" + (offSetX + 30) + "' y='" + (offSetY + 20) + "' font-family='Lato' style='cursor:pointer;'>Save As...</text>";

        strSVG += " <rect class='main-menu-item print' x='" + (offSetX + menuItemWidth + 17) + "' y='" + offSetY + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
        strSVG += " <text class='main-menu-item print' fill='#555' x='" + (offSetX + menuItemWidth + 45) + "' y='" + (offSetY + 20) + "' font-family='Lato' style='cursor:pointer;' >Print</text>";


        strSVG += " <g class='main-menu-item crossIcon'> ";
        let d = Geom.describeRoundedRect(((svgCenter.x * 2) - (2 * offSetX) - 28), offSetY + 1, 28, 28, 5);
        strSVG += " <path  fill='red' d='" + d.join(" ") + "' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
        strSVG += "  <line  x1='" + (((svgCenter.x * 2) - (2 * offSetX) - 25)) + "' y1='" + (offSetY + 28) + "' x2='" + ((svgCenter.x * 2) - (2 * offSetX) - 3) + "' y2='" + (offSetY + 3) + "' stroke-width='2' stroke='#be0d0d' style='cursor:pointer;' />";
        strSVG += "  <line  x1='" + (((svgCenter.x * 2) - (2 * offSetX) - 25)) + "' y1='" + (offSetY + 3) + "' x2='" + ((svgCenter.x * 2) - (2 * offSetX) - 3) + "' y2='" + (offSetY + 28) + "' stroke-width='2' stroke='#be0d0d' style='cursor:pointer;' />";
        strSVG += " </g>";

        strSVG += "  </g>";
        document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

        let menuPanel = document.querySelector("#" + targetElem + " svg #smartCharts-menu-panel");
        menuPanel.setAttribute("transform", "translate(" + ((svgCenter.x * 2) - offSetX) + ",0)");

        /*Slide menu left direction*/
        let slideOffset = ((svgCenter.x * 2) - offSetX);
        let shiftBy = 0,
          shiftOffset = 8;
        let intervalId = setInterval(function () {
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
          if (menuPanel) {
            menuPanel.setAttribute("transform", "translate(" + (slideOffset) + ",0)");
          } else {
            clearInterval(intervalId);
          }
          if (slideOffset === 0 || shiftOffset < 0.1) {
            menuPanel.setAttribute("transform", "translate(0,0)");
            clearInterval(intervalId);
          }
        }, 60);

        let closeMenu = document.querySelector("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.crossIcon");
        closeMenu.addEventListener("click", function () {
          let loader = document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container");
          loader.parentNode.removeChild(loader);
          let menuPanel = document.querySelector("#" + targetElem + " #smartCharts-menu-panel");
          menuPanel.parentNode.removeChild(menuPanel);
        }, false);

        let printMenu = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.print");
        for (let i = 0; i < printMenu.length; i++) {
          printMenu[i].addEventListener("click", () => {
            e.stopPropagation();
            e.preventDefault();

            //fire Event beforePrint
            let beforePrintEvent = new chartObj.event.Event("beforePrint", {
              srcElement: chartObj
            });
            chartObj.event.dispatchEvent(beforePrintEvent);

            document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container #loader-icon").style.display = "block";
            let opts = {
              width: svgCenter.x * 2,
              height: svgCenter.y * 2,
              srcElem: "#" + targetElem + " svg",
              saveSuccess: function () {
                document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "visible";
                let loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
                if (loaderContainter) {
                  loaderContainter.parentNode.removeChild(loaderContainter);
                }

                //fire Event afterPrint
                let afterPrintEvent = new chartObj.event.Event("afterPrint", {
                  srcElement: chartObj
                });
                chartObj.event.dispatchEvent(afterPrintEvent);
              }
            };
            let menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
            if (menuSidePanel.length > 0) {
              menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
            }
            document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "hidden";
            chartObj.util.printChart(opts);

          }, false);
        }


        let saveAsMenu = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.save-as");
        for (let s = 0; s < saveAsMenu.length; s++) {
          saveAsMenu[s].addEventListener("click", onSaveAs, false);
        }


        function onSaveAs(e) {
          e.stopPropagation();
          e.preventDefault();

          let subMenuOffsetY = 100;
          let saveAsMenu = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel #smartCharts-saveas-submenu");
          if (saveAsMenu.length > 0) {
            saveAsMenu[0].parentNode.removeChild(saveAsMenu[0]);
            return;
          }

          let otherMenus = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel .sub-menu");
          for (let i = 0; i < otherMenus.length; i++) {
            otherMenus[0].parentNode.removeChild(otherMenus[0]);
          }

          let subMenuCurveX = (offSetX + (menuItemWidth * 4) + 23);
          if (svgCenter.x <= 250) {
            subMenuCurveX = (offSetX + (menuItemWidth * 2) + 19);
          }


          let submenuOffsetPath = [
            "M", (offSetX + 15), (offSetY + menuHeight),
            "L", (offSetX + menuItemWidth + 15), (offSetY + menuHeight),
            "L", (offSetX + menuItemWidth + 15), (offSetY + menuHeight + (subMenuOffsetY / 2)),
            "L", subMenuCurveX, (offSetY + menuHeight + subMenuOffsetY),
            "L", (offSetX + 15), (offSetY + menuHeight + subMenuOffsetY),
            "Z"
          ];


          strSVG = "  <g id='smartCharts-saveas-submenu' class='sub-menu'>";
          strSVG += "  <path id='smartCharts-menu-container'  stroke='#09cef3'  fill='white' d='" + Geom.describeRoundedRect(offSetX + 15, (offSetY + menuHeight + subMenuOffsetY), (svgCenter.x <= 250 ? (menuItemWidth * 2) + 4 : (menuItemWidth * 4)), (svgCenter.x <= 250 ? (menuHeight * 3) : menuHeight), 2).join(" ") + "' stroke-width='1' fill-opacity='0.95'></path>";

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

          let saveAsSubmenus = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel #smartCharts-saveas-submenu .sub-menu-item");
          for (let i = 0; i < saveAsSubmenus.length; i++) {
            saveAsSubmenus[i].addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();

              //fire Event beforeSave
              let beforeSaveEvent = new chartObj.event.Event("beforeSave", {
                srcElement: chartObj
              });
              chartObj.event.dispatchEvent(beforeSaveEvent);

              document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container #loader-icon").style.display = "block";

              let saveAsType = e.target.getAttribute("save-as");
              let opts = {
                width: svgCenter.x * 2,
                height: svgCenter.y * 2,
                srcElem: "#" + targetElem + " svg",
                type: saveAsType,
                saveSuccess: () => {
                  document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "visible";
                  let loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
                  if (loaderContainter) {
                    loaderContainter.parentNode.removeChild(loaderContainter);
                  }

                  //fire Event afterSave
                  let afterSaveEvent = new chartObj.event.Event("afterSave", {
                    srcElement: chartObj
                  });
                  chartObj.event.dispatchEvent(afterSaveEvent);
                }
              };
              let menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
              if (menuSidePanel.length > 0) {
                menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
              }
              document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "hidden";
              chartObj.util.saveAsImage(opts);

            }, false);
          }
        } /*End onSaveAs()*/

      }

    } /*End onMenuClick()*/

  } /*End appendMenu2()*/

  appendWaterMark(targetElem, scaleX, scaleY) {
    let strSVG = "<g id='smartCharts-watermark'>";
    strSVG += "  <text fill='#717171' x='" + (10 - (scaleX / 4)) + "' y='" + (25 - (scaleY / 2)) + "' font-size='10' font-family='Lato' style='cursor: pointer;' onclick=\"window.open('http://www.smartcharts.cf')\">Powered by SmartChartsNXT</text>";
    strSVG += "  </g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);
  } /*End appendWaterMark()*/
}

export default new UiCore();