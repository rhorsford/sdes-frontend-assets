/**
 * Description: File retrieval from FileAPI for file upload functionality.
 * Author: David Birchall
 *
 */

HMRC.files = (function() {

  function init() {
    subscriptions();
  }

  function subscriptions() {
    events.on('drop', handleEvent.bind(this));
  }

  function handleEvent(event) {
    var filesArr = buildFilesArr(getFiles(event.fileEvent));

    // add the files added to the modelData
    events.emit('files', filesArr);
  }

  // gets all of the files either added through the file input event or drag and drop event
  function getFiles(event) {
    var files;
    if(event.target.files) {
      files = event.target.files;
    } else {
      files = event.dataTransfer.files;
    }
    return files;
  }

  // create an array of all the of the files so we can keep track of what files have been added
  function buildFilesArr(files) {
    var filesArr = [];
    Object.keys(files).forEach(function(key) {
      files[key].state = 'staged';
      files[key].retry = false;
      filesArr.push(files[key]);
    });
    return filesArr;
  }

  return {
    init: init,

    // Exposed for test
    getFiles: getFiles,
    buildFilesArr: buildFilesArr,
    handleEvent: handleEvent
  }

})();
