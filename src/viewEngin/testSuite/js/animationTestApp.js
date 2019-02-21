
"use strict";

import { Component } from "../../pview";
import Button from "./button"; 
import TextBox from "./textBox";
import TransitionGroup from "../../transitionGroup"; 
import Style from "../../style"; 

class AnimationTestApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      boxCount: 1,
      boxPosX: 100,
      pBoxPosX: 50,
      boxPosY: 250,
      applyForNew: false,
      showBox: true
    };
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
            <Button instanceId='plusBtn' posx='100' posy='150' width='100' height='40' bgColor='#28a745' borderColor='#1e7e34' borderRadius='5'
              onClick= { (e) => { this.setState({boxCount: this.state.boxCount + 1, applyForNew: true});}} >
              <text x="35" y="35" fill="#fff" font-size="50" font-weight="bold"> + </text>
            </Button>

            <Button instanceId='resetBtn' posx='210' posy='150' width='100' height='40' bgColor='#e0a800' borderColor='#d39e00' borderRadius='5'
              onClick= { (e) => { this.setState({boxCount: 0, applyForNew: true});}} >
              <text x="23" y="37" fill="#fff" font-size="50" font-weight="bold">{"<>"}</text>
            </Button>

            <Button instanceId='minusBtn' posx='320' posy='150' width='100' height='40' bgColor='#c82333' borderColor='#bd2130' borderRadius='5'
              onClick= { (e) => { this.state.boxCount > 0 && this.setState({boxCount: this.state.boxCount - 1, applyForNew: true});}} >
              <text x="40" y="32" fill="#fff" font-size="50" font-weight="bold">-</text>
            </Button>

            <Button instanceId='posXBtn' posx='430' posy='150' width='100' height='40' bgColor='#7d5eb3' borderColor='#6312f1' borderRadius='5'
              onClick= { (e) => { this.state.boxCount > 0 && this.setState({pBoxPosX:this.state.boxPosX, boxPosX: this.state.boxPosX + 50, applyForNew: false});}}>
              <text x="0" y="35" fill="#fff" font-size="45" font-weight="bold">{"X+10"}</text>
            </Button>

             <Button instanceId='posXBtn' posx='540' posy='150' width='100' height='40' bgColor='#33deb3' borderColor='#33deb3' borderRadius='5'
              onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} >
              <text x="35" y="30" fill="#fff" font-size="35" font-weight="bold">(.)</text>
            </Button> 

            <TransitionGroup transitionName='box-effect' 
              transitionEnterDelay='1000' transitionExitDelay='500' applyForNew={this.state.applyForNew}>
              {this.state.showBox && this.getBoxes()}
            </TransitionGroup>
            
          </g>
        </svg>
    );
  }

  onMouseEnter = (e) => {this.setState({showBox: true});}
  onMouseLeave = (e) => {this.setState({showBox: false});}

  getRects = () => {
    let arrRects = [];
    for(let i = 0; i < this.state.boxCount; i++) {
      arrRects.push(
        <rect class={'tbx-' + i} instanceId={'tbx-' + i} width={100} height={50} stroke='#000' fill='gray' transform={`translate(${this.state.boxPosX + (i * 110)}, ${this.state.boxPosY})`} />
      );
    }
    return arrRects;
  }

  getBoxes = () => {
    let arrBoxes = []; 
    for(let i = 0; i < this.state.boxCount; i++) {
      arrBoxes.push(
        <g class={'tbx-' + i} instanceId={'tbx-' + i} transform={`translate(${this.state.boxPosX + (i * 110)}, ${this.state.boxPosY})`} >
          <Style> 
            {{
              ['.tbx-' + i +".box-effect-enter"]: {
                opacity: "0.1",
                transform: `translate(${this.state.pBoxPosX + (i * 110)}px, ${this.state.boxPosY}px)`
              },
              ['.tbx-' + i +".box-effect-enter.box-effect-enter-active"]: {
                opacity: "1",
                transform: `translate(${this.state.boxPosX + (i * 110)}px, ${this.state.boxPosY}px)`,
                transition: "all 1s ease-in-out"
              },
              ['.tbx-' + i +".box-effect-exit"]: {
                opacity: "1"
              },
              ['.tbx-' + i +".box-effect-exit.box-effect-exit-active"] : {
                opacity: "0.1",
                transition: "opacity 0.5s ease-in-out"
              }
            }}
          </Style>
          
          <TextBox posx='0' posy='0' width='100' height='100' bgColor='#eee' borderColor='#999' borderRadius='5'>
            {"container " + (i + 1)}
          </TextBox>
        </g>
      );
    }
    return arrBoxes;
  }

}

export default AnimationTestApp;