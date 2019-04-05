
"use strict";

import { Component } from "./../../pview";
import Button from "./button";
import Style from "./../../style";
import Morphing from "./../../../plugIns/morph";
import Easing from "./../../../plugIns/easing";

class MorphingTestApp extends Component {
  constructor(props) {
    super(props);
    this.state = { };
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
            <Button instanceId='startBtn' posx={100} posy={150} width={100} height='40' bgColor='#28a745' borderColor='none' borderRadius='5' hoverColor='#009688'
              onClick= { (e) => { this.startAnimation(); }} >
              <text x="50" y="25" fill="#fff" font-size="20" ><tspan text-anchor="middle">Start</tspan></text>
            </Button>
            <Button instanceId='startBtn' posx={220} posy={150} width={100} height='40' bgColor='#E91E63' borderColor='none' borderRadius='5' hoverColor='#b50440'
              onClick= { (e) => { this.stopAnimation(); }} >
              <text x="50" y="25" fill="#fff" font-size="20" ><tspan text-anchor="middle">Stop</tspan></text>
            </Button>
            <g transform={`translate(50,300)`}>
              {/* <path class="" id="play" d="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28" /> */}
              {/* <path class="" stroke="blue" fill="blue" id="play" d="M 5 184.184 L 138.37024026608728 179.998 L 271.74048053217456 180.089 L 405.1107207982618 179.907 L 538.4809610643491 183.729 L 671.8512013304364 178.451 L 671.8512013304364 182 Z" stroke-width="1" style="stroke-opacity: 1;" fill-opacity="0.3"></path> */}
            </g>
            <g transform={`translate(50,120)`}>
              <path id="from-path" stroke="goldenrod" fill="goldenrod" d={`
                M 5 91 
                C 45 195 86 300 127 273 
                C 167 245 208 85 249 91 
                C 290 96 330 267 371 273 
                C 412 278 453 118 493 91 
                C 534 63 575 168 616 273 
                Z`
                } stroke-width="2" opacity="0.3"></path>
            </g>
            
          </g>
        </svg>
    );
  }

  startAnimation() {
    let path = this.ref.node.getElementById('from-path');
    let anim1 = () => {
      path.setAttribute("d",
        `M 5 91 
        L 72 273 
        L 140 91 
        L 208 273 
        L 276 91 
        L 344 273 
        L 344 182 
        Z`);
      let mTo = path.morphFrom(2000, 
        `M 5 184 
        L 138 179 
        L 271 180 
        L 405 179 
        L 538 183 
        L 671 178 
        L 671 182 
        Z`, undefined, anim2);
        this.state.anim1 = mTo; 
    };
    let anim2 = () => {
      path.setAttribute("d", 
        `M 5 184 
        L 138 179 
        L 271 180 
        L 405 179 
        L 538 183 
        L 671 178 
        L 671 182 
        Z`);
      let mTo = path.morphFrom(2000, 
        `M 5 91 
        L 72 273 
        L 140 91 
        L 208 273 
        L 276 91 
        L 344 273 
        L 344 182 
        Z`, undefined, anim1);
        this.state.anim2 = mTo; 
    };

    let anim3 = () => {
      let mTo = path.morphTo(2000,
        `
        M 5 179.725 
        C 45 17 86 175 127 174 
        C 167 174 208 175 249 183 
        C 290 192 330 209 371 182 
        C 412 154 453 84 493 70 
        C 534 57 575 101 616 145 
        L 616 182 
        L 5 182 
        Z`
        , Easing.easeOutElastic, anim4);
        this.state.anim3 = mTo; 
    };
    let anim4 = () => {
      let mTo = path.morphTo(2000, `
      M 5 91 
      C 45 195 86 300 127 273 
      C 167 245 208 85 249 91 
      C 290 96 330 267 371 273 
      C 412 278 453 118 493 91 
      C 534 63 575 168 616 273 
      Z`, Easing.easeOutElastic, anim3);
      this.state.anim4 = mTo;
    };

    anim3(); 
  }

  stopAnimation() {
    for(let key in this.state) {
      if(this.state[key] && typeof this.state[key].stop == 'function') {
        this.state[key].stop();
      }
    }
  }

  done() {
    console.log('Animation Done'); 
  }

  
}

export default MorphingTestApp;