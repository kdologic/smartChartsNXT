"use strict";

import Point from "./point";

/**
 * geom.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @description:SmartChartsNXT Core Library components. That contains geometric functionality.
 */

class GeomCore {
  constructor() {}

  describeRoundedRect(x, y, width, height, radius) {
    return [
      "M", (x + radius), y, "h", (width - (2 * radius)), "a", radius, radius, " 0 0 1 ", radius, radius, "v", (height - (2 * radius)), "a", radius, radius, " 0 0 1 ", -radius, radius, "h", ((2 * radius) - width), "a", radius, radius, " 0 0 1 ", -radius, -radius, "v", ((2 * radius) - height), "a", radius, radius, " 0 0 1 ", radius, -radius, "z"
    ];
  }

  describeBezireArc(point1, point2, point3) {
    let mid2 = this.getMidPoint(point2, point3);

    let c = [
      "C",
      point2.x,
      point2.y,
      point2.x,
      point2.y,
      mid2.x,
      mid2.y
    ];
    return c;
  }

  createDot(center, color, radious, opacity, cls, targetElem, stroke, strokeWidth) {
    let svg;
    if (targetElem) {
      if (typeof targetElem === "object") {
        svg = targetElem;
      } else if (typeof targetElem === "string") {
        svg = document.getElementById(targetElem);
      }
    } else {
      svg = document.getElementsByTagName('svg')[0]; //Get svg element
    }
    let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
    newElement.setAttribute("cx", center.x); //Set center x 
    newElement.setAttribute("cy", center.y); //Set center y 
    newElement.setAttribute("r", radious || 3); //Set radious
    newElement.setAttribute("class", cls || "dot"); //Set class
    newElement.setAttribute("stroke", stroke || "none"); //Set border color
    newElement.setAttribute("fill", color); //Set fill colour
    newElement.setAttribute("opacity", opacity || 1);
    newElement.setAttribute("stroke-width", strokeWidth || 1); //Set stroke width
    newElement.setAttribute("pointer-events", "none"); //set no pointer event for dot
    svg.appendChild(newElement);
  }


  createRect(left, top, width, height, color, cls, opacity, stroke, strokeWidth) {
    let svg = document.getElementsByTagName('svg')[0]; //Get svg element
    let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create a path in SVG's namespace
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
  }

  /**
   * Find the closest point from a set of Points. 
   * @param {Point} pSet Point set range for search.
   * @param {Point} pt Point to search the nearest in range.
   * @param {Boolean} ignoreY if --true then only consider the x axis distance, y axis distance will be ignored.
   */
  findClosestPoint(pSet, pt, ignoreY) {
    let halfLen = Math.ceil(pSet.length/2); 
    let lSet = pSet.slice(0, halfLen); 
    let rSet = pSet.slice(halfLen);
    let nearPoint = {};
    if(halfLen < 3) {
      let min = Number.MAX_SAFE_INTEGER; 
      for(let p of pSet) {
        let d = ignoreY ? this.xDist(p,pt) : this.getDistanceBetween(p,pt);
        if( d < min) {
          nearPoint = p; 
          nearPoint.dist = min = d; 
        }
      }
      return nearPoint; 
    }else {
      if(this.xDist(lSet[halfLen-1], pt) <=  this.xDist(rSet[0], pt)) {
        nearPoint= this.findClosestPoint(lSet, pt, ignoreY);
      } else {
        nearPoint = this.findClosestPoint(rSet, pt, ignoreY);
      }
      return nearPoint;
    }
  }

  xDist(p1, p2) {
    return Math.abs(p1.x - p2.x);
  }

