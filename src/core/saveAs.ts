'use strict';

import { MIME_TYPE, PDF_LIB_SRC } from '../global/global.constants';
import { SAVE_AS } from '../global/global.enums';
import { IObject } from '../viewEngin/pview.model';
import { IRemoveNodeInfo, ISaveAsOptions } from './core.model';
import UtilCore from './util.core';
declare global {
  interface Window {
    jsPDF: any
  }
}

/**
 * saveAs.ts
 * @createdOn:02-Feb-2018
 * @author:SmartChartsNXT
 * @description:This will convert HTML/SVG into downloadable image or PDF or print the Chart.
 *
 * @example
 * opts: {
 *    width:  // Total width of SVG
 *    height: // Total height of SVG,
 *    srcElem:// element ID of root
 * }
 *
 * @event Supported Events:
 * 1. beforeSave
 * 2. afterSave
 * 3. beforePrint
 * 4. afterPrint
 *
 */

/*
 Limitations of IE:
   1.  IE11 was unable to convert the SVG into base64 data URL. So, using Canvg v3.0.5 (https://github.com/canvg/canvg) to achieve the same.

   Found some limitation with Canvg usage -
   2.  Canvg unable to handle filter properly, few filter attributed are still unsupported there.
   3.  Canvg can't handle image inside filter it become blank.
   4.  Canvg can't handle multiple level of transformations, after conversion elements may get off-positioned.
   5.  Canvg don't have support for foreignObject. So before download rich text components are converted into plain text to render into downloaded image. I.E. Title and subtitle.
*/

class SaveAs {
  private mimeTypeMap: { [key: string]: string } = MIME_TYPE;
  private removedNodesForIE: IRemoveNodeInfo[] = [];
  public print = this.saveAsByType;
  public pdf = this.saveAsByType;
  public jpg = this.saveAsByType;
  public png = this.saveAsByType;
  public svg = this.saveAsByType;

