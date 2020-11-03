'use strict';

import { Component } from './../viewEngin/pview';
import Style from './../viewEngin/style';
import { fontFaceStatic } from './font-lato';
import defaultConfig from './../settings/config';

/**
 * commonStyles.js
 * @createdOn:09-Apr-2019
 * @author:SmartChartsNXT
 * @description: This components will create common styles for chart.
 * @extends Component
 */

class CommonStyles extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g class='sc-common-styles'>
        <style>{fontFaceStatic}</style>
        <Style>
          {{
            '.smartcharts-nxt *, .sc-prime-view *': {
              'outline': 'none'
            },
            '.smartcharts-nxt svg, .sc-prime-view': {
              'fontFamily': defaultConfig.theme.fontFamily,
              'background': 'transparent',
              'MozTapHighlightColor': 'rgba(0, 0, 0, 0)',
              'WebkitTapHighlightColor': 'rgba(0, 0, 0, 0)',
              'WebkitUserSelect': 'none',
              'HtmlUserSelect': 'none',
              'MozUserSelect': 'none',
              'MsUserSelect': 'none',
              'OUserSelect': 'none',
              'UserSelect': 'none',
              'overflow': 'hidden'
            },
            '.smartcharts-nxt .focus-in': {
              'stroke': defaultConfig.theme.fontColorHighlight
            },
            '.smartcharts-nxt .do-focus-highlight:focus': {
              'stroke': defaultConfig.theme.fontColorHighlight
            },
            '.smartcharts-nxt .sc-hide, .sc-prime-view .sc-hide': {
              'display': 'none'
            },
            '.sc-screen-reader-only': {
              'position': 'absolute',
              'width': '1px',
              'height': '1px',
              'overflow': 'hidden',
              'whiteSpace': 'nowrap',
              'clip': 'rect(1px, 1px, 1px, 1px)',
              'marginTop': '-3px',
              'opacity': '0.01'
            }
          }}
        </Style>
      </g>
    );
  }
}

export default CommonStyles;