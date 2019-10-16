'use strict';

import Validator from './../validators/validator';
import { validationRules } from './../settings/validationRules';
import { mountTo } from './../viewEngin/pview';
import BaseChart from './../base/baseChart';
import utilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import ErrorView from './../components/errorView';

/*eslint-disable  no-console*/

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
      if(!opts) {
        throw new CError('No configuration option found !');
      }
      const validator = new Validator();
      this.errors = validator.validate(validationRules, opts);
      if(this.errors.length) {
        return this.logErrors(opts);
      }
      this.runId = utilCore.uuidv4();
      this.targetNode = document.querySelector('#' + opts.targetElem);
      this.errors = this.targetElemValidate(opts);
      if(this.errors.length) {
        return this.logErrors(opts);
      }
      this.events = eventEmitter.createInstance(this.runId);
      this.targetNode.setAttribute('runId', this.runId);
      this.core = mountTo(<BaseChart opts={opts} runId={this.runId} width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} />, this.targetNode);
      window.addEventListener('resize', this.onResize.bind(this), false);
      $SC.debug && console.debug(this.core);
    } catch (ex) {
      this.logErrors(opts, ex);
    }
  }

  onResize(e) {
    e.data = {
      targetWidth: this.targetNode.offsetWidth,
      targetHeight: this.targetNode.offsetHeight
    };
    this.events.emit('resize', e);
  }

  logErrors(opts, ex) {
    if(ex) {
      if(ex instanceof Array){
        this.errors = ex;
      }else{
        console.error(ex);
      }
    }
    this.errors.forEach((err) => {
      console.error(err.module + err.message);

    });
    if(this.targetNode && opts) {
      this.showErrorScreen(opts);
    }
  }

  showErrorScreen(opts) {
    mountTo(<ErrorView width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} chartType={opts.type} runId={this.runId}></ErrorView>, this.targetNode);
  }

  targetElemValidate() {
    let errors = [];
    if(!this.targetNode) {
      errors.push(new CError('Option.targetElem not found in current DOM !'));
    }
    return errors;
  }
}

class CError extends Error {
  constructor(...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CError);
    }
    this.module = '[SmartChartsNXT] ';
  }
}

export default Chart;