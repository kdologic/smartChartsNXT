/**
 * util.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @version: 1.1.0
 * @description:SmartChartsNXT Core Library components. That contains utillity functions.
 */


/*-----------SmartChartsNXT Utility functions------------- */

"use strict";

class UtilCore {
  constructor() {}

  mergeRecursive(obj1, obj2) {
    //iterate over all the properties in the object which is being consumed
    for (let p in obj2) {
      // Property in destination object set; update its value.
      if (obj2.hasOwnProperty(p) && typeof obj1[p] !== "undefined") {
        this.mergeRecursive(obj1[p], obj2[p]);
      } else {
        //We don't have that level in the heirarchy so add it
        obj1[p] = obj2[p];
      }
    }
  } /*End mergeRecursive()*/

  extends(source, source1) {
    /*
     * Properties from the Souce1 object will be copied to source Object.
     * Note: This method will return a new merged object, Source1 and source original values will not be replaced.
     * */
    let mergedJSON = source;
    for (let attrname in source1) {
      if (mergedJSON.hasOwnProperty(attrname)) {
        if (source1[attrname] != null && source1[attrname].constructor == Object) {
          /*
           * Recursive call if the property is an object,
           * Iterate the object and set all properties of the inner object.
           */
          mergedJSON[attrname] = this.extends(mergedJSON[attrname], source1[attrname]);
        } else { //else copy the property from source1
          mergedJSON[attrname] = source1[attrname];
        }
      } else { //else copy the property from source1
        mergedJSON[attrname] = source1[attrname];
      }
    }
    return mergedJSON;
  } /*End mergeRecursive()*/

  /**
   * Returns a number whose value is limited to the given range.
   *
   * Example: limit the output of this computation to between 0 and 255
   * (x * 255).clamp(0, 255)
   *
   * @param {Number} min The lower boundary of the output range
   * @param {Number} max The upper boundary of the output range
   * @returns A number in the range [min, max]
   * @type Number
   */
  clamp(min, max, val) {
    return Math.min(Math.max(val, min), max);
  }


  getColor(index, ranbowFlag) {
    let Colors = {};
    Colors.names = {
      "light-blue": "#95CEFF",
      "light-orange": "#ff9e01",
      "olive-green": "#b0de09",
      "coral": "#FF7F50",
      "light-seagreen": "#20B2AA",
      "gold": "#ffd700",
      "light-slategray": "#778899",
      "rust": "#F56B19",
      "mat-violet": "#B009DE",
      "violet": "#DE09B0",
      "dark-Orange": "#FF8C00",
      "mat-blue": "#09b0de",
      "mat-green": "#09DEB0",
      "ruscle-red": "#d9534f",
      "dark-turquoise": "#00CED1",
      "orchid": "#DA70D6",
      "length": 16
    };
    Colors.rainbow = {
      "red": "#ff0f00",
      "dark-orange": "#ff6600",
      "light-orange": "#ff9e01",
      "dark-yello": "#fcd202",
      "light-yellow": "#f8ff01",
      "olive-green": "#b0de09",
      "green": "#04d215",
      "sky-blue": "#0d8ecf",
      "light-blue": "#0d52d1",
      "blue": "#2a0cd0",
      "violet": "#8a0ccf",
      "pink": "#cd0d74",
      "length": 12
    };
    let result;
    let count = 0;
    if (ranbowFlag) {
      index = index % 12;
      Colors.rainbow.length;
      for (let prop in Colors.rainbow) {
        if (index === count++) {
          result = Colors.rainbow[prop];
        }
      }
    } else {
      index = index % Colors.names.length;
      for (let prop in Colors.names) {
        if (index === count++) {
          result = Colors.names[prop];
        }
      }
    }

    return result;
  } /*End getColor()*/

  colorLuminance(hex, lum) {
    /* validate hex string*/
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    /* convert to decimal and change luminosity*/
    let rgb = "#",
      c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }
    return rgb;
  } /*End colorLuminance()*/

  saveAsImage(opts) {
    /*opts = {width:800, height:500, srcElem:"", type:"jpeg || png || svg", saveSuccess:null};*/
    let svgString;
    let loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
    if (loaderContainter) {
      loaderContainter.parentNode.removeChild(loaderContainter);
    }
    let bgColor = document.querySelector(opts.srcElem).style.background;

    if ((opts.type === "jpeg" || opts.type === "pdf") && (bgColor === "none" || bgColor.match(/transparent/gi))) {
      document.querySelector(opts.srcElem).style.background = "#FFF";
      svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
      document.querySelector(opts.srcElem).style.background = "none";
    } else {
      svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
    }
    document.querySelector(opts.srcElem).appendChild(loaderContainter);

    let img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));

    img.onload = function () {
      let today = new Date();
      let tzoffset = (today).getTimezoneOffset() * 60000; //offset in milliseconds
      let canvas;
      today = (new Date(Date.now() - tzoffset));

      if (opts.type !== "svg") {
        canvas = document.createElement("canvas");
        canvas.width = opts.width;
        canvas.height = opts.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
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

  } /*End saveAsImage()*/

  printChart(opts) {
    /*opts = {width:800, height:500, srcElem:"", saveSuccess:null};*/
    opts.printFlag = true;
    opts.type = "pdf";
    this.saveAsImage(opts);
  } /*End printChart()*/

  assemble(literal, params) {
    return new Function(params, "return `" + literal + "`;"); // TODO: Proper escaping
  } /*End assemble()*/

  /* will generate Universally Unique IDentifier (UUID) RFC4122 version 4 compliant*/
  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  } /*End assemble()*/
}

export default new UtilCore();