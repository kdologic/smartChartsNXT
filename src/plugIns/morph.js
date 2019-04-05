"use strict";

/**
 * morph.js
 * @createdOn: 31-Mar-2019
 * @author: SmartChartsNXT
 * @description: Animate a path by shape morphing technique. 
 * 
 * Note : 
 * It can automatically add the missing points if two paths have unequal number of points. 
 * Corresponding command character must be match for both path. (i.e. 'C' can't be morph into 'L' etc.) 
 */

import PathSegList from "../viewEngin/shims/pathSegmentList";
import Easing from "./easing"; 

(function() { 

  /**
   * A morphing function that morph a path element from a defferent shape. 
   * @param {number} duration A string or number determining how long the morphing will run. default: 400 ms.
   * @param {string} fromPath A string value represent the path d attribute, that will be morphing from it. 
   * @param {function} easing A function that calculate the easing value between [0 <==> 1] indicating which easing function to use for the transition.
   * @param {function} callback A function to call once the morphing is complete, called once per matched element.
   */
  window.SVGPathElement.prototype.morphFrom = function(duration=400, fromPath, easing, callback) {
    fromPath = _createPathElement(fromPath);
    let fromPathPoints = fromPath.pathSegList;
    let toPathPoints = this.pathSegList;
    let toPathClone = this.cloneNode(); 

    _equalizePaths(fromPathPoints, toPathPoints);
    let diffPoints = _getPathDiff(fromPathPoints, toPathPoints);
    if(typeof easing !== 'function') {
      easing = Easing.easeInQuad;
    }
    if (_validateMorphing(fromPathPoints, toPathPoints)) {
      this.frameId = _letsAnimate(duration, easing, (pos) => {
        _morphPathFrom(fromPath, this, diffPoints, pos);
      }, callback);
    }else {
      console.debug('%cMorphing fails : %cPath sequence mis-match !!', 'color:#ff5722', 'color:#ffc107');
      this.setAttribute('d', toPathClone.getAttribute('d'));
    }

    return {
      stop: () => {
        cancelAnimationFrame(this.frameId.id);
      }
    };
  };

  /**
   * A morphing function that morph a path element into a defferent shape. 
   * @param {number} duration A string or number determining how long the morphing will run. default: 400 ms.
   * @param {string} toPath A string value represent the path d attribute, that will be morphing into it. 
   * @param {function} easing A function that calculate the easing value between [0 <==> 1] indicating which easing function to use for the transition.
   * @param {function} callback A function to call once the morphing is complete, called once per matched element.
   */
  window.SVGPathElement.prototype.morphTo = function (duration=400, toPath, easing, callback) {
    toPath = _createPathElement(toPath);
    let fromPathPoints = this.pathSegList;
    let toPathPoints = toPath.pathSegList;

    _equalizePaths(fromPathPoints, toPathPoints);

    let fromPathClone = this.cloneNode();
    let diffPoints = _getPathDiff(toPathPoints, fromPathPoints);
    if(typeof easing !== 'function') {
      easing = Easing.easeInQuad;
    }
    if (_validateMorphing(fromPathPoints, toPathPoints)) {
      this.frameId = _letsAnimate(duration, easing, (pos) => {
          _morphPathTo(this, toPath, fromPathClone, diffPoints, pos);
      }, callback);
    } else {
      console.debug('%cMorphing fails : %cPath sequence mis-match !!', 'color:#ff5722', 'color:#ffc107');
      this.setAttribute('d', fromPathClone.getAttribute('d'));
    }

    return {
      stop: () => {
        cancelAnimationFrame(this.frameId.id);
      }
    };
  };

  function _equalizePaths(fromPathPoints, toPathPoints) {
    if (fromPathPoints.numberOfItems === toPathPoints.numberOfItems) {
      return;
    }
    let largePath = fromPathPoints.numberOfItems > toPathPoints.numberOfItems ? fromPathPoints : toPathPoints;
    let smallPath = fromPathPoints.numberOfItems < toPathPoints.numberOfItems ? fromPathPoints : toPathPoints;
    let pointMissingCount = largePath.numberOfItems - smallPath.numberOfItems;
    let insertIndex = smallPath.numberOfItems - 1;
    for (let i = 0; i < pointMissingCount; i++, insertIndex++) {
      let missingPoint = smallPath.getItem(insertIndex - 1);
      let existPoint = largePath.getItem(insertIndex);
      if (existPoint.pathSegTypeAsLetter.toUpperCase() !== missingPoint.pathSegTypeAsLetter.toUpperCase()) {
        missingPoint = existPoint;
      }
      smallPath.insertItemBefore(missingPoint, insertIndex);
    }
  }

  function _validateMorphing(fromPathPoints, toPathPoints) {
    if (fromPathPoints.numberOfItems !== toPathPoints.numberOfItems) {
      return false;
    }
    let pointCount = Math.max(fromPathPoints.numberOfItems, toPathPoints.numberOfItems);
    for (let i = 0; i < pointCount; i++) {
      if (fromPathPoints.getItem(i).pathSegTypeAsLetter.toUpperCase() !== toPathPoints.getItem(i).pathSegTypeAsLetter.toUpperCase()) {
        return false;
      }
    }
    return true;
  }

  function _letsAnimate(duration, easing, morphFunc, doneCallback) {
    let animTime = 0, position = 0;
    let startTime = performance.now();
    let frameId = {id: null};
    

    function frame(time) {
      animTime = time - startTime;

      // Are we done?
      if (animTime >= duration) {
        // last rendered value wasn't final position, set it here.
        if(typeof morphFunc == 'function') {
          morphFunc(1);
        }
        if(typeof doneCallback == 'function') {
          doneCallback();
        }
      } else {

        // What position should the animation be in?
        position = (easing(animTime / duration)).toPrecision(3);

        if(typeof morphFunc == 'function') {
          morphFunc(position);
        }

        // Request the next frame
        frameId.id = requestAnimationFrame(frame);
      }
    }
    // reqest the first frame
    frameId.id = requestAnimationFrame(frame);
    return frameId; 
  }

  function _getPathDiff(fromPathPoints, toPathPoints) {
    let diffPoints = [];
    let numPoints = fromPathPoints.numberOfItems;

    for (let i = 0; i < numPoints; i++) {
      let point = {},
        fromPoint = fromPathPoints.getItem(i),
        toPoint = toPathPoints.getItem(i),
        typeLetter = fromPoint.pathSegTypeAsLetter,
        pointX = fromPoint.x - toPoint.x,
        pointY = fromPoint.y - toPoint.y;

      switch (typeLetter.toUpperCase()) {
        case 'V':
          point.y = pointY;
          break;
        case 'H':
          point.x = pointX;
          break;
        case 'C':
          point.x2 = fromPoint.x2 - toPoint.x2;
          point.y2 = fromPoint.y2 - toPoint.y2;
        case 'Q':
          point.x1 = fromPoint.x1 - toPoint.x1;
          point.y1 = fromPoint.y1 - toPoint.y1;
        case 'T':
        case 'M':
        case 'L':
          point.x = pointX;
          point.y = pointY;
      }
      diffPoints.push(point);
    }
    return diffPoints;
  }

  function _morphPathTo(fromPath, toPath, fromPathClone, diffObj, multiplier) {
    let sourcePathPoints = fromPath.pathSegList;
    let sourceClonedPathPoints = fromPathClone.pathSegList; 
    let destPathPoints = toPath.pathSegList;
    let numPoints = destPathPoints.numberOfItems;
    for (let k = 0; k < numPoints; k++) {
      let srcPoint = sourceClonedPathPoints.getItem(k),
        segTypeLetter = srcPoint.pathSegTypeAsLetter,
        toX = srcPoint.x + (diffObj[k].x) * multiplier,
        toY = srcPoint.y + (diffObj[k].y) * multiplier;
      switch (segTypeLetter.toUpperCase()) {
        case 'V':
          sourcePathPoints.getItem(k).y = toY;
          break;
        case 'H':
          sourcePathPoints.getItem(k).x = toX;
          break;
        case 'C': // cubic
          sourcePathPoints.getItem(k).x2 = srcPoint.x2 + (diffObj[k].x2) * multiplier;
          sourcePathPoints.getItem(k).y2 = srcPoint.y2 + (diffObj[k].y2) * multiplier;
        case 'Q': // quadratic
          sourcePathPoints.getItem(k).x1 = srcPoint.x1 + (diffObj[k].x1) * multiplier;
          sourcePathPoints.getItem(k).y1 = srcPoint.y1 + (diffObj[k].y1) * multiplier;
        case 'T':
        case 'M': // move
        case 'L': // line
          sourcePathPoints.getItem(k).x = toX;
          sourcePathPoints.getItem(k).y = toY;
      }
    }
  }

  function _morphPathFrom(fromPath, toPath, diffObj, multiplier) {
    let sourcePathPoints = fromPath.pathSegList;
    let destPathPoints = toPath.pathSegList;
    let numPoints = sourcePathPoints.numberOfItems;
    for (let k = 0; k < numPoints; k++) {
      let sourcePoint = sourcePathPoints.getItem(k),
        segTypeLetter = sourcePoint.pathSegTypeAsLetter,
        toX = sourcePoint.x - (diffObj[k].x) * multiplier,
        toY = sourcePoint.y - (diffObj[k].y) * multiplier;

      switch (segTypeLetter.toUpperCase()) { // ignore case
        case 'V':
          destPathPoints.getItem(k).y = toY;
          break;
        case 'H':
          destPathPoints.getItem(k).x = toX;
          break;
        case 'C': // cubic
          destPathPoints.getItem(k).x2 = sourcePoint.x2 - (diffObj[k].x2) * multiplier;
          destPathPoints.getItem(k).y2 = sourcePoint.y2 - (diffObj[k].y2) * multiplier;
        case 'Q': // quadratic
          destPathPoints.getItem(k).x1 = sourcePoint.x1 - (diffObj[k].x1) * multiplier;
          destPathPoints.getItem(k).y1 = sourcePoint.y1 - (diffObj[k].y1) * multiplier;
        case 'T':
        case 'M': // move
        case 'L': // line
          destPathPoints.getItem(k).x = toX;
          destPathPoints.getItem(k).y = toY;
      }
    }
  }

  function _createPathElement(pathData) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('d', pathData);
    return path;
  }
})();

