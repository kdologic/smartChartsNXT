/*
 * point.js
 * @CreatedOn: 11-July-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:Define a Point class to store coordinate values.
 */


"use strict";

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