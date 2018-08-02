/**
 * Description: Used to display notifications.
 * Author: David Birchall
 * Compatability: IE9+
 *
 * e.g. events.emit('notify', { 'title' : 'string', 'options' : {} })
 *
 */

HMRC.notify = (function() {

  function watch() {
    events.on("notify", notification.bind(this));
  }

  function notification(data) {

    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notifications');
    } else if (Notification.permission === 'granted') {
      var notification = new Notification(data.title, data.options);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function(permission) {
        if (permission === 'granted') {
          var notification = new Notification(data.title, data.options);
        }
      });
    }
  }

  return {
    watch: watch,
    notification: notification
  }

})();
