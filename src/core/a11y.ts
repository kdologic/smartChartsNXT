'use strict';

import { IA11yWriterStore } from "../models/global.models";
import { IObject } from "../viewEngin/pview.model";


/**
 * a11y.js
 * @createdOn:24-Sep-2020
 * @author:SmartChartsNXT
 * @description: A accessibility factory that used to write screen reader text from other components.
 */

class A11yFactory {
  private _instances: IA11yWriterStore;

  constructor() {
    this._instances = {};
  }

  createInstance(runId: string, rootNode: Element): A11yWriter {
    return this._instances[runId] = new A11yWriter(rootNode);
  }

  getWriter(runId: string): A11yWriter {
    return this._instances[runId];
  }
}

export class A11yWriter {
  private rootNode: Element;
  private parentNode: Element;
  private spaces: IObject

  constructor(rootNode: Element) {
    this.rootNode = rootNode;
    this.parentNode = document.createElement('div');
    this.parentNode.setAttribute('class', 'sc-screen-reader-only');
    this.parentNode.setAttribute('aria-hidden', 'false');
    this.rootNode.insertAdjacentElement('afterbegin', this.parentNode);
    this.spaces = {};
  }

  createSpace(...spaceIds: string[]) {
    if (!spaceIds) {
      return {};
    }
    for (let s = 0; s < spaceIds.length; s++) {
      let spaceId = spaceIds[s];
      if (!this.spaces[spaceId]) {
        let spaceElem = document.createElement('div');
        spaceElem.setAttribute('id', spaceId);
        spaceElem.setAttribute('class', 'sc-screen-reader-only');
        spaceElem.setAttribute('aria-hidden', 'false');
        this.parentNode.appendChild(spaceElem);
        (spaceElem as any).writeTimeoutID = null;
        this.spaces[spaceId] = spaceElem;
      }
    }
    return {
      config: (opts: IObject) => {
        for (let s = 0; s < spaceIds.length; s++) {
          if (opts.attrs) {
            for (let attr in opts.attrs) {
              this.spaces[spaceIds[s]].setAttribute(attr, opts.attrs[attr]);
            }
          }
        }
      }
    };
  }

  write(spaceId: string, html: string, overWrite: boolean = true, throttle: number = 0) {
    let spaceElem = this.spaces[spaceId];
    if (spaceElem) {
      if (overWrite) {
        spaceElem.innerHTML = '';
      }

      if (throttle) {
        if (spaceElem.writeTimeoutID) {
          clearTimeout(spaceElem.writeTimeoutID);
        }
        spaceElem.writeTimeoutID = setTimeout(() => {
          spaceElem.writeTimeoutID = null;
          spaceElem.insertAdjacentHTML('beforeend', html);
        }, throttle);
      } else {
        spaceElem.insertAdjacentHTML('beforeend', html);
      }
    }
  }
}

export default new A11yFactory();