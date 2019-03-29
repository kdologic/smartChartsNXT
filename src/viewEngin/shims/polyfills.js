"use strict";

/**
 * polyfills.js
 * @createdOn: 08-Aug-2017
 * @author: SmartChartsNXT
 * @description: Apply polyfills for older browsers and unsupported methods.
 */

import PathDataPolyfill from "./path-data-polyfill"; 
import PathSegList from "./pathSegmentList";

class Polyfills {
  constructor() {
    this.performanceNowSHIM();
    this.requestAnimFrameSHIM();
    this.requestNextAnimationFrameSHIM();
    this.supportEventLisenerList();
  }

  /*window.performance.now() SHIM for all browser*/
  performanceNowSHIM() {
    window.performance = window.performance ? window.performance : {};
    window.performance.now = window.performance.now || window.performance.webkitNow || window.performance.msNow || window.performance.mozNow || Date.now;
    window.perfNow = window.now = window.performance.now.bind(performance);
    // warm up the function, fooling the interpreter not to skip;
    let a = now();
    a += now();
    return a;
  }

  /*window.requestAnimationFrame() SHIM for all browser*/
  requestAnimFrameSHIM() {
    let lastTime = 0;
    let vendors = ['webkit', 'moz'];
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame =
        window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback, element) {
        let currTime = new Date().getTime();
        let timeToCall = Math.max(0, 16 - (currTime - lastTime));
        let id = window.setTimeout(function () {
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

  /*requestNextAnimationFrame from: https://gist.github.com/getify/3004342 */
  requestNextAnimationFrameSHIM() {
    let ids = {};

    function requestId() {
      let id;
      do {
        id = Math.floor(Math.random() * 1E9);
      } while (id in ids);
      return id;
    }

    if (!window.requestNextAnimationFrame) {
      window.requestNextAnimationFrame = function (callback, element) {
        let id = requestId();

        ids[id] = requestAnimationFrame(function () {
          ids[id] = requestAnimationFrame(function (ts) {
            delete ids[id];
            callback(ts);
          }, element);
        }, element);

        return id;
      };
    }

    if (!window.cancelNextAnimationFrame) {
      window.cancelNextAnimationFrame = function (id) {
        if (ids[id]) {
          cancelAnimationFrame(ids[id]);
          delete ids[id];
        }
      };
    }
  }

  /**
   * Maintain a list of event listener that attached with each node. 
   * So that we can remove all listener handler before removing the node 
   * to avoid possible momory leak. 
   */
  supportEventLisenerList() {
    Element.prototype._addEventListener = function (eventName, handle, useCapture) {
      if (useCapture == undefined) {
        useCapture = false;
      }
      this.addEventListener(eventName, handle, useCapture);
      if (!this.eventListenerList) {
        this.eventListenerList = {};
      }
      if (!this.eventListenerList[eventName]) {
        this.eventListenerList[eventName] = [];
      }
      this.eventListenerList[eventName].push({
        listener: handle,
        useCapture: useCapture
      });
    };

    Element.prototype._getEventListeners = function (eventName) {
      if (!this.eventListenerList) {
        this.eventListenerList = {};
      }
      if (eventName == undefined) {
        return this.eventListenerList;
      }
      return this.eventListenerList[eventName];
    };

    Element.prototype._clearEventListeners = function (eventName) {
      if (!this.eventListenerList) {
        this.eventListenerList = {};
      }
      if (eventName == undefined) {
        for (let e in (this._getEventListeners())) {
          this._clearEventListeners(e);
        }
        return;
      }
      let el = this._getEventListeners(eventName);
      if (el == undefined) {
        return;
      }
      for (let i = el.length - 1; i >= 0; --i) {
        let ev = el[i];
        this.removeEventListener(eventName, ev.listener, ev.useCapture);
      }
    };
  }
}

export default new Polyfills();