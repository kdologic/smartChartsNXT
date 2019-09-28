'use strict';

import { mountTo } from './../viewEngin/pview';
import BaseChart from './../base/baseChart';
import utilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import Error from './../components/errorView';

/**
 * chart.js
 * @createdOn: 22-Oct-2017
 * @author: SmartChartsNXT
 * @description:This class will be the entry point of all charts.
 */

class Chart {
  constructor(opts) {
    try {
      this.errors = [];
      this.basicValidation(opts);
      this.runId = utilCore.uuidv4();
      this.events = eventEmitter.createInstance(this.runId);
      this.targetNode = document.querySelector('#' + opts.targetElem);
      if(this.errors.length) {
        if(!this.targetNode) {
          let errorDiv = document.createElement('div');
          document.appendChild(errorDiv);
          this.targetNode = errorDiv;
        }
        throw new Error();
      }
      
      this.targetNode.setAttribute('runId', this.runId);
      this.core = mountTo(<BaseChart opts={opts} runId={this.runId} width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} />, this.targetNode);
      window.addEventListener('resize', this.onResize.bind(this), false);
      /* eslint-disable-next-line no-console */
      $SC.debug && console.debug(this.core);
      
    } catch (ex) {
      this.showErrorScreen(opts, ex, ex.errorIn);
      //throw ex;
    }
  }

  onResize(e) {
    e.data = {
      targetWidth: this.targetNode.offsetWidth,
      targetHeight: this.targetNode.offsetHeight
    };
    this.events.emit('resize', e);
  }

  showErrorScreen(opts, ex, errorIn) {
    console.log(this.errors);
    mountTo(<Error width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} chartType={opts.type} runId={this.runId}></Error>, this.targetNode);
  }

  basicValidation(opts) {
    if(typeof opts === 'undefined') {
      this.errors.push(new Error('Chart option can\'t be undefined or blank'));
    }else {
      if(typeof opts.type === 'undefined') {
        this.errors.push(new Error('option.type can\'t be undefined'));
      }
      if(typeof opts.targetElem === 'undefined') {
        this.errors.push(new Error('option.targetElem can\'t be undefined'));
      }
    }
  }
}

export default Chart;