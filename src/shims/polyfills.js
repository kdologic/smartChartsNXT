/*
 * polyfills.js
 * @CreatedOn: 08-August-2017
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @description:Apply polyfills for older browsers 
 */


"use strict";

class Polyfills {
    constructor() {
        this.performanceNowSHIM(); 
        this.requestAnimFrameSHIM();
    }

    /*window.performance.now() SHIM for all browser*/
    performanceNowSHIM() {
        window.performance = window.performance ? window.performance : {};
        window.performance.now = window.performance.now || window.performance.webkitNow || window.performance.msNow || window.performance.mozNow || Date.now;
        window.perfNow = window.now = window.performance.now.bind(performance);
        // warm up the function, fooling the interpreter not to skip;
        var a = now();
        a += now();
        return a;
    }

    /*window.requestAnimationFrame() SHIM for all browser*/
    requestAnimFrameSHIM() {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame =
                window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }
}

module.exports = new Polyfills();