'use strict';

/**
 * rect.ts
 * @createdOn: 08-July-2023
 * @author: SmartChartsNXT
 * @description: Define a Rect class to define area
 */

export class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  toString(): string {
    return 'x:' + this.x + ', y:' + this.y + ', width:' + this.width + ', height:' + this.height;
  }
}


export default Rect;