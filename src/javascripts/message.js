/**
 * Description: Used to create and render messages (info, success, warning, error).
 * Author: David Birchall
 * Compatability: IE9+
 *
 * To just create an info message you can use 'your message'
 * e.g. events.emit('message', 'your message');
 *
 * To specify a message type (info, success, warning, erorr) use { 'message': 'message', 'type': 'info' }
 * e.g. events.emit('message', { 'message': 'sample message', 'type': 'info' });
 *
 * To specify a container for the message
 */

HMRC.message = (function() {

  function init() {
    watch();
  }

  function watch() {
    events.on('message', createMessage.bind(this));
  }

  function createMessage(data) {
    typeof(data.container) !== 'undefined' ? render(buildMessage(data), data.container) : render(buildMessage(data));
  }

  function buildMessage(data) {

    var type = '',
        message = '';

    if(typeof data === 'object') {
      message = data.message;
      type = data.type;
    } else {
      message = data;
    }

    var frag = document.createDocumentFragment(),
        container = document.createElement('div'),
        text = document.createElement('p');

    container.className = 'alert alert--' + (type || 'info');
    container.role = 'alert';
    text.className = 'alert__message';
    text.innerHTML = message;
    container.appendChild(text);
    frag.appendChild(container);

    return frag;
  }

  function render(message, container) {
    var messageContainer = container || document.getElementById('messages');
    while(messageContainer.firstChild) {
        messageContainer.removeChild(messageContainer.firstChild);
    }
    messageContainer.appendChild(message);
  }

  return {
    init    : init,
    watch   : watch,
    message : createMessage,
    render  : render
  }

})();
