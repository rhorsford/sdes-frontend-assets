/**
 * Description: Event emitter for file upload functionality.
 * Author: David Birchall
 *
 */

var events = {
  events: {},
  on: function(eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      };
    }
  },
  emit: function(eventName, arg1, arg2, arg3) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(fn) {
        fn(arg1, arg2, arg3)
      })
    }
  }
};
