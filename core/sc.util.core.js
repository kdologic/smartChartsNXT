
/*
 * sc.util.core.js
 * @CreatedOn: 07-Apr-2016
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @description:SmartChartsNXT Core Library components. That contains util functionality.
 */


/*-----------SmartChartsNXT Utility functions------------- */

window.SmartChartsNXT.util = {};
window.SmartChartsNXT.util.mergeRecursive = function (obj1, obj2) {
    //iterate over all the properties in the object which is being consumed
    for (var p in obj2) {
        // Property in destination object set; update its value.
        if (obj2.hasOwnProperty(p) && typeof obj1[p] !== "undefined") {
            $SC.util.mergeRecursive(obj1[p], obj2[p]);
        } else {
            //We don't have that level in the heirarchy so add it
            obj1[p] = obj2[p];
        }
    }
}; /*End mergeRecursive()*/

window.SmartChartsNXT.util.extends = function (source1, source2) {

    /*
     * Properties from the Souce1 object will be copied to Source2 Object.
     * Note: This method will return a new merged object, Source1 and Source2 original values will not be replaced.
     * */
    var mergedJSON = Object.create(source2); // Copying Source2 to a new Object

    for (var attrname in source1) {
        if (mergedJSON.hasOwnProperty(attrname)) {
            if (source1[attrname] != null && source1[attrname].constructor == Object) {
                /*
                 * Recursive call if the property is an object,
                 * Iterate the object and set all properties of the inner object.
                 */
                mergedJSON[attrname] = $SC.util.mergeRecursive(source1[attrname], mergedJSON[attrname]);
            }

        } else { //else copy the property from source1
            mergedJSON[attrname] = source1[attrname];

        }
    }

    return mergedJSON;
}; /*End mergeRecursive()*/



window.SmartChartsNXT.util.getColor = function (index, ranbowFlag) {
    var Colors = {};
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
    var result;
    var count = 0;
    if (ranbowFlag) {
        index = index % 12;
        Colors.rainbow.length;
        for (var prop in Colors.rainbow)
            if (index === count++)
                result = Colors.rainbow[prop];
    } else {
        index = index % Colors.names.length;
        for (var prop in Colors.names)
            if (index === count++)
                result = Colors.names[prop];
    }

    return result;
}; /*End getColor()*/

window.SmartChartsNXT.util.colorLuminance = function (hex, lum) {
    /* validate hex string*/
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    /* convert to decimal and change luminosity*/
    var rgb = "#",
        c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    return rgb;
}; /*End colorLuminance()*/

window.SmartChartsNXT.util.saveAsImage = function (opts) {
    /*opts = {width:800, height:500, srcElem:"", type:"jpeg || png || svg", saveSuccess:null};*/
    var svgString;
    var loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
    if (loaderContainter) loaderContainter.parentNode.removeChild(loaderContainter);

    var bgColor = document.querySelector(opts.srcElem).style.background;

    if ((opts.type === "jpeg" || opts.type === "pdf") && (bgColor === "none" || bgColor.match(/transparent/gi))) {
        document.querySelector(opts.srcElem).style.background = "#FFF";
        svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
        document.querySelector(opts.srcElem).style.background = "none";
    } else {
        svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
    }
    document.querySelector(opts.srcElem).appendChild(loaderContainter);

    var img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));

    img.onload = function () {
        var today = new Date();
        var tzoffset = (today).getTimezoneOffset() * 60000; //offset in milliseconds
        today = (new Date(Date.now() - tzoffset));

        if (opts.type !== "svg") {
            var canvas = document.createElement("canvas");
            canvas.width = opts.width;
            canvas.height = opts.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
        }
        if (opts.printFlag === true) {
            var iframe = document.createElement("iframe");
            iframe.name = "chartFrame";
            iframe.id = "chartFrame";
            iframe.width = opts.width;
            iframe.height = opts.height;
            document.body.appendChild(iframe);
            iframe = document.querySelector('#chartFrame');
            iframe.contentWindow.document.write("<body><img style='width:100%;height:auto;' src='" + canvas.toDataURL("image/jpeg") + "' /></body.");
            window.frames["chartFrame"].focus();
            window.frames["chartFrame"].print();
            iframe.parentNode.removeChild(iframe);
            if (typeof opts.saveSuccess === "function")
                opts.saveSuccess.call(this);

        } else if (opts.type === "pdf") {
            var head = document.getElementsByTagName("head")[0];
            var pdfLib = document.createElement("script");
            pdfLib.type = "text/javascript";
            pdfLib.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.2.61/jspdf.min.js";
            pdfLib.onload = function () {
                var imgAsURL = canvas.toDataURL("image/jpeg");
                var doc = new jsPDF("l", "pt", "a4");
                doc.addImage(imgAsURL, 'JPEG', 0, 0);
                doc.output('save', 'smartCharts_' + today.toISOString().split(".")[0].replace("T", "_") + "." + opts.type);
                if (typeof opts.saveSuccess === "function")
                    opts.saveSuccess.call(this);
            };
            head.appendChild(pdfLib);

        } else {
            var imgAsURL = (opts.type === "svg") ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString) : canvas.toDataURL("image/" + opts.type);
            var link = document.createElement("a");
            link.href = imgAsURL;
            link.download = "smartCharts_" + today.toISOString().split(".")[0].replace("T", "_") + "." + opts.type;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (typeof opts.saveSuccess === "function")
                opts.saveSuccess.call(this);
        }
    };

}; /*End saveAsImage()*/

window.SmartChartsNXT.util.printChart = function (opts) {
    /*opts = {width:800, height:500, srcElem:"", saveSuccess:null};*/
    opts.printFlag = true;
    opts.type = "pdf";
    $SC.util.saveAsImage(opts);
}; /*End printChart()*/

window.SmartChartsNXT.util.assemble = function (literal, params) {
    return new Function(params, "return `" + literal + "`;"); // TODO: Proper escaping
}; /*End assemble()*/