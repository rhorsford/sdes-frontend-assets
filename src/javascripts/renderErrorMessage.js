/**
 * Description: Document Object Model manipulation and page rendering.
 * Author: David Birchall
 *
 */

HMRC.renderErrorMessage = (function() {

  var error = {
    'heading' : 'There were problems with some documents',
    'message' : 'You need to remove the documents to continue',
    'link' : 'Remove all failed documents',
    'id': 'error'
  }

  var failed = {
    'heading' : 'Some documents failed to upload',
    'message' : 'You can try uploading the documents again, or continue without uploading them',
    'link' : 'Retry all failed documents',
    'id' : 'failed'
  }

    var status_failed = {
        'heading' : 'Some documents failed to upload',
        'message' : 'A network problem caused the file upload to fail. Wait a few minutes before trying again.',
        'link' : 'Retry all failed documents',
        'id' : 'failed'
    }
  function init() {
    cacheDom();
    watch();
  }

  function watch() {
    events.on('renderSummaryTable', clear.bind(this));
    events.on('applicationStateUpdated', render.bind(this));
  }

  function cacheDom() {
    messageDom = document.getElementById('upload-error-message');
  }

  function clear() {
    while (messageDom.firstChild) {
      messageDom.removeChild(messageDom.firstChild);
    }
  }

  function render(state) {

    while (messageDom.firstChild) {
      messageDom.removeChild(messageDom.firstChild);
    }

    switch(state) {
      case 'error':
        renderGlobalErrorMessage(error);
      break;
      case 'staged_error':
        renderGlobalErrorMessage(error);
      break;
      case 'valid_error':
        renderGlobalErrorMessage(error);
      break;
      case 'staged_valid_error':
        renderGlobalErrorMessage(error);
      break;
      case 'failed':
        renderGlobalErrorMessage(failed);
      break;
      case 'success_failed':
        renderGlobalErrorMessage(failed);
      break;
      case 'failed_cancelled':
        renderGlobalErrorMessage(failed);
      break;
      case 'success_failed_cancelled':
        renderGlobalErrorMessage(failed);
      break;
      case 'status_failed':
          renderGlobalInfoMessage(status_failed);
      break;
      default:
      break;

    }
  }


    var frag = document.createDocumentFragment();
    var message = document.createElement('div');
  function renderGlobalError(errorType) {
    
      // message.setAttribute('aria-labelledby','error-summary-validation-error');
      message.setAttribute('tabindex','-1');
      var heading = document.createElement('h2');
      heading.id = 'error-summary-heading';
      heading.className = 'h3-heading';
      // heading.setAttribute('tabindex','-1');
      heading.setAttribute('role','alert');
      heading.innerHTML = errorType.heading;
      var para = document.createElement('p');
      para.innerHTML = errorType.message;
      var link = document.createElement('a');
      link.id = errorType.id;
      link.innerHTML = errorType.link;
      link.href = '#';
      if(errorType.id === 'error') {
          link.addEventListener('click', removeAllLinkHandler, true);
      } else {
          link.addEventListener('click', retryAllLinkHandler, true);
      }
      message.appendChild(heading);
      message.appendChild(para);
      message.appendChild(link);
      frag.appendChild(message);
      messageDom.appendChild(frag);
      messageDom.firstChild.focus();
  }

  function renderGlobalErrorMessage(errorType) {
      renderGlobalError(errorType);
      message.className = 'flash error-summary error-summary--show';
  }


    function renderGlobalInfoMessage(errorType) {
        renderGlobalError(errorType);
      message.className = 'govuk-inset-text';
    }

  function removeAllLinkHandler(event) {
    event.preventDefault();
    events.emit('removeAll', event.target.id);
  }

  function retryAllLinkHandler(event) {
    event.preventDefault();
    events.emit('retryAll', event.target.id);
  }

  return {
    init: init,
  }

})();
