/**
 * Description: Page title rendering.
 * Author: David Birchall
 *
 */

HMRC.renderPageTitle = (function() {

  var title = {
    'staged' : 'Choose documents to upload',
    'valid' : 'Choose documents to upload',
    'error' : 'Choose documents to upload',
    'uploading' : 'Your documents are uploading',
    'success' : 'Your documents uploaded successfully ',
    'status_failed' : 'There\'s a problem with some of your uploads',
    'failed' : 'There\'s a problem with your uploads',
    'cancelled' : 'All your uploads have been cancelled',
    'success_failed' : 'There\'s a problem with some of your uploads',
    'success_cancelled' : 'Your documents have finished uploading',
    'failed_cancelled' : 'There\'s a problem with some of your uploads',
    'success_failed_cancelled' : 'There\'s a problem with some of your uploads'
  }

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    titleDOM = document.getElementById('page-title');
  }

  function watch() {
    events.on('allUploadsComplete', render.bind(this));
    events.on('applicationStateUpdated', render.bind(this));
    events.on('fileModelUpdate', fileModelUpdate.bind(this));
  }

  function render(state, complete) {
    cacheDom();
    switch(state) {
      case 'staged':
        titleDOM.innerHTML = title[state];
      break;
      case 'valid':
        titleDOM.innerHTML = title[state];
      break;
      case 'error':
        titleDOM.innerHTML = title[state];
      break;
      case 'uploading':
        titleDOM.innerHTML = title[state];
      break;
      case 'success':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      case 'failed':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      case 'cancelled':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      case 'success_failed':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      case 'status_failed':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      case 'success_cancelled':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      case 'failed_cancelled':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      case 'success_failed_cancelled':
        if(complete) titleDOM.innerHTML = title[state];
      break;
      default:
      break;
    }
  }

  function fileModelUpdate(dataModel) {

    var result = dataModel.files.filter(function(obj){
      return obj.state == "success";
    });

    if(result.length > 0) {
      titleDOM.innerHTML = result.length + " of " + dataModel.files.length + " files";
    }
  }

  return {
    init: init
  }

})();
