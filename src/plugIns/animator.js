/*
 * animator.js
 * @CreatedOn: 31-July-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:Support of different animation type. 
 */


"use strict";

let transformer = require("./../core/transformer");

class Animator {
    constructor() {}

    /*
     *  createBounce Function for bouncy effect.
     *  @param {Object} element - The target element where bounce apply.
     *  @param {Number} dropHeight - height where it starts to fallen.
     *  @param {Number} slope - Is the angle in which object moves.
     *  @param {Function} callBack - Function call after completing animation. 
     */
    createBounce(element, dropHeight, slope, preShift, callBack) {
        let self = this;
        let feet = 1152;
        let u = 0;
        let f = (1 * feet);
        let t = 0;

        if (preShift) {
            let trnsOprns = [`translateY(${(-1)*dropHeight})`];
            if (slope) {
                trnsOprns.unshift(`rotate(${slope})`);
                trnsOprns.push(`rotate(${(-1)*slope})`);
            }
            element.style.transform = transformer.getTransformMatrix(trnsOprns);
        }

        /*
         *  bounce Function for creating bounce effect of an element. 
         *  @param {Object} elem
         *  @param {Number} dropHeight -height where it starts to fallen.
         *  @param {Number} u -is the initial velocity. 
         *  @param {Number} f -is the acceleration = feet/squire(s) default:1152 [1 feet ~ 1152 pixel].
         *  @param {Number} t -is the time taken.
         *  @param {Boolean} isInitial -true for initial and false for call.
         *  @param {Number} baseHeight -is the initial height. 
         *  @return {void}
         */
        (function bounce(elem, dropHeight, u, f, t, isInitial, baseHeight) {
            let intervalMS = 40;
            let dist = 0;
            let v = 0;
            let cor = 0.7; //Coefficient of restitution 0 >= cor <= 1()
            let shiftY = baseHeight - dropHeight;
            baseHeight = baseHeight || dropHeight;
            let intervalId = setInterval(function () {
                dist = (u * t) + ((0.5) * (f * t * t)); // d = u*t + a*squire(t)/2
                dist = dist > dropHeight ? dropHeight : dist;
                dist = dist < 0 ? -0.0001 : dist;
                let height = dist;
                if (!isInitial) {
                    height = dropHeight - dist;
                } else {
                    shiftY = 0;
                }

                t += (intervalMS / 1000);

                if (dist >= dropHeight || dist < 0) {
                    clearInterval(intervalId);
                    let fVelocity = Math.sqrt(2 * Math.abs(f) * Math.abs(dropHeight));
                    let vi = cor * fVelocity;
                    let h1 = Math.abs((vi * vi) / (2 * f));

                    //console.log("dist:", dist, "fVelocity:", fVelocity);
                    //console.log("vi:", vi, "h1:", h1, "isInitial:", isInitial,"force:", f);

                    if (Math.round(dropHeight) !== 0) {
                        bounce(elem, h1, vi, (-1) * Math.abs(f), 0, false, baseHeight);
                    }
                }

                //console.log("dist:", dist, "height:", height, "dropHeight", dropHeight, "baseHeight", baseHeight);
                let trnsOprns = [`translateY(${shiftY})`, `translateY(${height})`];
                if (slope) {
                    trnsOprns.unshift(`rotate(${slope})`);
                    trnsOprns.push(`rotate(${(-1)*slope})`);
                }

                //console.log(trnsOprns);
                elem.style.transform = transformer.getTransformMatrix(trnsOprns);

            }, intervalMS);
        })(element, dropHeight, u, f, t, true);
    }

}

module.exports = new Animator();