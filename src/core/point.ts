'use strict';

/**
 * point.ts
 * @createdOn: 11-July-2017
 * @author: SmartChartsNXT
 * @description: Define a Point class to store coordinate values.
 */

export class Point {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return 'x:' + this.x + ', y:' + this.y;
  }
}

export class RangePoint extends Point {
  public value: number;
  public textDim: DOMRect;

  constructor(x: number = 0, y: number = 0, value: number = 0, textDim?: DOMRect) {
    super(x, y);
    this.value = value;
    this.textDim = textDim;
  }

  toString(): string {
    return 'x:' + this.x + ', y:' + this.y + ', value:' + this.value;
  }
}

export class DataPoint extends Point {
  public value: number;
  public index: number;
  public dist: number;
  public highlighted: boolean;
  public isHidden: boolean;
  
  constructor(x: number = 0, y: number = 0, index: number = 0, value: number = 0) {
    super(x, y);
    this.value = value;
    this.index = index;
  }

  toString(): string {
    return 'x:' + this.x + ', y:' + this.y + ', value:' + this.value + ', index:' + this.index;
  }
}

export default Point;