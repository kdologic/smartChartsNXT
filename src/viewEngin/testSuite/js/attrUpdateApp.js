
"use strict";

import { Component } from "./../../pview";
import Button from "./button";

class AttrUpdateApp extends Component {
  constructor(props) {
    super(props);
    this.maxLabelVal = 500; 
    this.state = {
      labelCount: 10
    };
    this.state.labels = this.getLabels();
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
            <Button instanceId='plus' posx='100' posy='100' width='100' height='40' bgColor='#28a745' borderColor='#1e7e34' borderRadius='5'
              onClick= {this.onClick.bind(this)} >
              <text x="30" y="25" fill="#fff" font-size="15" font-weight="bold" style="cursor:pointer;"> change </text>
            </Button>
            <text font-family={"late"} fill="blue" opacity={1} x={100} y={170} font-size={30} text-rendering='geometricPrecision' >
              <tspan class='header' text-anchor='middle'  dy="0.4em" > 
                List of position
              </tspan>
            </text>
            {this.state.labels}
          </g>
        </svg>
    );
  }

  onClick(e) {
    this.setState({labels: this.shuffle(this.state.labels)});
  }

  getLabels() {
    let labels = []; 

    for (let lCount = 0; lCount < this.state.labelCount; lCount++) {
      labels.push(this.getEachLabel(this.maxLabelVal, lCount)); 
    }
    return labels;
  }

  getEachLabel(val, index) {
    let x = 100; 
    let y = 200 + (index*30);  
    let transform = "translate(" + x + "," + y + ")";
    return (
      <text font-family={"late"} fill="black" opacity={1} stroke='none' 
        font-size={20} transform={transform} text-rendering='geometricPrecision' >
        <tspan class={`vlabel-${index}`} labelIndex={index} text-anchor='end' x={0} y={0} dy="0.4em" > 
          {x + ',' + y}
        </tspan>
      </text>
    );
  }

  shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

}

export default AttrUpdateApp;