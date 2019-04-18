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

  /**
   * https://gist.github.com/nicholaswmin/c2661eb11cad5671d816
   * Interpolates a Catmull-Rom Spline through a series of x/y points
   * Converts the CR Spline to Cubic Beziers for use with SVG items
   * 
   * If 'alpha' is 0.5 then the 'Centripetal' variant is used
   * If 'alpha' is 1 then the 'Chordal' variant is used
   *
   * 
   * @param  {Array} data - Array of points, each point in object literal holding x/y values
   * @return {String} d - SVG string with cubic bezier curves representing the Catmull-Rom Spline
   */
  catmullRomFitting(data,alpha) {
    if (alpha == 0 || alpha === undefined) {
      return false;
    } else {
      let p0, p1, p2, p3, bp1, bp2, d1, d2, d3, A, B, N, M;
      let d3powA, d2powA, d3pow2A, d2pow2A, d1pow2A, d1powA;
      let d = [Math.round(data[0].x), Math.round(data[0].y)];

      let length = data.length;
      for (let i = 0; i < length - 1; i++) {

        p0 = i == 0 ? data[0] : data[i - 1];
        p1 = data[i];
        p2 = data[i + 1];
        p3 = i + 2 < length ? data[i + 2] : p2;

        d1 = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
        d2 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        d3 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));

        // Catmull-Rom to Cubic Bezier conversion matrix

        // A = 2d1^2a + 3d1^a * d2^a + d3^2a
        // B = 2d3^2a + 3d3^a * d2^a + d2^2a

        // [   0             1            0          0          ]
        // [   -d2^2a /N     A/N          d1^2a /N   0          ]
        // [   0             d3^2a /M     B/M        -d2^2a /M  ]
        // [   0             0            1          0          ]

        d3powA = Math.pow(d3, alpha);
        d3pow2A = Math.pow(d3, 2 * alpha);
        d2powA = Math.pow(d2, alpha);
        d2pow2A = Math.pow(d2, 2 * alpha);
        d1powA = Math.pow(d1, alpha);
        d1pow2A = Math.pow(d1, 2 * alpha);

        A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
        B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
        N = 3 * d1powA * (d1powA + d2powA);
        if (N > 0) {
          N = 1 / N;
        }
        M = 3 * d3powA * (d3powA + d2powA);
        if (M > 0) {
          M = 1 / M;
        }

        bp1 = {
          x: (-d2pow2A * p0.x + A * p1.x + d1pow2A * p2.x) * N,
          y: (-d2pow2A * p0.y + A * p1.y + d1pow2A * p2.y) * N
        };

        bp2 = {
          x: (d3pow2A * p1.x + B * p2.x - d2pow2A * p3.x) * M,
          y: (d3pow2A * p1.y + B * p2.y - d2pow2A * p3.y) * M
        };

        if (bp1.x == 0 && bp1.y == 0) {
          bp1 = p1;
        }
        if (bp2.x == 0 && bp2.y == 0) {
          bp2 = p2;
        }

        d.push('C ' + bp1.x + ' ' + bp1.y + ' ' + bp2.x + ' ' + bp2.y + ' ' + p2.x + ' ' + p2.y);
      }

      return d;
    }
  }

}

export default new GeomCore();