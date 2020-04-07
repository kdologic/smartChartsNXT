import Canvg from 'canvg';

class IESupport {
  constructor() {
    this.Canvg = Canvg;
  }
}

if(window.$SC) {
  window.$SC.IESupport = new IESupport();
}

export default new IESupport();