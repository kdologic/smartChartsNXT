'use strict';

import { Component, parseStyleProps } from '../../viewEngin/pview';
import defaultConfig from '../../settings/config';
import UtilCore from '../../core/util.core';
import UiCore from '../../core/ui.core';
import { IDimension, IRichTextBoxProps, IStyleConfig } from './richTextBox.model';
import { HORIZONTAL_ALIGN, TEXT_ANCHOR, VERTICAL_ALIGN } from '../../global/global.enums';
import { IVnode } from '../../viewEngin/component.model';

/**
 * richTextBox.component.tsx
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

class RichTextBox extends Component<IRichTextBoxProps> {
  public contentId: string;
  private contentElem: HTMLElement | null;
  private defaultStyle: IStyleConfig;
  private textStyleIE: string;
  private htmlContainerIE: HTMLElement | null;

  constructor(props: IRichTextBoxProps) {
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

  resetState(props: IRichTextBoxProps): void {
    this.state = {
      style: props.style,
      fontSize: props.fontSize ? props.fontSize : defaultConfig.theme.fontSizeMedium + 'px',
      textColor: props.textColor || defaultConfig.theme.fontColorDark,
      text: props.text || '',
      textAlign: props.textAlign || HORIZONTAL_ALIGN.LEFT,
      verticalAlignMiddle: props.verticalAlignMiddle === undefined ? false : props.verticalAlignMiddle,
      rotation: props.rotation || 0,
      class: ['sc-rich-textbox', props.class]
    };
    const styleString = parseStyleProps({
      ...this.defaultStyle,
      ...{
        color: this.state.textColor,
        fontSize: this.state.fontSize + 'px',
        maxWidth: (props.contentWidth ? props.contentWidth + 'px' : 'initial')
      },
      ...props.style
    });
    this.textStyleIE = parseStyleProps({
      fontFamily: defaultConfig.theme.fontFamily,
      fontSize: this.state.fontSize + 'px',
      fill: this.state.textColor,
      ...props.style
    });
    let dim: IDimension = this.calcContentDim(props.text || '', styleString);
    this.state.contentWidth = dim.width;
    this.state.contentHeight = dim.height;
    this.state.width = props.width || dim.width;
    this.state.height = props.height || dim.height;
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.contentElem = (this.ref.node as HTMLElement).querySelector('#' + this.contentId);
    if (UtilCore.isIE) {
      setTimeout(() => {
        const actualTextPos: DOMRect = (this.ref.node as HTMLElement).querySelector('.sc-text-node').getBoundingClientRect();
        const svgPos: DOMRect = document.querySelector('#' + (this as any).context.rootSvgId).getBoundingClientRect();
        let left: number = actualTextPos.left - svgPos.left;
        let top: number = actualTextPos.top - svgPos.top;
        if (this.state.textAlign === VERTICAL_ALIGN.CENTER) {
          left = left - this.state.width / 2 + actualTextPos.width / 2;
        }
        let strHtml: string = `<div id="${this.contentId}" style="position: absolute; width: ${this.props.contentWidth || this.state.width}px; height: ${this.state.height}px; transform-origin: left top;transform: translate(${left}px, ${top}px) ${this.state.rotation ? 'rotate(' + this.state.rotation + 'deg)' : ''}; overflow-y: ${this.props.overflow === 'scroll' && this.state.contentHeight >= this.state.height ? 'scroll' : 'visible'}; pointer-events: ${this.props.overflow === 'scroll' && this.state.contentHeight >= this.state.height ? 'all' : 'none'};"></div>`;
        this.htmlContainerIE = document.getElementById((this as any).context.htmlContainerIE);
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

  beforeUpdate(props: IRichTextBoxProps): void {
    this.resetState(props);
  }

  afterUpdate(): void {
    if (UtilCore.isIE && this.contentElem) {
      setTimeout(() => {
        this.contentElem.style.width = (this.props.contentWidth || this.state.width) + 'px';
        this.contentElem.style.height = this.state.height + 'px';
        const actualTextPos: DOMRect = (this.ref.node as HTMLElement).querySelector('.sc-text-node').getBoundingClientRect();
        const svgPos: DOMRect = document.querySelector('#' + (this as any).context.rootSvgId).getBoundingClientRect();
        let left = actualTextPos.left - svgPos.left;
        let top = actualTextPos.top - svgPos.top;
        if (this.state.rotation) {
          top = top + actualTextPos.height;
        }
        if (this.state.textAlign === HORIZONTAL_ALIGN.CENTER) {
          left = left - this.state.width / 2 + actualTextPos.width / 2;
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

  beforeUnmount(): void {
    typeof this.props.onDestroyRef === 'function' && this.props.onDestroyRef(this);
    if (UtilCore.isIE && this.contentElem) {
      this.contentElem.parentNode.removeChild(this.contentElem);
    }
  }

  render(): IVnode {
    return (
      <g class={this.props.class || ''} transform={`translate(${this.props.posX},${this.props.posY})`}>
        {!UtilCore.isIE &&
          <foreignObject id={this.contentId} x={0} y={0} width={this.state.width || this.state.contentWidth} height={this.state.height} innerHTML={this.state.text}
            style={{ 'overflowY': this.props.overflow === 'scroll' && this.state.contentHeight >= this.state.height ? 'scroll' : 'hidden' }}
            transform={this.state.rotation ? `rotate(${this.state.rotation}, 0, ${this.state.contentHeight})` : ''}>
          </foreignObject>
        }
        {UtilCore.isIE &&
          this.getDownloadableTextForIE()
        }
      </g>
    );
  }

  updateInnerHTML(): void {
    const styleString: string = parseStyleProps({
      ...this.defaultStyle,
      ...{ color: this.state.textColor, fontSize: this.state.fontSize + 'px', textAlign: this.state.textAlign },
      ...this.props.style
    });
    this.contentElem.innerHTML = `<div style='${styleString}' class=${this.state.verticalAlignMiddle && !UtilCore.isIE ? 'sc-vertical-center' : ''}>${this.state.text}</div>`;
  }

  calcContentDim(strContents: string, styleString: string): IDimension {
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

  getContentDim(): IDimension {
    return {
      width: this.state.contentWidth,
      height: this.state.contentHeight
    };
  }

  getDownloadableTextForIE(): IVnode {
    let ieTextPosX: number = 0;
    let ieTextPosY: number = this.props.verticalAlignMiddle ? this.state.height / 2 : 14;
    let ieTextAnchor: TEXT_ANCHOR = TEXT_ANCHOR.START;
    switch (this.state.textAlign) {
      case HORIZONTAL_ALIGN.CENTER:
        ieTextPosX = this.state.width / 2;
        ieTextAnchor = TEXT_ANCHOR.MIDDLE;
        break;
      case HORIZONTAL_ALIGN.RIGHT:
        ieTextPosX = this.state.width;
        ieTextAnchor = TEXT_ANCHOR.END;
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

  extractContent(html: string, space: boolean = true): string {
    let span = document.createElement('span');
    span.innerHTML = html;
    if (space) {
      let children = span.querySelectorAll('*');
      for (let i = 0; i < children.length; i++) {
        if (children[i].textContent) {
          children[i].textContent += ' ';
        } else {
          (children[i] as HTMLElement).innerText += ' ';
        }
      }
    }
    return [span.textContent || span.innerText].toString().replace(/ +/g, ' ');
  }

  splitLines(text: string): string[] {
    let splitText: string[] = text.split(' ');
    let lines: string[] = [], line: string[] = [];
    for (let word of splitText) {
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