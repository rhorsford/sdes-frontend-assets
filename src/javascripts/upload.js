/**
 * Description: File upload using ajax and form object.
 * Author: David Birchall
 *
 */

HMRC.upload = (function() {

  var requests = [],
    files = {},
    modelData = [],
    cancelled = '',
    uploadRestrictions = undefined;

  function init() {
    watch();
  }

  function cacheDom() {
    uploadRestrictions = document.getElementById('upload--restrictions');
  }

  function watch() {
    events.on('modelUpdate', getFiles.bind(this));
    events.on('validationPassed', upload.bind(this));
    events.on('cancelled', cancel.bind(this));
    events.on('retry', retry.bind(this));
  }

  function getFiles(obj) {
    files = obj.files;
    modelData = obj;
  }

  function upload(modelData) {
    modelData.files.forEach(function(file) {
      file.state = 'uploading';
    }, this);

    $('#upload--restrictions').hide();
    $('#back').hide();

    events.emit('uploading', {
      'files': modelData.files
    });

    formData(files)
  }

  function formData(files) {
    var formObj = [];

    jQuery.each(files, function(i, file) {
      var obj = new FormData();
      obj.append('file-' + i, file);
      formObj.push([obj, file.uid]);
    });
    ajax(files, formObj);
  }

  function search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].uid === nameKey) {
        var item = myArray[i];
        item.state = 'uploading';
        return item;
      }
    }
  }

  function update(uid, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].uid === uid) {
        var file = myArray[i];
        file.state = 'uploading';
        file.retry = true;
      }
    }
  }

  function retry(file) {

    update(file, files);

    events.emit('uploading', {
      'files': files
    });

    var arr = [];
    arr.push(search(file, files));
    formData(arr);
  }

  function cancel(uid) {
    function withId(r) {
      return r.uniqueId === uid;
    }
    cancelled = uid;
    requests.find(withId).abort()
  }

  function ajax(files, formObj) {

    requests = [];
    formObj.forEach(function(item) {

      var fileFormData = item[0];
      var fileUid = item[1];

      var xhr = $.ajax({
        xhr: function() {
          var xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener('progress', function(evt) {
            if (evt.lengthComputable) {
              var percentComplete = evt.loaded / evt.total;
              var progress = Math.round(percentComplete * 100) + '% uploaded...';
              document.getElementById(fileUid).querySelector('.file-list__progress-bar > progress').value = percentComplete;
              document.getElementById(fileUid).querySelector('.file-list__status').innerHTML = progress;
            }
          }, false);
          return xhr;
        },
        url: '/zuul/sdes/upload',
        enctype: 'multipart/form-data',
        type: 'POST',
        data: fileFormData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data, status, jqXHR) {

                files.map(updateState(jqXHR.uniqueId, 'success'));
                events.emit('success', {
                    'files': files,
                });
                events.emit('notify', {
                    'title': 'File upload successful',
                    'options': {
                        'body': 'Completed uploading file: ' + files.find(findWithId(jqXHR)).name
                    }
                });

        },
        error: function(jqXHR, textStatus, errorThrown) {

            if(jqXHR.status===503) {
                console.log('503');
                files.map(updateState(jqXHR.uniqueId, 'status_failed'));
                files.map(setMessage(jqXHR, 'Failed to upload'));
                events.emit('failed', {
                    'files': files,
                });
                events.emit('notify', {
                    'title': 'Error Status 503: File upload failed',
                    'options': {
                        'body': 'A network problem caused the file upload to fail. Wait a few minutes before trying again.'
                    }
                });
            } else if (textStatus === 'abort') {
            files.map(updateState(jqXHR.uniqueId, 'failed'));
            files.map(updateState(cancelled, 'cancelled'));
            events.emit('failed', {
              'files': files,
            });
          } else {
            files.map(updateState(jqXHR.uniqueId, 'failed'));
            files.map(setMessage(jqXHR, 'Failed to upload '));
            events.emit('failed', {
              'files': files,
            });
            events.emit('notify', {
              'title': 'File upload failed',
              'options': {
                'body': 'Failed to upload file: ' + files.find(findWithId(jqXHR)).name
              }
            });
          }
        },
      })

      xhr.uniqueId = fileUid;
      requests.push(xhr);

      $(document).ajaxStop(function() {

        events.emit('allUploadsComplete', modelData.state, true);
      });
    }, this);

    function retryUpload(event) {
      events.emit('retry', event.target.dataset.file);
    }

    function findWithId(jqXHR) {
      return function findFile(md) {
        return md.uid === jqXHR.uniqueId
      };
    }

    function updateState(id, status) {
      return function setAs(md) {
        if (md.uid === id) {
          return md.state = status;
        } else return md;
      };
    }

    function setMessage(jqXHR, msg) {
      return function setAs(md) {
        if (md.uid === jqXHR.uniqueId) {
          return md.message = msg;
        } else return md;
      };
    }

  }

  return {
    init: init,
  }

})();

$(function () {
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader('X-CSRF-TOKEN', $("input[name=_csrf]" ).val());
    });
});