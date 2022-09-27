# SmartChartsNXT [![Build Status](https://travis-ci.org/kdologic/smartChartsNXT.svg?branch=develop)](https://travis-ci.org/kdologic/smartChartsNXT) [![](https://data.jsdelivr.com/v1/package/npm/smartcharts-nxt/badge)](https://www.jsdelivr.com/package/npm/smartcharts-nxt)
<p align="center"><img src="	https://www.smartchartsnxt.com/images/SmartChartsNXT_logo_200x200.png"></p>


A powerful yet simple Javascript chart library, built on top of JavaScript and JSON which unleash the power of SVG to create Smart, Interactive, Responsive, High Performance Charts. 

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera |
| --------- | --------- | --------- | --------- | --------- |
| Edge | 51+| 56+ | 10+| 43+

## Download and Installation

##### Installing via npm

```bash
npm install smartcharts-nxt --save
```

##### Direct &lt;script&gt; include

```html
<script src="https://cdn.jsdelivr.net/npm/smartcharts-nxt"></script>
```

## Usage

##### CommonJS

```js
 var SmartChartsNXT = require('smartcharts-nxt');
```

##### ESM
```js
import SmartChartsNXT from 'smartcharts-nxt';
```
To create a simple Line Chart with minimal configuration, write as follows : 

```js
SmartChartsNXT.ready()
  .then( () => {
    let lineChart = new SmartChartsNXT.Chart({
      "type": SmartChartsNXT.CHART_TYPE.LINE_CHART,
      "targetElem": "chartContainer",
      "dataSet": {
        "xAxis": {
          "categories": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        "series": [{
          "name": "Temperature",
          "data": [2.6,	4.0, 6.4, 9.9, 13.8, 16.9, 18.7, 18.3, 15.4, 10.8 ,6.3, 3.4]
        }]
      }
    });
  });
```
This will render this line chart inside element with id `#chartContainer`.
