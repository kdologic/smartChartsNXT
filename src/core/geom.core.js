'use strict';

import Point from './point';

/**
 * geom.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @description:SmartChartsNXT Core Library components. That contains geometric functionality.
 */

class GeomCore {

  /**
   * Create a rect with corner radius.
   * @param {Number} x x coordinate of rect.
   * @param {Number} y y coordinate of rect.
   * @param {Number} width Width of the rect.
   * @param {Number} height Height of the rect.
   * @param {Number} radius Corner radius of the rect.
   * @returns {Array} Returns path of the rounded rect in array.
   */
  static describeRoundedRect = (x, y, width, height, radius) => {
    return [
      'M', (x + radius), y, 'h', (width - (2 * radius)), 'a', radius, radius, ' 0 0 1 ', radius, radius, 'v', (height - (2 * radius)), 'a', radius, radius, ' 0 0 1 ', -radius, radius, 'h', ((2 * radius) - width), 'a', radius, radius, ' 0 0 1 ', -radius, -radius, 'v', ((2 * radius) - height), 'a', radius, radius, ' 0 0 1 ', radius, -radius, 'z'
    ];
  };

  /**
   * Find the closest point from a set of Points.
   * @param {Point} pSet Point set range for search.
   * @param {Point} pt Point to search the nearest in range.
   * @param {Boolean} ignoreY if --true then only consider the x axis distance, y axis distance will be ignored.
   * @return {Point} Return the closest point by distance.
   */
  static findClosestPoint = (pSet, pt, ignoreY) => {
    let halfLen = Math.ceil(pSet.length / 2);
    let lSet = pSet.slice(0, halfLen);
    let rSet = pSet.slice(halfLen);
    let nearPoint = {};
    if (halfLen < 3) {
      let min = Number.MAX_SAFE_INTEGER;
      for (let p of pSet) {
        let d = ignoreY ? GeomCore.xDist(p, pt) : GeomCore.getDistanceBetween(p, pt);
        if (d < min) {
          nearPoint = p;
          nearPoint.dist = min = d;
        }
      }
      return nearPoint;
    } else {
      if (GeomCore.xDist(lSet[halfLen - 1], pt) <= GeomCore.xDist(rSet[0], pt)) {
        nearPoint = GeomCore.findClosestPoint(lSet, pt, ignoreY);
      } else {
        nearPoint = GeomCore.findClosestPoint(rSet, pt, ignoreY);
      }
      return nearPoint;
    }
  };

  /**
   * Find distance between two point by x-axis, where y is constant.
   * @param {Point} p1 Input point 1.
   * @param {Point} p2 Input point 2.
   * @returns {Number} Returns distance.
   */
  static xDist = (p1, p2) => {
    return Math.abs(p1.x - p2.x);
  };

