
'use strict';

/**renderingTestApp.js */

import { Component } from './../../pview';
import Button from './button'; 
import TextBox from './textBox';

class RenderingTestApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      boxCount: 1,
      boxPosX: 0,
      pBoxPosX: 50,
      boxPosY: 250
    };
  }

  passContext() {
    return {
      runId: 'run-id-9911'
    };
  }

  render() {
    return (
      <svg xmlns='http://www.w3.org/2000/svg'
        version={1.1}
        width={this.props.width}
        height={this.props.height}
        id='svgContainer'
        style={{ background: 'none', MozTapHighlightColor: 'rgba(0, 0, 0, 0)', WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)', WebkitUserSelect: 'none', HtmlUserSelect: 'none', MozUserSelect: 'none',MsUserSelect: 'none', OUserSelect: 'none', UserSelect: 'none'
        }} >
          <g>
            <Button instanceId='plusBtn' posx={100} posy={150} width={100} height='40' bgColor='#28a745' borderColor='#1e7e34' borderRadius='5'
              onClick= { (e) => {
                this.setState({boxCount: this.state.boxCount + 1});
              }} >
              <text x="35" y="35" fill="#fff" font-size="50" font-weight="bold"> + </text>
            </Button>

            <Button instanceId='resetBtn' posx='210' posy='150' width='100' height='40' bgColor='#e0a800' borderColor='#d39e00' borderRadius='5'
              onClick= { (e) => {
                this.setState({boxCount: 0});
              }} >
              <text x="23" y="37" fill="#fff" font-size="50" font-weight="bold">{"<>"}</text>
            </Button>

            <Button instanceId='minusBtn' posx='320' posy='150' width='100' height='40' bgColor='#c82333' borderColor='#bd2130' borderRadius='5'
              onClick= { (e) => {
                this.state.boxCount > 0 && this.setState({boxCount: this.state.boxCount - 1});
              }} >
              <text x="40" y="32" fill="#fff" font-size="50" font-weight="bold">-</text>
            </Button>
            <g class='null-test'>
              {this.state.boxCount == 0 ? null : <text x={320} y={50}>{'box count:' + this.state.boxCount}</text>}
            </g>
            {this.getBoxes()}
            {this.getRects()}
            {/* { this.state.boxCount > 0 &&
              <Rect id={'rect-'+this.state.boxCount} x={this.state.boxPosX} y={this.state.boxPosY + 130} color={this.state.boxCount % 2 == 0 ? '#03a9f4':'#cddc39'} >
                <g>
                  <Rect id={'rect-child-'+this.state.boxCount} x={this.state.boxPosX} y={this.state.boxPosY + 160} color={this.state.boxCount % 2 == 1 ? '#03a9f4':'#cddc39'} ></Rect>
                </g>
                <text x={this.state.boxPosX} y={this.state.boxPosY + 100}>{'text-child-'+this.state.boxCount}</text>
              </Rect>
            } */}
          </g>
        </svg>
    );
  }

  getBoxes = () => {
    let arrBoxes = [];
    for(let i = 0; i < this.state.boxCount; i++) {
      let color = this.state.boxCount%2==0?'#dd1199':'#009688';
      arrBoxes.push(
        <Box instanceId={'box'+i} index={i} x={i*120} y={this.state.boxPosY}>
          <rect class='rect-color' x={(i*120)+5} y={this.state.boxPosY + 30} width={90} height={3} fill={color} stroke={color} />
        </Box>
      );
    }
    return arrBoxes;
  }

  getRects = () => {
    let arrRects = [];
    for(let i = 0; i < this.state.boxCount; i++) {
      let color = this.state.boxCount%2==0?'#03a9f4':'#cddc39';
      arrRects.push(
        <Rect instanceId={'rect-'+i} id={'rect-'+i} x={(i*120)+5} y={this.state.boxPosY + 130} color={color} ></Rect>
      );
    }
    return arrRects;
  }

}

// Text = (props) => {
//   return (
//     <text x={props.x} y={props.y}>{props.text}</text>
//   );
// }; 

class Rect extends Component {
  constructor(props) {
    super(props);
  }

  propsWillReceive(nextProps) {
    console.log('propsWillReceive --', this.props.id ,'(new)', nextProps.id);
  }

  beforeMount() {
    console.log('beforeMount --', this.props);
  }

  afterMount() {
    console.log('afterMount --', this.props);
  }

  afterUpdate(prevProps) {
    console.log('afterUpdate --', prevProps);
  }

  beforeUnmount() {
    console.log('beforeUnmount --', this.props.id);
  }

  shouldUpdate(nextProps) {
    return true;
  }

  render() {
    return (
      <g>
        <rect id={this.props.id} x={this.props.x} y={this.props.y} rx={5} width={90} height={20} fill={this.props.color} stroke="none" >
        </rect>
        <text x={this.props.x+5} y={this.props.y+15}>{this.props.id}</text>
        {this.props.extChildren}
      </g>
    );
  }
}

class Box extends Component {
  constructor(props) {
    super(props);
  }

  propsWillReceive(nextProps) {
    console.log('propsWillReceive --', this.props ,'(new)', nextProps);
  }

  render() {
    return (
      <g class={'tbx-' + this.props.index} instanceId={'tbx-' + this.props.index} >
        <text x={this.props.x} y={this.props.y-20} >{this.context.runId+'_'+this.props.index}</text>
        <TextBox posx={this.props.x} posy={this.props.y} width='100' height='100' bgColor='#eee' borderColor='#999' borderRadius='5'>
          {'container ' + (this.props.index + 1)}
        </TextBox>
        {this.props.extChildren}
      </g>
    );
  }
}

export default RenderingTestApp;