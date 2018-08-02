/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderUploadButton = (function() {

  var buttonText = {
    'staged' : 'Continue to upload',
    'valid' : 'Continue to upload',
    'staged_error' : 'Continue to upload',
    'valid_error' : 'Continue to upload',
    'staged_valid_error' : 'Continue to upload',
    'success' : 'Submit',
    'failed' : 'Finish',
    'status_failed' : 'Finish',
    'cancelled' : 'Finish',
    'success_failed' : 'Submit successful uploads',
    'success_cancelled' : 'Submit',
    'failed_cancelled' : 'Finish',
    'success_failed_cancelled' : 'Submit successful uploads',
    'summary' : 'Sign out'
  }

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    button = document.getElementById('button');
  }

  function watch() {
    events.on('renderSummaryTable', render.bind(this));
    events.on('allUploadsComplete', render.bind(this));
    events.on('applicationStateUpdated', render.bind(this));
  }

  function render(state, complete) {

    removeAllChildren(button)

    switch(state) {
      case 'staged':
        button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', validate));
      break;
      case 'valid':
        button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', validate));
      break;
      case 'staged_error':
        button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', validate));
      break;
      case 'valid_error':
        button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', validate));
      break;
      case 'staged_valid_error':
        button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', validate));
      break;
      case 'success':
        if(complete) { button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', renderSummaryTable)) };
      break;
      case 'failed':
        if(complete) button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '/sdes/verified-landing'));
      break;
      case 'cancelled':
        console.log('cancelled');
        console.log(complete);
        if(complete) button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '/sdes/verified-landing'));
      break;
      case 'success_failed':
        if(complete) { button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', renderSummaryTable)) };
      break;
      case 'success_cancelled':
        if(complete) { button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', renderSummaryTable)) };
      break;
      case 'failed_cancelled':
        if(complete) button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '/sdes/verified-landing'));
      break;
        case 'status_failed':
            if(complete) button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '/sdes/verified-landing'));
            break;
      case 'success_failed_cancelled':
        if(complete) { button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', renderSummaryTable)) };
      break;
      case 'summary':
        if(complete) {
          button.appendChild(addButton(buttonText[state], 'button', 'upload-link', '#', signOut));
          button.appendChild(document.createElement('br'));
          button.appendChild(document.createElement('br'));
          var a = document.createElement('a');
            a.innerHTML = 'Upload and download documents';
            a.href = '/sdes/verified-landing';
          button.appendChild(a);
        };
      break;
      default:
        // don't add button
      break;
    }
  }

  function addButton(text, className, id, href, evt, index) {
    var button = document.createElement('a');
    if(typeof text !== 'undefined') button.innerHTML = capitalizeFirstLetter(text);
    if(typeof id !== 'undefined') button.id = id;
    if(typeof className !== 'undefined') button.className = className;
    if(typeof href !== 'undefined') button.href = href;
    if(typeof text !== 'undefined') button.title = text;
    button.role = button;
    if(typeof evt !== 'undefined') button.addEventListener('click', evt, true);
    if(typeof index !== 'undefined') button.setAttribute('data-file', index);
    return button;
  }

  // Validate button event handler
  function validate(event) {
    event.preventDefault();
    events.emit('validate', event);
  }

  function renderSummaryTable(event) {
    event.preventDefault();
    events.emit('renderSummaryTable', 'summary', true);
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function removeAllChildren(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function signOut(event) {
    event.preventDefault();
      $('#logout-form').submit();
  }

  return {
    init : init
  }

})();


