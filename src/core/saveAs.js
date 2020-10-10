'use strict';

import utilCore from './util.core';

/**
 * saveAs.js
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

class SaveAs {

  mimeTypeMap = {
    'jpg': 'image/jpg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'bmp': 'image/bmp',
    'gif': 'image/gif',
    'svg': 'image/svg+xml'
  };

  print(opts) {
    opts.type = 'print';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emitSync('beforePrint');
    }
    this.doConvert(opts);
  }

  pdf(opts) {
    opts.type = 'pdf';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emitSync('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  jpg(opts) {
    opts.type = 'jpg';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emitSync('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  png(opts) {
    opts.type = 'png';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emitSync('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  svg(opts) {
    opts.type = 'svg';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emitSync('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  serialize(elemNode) {
    return new Promise((resolve, reject) => {
      elemNode.querySelectorAll('remove-before-save').forEach((node) => {
        node.parentNode.removeChild(node);
      });
      let allImages = elemNode.querySelectorAll('image');
      if (utilCore.isIE || allImages.length === 0) {
        resolve(new XMLSerializer().serializeToString(elemNode));
        return;
      }

      /* async Download and convert to Base64 for all external images that used in chart */
      let allPromises = [];
      allImages.forEach((image) => {
        const imgHref = image.getAttribute('href');
        const ext = (imgHref.match(/\.([^.]*?)(?=\?|#|$)/) || [])[1];
        if (imgHref && ext) {
          allPromises.push(
            this.toDataURL(imgHref, this.mimeTypeMap[ext])
              .then((base64url) => {
                image.insertAdjacentHTML('afterend', '<image class="image-before-save" x="' + (image.getAttribute('x') || 0) + '" y="' + (image.getAttribute('y') || 0) + '" width="' + (image.getAttribute('width') || 0) + '" height="' + (image.getAttribute('height') || 0) + '" href="' + base64url + '" preserveAspectRatio="' + (image.getAttribute('preserveAspectRatio') || 'none') + '"></image>');
                image.parentNode.removeChild(image);
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

  setDPI(canvas, dpi) {
    canvas.style.width = canvas.style.width || canvas.width + 'px';
    canvas.style.height = canvas.style.height || canvas.height + 'px';
    let scaleFactor = dpi / 96;
    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    let ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
    return ctx;
  }

  doConvert(opts) {
    let today = new Date();
    let tzoffset = (today).getTimezoneOffset() * 60000; //offset in milliseconds
    today = (new Date(Date.now() - tzoffset));
    const fileName = 'smartChartsNXT_' + today.toISOString().split('.')[0].replace('T', '_') + '.' + opts.type;

    this.serialize(document.querySelector(opts.srcElem).cloneNode(true))
      .then((serializedString) => {
        let svgString = this.normalizeCSS(serializedString);
        if (opts.type === 'print') {
          let iframe = document.createElement('iframe');
          iframe.name = 'chartFrame';
          iframe.id = 'chartFrame';
          iframe.width = opts.width;
          iframe.height = opts.height;
          iframe.frameBorder = 0;
          if (!utilCore.isIE) {
            iframe.srcdoc = svgString;
          }

          iframe.onload = () => {
            let frameDoc = iframe.contentDocument;
            if (utilCore.isIE) {
              frameDoc.getElementsByTagName('body')[0].innerHTML = svgString;
            }
            if (opts.width > opts.height) {
              let css = '@page { size: landscape; }';
              let frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
              let style = frameDoc.createElement('style');

              style.type = 'text/css';
              style.media = 'print';

              if (style.styleSheet) {
                style.styleSheet.cssText = css;
              } else {
                style.appendChild(frameDoc.createTextNode(css));
              }
              frameHead.appendChild(style);
            }

            window.frames['chartFrame'].focus();
            window.frames['chartFrame'].print();

            setTimeout(() => iframe.parentNode.removeChild(iframe));

            if (opts.emitter && typeof opts.emitter.emit === 'function') {
              opts.emitter.emit('afterPrint');
            }
          };
          document.body.appendChild(iframe);
        } else {
          let img = new Image();
          img.setAttribute('crossOrigin', 'anonymous');
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
          img.onload = () => {
            let canvas, vector;
            if (opts.type !== 'svg' && opts.type !== 'print') {
              if (utilCore.isIE) {
                if ($SC.IESupport && $SC.IESupport.Canvg) {
                  canvas = document.createElement('canvas');
                  canvas.style.position = 'absolute';
                  canvas.style.display = 'none';
                  document.body.appendChild(canvas);
                  canvas.width = opts.width;
                  canvas.height = opts.height;
                  let ctx = this.setDPI(canvas, 1.5 * 96);
                  vector = $SC.IESupport.Canvg.fromString(ctx, svgString);
                  vector.start();
                } else {
                  /*eslint-disable-next-line  no-alert*/
                  alert('Please include lib - SmartChartsNXT.IESupport for this feature !!');
                  if (opts.emitter && typeof opts.emitter.emit === 'function') {
                    opts.emitter.emit('afterSave', { type: opts.type });
                  }
                  return;
                }
              } else {
                canvas = document.createElement('canvas');
                canvas.width = opts.width;
                canvas.height = opts.height;
                let ctx = this.setDPI(canvas, 1.5 * 96);
                ctx.drawImage(img, 0, 0, opts.width, opts.height);
              }
            }

            if (opts.type === 'pdf') {
              if (opts.emitter && typeof opts.emitter.emit === 'function') {
                opts.emitter.emit('showLoader');
              }
              let head = document.getElementsByTagName('head')[0];
              let pdfLib = document.createElement('script');
              pdfLib.type = 'text/javascript';
              pdfLib.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js';
              pdfLib.onload = () => {
                let imgAsURL = canvas.toDataURL('image/jpeg');
                let orientation = opts.width > opts.height ? 'landscape' : 'portrait';
                /* eslint-disable-next-line new-cap, no-undef */
                let doc = new jsPDF(orientation, 'pt', [opts.width, opts.height]);
                doc.addImage(imgAsURL, 'JPEG', 0, 0, opts.width, opts.height);
                doc.output('save', fileName);
                if (utilCore.isIE && vector) {
                  vector.stop();
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
              let imgAsURL;
              if (utilCore.isIE) {
                imgAsURL = (opts.type === 'svg') ? (svgString) : canvas.toDataURL('image/' + opts.type);
              } else {
                imgAsURL = (opts.type === 'svg') ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<?xml version="1.0" encoding="utf-8"?>' + svgString) : canvas.toDataURL('image/' + opts.type);
              }
              this.download(imgAsURL, fileName, 'image/' + opts.type);
              if (utilCore.isIE && vector) {
                vector.stop();
                canvas.parentElement.removeChild(canvas);
              }
              if (opts.emitter && typeof opts.emitter.emit === 'function') {
                opts.emitter.emit('afterSave', { type: opts.type });
              }
            }
          };
        }
      }).catch((err) => {
        throw err;
      });
  }

  download(base64Data, fileName, mimeType) {
    const link = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';
    if (navigator.msSaveBlob) { // IE10, IE11
      if (mimeType === 'image/svg') {
        const blob = new Blob([base64Data], { type: 'image/svg+xml;charset=utf-8' });
        return navigator.msSaveBlob(blob, fileName);
      }
      const imageBlob = this.b64toBlob(base64Data.replace(/^[^,]+,/, '').replace('data:' + mimeType + ';base64,', ''), mimeType);
      return navigator.msSaveBlob(imageBlob, fileName);
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

  toDataURL(src, outputFormat) {
    return new Promise((resolve, reject) => {
      try {
        let img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = function () {
          let canvas = document.createElement('CANVAS');
          let ctx = canvas.getContext('2d');
          canvas.height = this.naturalHeight;
          canvas.width = this.naturalWidth;
          ctx.drawImage(this, 0, 0);
          let dataURL = canvas.toDataURL(outputFormat);
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

  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
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

  normalizeCSS(strSVG) {
    return strSVG
      .replace(/cursor:(.*?);/gi, 'cursor:auto;');
  }
}

export default new SaveAs();