'use strict';

import { Component, parseStyleProps } from './../viewEngin/pview';
import defaultConfig from './../settings/config';
import { OPTIONS_TYPE } from './../settings/globalEnums';
import UtilCore from '../core/util.core';
import UiCore from '../core/ui.core';
const enums = new OPTIONS_TYPE();

/**
 * richTextBox.js
 * @createdOn: 23-Oct-2020
 * @author: SmartChartsNXT
 * @description: This components can display rich text which may contains HTML tags.
 * @extends: Component
 *
 * Limitations:
 * As IE do not support foreignObjects so we have used separate html layer to render rich texts.
 * Rich texts become non-interactive in IE as there are in different layer and forcefully positions on top of actual SVG.
 * Before download in IE all rich text will be converted into plain text to render it into main svg.
 */

class RichTextBox extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.contentId = 'text-' + UtilCore.getRandomID();
    this.contentElem = null;

    this.defaultStyle = {
      display: 'block',
      position: 'relative',
      fontFamily: defaultConfig.theme.fontFamily,
      fontSize: defaultConfig.theme.fontSizeMedium + 'px'
    };
    this.resetState(props);
  }

  resetState(props) {
    this.state = {
      style: this.props.style,
      fontSize: this.props.fontSize ? this.props.fontSize : defaultConfig.theme.fontSizeMedium + 'px',
      textColor: props.textColor || defaultConfig.theme.fontColorDark,
      text: props.text || '',
      textAlign: props.textAlign || enums.HORIZONTAL_ALIGN.LEFT,
      verticalAlignMiddle: props.verticalAlignMiddle === undefined ? false : props.verticalAlignMiddle,
      rotation: props.rotation || 0
    };
    const styleString = parseStyleProps({
      ...this.defaultStyle,
      ...{ color: this.state.textColor, fontSize: this.state.fontSize + 'px', maxWidth: (props.contentWidth ? props.contentWidth + 'px' : 'initial') },
      ...props.style
    });
    this.textStyleIE = parseStyleProps({
      fontFamily: defaultConfig.theme.fontFamily,
      fontSize: this.state.fontSize + 'px',
      fill: this.state.textColor,
      ...props.style
    });
    let dim = this.calcContentDim(props.text || '', styleString);
    this.state.contentWidth = dim.width;
    this.state.contentHeight = dim.height;
    this.state.width = props.width || dim.width;
    this.state.height = props.height || dim.height;
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.contentElem = this.ref.node.querySelector('#' + this.contentId);
    if (UtilCore.isIE) {
      setTimeout(() => {
        let acutalTextPos = this.ref.node.querySelector('.sc-text-node').getBoundingClientRect();
        let svgPos = document.querySelector('#' + this.context.rootSvgId).getBoundingClientRect();
        let left = acutalTextPos.left - svgPos.left;
        let top = acutalTextPos.top - svgPos.top;
        if (this.state.textAlign === 'center') {
          left = left - this.props.width / 2 + acutalTextPos.width / 2;
        }
        let strHtml = `<div id="${this.contentId}" style="position: absolute; width: ${this.props.contentWidth || this.state.width}px; height: ${this.state.height}px; transform-origin: left top;transform: translate(${left}px, ${top}px) ${this.state.rotation ? 'rotate(' + this.state.rotation + 'deg)' : ''}; overflow-y: ${this.props.overflow == 'scroll' && this.state.contentHeight >= this.state.height ? 'scroll' : 'visible'}; pointer-events: ${this.props.overflow == 'scroll' && this.state.contentHeight >= this.state.height ? 'all' : 'none'};"></div>`;
        this.htmlContainerIE = document.getElementById(this.context.htmlContainerIE);
        this.htmlContainerIE.insertAdjacentHTML('beforeend', strHtml);
        this.contentElem = this.htmlContainerIE.querySelector(`#${this.contentId}`);
        if (this.contentElem) {
          this.update();
        }
      });
    } else if (this.contentElem) {
      this.updateInnerHTML();
    }
  }

  beforeUpdate(props) {
    this.resetState(props);
  }

  afterUpdate() {
    if (UtilCore.isIE && this.contentElem) {
      setTimeout(() => {
        this.contentElem.style.width = (this.props.contentWidth || this.state.width) + 'px';
        this.contentElem.style.height = this.state.height + 'px';
        let actualTextPos = this.ref.node.querySelector('.sc-text-node').getBoundingClientRect();
        let svgPos = document.querySelector('#' + this.context.rootSvgId).getBoundingClientRect();
        let left = actualTextPos.left - svgPos.left;
        let top = actualTextPos.top - svgPos.top;
        if (this.state.rotation) {
          top = top + actualTextPos.height;
        }
        if (this.state.textAlign === 'center') {
          left = left - this.props.width / 2 + actualTextPos.width / 2;
        }
        this.contentElem.style.transform = `translate(${left}px, ${top}px) ${this.state.rotation ? 'rotate(' + this.state.rotation + 'deg)' : ''}`;
        if (this.contentElem) {
          this.updateInnerHTML();
        }
      });
    } else if (this.contentElem) {
      this.updateInnerHTML();
    }
  }

  beforeUnmount() {
    typeof this.props.onDestroyRef === 'function' && this.props.onDestroyRef(this);
    if (UtilCore.isIE && this.contentElem) {
      this.contentElem.parentNode.removeChild(this.contentElem);
    }
  }

  render() {
    return (
      <g class={this.props.class || ''} transform={`translate(${this.props.posX},${this.props.posY})`}>
        {!UtilCore.isIE &&
          <foreignObject id={this.contentId} x={0} y={0} width={this.state.width || this.state.contentWidth} height={this.state.height} innerHTML={this.state.text}
            style={{ 'overflowY': this.props.overflow == 'scroll' && this.state.contentHeight >= this.state.height ? 'scroll' : 'hidden' }}
            transform={this.state.rotation ? `rotate(${this.state.rotation}, 0, ${this.state.contentHeight})` : ''}>
          </foreignObject>
        }
        {UtilCore.isIE &&
          this.getDownloadableTextForIE()
        }
      </g>
    );
  }

  updateInnerHTML() {
    const styleString = parseStyleProps({
      ...this.defaultStyle,
      ...{ color: this.state.textColor, fontSize: this.state.fontSize + 'px', textAlign: this.state.textAlign },
      ...this.props.style
    });
    this.contentElem.innerHTML = `<div style='${styleString}' class=${this.state.verticalAlignMiddle && !UtilCore.isIE ? 'sc-vertical-center' : ''}>${this.state.text}</div>`;
  }

  calcContentDim(strContents, styleString) {
    let temp = document.createElement('div');
    temp.setAttribute('style', styleString);
    temp.innerHTML = strContents;
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    document.getElementsByTagName('body')[0].appendChild(temp);
    let containBox = {
      width: temp.getBoundingClientRect().width,
      height: temp.getBoundingClientRect().height
    };
    temp && temp.parentNode.removeChild(temp);
    return containBox;
  }

  getContentDim() {
    return {
      width: this.state.contentWidth,
      height: this.state.contentHeight
    };
  }

  getDownloadableTextForIE() {
    let ieTextPosX = 0;
    let ieTextPosY = this.props.verticalAlignMiddle ? this.state.height / 2 : 14;
    let ieTextAnchor = 'start';
    switch (this.state.textAlign) {
      case 'center':
        ieTextPosX = this.state.width / 2;
        ieTextAnchor = 'middle';
        break;
      case 'end':
        ieTextPosX = this.state.width;
        ieTextAnchor = 'end';
    }
    let lines = this.splitLines(this.extractContent(this.state.text));
    return (
      <g class='show-before-save sc-hide-ie'>
        <text class="sc-text-node" style={this.textStyleIE} x={ieTextPosX} y={ieTextPosY} dominant-baseline={this.props.verticalAlignMiddle ? 'middle' : 'hanging'} text-anchor={ieTextAnchor} transform={this.state.rotation ? `rotate(${this.state.rotation},0, ${this.state.contentHeight})` : ''} >
          {
            lines.map((l, i) => <tspan fill="red" x={ieTextPosX} dy={i == 0 ? 0 : 15}>{l}</tspan>)
          }
        </text>
      </g>
    );
  }

  extractContent(html, space = true) {
    let span = document.createElement('span');
    span.innerHTML = html;
    if (space) {
      let children = span.querySelectorAll('*');
      for (let i = 0; i < children.length; i++) {
        if (children[i].textContent) {
          children[i].textContent += ' ';
        } else {
          children[i].innerText += ' ';
        }
      }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
  }

  splitLines(text) {
    let splitText = text.split(' ');
    let lines = [], line = [];
    for (let i = 0; i < splitText.length; i++) {
      let word = splitText[i];
      line.push(word);
      if (Math.round(UiCore.getComputedTextWidth(<text style={this.textStyleIE}>{line.join(' ')}</text>)) > Math.round(this.props.contentWidth || this.state.width)) {
        line.pop();
        if (line.length) {
          lines.push(line.join(' '));
        }
        line = [word];
      }
    }
    lines.push(line.join(' '));
    return lines;
  }

}

export default RichTextBox;