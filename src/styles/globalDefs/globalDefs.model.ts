import { IGradient } from "../gradients/gradients.model";
import { IDefImageFill, IPattern } from "../patterns/patterns.model";

export interface IGlobalDefs {
  patterns?: IPattern[],
  gradients?: IGradient[],
  imagesFill?: IDefImageFill[]
};