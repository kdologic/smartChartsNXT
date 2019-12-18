'use strict';

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

  print(opts) {
    opts.type = 'print';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emit('beforePrint');
    }
    this.doConvert(opts);
  }

  pdf(opts) {
    opts.type = 'pdf';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emit('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  jpg(opts) {
    opts.type = 'jpg';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emit('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  png(opts) {
    opts.type = 'png';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emit('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  svg(opts) {
    opts.type = 'svg';
    if (opts.emitter && typeof opts.emitter.emit === 'function') {
      opts.emitter.emit('beforeSave', { type: opts.type });
    }
    this.doConvert(opts);
  }

  serialize(elemNode) {
    elemNode.querySelectorAll('remove-before-save').forEach((node) => {
      node.parentNode.removeChild(node);
    });
    return new XMLSerializer().serializeToString(elemNode);
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
    let svgString = this.normalizeCSS(this.serialize(document.querySelector(opts.srcElem)));
    if (opts.type === 'print') {
      let iframe = document.createElement('iframe');
      iframe.name = 'chartFrame';
      iframe.id = 'chartFrame';
      iframe.width = opts.width;
      iframe.height = opts.height;
      iframe.frameBorder = 0;

      iframe.onload = () => {
        let frameDoc = iframe.contentDocument;
        frameDoc.getElementsByTagName('body')[0].innerHTML = svgString;
        if (opts.width > opts.height) {
          let css = '@page { size: landscape; }',
            frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0],
            style = frameDoc.createElement('style');

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
        iframe.parentNode.removeChild(iframe);
        if (opts.emitter && typeof opts.emitter.emit === 'function') {
          opts.emitter.emit('afterPrint');
        }
      };
      document.body.appendChild(iframe);
    } else {
      let img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
      img.onload = () => {
        let today = new Date();
        let tzoffset = (today).getTimezoneOffset() * 60000; //offset in milliseconds
        let canvas;
        today = (new Date(Date.now() - tzoffset));

        if (opts.type !== 'svg' && opts.type !== 'print') {
          canvas = document.createElement('canvas');
          canvas.width = opts.width;
          canvas.height = opts.height;
          let ctx = this.setDPI(canvas, 1.5 * 96);
          ctx.drawImage(img, 0, 0, opts.width, opts.height);
        }

        if (opts.type === 'pdf') {
          if (opts.emitter && typeof opts.emitter.emit === 'function') {
            opts.emitter.emit('showLoader');
          }
          let head = document.getElementsByTagName('head')[0];
          let pdfLib = document.createElement('script');
          pdfLib.type = 'text/javascript';
          pdfLib.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js';
          pdfLib.onload = function () {
            let imgAsURL = canvas.toDataURL('image/jpeg');
            let orientation = opts.width > opts.height ? 'landscape' : 'portrait';
            /* eslint-disable-next-line new-cap, no-undef */
            let doc = new jsPDF(orientation, 'pt', [opts.width, opts.height]);
            doc.addImage(imgAsURL, 'JPEG', 0, 0, opts.width, opts.height);
            doc.output('save', 'smartChartsNXT_' + today.toISOString().split('.')[0].replace('T', '_') + '.' + opts.type);
            if (opts.emitter && typeof opts.emitter.emit === 'function') {
              opts.emitter.emit('afterSave', { type: opts.type });
            }
            if (opts.emitter && typeof opts.emitter.emit === 'function') {
              opts.emitter.emit('hideLoader');
            }
          };
          head.appendChild(pdfLib);
        } else {
          let imgAsURL = (opts.type === 'svg') ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<?xml version="1.0" encoding="utf-8"?>' + svgString) : canvas.toDataURL('image/' + opts.type);
          let link = document.createElement('a');
          link.href = imgAsURL;
          link.download = 'smartChartsNXT_' + today.toISOString().split('.')[0].replace('T', '_') + '.' + opts.type;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          if (opts.emitter && typeof opts.emitter.emit === 'function') {
            opts.emitter.emit('afterSave', { type: opts.type });
          }
        }
      };
    }
  }

  normalizeCSS(strSVG) {
    return strSVG
      .replace(/cursor:(.*?);/gi, 'cursor:auto;');
  }
}

export default new SaveAs();