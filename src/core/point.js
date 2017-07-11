/*
 * sc.geom.core.js
 * @CreatedOn: 07-Apr-2016
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:Define a Point class to store coordinate values.
 */


"use strict";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return "x:" + this.x + ", y:" + this.y;
    }
}

module.exports = Point; 