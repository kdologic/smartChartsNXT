/*
 * transformer.js
 * @CreatedOn: 31-July-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:This class will generate css transformation matrix. 
 * Will merge multiple transform operation (like rotate, skes, translate etc.) into a single transformation matrix. 
 */


"use strict";

class Transformer {
  constructor() {}

  getBase() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  /*
   * @param {Array of String} trnsOprtns - Array of transformation operations like ["scaleX(1.5)","skewY(0.5)","translateY(200)"]
   * @param {Arry of Number} baseMatrix - Array of pre-exist transformation matrix.
   * @return {string}  Of transformation matrix 
   */
  getTransformMatrix(trnsOprtns, baseMatrix) {
    let matrix = baseMatrix || this.getBase();
    for (let i = 0; i < (trnsOprtns || []).length; i++) {
      let arrOpr = trnsOprtns[i].split(/[(),]/g).filter(v => {
        return v !== "";
      });
      switch (arrOpr[0]) {
        case "rotate":
          matrix = this.multiply(matrix, [
            [Math.cos(degToRad(arrOpr[1])), (-1) * Math.sin(degToRad(arrOpr[1])), 0],
            [Math.sin(degToRad(arrOpr[1])), Math.cos(degToRad(arrOpr[1])), 0],
            [0, 0, 1]
          ]);
          break;
        case "scale":
          matrix = this.multiply(matrix, [
            [arrOpr[1], 0, 0],
            [0, arrOpr[1], 0],
            [0, 0, 1]
          ]);
          break;
        case "scaleX":
          matrix = this.multiply(matrix, [
            [arrOpr[1], 0, 0],
            [0, 1, 0],
            [0, 0, 1]
          ]);
          break;
        case "scaleY":
          matrix = this.multiply(matrix, [
            [1, 0, 0],
            [0, arrOpr[1], 0],
            [0, 0, 1]
          ]);
          break;
        case "translate":
          matrix = this.multiply(matrix, [
            [1, 0, arrOpr[1]],
            [0, 1, arrOpr[2]],
            [0, 0, 1]
          ]);
          break;
        case "translateX":
          matrix = this.multiply(matrix, [
            [1, 0, arrOpr[1]],
            [0, 1, 0],
            [0, 0, 1]
          ]);
          break;
        case "translateY":
          matrix = this.multiply(matrix, [
            [1, 0, 0],
            [0, 1, arrOpr[1]],
            [0, 0, 1]
          ]);
          break;
        case "skew":
          var angle =
            matrix = this.multiply(matrix, [
              [1, Math.tan(degToRad(arrOpr[1])), 0],
              [Math.tan(degToRad(arrOpr[2])), 1, 0],
              [0, 0, 1]
            ]);
          break;
        case "skewX":
          matrix = this.multiply(matrix, [
            [1, Math.tan(degToRad(arrOpr[1])), 0],
            [0, 1, 0],
            [0, 0, 1]
          ]);
          break;
        case "skewY":
          matrix = this.multiply(matrix, [
            [1, 0, 0],
            [Math.tan(degToRad(arrOpr[1])), 1, 0],
            [0, 0, 1]
          ]);
          break;
      }
    }
    return `matrix(${[matrix[0][0],matrix[1][0], matrix[0][1], matrix[1][1], matrix[0][2], matrix[1][2]].join()})`;
  }

  convertTransformMatrix(strMatrix) {
    let arr = strMatrix.replace(/[matrix\(\) ]/g, "").split(",");
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

  getElementTransformation(element) {
    if (element) {
      let computedStyle = window.getComputedStyle(element);
      return this.convertTransformMatrix(computedStyle.transform);
    }
    return null;

  }

  setElementTransformation(element, strTrns) {
    if (element) {
      element.style["-webkit-transform"] = strTrns;
      element.style["-moz-transform"] = strTrns;
      element.style["-ms-transform"] = strTrns;
      element.style["-o-transform"] = strTrns;
      element.style["transform"] = strTrns;
    }
  }

  degToRad(x) {
    return Number(x) * Math.PI / 180;
  }

  multiply(a, b) {
    let aNumRows = a.length;
    let aNumCols = a[0].length;
    let bNumRows = b.length;
    let bNumCols = b[0].length;
    let m = new Array(aNumRows);
    for (let r = 0; r < aNumRows; ++r) {
      m[r] = new Array(bNumCols);
      for (let c = 0; c < bNumCols; ++c) {
        m[r][c] = 0;
        for (let i = 0; i < aNumCols; ++i) {
          m[r][c] += a[r][i] * b[i][c];
        }
      }
    }
    return m;
  }


}

export default new Transformer();