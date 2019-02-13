"use strict";

/**
 * point.js
 * @createdOn: 11-July-2017
 * @author: SmartChartsNXT
 * @description: Define a Point class to store coordinate values.
 */

class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return "x:" + this.x + ", y:" + this.y;
    }
}

export default Point; 