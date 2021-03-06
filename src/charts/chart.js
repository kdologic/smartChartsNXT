'use strict';

import Validator from './../validators/validator';
import { validationRules } from './../settings/validationRules';
import { mountTo } from './../viewEngin/pview';
import BaseChart from './../base/baseChart';
import StoreManager from './../liveStore/storeManager';
import UtilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import ErrorView from './../components/errorView';
import a11yFactory from './../core/a11y';

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
      if (!opts) {
        throw new CError('No configuration option found !');
      }
      this.runId = UtilCore.uuidv4();
      const storeId = StoreManager.createStore(this.runId, opts);
      this.config = StoreManager.getStore(storeId);
      this.validator = new Validator();
      this.errors = this.validator.validate(validationRules, opts);
      if (this.errors.length) {
        return this.logErrors(opts);
      }
      this.targetNode = document.querySelector('#' + opts.targetElem);
      this.errors = this.targetElemValidate(opts);
      if (this.errors.length) {
        return this.logErrors(opts);
      }
      this.events = eventEmitter.createInstance(this.runId);
      this.targetNode.setAttribute('runId', this.runId);
      this.targetNode.style.position = 'relative';

      /* For accessibility */
      this.targetNode.setAttribute('role', 'region');
      this.targetNode.setAttribute('aria-hidden', 'false');
      this.targetNode.setAttribute('aria-label', 'SmartchartsNXT interactive ' + this.config._state.type);
      this.a11yService = a11yFactory.createInstance(this.runId, this.targetNode);
      this.core = mountTo(<BaseChart opts={this.config._state} runId={this.runId} width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} />, this.targetNode, 'vnode', null, {}, false);

      /* Detect the element resize and re-draw accordingly */
      this.onResize = this.onResize.bind(this);
      if (!UtilCore.isIE) {
        const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            this.onResize(entry.target);
          }
        });
        resizeObserver.observe(this.targetNode);
      } else if ($SC.IESupport && $SC.IESupport.ResizeObserver) {
        const ro = new $SC.IESupport.ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            this.onResize({
              offsetWidth: width,
              offsetHeight: height
            });
          }
        });
        ro.observe(this.targetNode);
      }

      $SC.debug && console.debug(this.core);
    } catch (ex) {
      this.logErrors(this.config._state, ex);
    }
  }

  onResize(element) {
    const e = {
      data: {
        targetWidth: element.offsetWidth,
        targetHeight: element.offsetHeight
      }
    };
    this.events.emit('resize', e);
  }

  render() {
    this.errors = this.validator.validate(validationRules, this.config._state);
    if (this.errors.length) {
      return this.logErrors(this.config._state);
    }
    this.events.emitSync('render', this.config._state);
  }

  logErrors(opts, ex) {
    if (ex) {
      if (ex instanceof Array) {
        this.errors = ex;
      } else {
        console.error(ex);
      }
    }
    this.errors.forEach((err) => {
      console.error(err.module + err.message);
    });
    if (this.targetNode && opts) {
      this.showErrorScreen(opts);
    }
  }

  showErrorScreen(opts) {
    mountTo(<ErrorView width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} chartType={opts.type} runId={this.runId}></ErrorView>, this.targetNode);
  }

  targetElemValidate() {
    let errors = [];
    if (!this.targetNode) {
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