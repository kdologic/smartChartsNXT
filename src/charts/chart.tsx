'use strict';

import { Validator, CError } from '../validators/validator';
import { validationRules } from '../settings/validationRules';
import { mountTo } from '../viewEngin/pview';
import { IComponent } from '../viewEngin/component.model';
import BaseChart from '../base/baseChart.component';
import StoreManager from '../liveStore/storeManager';
import UtilCore from '../core/util.core';
import eventEmitter, { CustomEvents } from '../core/eventEmitter';
import ErrorView from '../components/errorView/errorView.component';
import a11yFactory from '../core/a11y';
import { Store } from '../liveStore/store';
import { IObject } from '../viewEngin/pview.model';

/*eslint-disable  no-console*/

/**
 * chart.tsx
 * @createdOn: 22-Oct-2017
 * @author: SmartChartsNXT
 * @description:This class will be the entry point of all charts.
 */

class Chart {
  private errors: CError[] = [];
  private runId: string;
  private config: Store;
  private validator: Validator;
  private targetNode: HTMLElement;
  private targetNodeWidth: number;
  private targetNodeHeight: number;
  private events: CustomEvents;
  private core: SVGElement | IComponent;
  private oldTargetWidth: number;
  private oldTargetHeight: number;
  private opts: IObject;

  constructor(opts: IObject) {
    try {
      if (!opts) {
        throw new CError('No configuration option found!');
      }
      this.runId = UtilCore.uuidv4();
      this.events = eventEmitter.createInstance(this.runId);
      this.showPopup = this.showPopup.bind(this);
      this.opts = opts;
      this.targetNode = typeof opts.targetElem === 'string' ? document.querySelector('#' + opts.targetElem) : opts.targetElem;
      this.errors = this.targetElemValidate();
      if (this.errors.length) {
        this.logErrors(opts);
        throw new CError('Target Node Validation failed!');
      }
      if (this.targetNode) {
        this.targetNodeWidth = this.targetNode.offsetWidth;
        this.targetNodeHeight = this.targetNode.offsetHeight;
      }
      /* Detect the element resize and re-draw accordingly */
      this.onResize = this.onResize.bind(this);
      this.bindResizeObserver();
      const storeId = StoreManager.createStore(this.runId, opts);
      this.config = StoreManager.getStore(storeId);
      this.validator = new Validator();
      this.errors = this.validator.validate(validationRules, opts);
      if (this.errors.length) {
        this.logErrors(opts);
        throw new CError('Validation failed!');
      }
      this.targetNode.setAttribute('runId', this.runId);
      this.targetNode.style.position = 'relative';

      /* For accessibility */
      this.targetNode.setAttribute('role', 'region');
      this.targetNode.setAttribute('aria-hidden', 'false');
      this.targetNode.setAttribute('aria-label', 'SmartchartsNXT interactive ' + this.config.getState().type);
      a11yFactory.createInstance(this.runId, this.targetNode);
      this.core = mountTo(<BaseChart opts={this.config.getState()} runId={this.runId} width={this.targetNodeWidth} height={this.targetNodeHeight} />, this.targetNode, 'vnode', null, {}, false);
      $SC.debug && console.debug(this.core);
    } catch (ex) {
      this.errors = [ex];
      this.logErrors(this.config.getState(), ex);
    }
  }

  bindResizeObserver() {
    if (!UtilCore.isIE) {
      const resizeObserver = new ResizeObserver((entries: Array<ResizeObserverEntry>) => {
        // We wrap it in requestAnimationFrame to avoid this error - ResizeObserver loop limit exceeded
        window.requestAnimationFrame(() => {
          if (!Array.isArray(entries) || !entries.length) {
            return;
          }
          for (const entry of entries) {
            this.onResize(entry.target as HTMLElement);
          }
        });
      });
      resizeObserver.observe(this.targetNode);
    } else if (window.$SC.IESupport && $SC.IESupport.ResizeObserver) {
      const ro = new $SC.IESupport.ResizeObserver((entries: any) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this.onResize({
            offsetWidth: width,
            offsetHeight: height
          } as any);
        }
      });
      ro.observe(this.targetNode);
    }
  }

  onResize(element: HTMLElement) {
    if (!this.errors.length && (this.oldTargetWidth !== element.offsetWidth || this.oldTargetHeight !== element.offsetHeight)) {
      const e = {
        data: {
          oldTargetWidth: this.targetNodeWidth,
          oldTargetHeight: this.targetNodeHeight,
          targetWidth: element.offsetWidth,
          targetHeight: element.offsetHeight
        }
      };
      this.events.emit('resize', e);
    }
    this.targetNodeWidth = element.offsetWidth;
    this.targetNodeHeight = element.offsetHeight;
    if (this.errors.length) {
      this.logErrors(this.opts);
    }
  }

  render() {
    this.errors = this.validator.validate(validationRules, this.config.getState());
    if (this.errors.length) {
      return this.logErrors(this.config.getState());
    }
    this.events.emitSync('render', this.config.getState());
  }

  showPopup(data: any) {
    this.events.emit('createPopup', data);
  }

  logErrors(opts: any, ex?: CError) {
    if (ex) {
      if (ex instanceof Array) {
        this.errors = ex;
      } else {
        console.error(ex);
      }
    }
    this.errors.forEach((err) => {
      console.error(opts.type + ': ' + err.message);
    });
    if (this.targetNode && opts) {
      this.showErrorScreen(opts);
    }
  }

  showErrorScreen(opts: any) {
    mountTo(<ErrorView width={this.targetNodeWidth} height={this.targetNodeHeight} chartType={opts.type} runId={this.runId}></ErrorView>, this.targetNode);
  }

  targetElemValidate() {
    let errors = [];
    if (!this.targetNode) {
      errors.push(new CError('Option.targetElem not found in current DOM !'));
    }
    return errors;
  }
}

export default Chart;