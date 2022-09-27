'use strict';

import { OPTIONS_TYPE } from './../settings/globalEnums';
import defaultConfig from '../settings/config';
import { Component } from '../viewEngin/pview';
import Point from '../core/point';
import eventEmitter from './../core/eventEmitter';
import UtilCore from '../core/util.core';
import UiCore from '../core/ui.core';
import GeomCore from '../core/geom.core';
import ConnectorBox from './connectorBox';
import RichTextBox from './richTextBox';
import SpeechBox from './speechBox';
const enums = new OPTIONS_TYPE();


/**
 * annotationLabels.js
 * @createdOn:28-Aug-2021
 * @author:SmartChartsNXT
 * @description: This components will create annotation labels at the various point of interest.
 * @extends: Component
 */

class AnnotationLabels extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.rid = UtilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.state = {
      scaleX: 0,
      scaleY: 0,
      baseLine: 0,
      annotations: [],
      mouseDown: false,
      mouseDownPos: null,
      grpIndex: null,
      labelIndex: null
    };
    this.createAnnotationState(this.props);
    this.minimizeLabel = this.minimizeLabel.bind(this);
    this.maximizeLabel = this.maximizeLabel.bind(this);
    this.labelMouseDown = this.labelMouseDown.bind(this);
    this.labelMouseMove = this.labelMouseMove.bind(this);
    this.labelMouseUp = this.labelMouseUp.bind(this);
  }

  beforeUpdate(nextProps) {
    this.state.scaleX = nextProps.scaleX || 0;
    this.state.scaleY = nextProps.scaleY || 0;
    this.state.baseLine = nextProps.baseLine || 0;
  }

  createAnnotationState(props) {
    let annotations = props.annotations;
    this.state.annotations = [];
    this.state.scaleX = props.scaleX || 0;
    this.state.scaleY = props.scaleY || 0;
    this.state.baseLine = props.baseLine || 0;
    let defaultOpt = {
      isDraggable: true,
      isCollapsable: true, //After collapse the annotation label become small plus icon
      offsetX: 0, // Move entire label along with anchor point to left or right
      offsetY: -10, // Move entire label along with anchor point to top or bottom
      xPadding: 5, // Create x padding inside label box
      yPadding: 5, // Create y padding inside label box
      float: enums.FLOAT.TOP,
      textColor: defaultConfig.theme.fontColorDark,
      bgColor: defaultConfig.theme.bgColorLight,
      fontSize: 12,
      fontFamily: defaultConfig.theme.fontFamily,
      borderColor: defaultConfig.theme.bgColorDark,
      borderWidth: 1,
      borderRadius: 5,
      opacity: 0.5, // Label background opacity
      dropShadow: true,
      maxWidth: 150,
      minHeight: 30,
      rotate: 0
    };
    for (let i = 0; i < annotations.length; i++) {
      for (let j = 0; j < annotations[i].labels.length; j++) {
        if (annotations[i].labels[j].isMinimized === undefined) {
          annotations[i].labels[j].isMinimized = false;
        }
        if (!annotations[i].labels[j].topOffset) {
          annotations[i].labels[j].topOffset = 0;
          annotations[i].labels[j].nextTopOffset = 0;
        }
        if (!annotations[i].labels[j].leftOffset) {
          annotations[i].labels[j].leftOffset = 0;
          annotations[i].labels[j].nextLeftOffset = 0;
        }
      }
      if (annotations[i].options.isDraggable && annotations[i].options.bgColor === 'none') {
        annotations[i].options.opacity = 0.0001;
        annotations[i].options.bgColor = '#FFF';
      }
      this.state.annotations.push({
        options: { ...defaultOpt, ...annotations[i].options },
        labels: [...annotations[i].labels]
      });
    }
  }

  render() {
    return (
      <g class='sc-annotation-labels-container' transform={`translate(${this.props.posX},${this.props.posY})`} clip-path={`url(#${this.clipPathId})`}>
        {this.getStyle()}
        <defs>
          <radialGradient id="mIconGradInactive">
            <stop offset="10%" stop-color="#fff" />
            <stop offset="95%" stop-color="#555" />
          </radialGradient>
        </defs>
        <defs>
          <clipPath id={this.clipPathId}>
            <rect x={0} y={0} width={this.props.width} height={this.props.height} />
          </clipPath>
        </defs>
        {this.drawAnnotationGroup()}
        <rect class="sc-annotation-drag-plane" x={0} y={0} width={this.props.width} height={this.props.height} stroke='none' fill={this.state.mouseDown ? '#fff' : 'none'} fill-opacity={0}
          events={{
            mousemove: (e) => this.labelMouseMove(e),
            mouseup: (e) => this.labelMouseUp(e)
          }} >
        </rect>
      </g>
    );
  }

  drawAnnotationGroup() {
    return this.state.annotations.map((annotations, index) => {
      return (
        <g class={`sc-annotation-label-group-${index}`} transform={`translate(${this.props.vTransformX}, 0)`}>
          {this.drawAnnotationLabels(annotations, index)}
        </g>
      );
    });
  }

  drawAnnotationLabels(annotations, grpIndex) {
    let config = annotations.options;
    return annotations.labels.map((label, index) => {
      let valueY = label.y;
      if (this.props.yAxisType === enums.AXIS_TYPE.LOGARITHMIC && valueY > 0) {
        valueY = Math.log10(valueY);
      }
      let dataPoint = new Point(
        (label.x * this.state.scaleX) - (this.state.scaleX * this.props.leftIndex) - (label.leftOffset + label.nextLeftOffset),
        this.state.baseLine - (valueY * this.state.scaleY) - (label.topOffset + label.nextTopOffset)
      );
      const isDataVisible = this.getDataPointVisibility(new Point(dataPoint.x + label.leftOffset + label.nextLeftOffset, dataPoint.y));
      if (label.text) {
        return this.drawAnnotationTypeText(grpIndex, index, label, config, dataPoint, isDataVisible);
      } else if (label.shape) {
        return this.drawAnnotationTypeShape(grpIndex, index, label, config, dataPoint);
      } else if (label.image) {
        return this.drawAnnotationTypeImage(grpIndex, index, label, config, dataPoint);
      }

    });
  }

  drawAnnotationTypeShape(grpIndex, index, label, config, dataPoint) {
    return (
      <g class={`sc-annotation-label-${grpIndex}-${index}`} transform={`rotate(${config.rotate}, ${dataPoint.x}, ${dataPoint.y}) translate(${dataPoint.x}, ${dataPoint.y})`}>
        {config.dropShadow && UiCore.dropShadow('sc-annotation-shape-drop-shadow')}
        <path class='sc-annotation-label-shape' d={label.shape} fill={config.bgColor} stroke={config.borderColor} opacity={config.opacity} stroke-width={config.borderWidth}
          filter={config.dropShadow ? 'url(#sc-annotation-shape-drop-shadow)' : ''} shape-rendering='geometricPrecision' vector-effect='non-scaling-stroke'>
        </path>
      </g>
    );
  }

  drawAnnotationTypeImage(grpIndex, index, label, config, dataPoint) {
    return (
      <g class={`sc-annotation-label-${grpIndex}-${index}`} transform={`rotate(${config.rotate}, ${dataPoint.x}, ${dataPoint.y}) translate(${dataPoint.x}, ${dataPoint.y})`}>
        {config.dropShadow && UiCore.dropShadow('sc-annotation-image-drop-shadow')}
        <image class='sc-annotation-label-img' width={label.width || 50} height={label.height || 50} href={label.image} opacity={config.opacity}
          filter={config.dropShadow ? 'url(#sc-annotation-shape-drop-shadow)' : ''}>
        </image>
      </g>
    );
  }

  drawAnnotationTypeText(grpIndex, index, label, config, dataPoint, isDataVisible) {
    let boxWidth = label.contentWidth ? (label.contentWidth + (2 * config.xPadding)) : config.maxWidth;
    let boxHeight = label.contentHeight ? (label.contentHeight + (2 * config.yPadding) + 5) : config.minHeight;
    const hasRotation = config.rotate !== 0;
    const hasSpeechBubble = !(label.speechBubble === false) && !hasRotation;

    const noFloat = !hasSpeechBubble;
    if (label.isMinimized === true) {
      boxWidth = 30;
      boxHeight = 30;
    }
    const boxCenter = new Point(boxWidth / 2, boxHeight / 2);
    const labelBoxPos = this.getLabelPosition(dataPoint, boxWidth, boxHeight, config, noFloat);
    const anchorPoint = new Point(dataPoint.x - labelBoxPos.x + label.leftOffset + label.nextLeftOffset + config.offsetX, dataPoint.y - labelBoxPos.y + label.topOffset + label.nextTopOffset + config.offsetY);
    const anchorDistance = GeomCore.getDistanceBetween(boxCenter, anchorPoint);
    let labelBox;
    if (noFloat) {
      labelBox = <g class='sc-annotation-label-box-bg'>
        {config.dropShadow && UiCore.dropShadow('sc-annotation-bg-drop-shadow')}
        <rect x='0' y='0' width={boxWidth} height={boxHeight} filter={config.dropShadow ? 'url(#sc-annotation-bg-drop-shadow)' : ''}
          fill-opacity={config.opacity} fill={config.bgColor} stroke-width={config.borderWidth} stroke={config.borderColor} rx={config.borderRadius}
          shape-rendering='optimizeSpeed' vector-effect='non-scaling-stroke' ></rect>
      </g>;
    } else {
      labelBox = anchorDistance > 100 ?
        <ConnectorBox x={0} y={0} width={boxWidth} height={boxHeight} cpoint={new Point(anchorPoint.x, anchorPoint.y)}
          bgColor={config.bgColor} fillOpacity={config.opacity} shadow={config.dropShadow} strokeColor={config.borderColor} strokeWidth={config.borderWidth}
          cornerRadius={config.borderRadius} showConnectorLine={!hasRotation}>
        </ConnectorBox>
        :
        <SpeechBox x={0} y={0} width={boxWidth} height={boxHeight} cpoint={new Point(anchorPoint.x, anchorPoint.y)}
          bgColor={config.bgColor} fillOpacity={config.opacity} shadow={config.dropShadow} strokeColor={config.borderColor} strokeWidth={config.borderWidth}
          anchorBaseWidth={7} cornerRadius={config.borderRadius} showAnchor={!hasRotation}>
        </SpeechBox>;
    }

    if (!isDataVisible) {
      return (
        <g class={`sc-annotation-label-${grpIndex}-${index}`}></g>
      );
    }
    if (label.isMinimized === true && config.isCollapsable) {
      return (
        <g class={`sc-annotation-label-${grpIndex}-${index}`} transform={`translate(${labelBoxPos.x},${labelBoxPos.y})`}>
          <title>Maximize</title>
          <g>
            <rect class='sc-maximize-icon-bg' x={0} y={0} width={boxWidth} height={boxWidth} rx="5" fill="url('#mIconGradInactive')" stroke="none" fill-opacity={0.5}
              events={{
                click: (e) => this.maximizeLabel(e, grpIndex, index)
              }}>
            </rect>
          </g>
          <text text-rendering='geometricPrecision' stroke='#000' fill='#000' font-size='22' pointer-events='none'>
            <tspan text-anchor='middle' x={boxWidth / 2} y={boxWidth / 2} dominant-baseline="middle">+</tspan>
          </text>
        </g>
      );
    }
    return (
      <g class={`sc-annotation-label-${grpIndex}-${index}`} transform={`rotate(${config.rotate}, ${labelBoxPos.x}, ${labelBoxPos.y}) translate(${labelBoxPos.x},${labelBoxPos.y})`} tabindex={0}>
        <g class='sc-annotation-label-box' style={{ 'cursor': config.isDraggable ? 'move' : 'initial' }}
          events={{ mousedown: (e) => this.labelMouseDown(e, grpIndex, index) }}>
          {labelBox}
        </g>
        <RichTextBox class='sc-annotation-label-text' posX={config.xPadding} posY={config.yPadding} contentWidth={config.maxWidth - (2 * config.xPadding)}
          textAlign={enums.HORIZONTAL_ALIGN.CENTER} verticalAlignMiddle={true} fontSize={config.fontSize} textColor={config.textColor} text={label.text || ''}
          onRef={(ref) => {
            if (ref) {
              let textDim = ref.getContentDim();
              label.contentWidth = textDim.width;
              label.contentHeight = textDim.height;
            }
          }}>
        </RichTextBox>
        {config.isCollapsable && this.getMinimizeIcon(boxWidth, config.borderRadius, grpIndex, index)}
      </g>
    );
  }

  getMinimizeIcon(boxWidth, radius, grpIndex, labelIndex) {
    let iconWidth = 20;
    let iconHeight = 20;
    let iconPath = ['M', 0, 0, 'L', iconWidth - radius, 0, 'a', radius, radius, ' 0 0 1 ', radius, radius, 'L', iconWidth, iconHeight, 'Z'];
    return (
      <g class="sc-minimize-icon-group" transform={`translate(${boxWidth - iconWidth}, ${0})`}>
        <title>Minimize</title>
        <g>
          <path class='sc-minimize-icon-bg' d={iconPath.join(' ')} fill="#000" fill-opacity={0.5}
            events={{
              click: (e) => this.minimizeLabel(e, grpIndex, labelIndex)
            }}>
          </path>
        </g>
      </g>
    );
  }

  getMaximizeIcon(boxWidth, grpIndex, labelIndex) {
    return (
      <g class="sc-maximize-icon-group">
        <title>Maximize</title>
        <g>
          <rect class='sc-maximize-icon-bg' x={0} y={0} width={boxWidth} height={boxWidth} rx="5" fill="url('#mIconGradInactive')" stroke="none" fill-opacity={0.5}
            events={{
              click: (e) => this.maximizeLabel(e, grpIndex, labelIndex)
            }}>
          </rect>
        </g>
        <text text-rendering='geometricPrecision' stroke='#000' fill='#000' font-size='22' pointer-events='none'>
          <tspan text-anchor='middle' x={boxWidth / 2} y={boxWidth / 2} dominant-baseline="middle">+</tspan>
        </text>
      </g>
    );
  }

  minimizeLabel(e, grpIndex, labelIndex) {
    this.state.annotations[grpIndex].labels[labelIndex].isMinimized = true;
    this.update();
  }

  maximizeLabel(e, grpIndex, labelIndex) {
    this.state.annotations[grpIndex].labels[labelIndex].isMinimized = false;
    this.update();
  }

  getLabelPosition(dataPoint, boxWidth, boxHeight, config, noFloat, recursion = 1) {
    let labelBoxPos;
    let anchorHeight = 7;
    if (noFloat) {
      labelBoxPos = new Point(dataPoint.x, dataPoint.y);
    } else {
      switch (config.float) {
        case enums.FLOAT.TOP: {
          labelBoxPos = new Point(dataPoint.x - (boxWidth / 2), dataPoint.y - (boxHeight + anchorHeight));
          break;
        }
        case enums.FLOAT.BOTTOM: {
          labelBoxPos = new Point(dataPoint.x - (boxWidth / 2), dataPoint.y + (anchorHeight));
          break;
        }
        case enums.FLOAT.LEFT: {
          labelBoxPos = new Point(dataPoint.x - (boxWidth + anchorHeight), dataPoint.y - (boxHeight / 2));
          break;
        }
        case enums.FLOAT.RIGHT: {
          labelBoxPos = new Point(dataPoint.x + anchorHeight, dataPoint.y - (boxHeight / 2));
          break;
        }
      }
      labelBoxPos.x += config.offsetX;
      labelBoxPos.y += config.offsetY;

      if (recursion <= 4) {
        if (labelBoxPos.y < 0) {
          let cnf = { ...config, ...{ float: enums.FLOAT.BOTTOM } };
          return this.getLabelPosition(dataPoint, boxWidth, boxHeight, cnf, noFloat, recursion + 1);
        }
        if (labelBoxPos.y + boxHeight > this.props.height) {
          let cnf = { ...config, ...{ float: enums.FLOAT.TOP } };
          return this.getLabelPosition(dataPoint, boxWidth, boxHeight, cnf, noFloat, recursion + 1);
        }
      }

      if (labelBoxPos.x + this.props.vTransformX < 0) {
        labelBoxPos.x = -(this.props.vTransformX);
      }
      if (labelBoxPos.x + boxWidth + this.props.paddingX + this.props.vTransformX > this.props.width) {
        let diff = (labelBoxPos.x + boxWidth + this.props.paddingX + this.props.vTransformX) - this.props.width;
        labelBoxPos.x -= diff;
        if (config.float === enums.FLOAT.BOTTOM && labelBoxPos.y < 0) {
          labelBoxPos.y = 0;
        }
      }
    }
    return labelBoxPos;
  }

  getDataPointVisibility(dataPoint) {
    let isVisible = true;
    if (dataPoint.x < 0 || (dataPoint.x == 0 && this.props.vTransformX < 0)) {
      isVisible = false;
    }
    if (dataPoint.x + this.props.vTransformX > this.props.width) {
      isVisible = false;
    }
    return isVisible;
  }

  labelMouseDown(e, grpIndex, labelIndex) {
    if (!this.state.annotations[grpIndex].options.isDraggable) {
      return;
    }
    let mouseDownPos = UiCore.cursorPoint(this.context.rootContainerId, e);
    let label = this.state.annotations[grpIndex].labels[labelIndex];
    if (!label.mouseDownPos) {
      label.mouseDownPos = mouseDownPos;
    }
    label.mouseDownPos = mouseDownPos;
    this.setState({
      mouseDown: true,
      grpIndex,
      labelIndex
    });
  }

  labelMouseMove(e) {
    if (this.state.mouseDown) {
      let mousePosNow = UiCore.cursorPoint(this.context.rootContainerId, e);
      let movingLabel = this.state.annotations[this.state.grpIndex].labels[this.state.labelIndex];
      let nextLeftOffset = movingLabel.mouseDownPos.x - mousePosNow.x;
      let nextTopOffset = movingLabel.mouseDownPos.y - mousePosNow.y;
      movingLabel.nextLeftOffset = nextLeftOffset;
      movingLabel.nextTopOffset = nextTopOffset;
      this.update();
    }
  }

  labelMouseUp() {
    let movingLabel = this.state.annotations[this.state.grpIndex].labels[this.state.labelIndex];
    movingLabel.leftOffset += movingLabel.nextLeftOffset;
    movingLabel.topOffset += movingLabel.nextTopOffset;
    movingLabel.nextLeftOffset = 0;
    movingLabel.nextTopOffset = 0;
    this.setState({
      mouseDown: false,
      mouseDownPos: null,
      grpIndex: null,
      labelIndex: null
    });
  }

  getStyle() {
    return (
      <style>
        {`
          .sc-annotation-label-text {
            pointer-events: none;
          }
          .sc-minimize-icon-bg {
            transition-duration: .15s;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-property: fill-opacity;
            cursor:pointer;
          }
          .sc-minimize-icon-bg:hover, .sc-minimize-icon-bg:focus {
            fill-opacity: 1;
          }
          .sc-maximize-icon-bg {
            transition-duration: .15s;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-property: fill-opacity;
            cursor:pointer;
          }
          .sc-maximize-icon-bg:hover, .sc-maximize-icon-bg:focus {
            fill-opacity: 1;
          }
        `}
      </style>
    );
  }

}



export default AnnotationLabels;