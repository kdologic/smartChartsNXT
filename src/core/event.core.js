/*
 * event.core.js
 * @CreatedOn: 07-Apr-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @Description:SmartChartsNXT Core Library components. That will define all the event related activity functionality.
 */

//<-----core event list ----->
// afterRender
// onInit
// afterParseData
// beforePrint
// afterPrint
// beforeSave
// afterSave

"use strict";

let Event = require("./event"); 

class EventCore {

    /*This is a event object class */
    constructor() {
       this.Event = Event; 
    } /*End Event()*/

    /* Will attach a new event  */
    on(eventName, handler) {
        if (!this.eventList) {
            this.eventList = {};
        }
        if (!this.eventList[eventName]) {
            this.eventList[eventName] = [handler];
        } else {
            this.eventList[eventName].push(handler);
        }
    } /*End on()*/

    /* will detach a existing event */
    off(eventName, handler) {
        if (this.eventList && this.eventList[eventName]) {
            for (var i = 0; i < this.eventList[eventName].length; i++) {
                if (this.eventList[eventName][i] === handler) {
                    this.eventList[eventName].splice(i, 1);
                }
            }
        }
    } /*End off()*/

    /*Will fire a event of the sepecific event type */
    dispatchEvent(objEvent) {
        if (this.eventList) {
            for (var evt in this.eventList) {
                if (evt === objEvent.type) {
                    for (var i = 0; i < this.eventList[evt].length; i++) {
                        if (typeof this.eventList[evt][i] === "function") {
                            this.eventList[evt][i].call(this, objEvent);
                        }
                    }
                }
            }
        }
    } /*End dispatchEvent()*/
}

module.exports = EventCore;