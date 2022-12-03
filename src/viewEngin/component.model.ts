import { Component } from "./component";
import { IObject } from "./pview.model";

export type CustomComponent<T extends Component> = {
  (...args: any[]): IVnode;
  new(...args: any[]): T;
}

export interface IVnode {
  nodeName: string | CustomComponent<Component> | Component,
  attributes: IObject,
  children: Array<IVnode> | Array<string> | null,
  class?: CustomComponent<Component>
}

export interface IComponent {
  node: SVGElement | HTMLElement | Text,
  children: IComponent[],
  eventStack: { (data?: unknown): unknown }[],
  self?: Component
}

export interface IReferenceNode {
  node: SVGElement | HTMLElement | Text
  children: Array<IReferenceNode>,
  self?: Component
}