  /**
   * Calculate distance between two point.
   * @param {Point} p1 Starting point.
   * @param {Point} p2 Ending point.
   * @return {Number} Returns the distance between two points.
   */
  static getDistanceBetween = (p1, p2) => {
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2)) || 0;
  }

  /**
   * Convert polar coordinate to cartesian coordinate.
   * @param {Number} centerX Center x of polar coordinate.
   * @param {Number} centerY Center y of polar coordinate.
   * @param {Number} radius Radius of polar coordinate.
   * @param {Number} angleInDegrees Angle of polar coordinate in degree.
   * @returns {Point} Returns point(x,y) in cartesian coordinate.
   */
  static polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return new Point(
      centerX + (radius * Math.cos(angleInRadians).toFixed(4)),
      centerY + (radius * Math.sin(angleInRadians).toFixed(4))
    );
  };

  /**
   * Calculate the mid point value between two points.
   * @param {Point} point1 Starting point value.
   * @param {Point} point2 Ending point value.
   * @return {Point} Returns mid point value between two points.
   */
  static getMidPoint = (point1, point2) => {
    return new Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
  };

  static getEllipticalRadius = (rx, ry, angleInDegrees) => {
    if (!rx || !ry) {
      return 0;
    }
    let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    let r = (rx * ry) / Math.sqrt(((rx * rx) * (Math.sin(angleInRadians) * Math.sin(angleInRadians))) + ((ry * ry) * (Math.cos(angleInRadians) * Math.cos(angleInRadians))));
    return r;
  };

  /**
   * Create an Elliptical Arc.
   * @param {Number} cx - Center x value of arc.
   * @param {Number} cy Center y value of arc.
   * @param {Number} rx X radius of arc.
   * @param {Number} ry Y radius of arc.
   * @param {Number} startAngle Arc start angle.
   * @param {Number} endAngle Arc end angle.
   * @param {Boolean} sweepFlag Sweep flag for clock or anti-clock.
   * @returns {Object} Path of elliptical arc.
   */
  static describeEllipticalArc = (cx, cy, rx, ry, startAngle, endAngle, sweepFlag) => {
    let fullArc = false;
    if (startAngle % 360 === endAngle % 360) {
      endAngle--;
      fullArc = true;
    }
    let start = GeomCore.polarToCartesian(cx, cy, GeomCore.getEllipticalRadius(rx, ry, endAngle), endAngle);
    let end = GeomCore.polarToCartesian(cx, cy, GeomCore.getEllipticalRadius(rx, ry, startAngle), startAngle);
    let largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';

    let d = [
      'M', start.x, start.y,
      'A', rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y
    ];

    if (fullArc) {
      d.push('L', start.x, start.y);
    }
    d.push('L', cx, cy, 'Z');
    let path = {
      d: d.join(' '),
      arc: [rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y].join(' '),
      start: start,
      end: end,
      center: new Point(cx, cy),
      rx: rx,
      ry: ry,
      startAngle: startAngle,
      endAngle: endAngle
    };
    return path;
  };

  static checkLineIntersection = (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) => {
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
  };

  /**
   * https://gist.github.com/nicholaswmin/c2661eb11cad5671d816
   * Interpolates a Catmull-Rom Spline through a series of x/y points
   * Converts the CR Spline to Cubic Bezier for use with SVG items
   *
   * If 'alpha' is 0.5 then the 'Centripetal' variant is used
   * If 'alpha' is 1 then the 'Chordal' variant is used
   *
   *
   * @param  {Array} data - Array of points, each point in object literal holding x/y values
   * @param {Number} alpha - Alpha value[ 0 ~ 1]. If 'alpha' is 0.5 then the 'Centripetal' variant is used and 1 for 'Chordal'.
   * @return {String} d - SVG string with cubic bezier curves representing the Catmull-Rom Spline
   */
  static catmullRomFitting = (data, alpha) => {
    if (alpha == 0 || alpha === undefined) {
      return false;
    } else {
      let p0, p1, p2, p3, bp1, bp2, d1, d2, d3, A, B, N, M;
      let d3powA, d2powA, d3pow2A, d2pow2A, d1pow2A, d1powA;
      let d = ['M', Math.round(data[0].x), Math.round(data[0].y)];

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
  };

  /**
   * Check Rectangle overlapping.
   * @param {Object} rect1 First rect object with x, y, width and height.
   * @param {Object} rect2 Second rect object with x, y, width and height.
   * @returns {Boolean} Return true if the rect1 overlap with rect2 otherwise returns false.
   */
  static isRectOverlapping = (rect1, rect2) => {
    if (rect2.width > rect1.width) {
      let r = { ...rect1 };
      rect1 = { ...rect2 };
      rect2 = r;
    }
    if (GeomCore.isPointInsideRect(rect1, new Point(rect2.x, rect2.y))) {
      return true;
    }
    if (GeomCore.isPointInsideRect(rect1, new Point(rect2.x + rect2.width, rect2.y))) {
      return true;
    }
    if (GeomCore.isPointInsideRect(rect1, new Point(rect2.x + rect2.width, rect2.y + rect2.height))) {
      return true;
    }
    if (GeomCore.isPointInsideRect(rect1, new Point(rect2.x, rect2.y + rect2.height))) {
      return true;
    }
    return false;
  };

  /**
   * Function that verify a point is inside or outside of a rectangle area.
   * @param {Object} rect Rect object having x, y, width and height.
   * @param {Object} point Point object which need check overlapping with the rect object.
   * @returns {Boolean} Return true if the point is inside the rect otherwise returns false.
   */
  static isPointInsideRect = (rect, point) => {
    if (point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height) {
      return true;
    }
    return false;
  };

}

export default GeomCore;