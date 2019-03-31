"use strict";

/**
 * pathAnimator.js
 * @createdOn: 31-Mar-2019
 * @author: SmartChartsNXT
 * @description: Animate a path by shape morphing technique. 
 */

import PathSegList from "./../../shims/pathSegmentList";

(function() { 
  if (!("animate" in window.SVGPathElement)) {
    window.SVGPathElement.prototype.animate = function(duration, fromPath, easing, callback) {
      console.log('start of animation');
      let fromPathPoints = fromPath.pathSegList;
      let toPathPoints = this.pathSegList;
      let diffPoints = getPathDiff(fromPathPoints, toPathPoints);

      letsAnimate(duration, (pos) => { 
        morphPath(fromPath, this, diffPoints, pos);
      }, callback);
    };

    
  
    function letsAnimate(duration, morphFunc, doneCallback) {
      let animTime = 0, position = 0,
      startTime = performance.now();
  
      function frame(time) {
        animTime = time - startTime;
        // Are we done?
        if (animTime >= duration) {
          // last rendered value wasn't final position, set it here.
          morphFunc(1);
          doneCallback();
        } else {
  
          // What position should the animation be in?
          position = (animTime / duration).toPrecision(3);
  
          morphFunc(position);
  
          // Request the next frame
          requestAnimationFrame(frame);
        }
      }
      // reqest the first frame
      requestAnimationFrame(frame);
    }
  
    function getPathDiff(fromPathPoints, toPathPoints) {
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
  
    function morphPath(fromPath, toPath, diffObj, multiplier) {
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
  
  }
})();