  getDistanceBetween(p1, p2) {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2)) || 0;
  } 

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians).toFixed(4)),
      y: centerY + (radius * Math.sin(angleInRadians).toFixed(4))
    };
  }

  getMidPoint(point1, point2) {
    return new Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
  }

  getEllipticalRadius(rx, ry, angleInDegrees) {
    if (!rx || !ry) {
      return 0;
    }
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    let r = (rx * ry) / Math.sqrt(((rx * rx) * (Math.sin(angleInRadians) * Math.sin(angleInRadians))) + ((ry * ry) * (Math.cos(angleInRadians) * Math.cos(angleInRadians))));
    return r;
  }

  /**
   * Return path of an Elliptical Arc.
   * @param {Number} cx - Center x value of arc.
   * @param {Number} cy Center y value of arc.
   * @param {Number} rx X radius of arc.
   * @param {Number} ry Y radius of arc.
   * @param {Number} startAngle Arc strat angle.
   * @param {Number} endAngle Arc end angle.
   * @param {Boolean} sweepFlag Swip flag for clock or anti-clock.
   * @returns {Object} Path of eliptical arc. 
   */
  describeEllipticalArc(cx, cy, rx, ry, startAngle, endAngle, sweepFlag) {
    let fullArc = false;
    if (startAngle % 360 === endAngle % 360) {
      endAngle--;
      fullArc = true;
    }
    let start = this.polarToCartesian(cx, cy, this.getEllipticalRadius(rx, ry, endAngle), endAngle);
    let end = this.polarToCartesian(cx, cy, this.getEllipticalRadius(rx, ry, startAngle), startAngle);
    let largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    let d = [
      "M", start.x, start.y,
      "A", rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y
    ];

    if (fullArc) {
      d.push("L", start.x, start.y);
    }
    d.push("L", cx, cy, "Z");
    let path = {
      d: d.join(" "),
      arc: [rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y].join(" "),
      start: start,
      end: end,
      center: new Point(cx, cy),
      rx: rx,
      ry: ry,
      startAngle: startAngle,
      endAngle: endAngle
    };
    return path;
  } 

  checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    /* if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point*/
    let denominator, a, b, numerator1, numerator2, result = {
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
  } /*End checkLineIntersection()*/

  /* 
   * @param {Point} pointSet 
   * @return {object []} Bézier curve path
   */
  getBezierSplines(pointSet) {
    /*grab (x,y) coordinates of the control points*/
    let x = [];
    let y = [];
    let curvedPath = [];

    /*use parseInt to convert string to let*/
    for (let i = 0; i < pointSet.length; i++) {
      x[i] = parseInt(pointSet[i].x);
      y[i] = parseInt(pointSet[i].y);
    }

    let cp = this.getCurveControlPoints(pointSet);
    /*updates path settings, the browser will draw the new spline*/
    for (let i = 0; i < pointSet.length - 1; i++) {
      curvedPath.push(path(x[i], y[i], cp.p1[i].x, cp.p1[i].y, cp.p2[i].x, cp.p2[i].y, x[i + 1], y[i + 1]));
    }

    function path(x1, y1, px1, py1, px2, py2, x2, y2) {
      return "C " + px1 + " " + py1 + " " + px2 + " " + py2 + " " + x2 + " " + y2;
    }

    return curvedPath;
  }

  getCurveControlPoints(knots) {
    let firstControlPoints = [];
    let secondControlPoints = [];
    if (knots === null) {
      throw new Error("null argument");
    }
    let n = knots.length - 1;
    if (n < 1) {
      throw new Error("At least two knot points required");
    }
    if (n === 1) { // Special case: Bezier curve should be a straight line.
      firstControlPoints = [new Point()]; //:: 3P1 = 2P0 + P3 ::
      firstControlPoints[0].x = (2 * knots[0].x + knots[1].x) / 3;
      firstControlPoints[0].y = (2 * knots[0].y + knots[1].y) / 3;

      secondControlPoints = [new Point()]; // :: P2 = 2P1 – P0 ::
      secondControlPoints[0].x = 2 * firstControlPoints[0].x - knots[0].x;
      secondControlPoints[0].y = 2 * firstControlPoints[0].y - knots[0].y;
      return {
        p1: firstControlPoints,
        p2: secondControlPoints
      };
    }

    // Calculate first Bezier control points
    // Right hand side vector
    let rhs = [];

    // Set right hand side x values
    for (let i = 1; i < n - 1; ++i) {
      rhs[i] = 4 * knots[i].x + 2 * knots[i + 1].x;
    }
    rhs[0] = knots[0].x + 2 * knots[1].x;
    rhs[n - 1] = (8 * knots[n - 1].x + knots[n].x) / 2.0;

    // Get first control points x-values
    let x = this.getFirstControlPoints(rhs);

    // Set right hand side y values
    for (let i = 1; i < n - 1; ++i) {
      rhs[i] = 4 * knots[i].y + 2 * knots[i + 1].y;
    }
    rhs[0] = knots[0].y + 2 * knots[1].y;
    rhs[n - 1] = (8 * knots[n - 1].y + knots[n].y) / 2.0;

    // Get first control points y-values
    let y = this.getFirstControlPoints(rhs);

    // Fill output arrays.
    firstControlPoints = [];
    secondControlPoints = [];
    for (let i = 0; i < n; ++i) {
      firstControlPoints[i] = new Point(x[i], y[i]);
      if (i < n - 1) {
        secondControlPoints[i] = new Point(2 * knots[i + 1].x - x[i + 1], 2 * knots[i + 1].y - y[i + 1]);
      } else {
        secondControlPoints[i] = new Point((knots[n].x + x[n - 1]) / 2, (knots[n].y + y[n - 1]) / 2);
      }
    }
    return {
      p1: firstControlPoints,
      p2: secondControlPoints
    };
  }

  /**
   * Solves a tridiagonal system for one of coordinates (x or y) of first Bezier control points.
   * @param {*} rhs 
   */
  getFirstControlPoints(rhs) {
    let n = rhs.length;
    let x = []; // Solution vector.
    let tmp = []; // Temp workspace.

    let b = 2.0;
    x[0] = rhs[0] / b;
    for (let i = 1; i < n; i++) { // Decomposition and forward substitution.
      tmp[i] = 1 / b;
      b = (i < n - 1 ? 4.0 : 3.5) - tmp[i];
      x[i] = (rhs[i] - x[i - 1]) / b;
    }
    for (let i = 1; i < n; i++) {
      x[n - i - 1] -= tmp[n - i] * x[n - i]; // Backsubstitution.
    }
    return x;
  }

}

export default new GeomCore();