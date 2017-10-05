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
     *  @param {Number} options.dropHeight - height where it starts to fallen.
     *  @param {Number} options.slope - Is the angle in which object moves.
     *  @param {Array} options.preTransform - is array of transformation apply before animation.
     *  @param {Array} options.postTransform - is array of transformation apply after animation.
     *  @param {Function} callBack - Function call after completing animation. 
     */
    createBounce(element, options, callBack) {
        let feet = 1152;
        let velocity = 0; //velocity -is the initial velocity. 
        let acceleration = (1 * feet); //acceleraion -is the acceleration = feet/squire(s) default:1152 [1 feet ~ 1152 pixel].
        let time = 0; //time -is the time taken.
        let isInitial = true; //isInitial -true for initial and false for call.
        let dropHeight = options.dropHeight || 0;
        let slope = options.slope || 0;
        let baseHeight = dropHeight; //baseHeight -is the initial height. 
        let dist = 0;
        let cor = 0.7; //Coefficient of restitution 0 >= cor <= 1()
        let shiftY = baseHeight - dropHeight;

        let baseTransformMatrix = transformer.getElementTransformation(element);

        let timenow = window.performance.now ?
            (performance.now() + performance.timing.navigationStart) : Date.now();
        window.requestAnimationFrame((timestamp) => {
            let starttime = window.performance.now ?
                (performance.now() + performance.timing.navigationStart) : Date.now();
            moveIt(starttime - timenow);
        });

        function moveIt(intervalMS) {
            dist = (velocity * time) + ((0.5) * (acceleration * time * time)); // d = u*t + a*squire(t)/2
            dist = dist > dropHeight ? dropHeight : dist;
            dist = dist < 0 ? -0.0001 : dist;
            let height = dist;
            if (!isInitial) {
                height = dropHeight - dist;
            } else {
                shiftY = 0;
            }

            time += (intervalMS / 1000);

            let trnsOprns = [];
            if (options.preTransform && options.preTransform instanceof Array) {
                trnsOprns.push.apply(trnsOprns, options.preTransform);
            }
            trnsOprns.push.apply(trnsOprns, [`translateY(${shiftY})`, `translateY(${height})`]);
            if (slope) {
                trnsOprns.unshift(`rotate(${slope})`);
                trnsOprns.push(`rotate(${(-1)*slope})`);
            }

            transformer.setElementTransformation(element, transformer.getTransformMatrix(trnsOprns, baseTransformMatrix));

            if (dist >= dropHeight || dist < 0) {
                let fVelocity = Math.sqrt(2 * Math.abs(acceleration) * Math.abs(dropHeight));
                let vi = cor * fVelocity;
                let h1 = Math.abs((vi * vi) / (2 * acceleration));

                if (Math.round(dropHeight) === 0) {
                    if (typeof callBack === "function") {
                        callBack.call(this);
                    }
                    return;
                } else {
                    dist = 0;
                    acceleration = (-1) * Math.abs(acceleration);
                    time = 0;
                    isInitial = false;
                    dropHeight = h1;
                    velocity = vi;
                    shiftY = baseHeight - dropHeight;
                }
            }

            let timenow = window.performance.now ?
                (performance.now() + performance.timing.navigationStart) : Date.now();
            window.requestAnimationFrame((timestamp) => {
                let starttime = window.performance.now ?
                    (performance.now() + performance.timing.navigationStart) : Date.now();
                moveIt(starttime - timenow);
            });

        } /*End of moveIt()*/

    }

    /*
     *  Simple harmonic oscillator
     *  @param {Object} element - The target element where harmonic oscillator apply.
     *  @param {Number} options.elasticity - Elasticity factor of element how it stress
     *  @param {Number} options.baseWidth - It is the width of the element.
     *  @param {Number} options.baseHeight - It is the height of the element.
     *  @param {Number} options.amplitude - Maximum displacement.
     *  @param {Array} options.preTransform - Is array of transformation apply before animation.
     *  @param {Array} options.postTransform - Is array of transformation apply after animation.
     *  @param {Function} callBack - Function call after completing animation. 
     */
    createElastic(element, options, callBack) {
        let distTravelled = 1000;
        let frequency = 1;
        let period = 1 / frequency;
        let time = 0;
        let amp = options.amplitude || 50;
        let kFactor = options.elasticity || 0.99;

        let baseTransformMatrix = transformer.getElementTransformation(element);

        let timenow = window.performance.now ?
            (performance.now() + performance.timing.navigationStart) : Date.now();
        window.requestAnimationFrame((timestamp) => {
            let starttime = window.performance.now ?
                (performance.now() + performance.timing.navigationStart) : Date.now();
            moveIt(starttime - timenow);
        });

        function moveIt(intervalMS) {
            let omega = (2 * Math.PI * frequency);
            let displacement = amp * Math.cos(omega * (time / 1000));
            let modDim, scale, trnsOprns = [];

            switch (options.impactOn) {
                case "top":
                    modDim = options.baseHeight + displacement;
                    scale = options.baseHeight / modDim;
                    trnsOprns.push.apply(trnsOprns, [`scaleY(${scale})`]);//, `translateY(${((displacement*scale)/2)})`
                    break;
                case "bottom":
                    modDim = options.baseHeight + displacement;
                    scale = options.baseHeight / modDim;
                    trnsOprns.push.apply(trnsOprns, [`scaleY(${scale})`, `translateY(${-(displacement/2)})`]);
                    break;
                case "left":
                    modDim = options.baseWidth + displacement;
                    scale = options.baseWidth / modDim;
                    trnsOprns.push.apply(trnsOprns, [`scaleX(${scale})`, `translateX(${(displacement/2)})`]);
                    break;
                case "right":
                    modDim = options.baseWidth + displacement;
                    scale = options.baseWidth / modDim;
                    trnsOprns.push.apply(trnsOprns, [`scaleX(${scale})`, `translateX(${-(displacement/2)})`]);
                    break;
                case "all":
                default:
                    trnsOprns.push.apply(trnsOprns, [`translateY(${(displacement)})`]);
                    break;
            }

            console.log((displacement/scale)/2, "displacement", displacement, "scale", scale, "ModDim", modDim, "baseHeight", options.baseHeight);
            

            time += intervalMS;
            amp *= kFactor;

            if (Math.round(amp) === 0) {
                if (typeof callBack === "function") {
                    callBack.call(this);
                }
                return;
            }


            if (options.preTransform && options.preTransform instanceof Array) {
                trnsOprns.unshift.apply(trnsOprns, options.preTransform);
            }

            transformer.setElementTransformation(element, transformer.getTransformMatrix(trnsOprns, baseTransformMatrix));
            //debugger;
            return;
            let timenow = window.performance.now ?
                (performance.now() + performance.timing.navigationStart) : Date.now();
            window.requestAnimationFrame((timestamp) => {
                let starttime = window.performance.now ?
                    (performance.now() + performance.timing.navigationStart) : Date.now();
                moveIt(starttime - timenow);
            });

        } /*End of moveIt()*/

    }
}

module.exports = new Animator();