'use strict';

import { TransformMatrix } from "./core.model";

/**
 * transformer.ts
 * @createdOn: 31-July-2017
 * @author: SmartChartsNXT
 * @description:This class will generate css transformation matrix.
 * Will merge multiple transform operation (like rotate, skews, translate etc.) into a single transformation matrix.
 */

class Transformer {
  matrix: TransformMatrix;

  constructor() {
    this.matrix = [];
  }

  /**
   * Returns unit matrix as base matrix
   * @return unit matrix
   */

  getBase(): TransformMatrix {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  /**
   * @param {String} transformOperations Array of transformation operations like ['scaleX(1.5)','skewY(0.5)','translateY(200)']
   * @param {Number} baseMatrix Array of pre-exist transformation matrix.
   * @return {String} String value of transformation matrix
   */
  getTransformMatrix(transformOperations?: string[], baseMatrix?: TransformMatrix): string {
    this.matrix = JSON.parse(JSON.stringify(baseMatrix || this.getBase()));
    for (let i = 0; i < (transformOperations || []).length; i++) {
      const arrOpr = transformOperations[i].split(/[(),]/g).filter(v => {
        return v !== '';
      });
      switch (arrOpr[0]) {
        case 'rotate':
          this.matrix = this.matrixMultiply(this.matrix, [
            [Math.cos(this.degToRad(arrOpr[1])), (-1) * Math.sin(this.degToRad(arrOpr[1])), 0],
            [Math.sin(this.degToRad(arrOpr[1])), Math.cos(this.degToRad(arrOpr[1])), 0],
            [0, 0, 1]
          ]);
          break;
        case 'scale':
          this.matrix = this.matrixMultiply(this.matrix, [
            [arrOpr[1], 0, 0],
            [0, arrOpr[1], 0],
            [0, 0, 1]
          ]);
          break;
        case 'scaleX':
          this.matrix = this.matrixMultiply(this.matrix, [
            [arrOpr[1], 0, 0],
            [0, 1, 0],
            [0, 0, 1]
          ]);
          break;
        case 'scaleY':
          this.matrix = this.matrixMultiply(this.matrix, [
            [1, 0, 0],
            [0, arrOpr[1], 0],
            [0, 0, 1]
          ]);
          break;
        case 'translate':
          this.matrix = this.matrixMultiply(this.matrix, [
            [1, 0, arrOpr[1]],
            [0, 1, arrOpr[2]],
            [0, 0, 1]
          ]);
          break;
        case 'translateX':
          this.matrix = this.matrixMultiply(this.matrix, [
            [1, 0, arrOpr[1]],
            [0, 1, 0],
            [0, 0, 1]
          ]);
          break;
        case 'translateY':
          this.matrix = this.matrixMultiply(this.matrix, [
            [1, 0, 0],
            [0, 1, arrOpr[1]],
            [0, 0, 1]
          ]);
          break;
        case 'skew':
          this.matrix = this.matrixMultiply(this.matrix, [
            [1, Math.tan(this.degToRad(arrOpr[1])), 0],
            [Math.tan(this.degToRad(arrOpr[2])), 1, 0],
            [0, 0, 1]
          ]);
          break;
        case 'skewX':
          this.matrix = this.matrixMultiply(this.matrix, [
            [1, Math.tan(this.degToRad(arrOpr[1])), 0],
            [0, 1, 0],
            [0, 0, 1]
          ]);
          break;
        case 'skewY':
          this.matrix = this.matrixMultiply(this.matrix, [
            [1, 0, 0],
            [Math.tan(this.degToRad(arrOpr[1])), 1, 0],
            [0, 0, 1]
          ]);
          break;
      }
    }
    return `matrix(${[this.matrix[0][0], this.matrix[1][0], this.matrix[0][1], this.matrix[1][1], this.matrix[0][2], this.matrix[1][2]].join()})`;
  }

  /**
   * Converts transformation string into 2d matrix.
   * @param {String} strMatrix String value of transformation matrix.
   * @return {Number}  Transformation matrix in 2d array form.
   */
  convertTransformMatrix(strMatrix: string): TransformMatrix | null {
    let arr = strMatrix.replace(/[matrix\(\) ]/g, '').split(',');
    if (!strMatrix || arr.length < 6) {
      return null;
    }
    let arrMatrix = [
      [arr[0], arr[2], arr[4]],
      [arr[1], arr[3], arr[5]],
      [0, 0, 1]
    ];
    return arrMatrix;
  }

  /**
   * Returns present transformation matrix of input element.
   * @param {DOM} element DOM element.
   * @return {Number}  Transformation matrix in 2d array form.
   */
  getElementTransformation(element: SVGElement | HTMLElement): TransformMatrix | null {
    if (element) {
      let computedStyle = window.getComputedStyle(element);
      return this.convertTransformMatrix(computedStyle.transform);
    }
    return null;
  }
  /**
   * Set transformation of a DOM element.
   * @param {DOM} element DOM element.
   * @param {String} strTransform String value of transformation matrix.
   * @return {void} undefined
   */
  setElementTransformation(element: SVGElement | HTMLElement, strTransform: string) {
    if (element) {
      element.style['-webkit-transform'] = strTransform;
      element.style['-moz-transform'] = strTransform;
      element.style['-ms-transform'] = strTransform;
      element.style['-o-transform'] = strTransform;
      element.style['transform'] = strTransform;
    }
  }

  /**
   * Convert Degree value into Radian value
   * @param {Number | string} x Degree value
   * @return {Number} Radian value
   */
  degToRad(x: number | string): number {
    return Number(x) * Math.PI / 180;
  }


  /**
   * Matrix multiplication.
   * @param {Number} a Input matrix 1.
   * @param {Number} b Input matrix 2.
   * @return {Number} Multiplication result of two matrix.
   */
  matrixMultiply(a: TransformMatrix, b: TransformMatrix): TransformMatrix {
    let aNumRows = a.length;
    let aNumCols = a[0].length;
    //let bNumRows = b.length;
    let bNumCols = b[0].length;
    let m = new Array(aNumRows);
    for (let r = 0; r < aNumRows; ++r) {
      m[r] = new Array(bNumCols);
      for (let c = 0; c < bNumCols; ++c) {
        m[r][c] = 0;
        for (let i = 0; i < aNumCols; ++i) {
          m[r][c] += (Number(a[r][i]) * Number(b[i][c]));
        }
      }
    }
    return m;
  }
}

export default new Transformer();