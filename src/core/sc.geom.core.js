/*
 * sc.geom.core.js
 * @CreatedOn: 07-Apr-2016
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @description:SmartChartsNXT Core Library components. That contains geometric functionality.
 */



/*---------------Related mathematical shapes---------------------------*/

  window.SmartChartsNXT.geom = {};
  window.SmartChartsNXT.geom.describeRoundedRect = function (x, y, width, height, radius) {
    return [
      "M", (x + radius), y, "h", (width - (2 * radius)), "a", radius, radius, " 0 0 1 ", radius, radius, "v", (height - (2 * radius)), "a", radius, radius, " 0 0 1 ", -radius, radius, "h", ((2 * radius) - width), "a", radius, radius, " 0 0 1 ", -radius, -radius, "v", ((2 * radius) - height), "a", radius, radius, " 0 0 1 ", radius, -radius, "z"
    ];
  }; /*End describeRoundedRect()*/

  window.SmartChartsNXT.geom.describeBezireArc = function (point1, point2, point3) {
    var mid2 = $SC.geom.getMidPoint(point2, point3);

    var c = [
      "C",
      point2.x,
      point2.y,
      point2.x,
      point2.y,
      mid2.x,
      mid2.y
    ];
    return c;
  }; /*End describeBezireArc()*/

  window.SmartChartsNXT.geom.createDot = function (center, color, radious, opacity, cls, targetElem, stroke, strokeWidth) {
    var svg;
    if (targetElem)
      svg = document.getElementById(targetElem);
    else
      svg = document.getElementsByTagName('svg')[0]; //Get svg element
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
    newElement.setAttribute("cx", center.x); //Set center x 
    newElement.setAttribute("cy", center.y); //Set center y 
    newElement.setAttribute("r", radious || 3); //Set radious
    newElement.setAttribute("class", cls || "dot"); //Set class
    newElement.setAttribute("stroke", stroke || "none"); //Set border color
    newElement.setAttribute("fill", color); //Set fill colour
    newElement.setAttribute("opacity", opacity || 1);
    newElement.setAttribute("stroke-width", strokeWidth || 1); //Set stroke width
    svg.appendChild(newElement);
  }; /*End createDot()*/


  window.SmartChartsNXT.geom.createRect = function (left, top, width, height, color, cls, opacity, stroke, strokeWidth) {
    var svg = document.getElementsByTagName('svg')[0]; //Get svg element
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create a path in SVG's namespace
    newElement.setAttribute("x", left); //Set left position
    newElement.setAttribute("y", top); //Set top position
    newElement.setAttribute("width", width); //Set width
    newElement.setAttribute("height", height); //Set height
    newElement.setAttribute("stroke", stroke || "none"); //Set border color
    newElement.setAttribute("fill", color); //Set fill colour
    newElement.setAttribute("opacity", opacity || 1);
    newElement.setAttribute("stroke-width", strokeWidth || 1); //Set stroke width
    newElement.setAttribute("class", cls || "bbox"); //Set class
    svg.appendChild(newElement);
  }; /*End createRect()*/



  window.SmartChartsNXT.geom.getDistanceBetween = function (point1, point2) {
    var dist = Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y)) || 0;
    return dist;
  }; /*End getDistanceBetween()*/

  window.SmartChartsNXT.geom.Point = function (x, y) {
    var obj = this;
    this.x = x;
    this.y = y;
    this.toString = function () {
      return "x:" + obj.x + ", y:" + obj.y;
    };
  };

  window.SmartChartsNXT.geom.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }; /*End polarToCartesian()*/

  window.SmartChartsNXT.geom.getMidPoint = function (point1, point2) {
    return new $SC.geom.Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
  }; /*End getMidPoint()*/

  window.SmartChartsNXT.geom.getEllipticalRadious = function (rx, ry, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    var r = (rx * ry) / Math.sqrt(((rx * rx) * (Math.sin(angleInRadians) * Math.sin(angleInRadians))) + ((ry * ry) * (Math.cos(angleInRadians) * Math.cos(angleInRadians))));
    return r;
  }; /*End getEllipticalRadious()*/

  window.SmartChartsNXT.geom.describeEllipticalArc = function (cx, cy, rx, ry, startAngle, endAngle, sweepFlag) {
    var fullArc = false;
    if (startAngle % 360 === endAngle % 360) {
      endAngle--;
      fullArc = true;
    }

    var start = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rx, ry, endAngle), endAngle);
    var end = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rx, ry, startAngle), startAngle);
    var largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    var d = [
      "M", start.x, start.y,
      "A", rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y
    ];

    if (fullArc)
      d.push("L", start.x, start.y);
    d.push("L", cx, cy, "Z");
    var path = {
      "d": d.join(" "),
      "arc": [rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y].join(" "),
      "start": start,
      "end": end,
      "center": new $SC.geom.Point(cx, cy),
      "rx": rx,
      "ry": ry,
      "startAngle": startAngle,
      "endAngle": endAngle
    };
    return path;
  }; /*End describeEllipticalArc()*/

  window.SmartChartsNXT.geom.checkLineIntersection = function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    /* if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point*/
    var denominator, a, b, numerator1, numerator2, result = {
      x: null,
      y: null,
      onLine1: false,
      onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator === 0) {
      return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    /* if we cast these lines infinitely in both directions, they intersect here:*/
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
    /* it is worth noting that this should be the same as:
    x = line2StartX + (b * (line2EndX - line2StartX));
    y = line2StartX + (b * (line2EndY - line2StartY));
    */
    /* if line1 is a segment and line2 is infinite, they intersect if:*/
    if (a > 0 && a < 1) {
      result.onLine1 = true;
    }
    /* if line2 is a segment and line1 is infinite, they intersect if:*/
    if (b > 0 && b < 1) {
      result.onLine2 = true;
    }
    /* if line1 and line2 are segments, they intersect if both of the above are true*/
    return result;
  } /*End checkLineIntersection()*/ ;