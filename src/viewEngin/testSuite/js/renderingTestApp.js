
"use strict";

/**renderingTestApp.js */

import { Component } from "./../../pview";
import Button from "./button"; 
import TextBox from "./textBox";

class RenderingTestApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      boxCount: 5,
      boxPosX: 0,
      pBoxPosX: 50,
      boxPosY: 250
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
              onClick= { (e) => { this.setState({boxCount: this.state.boxCount + 1});}} >
              <text x="35" y="35" fill="#fff" font-size="50" font-weight="bold"> + </text>
            </Button>

            <Button instanceId='resetBtn' posx='210' posy='150' width='100' height='40' bgColor='#e0a800' borderColor='#d39e00' borderRadius='5'
              onClick= { (e) => { this.setState({boxCount: 0});}} >
              <text x="23" y="37" fill="#fff" font-size="50" font-weight="bold">{"<>"}</text>
            </Button>

            <Button instanceId='minusBtn' posx='320' posy='150' width='100' height='40' bgColor='#c82333' borderColor='#bd2130' borderRadius='5'
              onClick= { (e) => { this.state.boxCount > 0 && this.setState({boxCount: this.state.boxCount - 1});}} >
              <text x="40" y="32" fill="#fff" font-size="50" font-weight="bold">-</text>
            </Button>
            
            {this.getBoxes()}
          </g>
        </svg>
    );
  }

  getBoxes = () => {
    let arrBoxes = []; 
    for(let i = 0; i < this.state.boxCount; i++) {
      arrBoxes.push(
        <g class={'tbx-' + i} instanceId={'tbx-' + i} >
          <TextBox posx={i*120} posy={this.state.boxPosY} width='100' height='100' bgColor='#eee' borderColor='#999' borderRadius='5'>
            {"container " + (i + 1)}
          </TextBox>
        </g>
      );
    }
    return arrBoxes;
  }

}

export default RenderingTestApp;