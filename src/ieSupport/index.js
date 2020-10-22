import Canvg from 'canvg';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

class IESupport {
  constructor() {
    this.Canvg = Canvg;
    this.ResizeObserver = ResizeObserverPolyfill;
  }
}

if (window.$SC) {
  window.$SC.IESupport = new IESupport();
}

export default new IESupport();