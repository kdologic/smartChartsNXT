"use strict";

/** 
 * saveAs.js
 * @createdOn:02-Feb-2018
 * @author:SmartChartsNXT
 * @description:This will convert HTML/SVG into downloadable image or PDF or print the Chart. 
 * 
 * Sample opts: {
 *  width: //Total width of SVG 
 *  height://Total height of SVGthis.props.svgHeight, 
 *  srcElem:// element ID of root 
 * }
 */

class SaveAs {

  print(opts) {
    opts.type = 'pdf';
    opts.printFlag = true; 
    this.doConvert(opts);
  }
  
  pdf(opts) {
    opts.type = 'pdf';
    opts.printFlag = false; 
    this.doConvert(opts);
  }

  jpeg(opts) {
    opts.type = 'jpeg';
    opts.printFlag = false; 
    this.doConvert(opts);
  }

  png(opts) {
    opts.type = 'png';
    opts.printFlag = false; 
    this.doConvert(opts);
  }

  svg(opts) {
    opts.type = 'svg';
    opts.printFlag = false; 
    this.doConvert(opts);
  }

  serialize(elemNode, type){
    let bgColor = elemNode.style.background, svgString;
    if ((type === "jpeg" || type === "pdf") && (bgColor === "none" || bgColor.match(/transparent/gi))) {
      elemNode.style.background = "#FFF";
      svgString = new XMLSerializer().serializeToString(elemNode);
      elemNode.style.background = bgColor;
    } else {
      svgString = new XMLSerializer().serializeToString(elemNode);
    }
    return svgString; 
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
    let svgString = this.serialize(document.querySelector(opts.srcElem), opts.type);
    let img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
    
    img.onload = () => {
      let today = new Date();
      let tzoffset = (today).getTimezoneOffset() * 60000; //offset in milliseconds
      let canvas;
      today = (new Date(Date.now() - tzoffset));

      if (opts.type !== "svg") {
        canvas = document.createElement("canvas");
        canvas.width = opts.width;
        canvas.height = opts.height;
        let ctx = this.setDPI(canvas, 300);
        ctx.drawImage(img, 0, 0, opts.width, opts.height);
      }

      if (opts.printFlag === true) {
        let iframe = document.createElement("iframe");
        iframe.name = "chartFrame";
        iframe.id = "chartFrame";
        iframe.width = opts.width;
        iframe.height = opts.height;
        document.body.appendChild(iframe);
        iframe = document.querySelector('#chartFrame');
        iframe.contentWindow.document.write("<body><img style='width:100%;height:auto;' src='" + canvas.toDataURL("image/jpeg") + "' /></body.");
        setTimeout(function () {
          window.frames["chartFrame"].focus();
          window.frames["chartFrame"].print();
          iframe.parentNode.removeChild(iframe);
          if (typeof opts.saveSuccess === "function") {
            opts.saveSuccess.call(this);
          }
        }, 0);
      } else if (opts.type === "pdf") {
        let head = document.getElementsByTagName("head")[0];
        let pdfLib = document.createElement("script");
        pdfLib.type = "text/javascript";
        pdfLib.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.2.61/jspdf.min.js";
        pdfLib.onload = function () {
          if (typeof opts.beforeSave === "function") {
            opts.beforeSave.call(this);
          }
          let imgAsURL = canvas.toDataURL("image/jpeg");
          let doc = new jsPDF("l", "pt", "a4");
          doc.addImage(imgAsURL, 'JPEG', 0, 0);
          doc.output('save', 'smartCharts_' + today.toISOString().split(".")[0].replace("T", "_") + "." + opts.type);
          if (typeof opts.saveSuccess === "function") {
            opts.saveSuccess.call(this);
          }
        };
        head.appendChild(pdfLib);

      } else {
        let imgAsURL = (opts.type === "svg") ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString) : canvas.toDataURL("image/" + opts.type);
        let link = document.createElement("a");
        link.href = imgAsURL;
        link.download = "smartCharts_" + today.toISOString().split(".")[0].replace("T", "_") + "." + opts.type;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (typeof opts.saveSuccess === "function") {
          opts.saveSuccess.call(this);
        }
      }
    };
  }
}

export default new SaveAs(); 