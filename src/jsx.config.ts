import { IVnode } from "./viewEngin/component.model";

declare global {
  namespace JSX {
    // The return type of our JSX Factory: this could be anything
    type Element = IVnode;

    // IntrinsicElementMap grabs all the standard HTML and SVG tags in the TS DOM lib.
    interface IntrinsicElements extends IntrinsicElementMapSvg, IntrinsicElementMapHtml, IntrinsicElementMapCustom { }

    // The following are custom types, not part of TS's known JSX namespace:
    type IntrinsicElementMapHtml = {
      [K in keyof HTMLElementTagNameMap]: {
        [k: string]: any
      }
    }

    type IntrinsicElementMapSvg = {
      [K in keyof SVGElementTagNameMap]: {
        [k: string]: any
      }
    }

    //support custom html element with lower-case name
    type IntrinsicElementMapCustom = {
      ['x-div']: any
    }
  }
}

export { };
