'use strict';

import { Component } from './../viewEngin/pview';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import { CircleIcon, TriangleIcon, DiamondIcon, StarIcon, CustomIcon } from '../icons/iconCollection';


/**
 * markerIcon.js
 * @createdOn: 08-Oct-2020
 * @author: SmartChartsNXT
 * @description:This component switch between different icon based on type.
 * @extends: Component
 */

class MarkerIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g instanceId={this.props.instanceId}>
        {this.selectIcon()}
      </g>
    );
  }

  selectIcon() {
    switch (this.props.type) {
      default:
      case ENUMS.ICON_TYPE.CIRCLE:
        return <CircleIcon id={this.props.index} x={this.props.x} y={this.props.y} r={this.props.width / 2} fillColor={this.props.fillColor} highlighted={this.props.highlighted} strokeColor={this.props.strokeColor} onRef={this.props.onRef} />;

      case ENUMS.ICON_TYPE.TRIANGLE:
        return <TriangleIcon id={this.props.index} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} fillColor={this.props.fillColor} highlighted={this.props.highlighted} strokeColor={this.props.strokeColor} onRef={this.props.onRef} />;

      case ENUMS.ICON_TYPE.DIAMOND:
        return <DiamondIcon id={this.props.index} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} fillColor={this.props.fillColor} highlighted={this.props.highlighted} strokeColor={this.props.strokeColor} onRef={this.props.onRef} />;

      case ENUMS.ICON_TYPE.STAR:
        return <StarIcon id={this.props.index} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} fillColor={this.props.fillColor} highlighted={this.props.highlighted} strokeColor={this.props.strokeColor} onRef={this.props.onRef} />;

      case ENUMS.ICON_TYPE.CUSTOM:
        return <CustomIcon id={this.props.index} x={this.props.x} y={this.props.y} width={this.props.width + 2} height={this.props.height + 2} URL={this.props.URL || ''} fillColor={this.props.fillColor} highlighted={this.props.highlighted} strokeColor={this.props.strokeColor} onRef={this.props.onRef} />;

    }
  }
}

export default MarkerIcon;