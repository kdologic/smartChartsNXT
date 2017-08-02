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

    /*
    * @param {Array of String} trnsOprtns - Array of transformation operations like ["scaleX(1.5)","skewY(0.5)","translateY(200)"]
    * @return {Array of Numbers} 
    */
    getTransformMatrix(trnsOprtns) {
        let self = this; 
        let matrix = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
        for (let i = 0; i < trnsOprtns.length; i++) {
            let arrOpr = trnsOprtns[i].split(/[(),]/g).filter(v => {
                return v !== "";
            });
            switch (arrOpr[0]) {
                case "rotate":
                    matrix = self.multiply(matrix, [
                        [Math.cos(self.degToRad(arrOpr[1])), (-1) * Math.sin(self.degToRad(arrOpr[1])), 0],
                        [Math.sin(self.degToRad(arrOpr[1])), Math.cos(self.degToRad(arrOpr[1])), 0],
                        [0, 0, 1]
                    ]);
                    break;
                case "scale":
                    matrix = self.multiply(matrix, [
                        [arrOpr[1], 0, 0],
                        [0, arrOpr[1], 0],
                        [0, 0, 1]
                    ]);
                    break;
                case "scaleX":
                    matrix = self.multiply(matrix, [
                        [arrOpr[1], 0, 0],
                        [0, 1, 0],
                        [0, 0, 1]
                    ]);
                    break;
                case "scaleY":
                    matrix = self.multiply(matrix, [
                        [1, 0, 0],
                        [0, arrOpr[1], 0],
                        [0, 0, 1]
                    ]);
                    break;
                case "translate":
                    matrix = self.multiply(matrix, [
                        [1, 0, arrOpr[1]],
                        [0, 1, arrOpr[2]],
                        [0, 0, 1]
                    ]);
                    break;
                case "translateX":
                    matrix = self.multiply(matrix, [
                        [1, 0, arrOpr[1]],
                        [0, 1, 0],
                        [0, 0, 1]
                    ]);
                    break;
                case "translateY":
                    matrix = self.multiply(matrix, [
                        [1, 0, 0],
                        [0, 1, arrOpr[1]],
                        [0, 0, 1]
                    ]);
                    break;
                case "skew":
                    var angle =
                        matrix = self.multiply(matrix, [
                            [1, Math.tan(self.degToRad(arrOpr[1])), 0],
                            [Math.tan(self.degToRad(arrOpr[2])), 1, 0],
                            [0, 0, 1]
                        ]);
                    break;
                case "skewX":
                    matrix = self.multiply(matrix, [
                        [1, Math.tan(self.degToRad(arrOpr[1])), 0],
                        [0, 1, 0],
                        [0, 0, 1]
                    ]);
                    break;
                case "skewY":
                    matrix = self.multiply(matrix, [
                        [1, 0, 0],
                        [Math.tan(self.degToRad(arrOpr[1])), 1, 0],
                        [0, 0, 1]
                    ]);
                    break;
            }
        }
        return `matrix(${[matrix[0][0],matrix[1][0], matrix[0][1], matrix[1][1], matrix[0][2], matrix[1][2]].join()})`;
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

module.exports = new Transformer();