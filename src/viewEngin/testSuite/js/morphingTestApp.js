
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
              {/* <path class="" id="play" d="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28" /> */}
              <path class="" id="play" d="M11,20 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28" />
            </g>
            <g transform={`translate(200,400)`}>
              <path class="" id="pause" d="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26" />
            </g>
            
          </g>
        </svg>
    );
  }

  startAnimation() {
    let paths = this.ref.node.getElementsByTagName('path');
    paths[0].setAttribute('class','');
    paths[1].animate(1000, paths[0], undefined, this.done);
  }

  done() {
    console.log('Animation Done'); 
  }

  
}

export default MorphingTestApp;