  saveAsByType(opts: ISaveAsOptions): void {
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      if (opts.type === SAVE_AS.PRINT) {
        opts.emitter.emitSync('beforePrint');
      } else {
        opts.emitter.emitSync('beforeSave', { type: opts.type });
      }
    }
    this.doConvert(opts);
  }

  serialize(elemNode: SVGAElement): Promise<string> {
    return new Promise((resolve, reject) => {
      this.removedNodesForIE = [];
      elemNode.querySelectorAll('remove-before-save').forEach((node) => {
        if (UtilCore.isIE) {
          this.removedNodesForIE.push({ parentNode: node.parentNode, node: node });
        }
        node.parentNode.removeChild(node);
      });

      elemNode.querySelectorAll('.show-before-save').forEach((node) => {
        node.classList.remove('sc-hide');
        node.classList.remove('sc-hide-ie');
      });

      const allImages = elemNode.querySelectorAll('image');
      if (UtilCore.isIE || allImages.length === 0) {
        resolve(new XMLSerializer().serializeToString(elemNode));
        return;
      }

      /* async Download and convert to Base64 for all external images that used in chart */
      let allPromises: Promise<string | void>[] = [];
      allImages.forEach((image) => {
        const imgHref = image.getAttribute('href');
        const ext = (imgHref.match(/\.([^.]*?)(?=\?|#|$)/) || [])[1];
        if (imgHref && ext) {
          allPromises.push(
            this.toDataURL(imgHref, this.mimeTypeMap[ext])
              .then((base64url: string) => {
                if (base64url) {
                  image.insertAdjacentHTML('afterend', '<image class="image-converted" x="' + (image.getAttribute('x') || 0) + '" y="' + (image.getAttribute('y') || 0) + '" width="' + (image.getAttribute('width') || 0) + '" height="' + (image.getAttribute('height') || 0) + '" href="' + base64url + '" preserveAspectRatio="' + (image.getAttribute('preserveAspectRatio') || 'none') + '"></image>');
                  image.parentNode?.removeChild(image);
                }
                return base64url;
              })
              .catch((ex) => {
                reject(ex);
              })
          );
        }
      });
      Promise.all(allPromises)
        .then(() => {
          resolve(new XMLSerializer().serializeToString(elemNode));
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  }

  setDPI(canvas: HTMLCanvasElement, dpi: number): CanvasRenderingContext2D {
    canvas.style.width = canvas.style.width || canvas.width + 'px';
    canvas.style.height = canvas.style.height || canvas.height + 'px';
    const scaleFactor: number = dpi / 96;
    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
    return ctx;
  }

  doConvert(opts: ISaveAsOptions) {
    let today: Date = new Date();
    const timeZoneOffset: number = (today).getTimezoneOffset() * 60000; //offset in milliseconds
    today = (new Date(Date.now() - timeZoneOffset));
    const fileName: string = 'smartChartsNXT_' + today.toISOString().split('.')[0].replace('T', '_') + '.' + opts.type;
    const svgRoot: SVGAElement = document.querySelector(opts.srcElem);

    /*
      CloneNode in IE 11 create erroneous values on patterns elements that fails Canvg to work properly so remove for IE 11.
      Also drop shadow filter, create distorted and faded canvas images. Better to avoid it for IE 11.
    */
    let elemNode: SVGAElement = (UtilCore.isIE ? svgRoot : svgRoot.cloneNode(true)) as SVGAElement;
    this.serialize(elemNode)
      .then((serializedString: string) => {
        let svgString = this.normalizeCSS(serializedString);
        if (opts.type === SAVE_AS.PRINT) {
          let iframe = document.createElement('iframe');
          iframe.name = 'chartFrame';
          iframe.id = 'chartFrame';
          iframe.width = opts.width.toString();
          iframe.height = opts.height.toString();
          iframe.frameBorder = '0';
          if (!UtilCore.isIE) {
            iframe.srcdoc = svgString;
          }

          iframe.onload = () => {
            let frameDoc = iframe.contentDocument;
            if (UtilCore.isIE) {
              frameDoc.getElementsByTagName('body')[0].innerHTML = svgString;
            }
            if (opts.width > opts.height) {
              let css = '@page { size: landscape; }';
              let frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
              let style: any = frameDoc.createElement('style');

              style.type = 'text/css';
              style.media = 'print';

              if (style.styleSheet) {
                style.styleSheet.cssText = css;
              } else {
                style.appendChild(frameDoc.createTextNode(css));
              }
              frameHead.appendChild(style);
            }

            (window.frames as any)['chartFrame'].focus();
            (window.frames as any)['chartFrame'].print();

            setTimeout(() => iframe.parentNode.removeChild(iframe));

            if (opts.emitter && typeof opts.emitter.emit === 'function') {
              opts.emitter.emit('afterPrint');
            }
          };
          document.body.appendChild(iframe);
        } else {
          let img: HTMLImageElement = new Image();
          img.setAttribute('crossOrigin', 'anonymous');
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
          img.onload = () => {
            let imgAsURL: string;
            if (opts.type === SAVE_AS.SVG) {
              if (UtilCore.isIE) {
                imgAsURL = svgString;
              } else {
                imgAsURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<?xml version="1.0" encoding="utf-8"?>' + svgString);
              }
              this.download(imgAsURL, fileName, this.mimeTypeMap[opts.type]);
              if (opts.emitter && typeof opts.emitter.emit === 'function') {
                opts.emitter.emit('afterSave', { type: opts.type });
              }
            } else {
              this.createCanvasForDownload(img, svgString, opts)
                .then((data: { canvas: HTMLCanvasElement, vector?: IObject }) => {
                  let { canvas, vector } = data;
                  if (opts.type === 'pdf') {
                    if (opts.emitter && typeof opts.emitter.emit === 'function') {
                      opts.emitter.emit('showLoader');
                    }
                    const head = document.getElementsByTagName('head')[0];
                    const pdfLib = document.createElement('script');
                    pdfLib.type = 'text/javascript';
                    pdfLib.src = PDF_LIB_SRC;
                    pdfLib.onload = () => {
                      const imgAsURL: string = canvas.toDataURL('image/jpeg');
                      const orientation = opts.width > opts.height ? 'landscape' : 'portrait';
                      if (window.jsPDF) {
                        let doc = new window.jsPDF(orientation, 'pt', [opts.width, opts.height]);
                        doc.addImage(imgAsURL, 'JPEG', 0, 0, opts.width, opts.height);
                        doc.output('save', fileName);
                      }
                      if (UtilCore.isIE && vector) {
                        canvas.parentElement.removeChild(canvas);
                      }
                      if (opts.emitter && typeof opts.emitter.emit === 'function') {
                        opts.emitter.emit('afterSave', { type: opts.type });
                      }
                      if (opts.emitter && typeof opts.emitter.emit === 'function') {
                        opts.emitter.emit('hideLoader');
                      }
                    };
                    head.appendChild(pdfLib);
                  } else {
                    /* For other image type JPEG, PNG */
                    imgAsURL = canvas.toDataURL(this.mimeTypeMap[opts.type]);
                    this.download(imgAsURL, fileName, this.mimeTypeMap[opts.type]);
                    if (UtilCore.isIE && vector) {
                      canvas.parentElement.removeChild(canvas);
                    }
                    if (opts.emitter && typeof opts.emitter.emit === 'function') {
                      opts.emitter.emit('afterSave', { type: opts.type });
                    }
                  }
                });
            }
          };
        }
      })
      .then(() => {
        this.removedNodesForIE.forEach((nodeElem: IRemoveNodeInfo) => {
          nodeElem.parentNode.appendChild(nodeElem.node);
        });
        elemNode.querySelectorAll('.show-before-save').forEach((node) => {
          node.classList.add(UtilCore.isIE ? 'sc-hide-ie' : 'sc-hide');
        });
      }).catch((err) => {
        throw err;
      });
  }

  createCanvasForDownload(img: HTMLImageElement, svgString: string, opts: ISaveAsOptions): Promise<{ canvas: HTMLCanvasElement, vector?: IObject }> {
    let canvas: HTMLCanvasElement;
    return new Promise((resolve, reject) => {
      if (UtilCore.isIE) {
        if ($SC.IESupport && $SC.IESupport.Canvg) {
          canvas = document.createElement('canvas');
          canvas.style.position = 'absolute';
          canvas.style.display = 'none';
          canvas.width = opts.width;
          canvas.height = opts.height;
          document.body.appendChild(canvas);
          let ctx = this.setDPI(canvas, 1.5 * 96);
          $SC.IESupport.Canvg.from(ctx, svgString, { anonymousCrossOrigin: true })
            .then((v: IObject) => { // vector is type Canvg
              v.render().then(() => resolve({ canvas, vector: v }));
            })
            .catch((ex: Error) => {
              reject(ex);
            });
        } else {
          /*eslint-disable-next-line  no-alert*/
          alert('Please include lib - SmartChartsNXT.IESupport for this feature !!');
          if (opts.emitter && typeof opts.emitter.emit === 'function') {
            opts.emitter.emit('afterSave', { type: opts.type });
          }
          reject('Please include lib - SmartChartsNXT.IESupport for this feature !!');
          return;
        }
      } else {
        canvas = document.createElement('canvas');
        canvas.width = opts.width;
        canvas.height = opts.height;
        let ctx = this.setDPI(canvas, 1.5 * 96);
        ctx.drawImage(img, 0, 0, opts.width, opts.height);
        resolve({ canvas });
      }
    });
  }

  download(base64Data: string, fileName: string, mimeType: string) {
    const link = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';
    if ((navigator as any).msSaveBlob) { // for IE10, IE11
      if (mimeType === 'image/svg+xml') {
        const blob = new Blob([base64Data], { type: 'image/svg+xml;charset=utf-8' });
        return (navigator as any).msSaveBlob(blob, fileName);
      }
      const imageBlob = this.b64toBlob(base64Data.replace(/^[^,]+,/, '').replace('data:' + mimeType + ';base64,', ''), mimeType);
      return (navigator as any).msSaveBlob(imageBlob, fileName);
    }

    if ('download' in link) { //html5 A[download]
      link.href = base64Data;
      link.setAttribute('download', fileName);
      link.innerHTML = 'downloading...';
      document.body.appendChild(link);
      setTimeout(function () {
        link.click();
        document.body.removeChild(link);
      }, 66);
      return true;
    }


    //do iframe dataURL download (old ch+FF):
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    frame.src = base64Data;
    setTimeout(function () {
      document.body.removeChild(frame);
    }, 333);
    return true;
  }

  toDataURL(src: string, outputFormat: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        let img: HTMLImageElement = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = function () {
          let canvas: HTMLCanvasElement = document.createElement('canvas');
          let ctx = canvas.getContext('2d');
          canvas.height = (this as HTMLImageElement).naturalHeight;
          canvas.width = (this as HTMLImageElement).naturalWidth;
          ctx.drawImage((this as HTMLImageElement), 0, 0);
          let dataURL: string = canvas.toDataURL(outputFormat);
          resolve(dataURL);
        };
        img.src = src;
        if (img.complete || img.complete === undefined) {
          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
          img.src = src;
        }
      } catch (e) {
        reject(e);
        throw new Error(e);
      }
    });
  }

  b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  normalizeCSS(strSVG: string) {
    return strSVG
      .replace(/cursor:(.*?);/gi, 'cursor:auto;');
  }
}

export default new SaveAs();