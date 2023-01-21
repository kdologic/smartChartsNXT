declare global {
  interface Window {
    __h__: any;
    requestNextAnimationFrame: (callback: any) => void
  }
}

export type NodeType = 'rnode' | 'vnode';

export enum ElementTypeNS {
  svgNS = 'http://www.w3.org/2000/svg',
  htmlNS = 'http://www.w3.org/1999/xhtml'
}

export interface IObject {
  [key: string]: any
}

export interface IPrototype {
  prototype: IObject;
}

export interface IConfig {
  debug: boolean,
  debugRenderTime: boolean,
  svgNS: ElementTypeNS.svgNS,
  htmlNS: ElementTypeNS.htmlNS
};

export interface IAttrDiff {
  $added: any,
  $deleted: any,
  $updated: any,
  $object: any,
  $unchanged: any,
  length?: number
}

export interface INodeDiff {
  type: string,
  attributes?: IAttrDiff
}