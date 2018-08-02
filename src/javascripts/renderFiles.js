/**
 * Description: Document Object Model manipulation and page rendering.
 * Author: David Birchall
 *
 */

HMRC.renderFiles = (function() {

  var modelData = {};

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    container = document.getElementById('table');
    title = document.getElementById('page-title');
    logger = document.getElementById('fail__logger');
  }

  function watch() {
    events.on('renderFiles', render.bind(this));

    events.on('validationFailed', render.bind(this));
    events.on('validationPassed', render.bind(this));

    events.on('modelUpdate', cacheData.bind(this));
    events.on('modelUpdate', render.bind(this));
  }

  function cacheData(modelData) {
    modelData = modelData;
  }

  function render(modelData) {
    cacheDom();

    var frag2 = document.createDocumentFragment();
    var frag = document.createDocumentFragment();

    modelData.files.forEach(function(file, index) {
      var fileContainer = document.createElement('div'),
        name = document.createElement('div'),
        nameText = document.createElement('span'),
        size = document.createElement('div'),
        status = document.createElement('div'),
        action = document.createElement('div');
      progressIndicator = document.createElement('div');

      fileContainer.className = 'file-list__file';
      fileContainer.id = file.uid;

      name.className = 'file-list__name';
      size.className = 'file-list__size';
      status.className = 'file-list__status';
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('aria-hidden', 'true');
      action.className = 'file-list__action';
      progressIndicator.className = 'file-list__progress-bar';

      nameText.innerHTML = file.name;
      size.innerHTML = formatBytes(file.size);

      switch(file.state) {
        case 'error':
          fileContainer.classList.add('file-list__file-error');
          status.innerHTML = file.message;
          var link = addLink('remove', 'remove', '', removeLinkHandler, index, 'remove ' + file.name);

          // remove me
          var span = document.createElement('span');
          span.innerHTML = file.name;
          span.className = 'visuallyhidden';
          link.appendChild(span);
          action.appendChild(link);
        break;
        case 'uploading':
          fileContainer.classList.add('file-list__uploading');
          progressIndicator.appendChild(addProgressBar(file.uid));
          status.innerHTML = '0%';
          action.appendChild(addLink('cancel', 'cancel', file.uid, cancelLinkHandler, index, file.name));
        break;
        case 'success':
          fileContainer.classList.add('file-list__uploading');
          progressIndicator.appendChild(addProgressBar(file.uid, 'complete'));
          status.innerHTML = '<strong>Complete</strong>';
        break;
        case 'cancelled':
          fileContainer.classList.add('file-list__cancelled');
          status.innerHTML = '<strong>Cancelled</strong>';
        break;
        case 'failed':
          fileContainer.classList.remove('file-list__uploading');
          fileContainer.classList.add('file-list__failed');
          status.innerHTML = file.message;
          action.appendChild(addLink('retry', 'retry', file.uid, retryLinkHandler, index, file.name));
        break;
          case 'status_failed':
                  fileContainer.classList.remove('file-list__uploading');
                  fileContainer.classList.add('file-list__failed');
                  status.innerHTML = file.message;
                  action.appendChild(addLink('retry', 'retry', file.uid, retryLinkHandler, index, file.name));
                break;
        default:
          action.appendChild(addLink('remove', 'remove', '', removeLinkHandler, index, file.name));
          gtag('config','UA-43414424-36',{'page_path': '/upload','page_title': 'Chose ' + file.name + 'to upload'});

        break;
      }

      name.appendChild(nameText);
      fileContainer.appendChild(name);
      fileContainer.appendChild(size);
      fileContainer.appendChild(action);
      fileContainer.appendChild(status);
      fileContainer.appendChild(progressIndicator);
      frag.appendChild(fileContainer);
    }, this);

    frag2.appendChild(frag);

    removeAllChildren(container);
    container.appendChild(frag2);
  }


  function addProgressBar(uid, state) {
    var frag = document.createDocumentFragment(),
      progress = document.createElement('progress'),
      div = document.createElement('div'),
      span = document.createElement('span');

    progress.id = 'progress-' + uid;
    progress.setAttribute('min', 0);
    progress.setAttribute('max', 1);

    state === 'complete' ? progress.setAttribute('value', 1) : progress.setAttribute('value', 0);

    div.appendChild(span);
    progress.appendChild(div);
    frag.appendChild(progress);

    return frag;
  }

  function addLink(text, className, id, evt, index, fileName) {
    var link = document.createElement('a');
    if(typeof text !== 'undefined') link.innerHTML = capitalizeFirstLetter(text);
    if(typeof id !== 'undefined') link.id = id;
    if(typeof className !== 'undefined') link.className = className;
    link.href = '#';
    link.role = 'button';
    if(typeof text !== 'undefined') link.title = fileName;
    if(typeof evt !== 'undefined') link.addEventListener('click', evt, true);
    if(typeof index !== 'undefined') link.setAttribute('data-file', index);
    return link;
  }

  function removeLinkHandler(event) {
    event.preventDefault();
    events.emit('remove', event.target.getAttribute('data-file'));
  }

  function retryLinkHandler(event) {
    event.preventDefault();
    events.emit('retry', event.target.id);
  }

  function cancelLinkHandler(event) {
    event.preventDefault();
    events.emit('cancelled', event.target.id);
  }

  function removeAllChildren(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1000,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return {
    init: init,
  }

})();
