/*
 * Event.js
 * @CreatedOn: 11-Jul-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @Description:SmartChartsNXT Core Library components. That will define Event class.
 */

"use strict";


class Event {

    /*This is a event object class */
    constructor(eventType, data) {
        this.cancelable = false;
        this.defaultPrevented = false;
        this.srcElement = null;
        this.timeStamp = new Date().getTime();
        this.type = eventType;
        for (var key in data) {
            this[key] = data[key];
        }
    }
}

module.exports = Event; 