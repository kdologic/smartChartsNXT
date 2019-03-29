
"use strict";

import { Component } from "./../../pview";
import Button from "./button";
import Style from "./../../style";

class MorphingTestApp extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <svg xmlns='http://www.w3.org/2000/svg'
        version={1.1}
        width={this.props.width}
        height={this.props.height}
        id="svgContainer"
        style={{ background: 'none', MozTapHighlightColor: 'rgba(0, 0, 0, 0)', WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)', WebkitUserSelect: 'none', HtmlUserSelect: 'none', MozUserSelect: 'none',MsUserSelect: 'none', OUserSelect: 'none', UserSelect: 'none'
        }} >
          <g>
            <Style>
            {{
              ".hide": {
                "display": "none"
              }
            }}
            </Style>
            <Button instanceId='startBtn' posx={100} posy={150} width={100} height='40' bgColor='#28a745' borderColor='#1e7e34' borderRadius='5'
              onClick= { (e) => { this.startAnimation(); }} >
              <text x="35" y="35" fill="#fff" font-size="50" font-weight="bold"> + </text>
            </Button>
            <g transform={`translate(200,300)`}>
              <path class="hide" id="play" d="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28" />
      
              <path class="hide" id="pause" d="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26" />
            </g>
            
          </g>
        </svg>
    );
  }

  startAnimation() {
    let paths = this.ref.node.getElementsByTagName('path'), 
        fromPathPoints = paths[0].pathSegList, 
        toPathPoints = paths[1].pathSegList,
        diffPoints = this.getPathDiff(fromPathPoints, toPathPoints);
    console.log('fromPathPoints', fromPathPoints, 'toPathPoints', toPathPoints);
    console.log('diffPoints', diffPoints);
    paths[0].setAttribute('class','');
    this.letsAnimate(2000, (pos) => { 
      this.morphPath(paths[0], paths[1], diffPoints, pos);
    }, this.done);


  }

  done() {
    console.log('Animation Done'); 
  }

  letsAnimate(duration, morphFunc, doneCallback) {
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

        //console.log(position)
        morphFunc(position);

        // Request the next frame
        requestAnimationFrame(frame);
      }
    }
    // reqest the first frame
    requestAnimationFrame(frame);
  }

  getPathDiff(fromPathPoints, toPathPoints) {
    let diffPoints = [], 
        numPoints = fromPathPoints.numberOfItems;

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

  morphPath(fromPath, toPath, diffObj, multiplier) {
    let sourcePathPoints = fromPath.pathSegList,
        destPathPoints = toPath.pathSegList,
        numPoints = sourcePathPoints.numberOfItems;
debugger;
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

export default MorphingTestApp;