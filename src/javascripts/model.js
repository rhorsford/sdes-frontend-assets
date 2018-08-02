/**
 * Description: Model for file upload functionality.
 * Author: David Birchall
 *
 */

HMRC.model = (function() {

  var modelData = {
    state: '',
    files: [],
    // messages: {}
  };

  function watch() {
    events.on('files', addFile.bind(this));
    events.on('remove', removeFile.bind(this));
    events.on('validationFailed', updateModel.bind(this));
    events.on('uploading', updateModel.bind(this));
    events.on('success', updateModel.bind(this));
    events.on('failed', updateModel.bind(this));
    events.on('status_failed', updateModel.bind(this));
    events.on('cancel', updateModel.bind(this));
    events.on('removeAll', removeAllFileType.bind(this));
    events.on('retryAll', retryAllFileType.bind(this));

    events.on('applicationStateUpdated', updateApplicationState.bind(this));
  }

  function updateApplicationState(state) {
    modelData.state = state;
    events.emit("modelUpdate", modelData);
  }

  function updateModel(modelData) {
    modelData.files = modelData.files;
    if(contains(modelData.files, 'error', 'state') || contains(modelData.files, 'failed', 'state') || contains(modelData.files, 'status_failed', 'state') && !contains(modelData.files, true, 'retry')) {
      modelData.files = reorder(modelData.files);
    }
    events.emit("updateApplicationState", modelData);
  }

  function addFile(data) {
    if (data.constructor === Array) {
      data.forEach(function(file) {
        file["uid"] = Math.random().toString().split(".")[1];
        if (modelData.files.filter(function(existingFile) {
            return existingFile.name === file.name
          }).length === 0) {
          file.status = 0;
          modelData.files.push(file);
        }
      }, this)
    }

    reorder(modelData.files);
    events.emit("updateApplicationState", modelData);
  }

  function contains(files, state, property) {
    return files.find(fileState.bind('this', state, property)) ? true : false;
  }

  function fileState(state, property, element, index, array) {
    return element[property] === state;
  };

  function removeFile(filePosition) {
    modelData.files.splice(filePosition, 1);
    events.emit("updateApplicationState", modelData);
  }

  function removeAllFileType(fileType) {
    for (var i = modelData.files.length -1; i >= 0; i--) {
      if(modelData.files[i].state === fileType) {
        modelData.files.splice(i, 1);
      }
    }
    events.emit("updateApplicationState", modelData);
    events.emit("ajaxComplete", modelData.state, true);
  }

  function retryAllFileType(fileType) {
    for (var i = modelData.files.length -1; i >= 0; i--) {
      if(modelData.files[i].state === fileType) {
        events.emit('retry', modelData.files[i].uid);
      }
    }
    events.emit("updateApplicationState", modelData);
    events.emit("ajaxComplete", modelData.state, true);
  }

  function reorder(files) {

    files.sort(function(file1, file2) {
      if (file1.state === 'error' && file2.state !== 'error') {
        return -1;
      } else if (file1.state !== 'error' && file2.state === 'error') {
        return 1;
      } else if (file1.state === 'error' && file2.state === 'error') {
        return file1.name.localeCompare(file2.name);
      }

      if (file1.state === 'failed' && file2.state !== 'failed') {
        return -1
      } else if (file1.state !== 'failed' && file2.state === 'failed') {
        return 1
      } else if (file1.state === 'failed' && file2.state === 'failed') {
        return file1.name.localeCompare(file2.name);
      }

      if (file1.state === 'status_failed' && file2.state !== 'status_failed') {
          return -1
      } else if (file1.state !== 'status_failed' && file2.state === 'status_failed') {
          return 1
      } else if (file1.state === 'status_failed' && file2.state === 'status_failed') {
          return file1.name.localeCompare(file2.name);
      }

      return file1.name.localeCompare(file2.name);
  });

    return files;
  }

  return {
    watch: watch,

    // exposed for testing
    addFiles: addFile,
    removeFiles: removeFile,
    data: modelData,
    reorder: reorder
  }

})();
