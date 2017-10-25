"use strict";

import { h, Component} from "./pview";

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeNow: new Date().toTimeString().split(' ')[0]
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        timeNow: new Date().toTimeString().split(' ')[0]
      });
    }, 1000);
  }

  render() {
    return (
      <text  fill='#717171' font-family='Lato' font-size='20' x={this.props.x} y={this.props.y} > 
        {this.state.timeNow} 
      </text>
    );
  }
}

export default Timer; 