/*
 * sc.geom.core.js
 * @CreatedOn: 07-Apr-2016
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @description:SmartChartsNXT Core Library components. That will define all the event related activity functionality.
 */

/*This is a event object class */
 window.SmartChartsNXT.Event = function (eventType, data) {
    this.cancelable = false;
    this.defaultPrevented = false;
    this.srcElement = null;
    this.timeStamp = new Date().getTime();
    this.type = eventType;
    for (var key in data) {
      this[key] = data[key];
    }
  };

  /* Will attach a new event  */
  window.SmartChartsNXT.on = function (eventName, handler) {
    if (!this.eventList)
      this.eventList = {};
    if (!this.eventList[eventName])
      this.eventList[eventName] = [handler];
    else
      this.eventList[eventName].push(handler);
  };

/* will detach a existing event */
  window.SmartChartsNXT.off = function (eventName, handler) {

  };

/*Will fire a event of the sepecific event type */
  window.SmartChartsNXT.dispatchEvent = function (objEvent) {
    if (this.eventList) {
      for (var evt in this.eventList) {
        if (evt === objEvent.type) {
          
          for (var i = 0; i < this.eventList[evt].length; i++) {
            if (typeof this.eventList[evt][i] === "function")
              this.eventList[evt][i].call(this);
          }

        }
      }
    }
  };