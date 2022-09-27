'use strict';


/**
 * a11y.js
 * @createdOn:24-Sep-2020
 * @author:SmartChartsNXT
 * @description: A accessibility factory that used to write screen reader text from other components.
 * @extends Component
 */

class A11yFactory {
  constructor() {
    this._instances = {};
  }

  createInstance(runId, rootNode) {
    return this._instances[runId] = new A11yWriter(rootNode);
  }

  getWriter(runId) {
    return this._instances[runId];
  }
}

export class A11yWriter {
  constructor(rootNode) {
    this.rootNode = rootNode;
    this.parentNode = document.createElement('div');
    this.parentNode.setAttribute('class', 'sc-screen-reader-only');
    this.parentNode.setAttribute('aria-hidden', 'false');
    this.rootNode.insertAdjacentElement('afterbegin', this.parentNode);
    this.spaces = {};
  }

  createSpace(...spaceIds) {
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
        spaceElem.writeTimeoutID = null;
        this.spaces[spaceId] = spaceElem;
      }
    }
    return {
      config: (opts) => {
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

  write(spaceId, html, overWrite = true, throttle = 0) {
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