/*! http://mths.be/details v0.1.0 by @mathias | includes http://mths.be/noselect v1.0.3 */
;(function (document, $)
{

  var proto = $.fn,
    details,
    nextDetailsId = 1,
  // :'(
    isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]',
  // Feature test for native `<details>` support
    isDetailsSupported = (function (doc)
    {
      var el = doc.createElement('details'),
        fake,
        root,
        diff;
      if (!('open' in el))
      {
        return false;
      }
      root = doc.body || (function ()
        {
          var de = doc.documentElement;
          fake = true;
          return de.insertBefore(doc.createElement('body'), de.firstElementChild || de.firstChild);
        }());
      el.innerHTML = '<summary>a</summary><div>b</div>';
      el.style.display = 'block';
      root.appendChild(el);
      diff = el.offsetHeight;
      el.open = true;
      diff = diff != el.offsetHeight;
      root.removeChild(el);
      if (fake)
      {
        root.parentNode.removeChild(root);
      }
      return diff;
    }(document)),
    fixDetailContentId = function ($detailsNotSummary)
    {
      var $content = $detailsNotSummary.first();
      if (!$content.attr("id"))
      {
        $content.attr("id", "details-content-" + nextDetailsId++);
      }
    },
    toggleOpen = function ($details, $detailsSummary, $detailsNotSummary, toggle)
    {
      var isOpen = $details.prop('open'),
        close = isOpen && toggle || !isOpen && !toggle;
      if (close)
      {
        $details.removeClass('open').prop('open', false).removeAttr("open").triggerHandler('close.details');
        $detailsSummary.attr('aria-expanded', false);
        $detailsNotSummary.hide();
      }
      else
      {
        $details.addClass('open').prop('open', true).attr("open", "").triggerHandler('open.details');
        $detailsSummary.attr('aria-expanded', true);
        $detailsNotSummary.show();
      }
    };

  /* http://mths.be/noselect v1.0.3 */
  proto.noSelect = function ()
  {

    // Since the string 'none' is used three times, storing it in a variable gives better results after minification
    var none = 'none';

    // onselectstart and ondragstart for WebKit & IE
    // onmousedown for WebKit & Opera
    return this.bind('selectstart dragstart mousedown', function ()
    {
      return false;
    }).css({
      'MozUserSelect': none,
      'msUserSelect': none,
      'webkitUserSelect': none,
      'userSelect': none
    });

  };

  // Execute the fallback only if there’s no native `details` support
  if (isDetailsSupported)
  {

    details = proto.details = function ()
    {
      return this.each(function ()
      {
        var $details = $(this),
          $summary = $('summary', $details).first();

        if ($details.prop("details-initialised"))
          return;

        fixDetailContentId($details.children(':not(summary)'));

        $details.prop("details-initialised", true);
        $summary.attr({
          'role': 'button',
          'aria-expanded': $details.prop('open')
        }).on('click', function ()
        {
          // the value of the `open` property is the old value
          var isOpen = $details.prop('open');
          $summary.attr('aria-expanded', !isOpen);
          $details.toggleClass("open", !isOpen).triggerHandler((isOpen ? 'close' : 'open') + '.details');
        }).on("toggle-open", function ()
        {
          var opened = $details.prop('open');
          $details.prop("open", !opened);
          if (opened)
          {
            $details.removeClass("open").removeAttr("open");
          }
          else
          {
            $details.addClass("open").attr("open", "");
          }
          $summary.attr('aria-expanded', !opened);
          $details.triggerHandler((opened ? 'close' : 'open') + '.details');
        });
      });

    };

    details.support = isDetailsSupported;

  }
  else
  {

    details = proto.details = function ()
    {

      // Loop through all `details` elements
      return this.each(function ()
      {

        // Store a reference to the current `details` element in a variable
        var $details = $(this),
        // Store a reference to the `summary` element of the current `details` element (if any) in a variable
          $detailsSummary = $('summary', $details).first(),
        // Do the same for the info within the `details` element
          $detailsNotSummary = $details.children(':not(summary)'),
        // This will be used later to look for direct child text nodes
          $detailsNotSummaryContents = $details.contents(':not(summary)');

        if ($details.prop("details-initialised"))
        {
          return;
        }

        $details.attr("role", "group");
        $details.prop("details-initialised", true);

        // If there is no `summary` in the current `details` element…
        if (!$detailsSummary.length)
        {
          // …create one with default text
          $detailsSummary = $('<summary>').text('Details').prependTo($details);
        }

        $('<i>').addClass("arrow arrow-open").append(document.createTextNode("\u25bc")).prependTo($detailsSummary);
        $('<i>').addClass("arrow arrow-closed").append(document.createTextNode("\u25ba")).prependTo($detailsSummary);

        // Look for direct child text nodes
        if ($detailsNotSummary.length != $detailsNotSummaryContents.length)
        {
          // Wrap child text nodes in a `span` element
          $detailsNotSummaryContents.filter(function ()
          {
            // Only keep the node in the collection if it’s a text node containing more than only whitespace
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-microsyntaxes.html#space-character
            return this.nodeType == 3 && /[^ \t\n\f\r]/.test(this.data);
          }).wrap('<span>');
          // There are now no direct child text nodes anymore — they’re wrapped in `span` elements
          $detailsNotSummary = $details.children(':not(summary)');
        }

        fixDetailContentId($detailsNotSummary);

        // Hide content unless there’s an `open` attribute
        $details.prop('open', typeof $details.attr('open') == 'string');
        toggleOpen($details, $detailsSummary, $detailsNotSummary);

        // Add `role=button` and set the `tabindex` of the `summary` element to `0` to make it keyboard accessible
        $detailsSummary.attr('role', 'button').noSelect().prop('tabIndex', 0)
          .on('click', function ()
          {
            // Focus on the `summary` element
            $detailsSummary.focus();
            // Toggle the `open` and `aria-expanded` attributes and the `open` property of the `details` element and display the additional info
            toggleOpen($details, $detailsSummary, $detailsNotSummary, true);
          })
          .on("toggle-open", function ()
          {
            // Toggle the `open` and `aria-expanded` attributes and the `open` property of the `details` element and display the additional info
            toggleOpen($details, $detailsSummary, $detailsNotSummary, true);
          })
          .keyup(function (event)
          {
            if (32 == event.keyCode || (13 == event.keyCode && !isOpera))
            {
              // Space or Enter is pressed — trigger the `click` event on the `summary` element
              // Opera already seems to trigger the `click` event when Enter is pressed
              event.preventDefault();
              $detailsSummary.click();
            }
          });

      });

    };

    details.support = isDetailsSupported;
  }

  if (!isDetailsSupported)
  {
    $("html").addClass("no-details");
  }

  $(window).on("reapplyDetails", function ()
  {
    $("details").details();
  });

  $(function ()
  {
    $("details").details();
  });
}(document, jQuery));

/**
 * Description: Used to define global variables.
 * Last update: 2017/08/15
 * Author: David Birchall
 *
 */

try {
  document.body.classList.add('js-enabled');
} catch (e) {

}

var HMRC = {};

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

/**
 * Description: Monitors ajax requests and .
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

(function() {

    var ajaxInProgress = false;

    $(document).ajaxStart(function() {
        ajaxInProgress = true;
    })

    $(document).ajaxStop(function() {
        ajaxInProgress = false;
    })

    $(document).ajaxError(function (e, xhr, settings) {
        if (xhr.status === 401 || xhr.status === 403) {
            window.location.href = '/sdes/verified-landing';
        }
    })

    window.onbeforeunload = function () {
        if (ajaxInProgress) {
            return 'An upload is in progress, are you sure you want to leave this page?'
        }
    }

})();


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

/**
 * Description: Event emitter for file upload functionality.
 * Author: David Birchall
 *
 */

(function() {

  var Dropzone = {
    init: function(config) {
      this.config = config;
      if(this.config.dropzone !== null) {
        this.cacheDom();
        this.bindEvents();
      }
    },
    cacheDom: function() {
      this.dropzone = this.config.dropzone;
      this.input = this.dropzone.querySelector('#file');
    },
    bindEvents: function() {
      this.input.addEventListener('change', this.handleChange.bind(this));
      this.input.addEventListener('click', this.handleClick.bind(this));
      this.dropzone.addEventListener('dragover', this.handleDrag.bind(this));
      this.dropzone.addEventListener('dragleave', this.handleLeave.bind(this));
      this.dropzone.addEventListener('drop', this.handleDrop.bind(this));
    },
    callback: function(event) {
      events.emit('drop', {
        'fileEvent': event
      });
    },
    handleDrag: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this.dropzone.classList.add('dragover');
    },
    handleLeave: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this.dropzone.classList.add('dragleave');
    },
    handleDrop: function(event) {
      event.preventDefault();
      event.stopPropagation();
      this.dropzone.classList.remove('dragover');
      this.callback(event);
    },
    handleChange: function(event) {
      this.callback(event);
    },
    handleClick: function(event) {
      event.target.value = null;
    }
  }

  HMRC.dropzone = function(config) {
    return Dropzone.init(config);
  }

})();

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

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}

/**
 * Description: Creates an application state based on the aggregated state of the files being uploaded.
 * Author: David Birchall
 * Compatibility: IE10+
 *
 */

HMRC.state = (function() {

  function watch() {
    events.on('updateApplicationState', updateState.bind(this));
  }

  function updateState(modelData) {

    var arr = [],
      status = '',
      state = 0,
      files = modelData.files;

    if (files.some(stateCheck.bind(this, 'staged'))) arr.push('staged');
    if (files.some(stateCheck.bind(this, 'valid'))) arr.push('valid');
    if (files.some(stateCheck.bind(this, 'error'))) arr.push('error');
    if (files.some(stateCheck.bind(this, 'uploading'))) arr.push('uploading');
    if (files.some(stateCheck.bind(this, 'success'))) arr.push('success');
    if (files.some(stateCheck.bind(this, 'failed'))) arr.push('failed');
    if (files.some(stateCheck.bind(this, 'status_failed'))) arr.push('status_failed');
    if (files.some(stateCheck.bind(this, 'cancelled'))) arr.push('cancelled');

    status = arr.join('_');

    switch (status) {
      case 'staged':
        state = 'staged';
        break;
      case 'valid':
        state = 'valid';
        break;
      case 'error':
        state = 'error';
        break;
      case 'staged_error':
        state = 'staged_error';
        break;
      case 'valid_error':
        state = 'valid_error';
        break;
      case 'staged_valid':
        state = 'staged';
        break;
      case 'staged_valid_error':
        state = 'staged_valid_error';
        break;
      case 'uploading':
        $('#dragandrop').hide();
        state = 'uploading';
        break;
      case 'uploading_success':
        state = 'uploading';
        break;
      case 'uploading_failed':
        state = 'uploading';
        break;
      case 'uploading_cancelled':
        state = 'uploading';
        break;
      case 'uploading_success_failed':
        state = 'uploading';
        break;
      case 'uploading_success_cancelled':
        state = 'uploading';
        break;
      case 'uploading_success_failed_cancelled':
        state = 'uploading';
        break;
      case 'success':
        state = 'success';
        break;
      case 'failed':
        state = 'failed';
        break;
      case 'cancelled':
        state = 'cancelled';
        break;
      case 'success_failed':
        state = 'success_failed';
        break;
      case 'status_failed':
        state = 'status_failed';
        break;
      case 'success_cancelled':
        state = 'success_cancelled';
        break;
      case 'failed_cancelled':
        state = 'failed_cancelled';
        break;
      case 'success_failed_cancelled':
        state = 'success_failed_cancelled';
        break;
      default:
      break;
    }

    events.emit('applicationStateUpdated', state);

    if(!('Notification' in window)) {
        console.log("Browser does not support notifications");
    }else if(Notification.permission !== "granted") {
      events.emit('fileModelUpdated', modelData);
    }
  }

  function stateCheck(state, element, index, array) {
    return element.state === state;
  };

  return {
    watch: watch,
    updateState: updateState
  }

})();

/**
 * Description: Dom manipulation and page rendering.
 * Last update: 2017/07/17
 * Author: David Birchall <david.birchall@digital.hmrc.gov.uk>
 *
 */

HMRC.render = (function() {

    function init() {
        cacheDom();
        watch();
    }

    function cacheDom() {
        $container = $('#table');
        $dropContainer = $('#dragandrop');
        $restrictions = $('#upload--restrictions');
        $links = $container.find('.link');
        $input = $('#file');
        $state3 = $('.js-state-3');
    }

    function watch() {
        events.on('model', buildUI.bind(this));
    }

    function buildUI(data) {
        cacheDom();
        removeLinks();

        var status = data.appState,
            frag = document.createDocumentFragment();

        switch(data.appState) {
            case 1:
                updateTitle(data.files, 'Upload Documents');

                if(data.messages.size.length > 0 || data.messages.type.length > 0) {
                    frag.appendChild(buildMessage(data));
                }
                frag.appendChild(buildTable(data));
                frag.appendChild(buildUploadLink());
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                    frag.appendChild(buildResetLink(data));
                    frag.appendChild(buildBackLink());
                }
                render(frag);
                break;
            case 2:
                updateTitle(data.files, 'Upload Documents');

                if(data.messages.size.length > 0 || data.messages.type.length > 0) {
                    frag.appendChild(buildMessage(data));
                }
                frag.appendChild(buildTable(data));
                frag.appendChild(buildUploadLink());
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                    frag.appendChild(buildResetLink(data));
                    frag.appendChild(buildBackLink());
                }
                render(frag);
                break;
            case 3:
                $('#page-title').text('Your documents are uploading');

                $state3.show();
                $dropContainer.hide();
                $restrictions.hide();

                var noCancellations = data.files.filter(cancelled);

                if (noCancellations.length > 0) {
                    updateTitle(noCancellations, 'Your documents are uploading');
                }

                if(!data.files.some(progress)) {
                  if(data.files.some(failed)) {
                     updateTitle(data.files, 'Some of your documents didn\'t upload');
                     frag.appendChild(buildMessage(data));
                  }
                  else if (data.files.filter(success).length) {
                     updateTitle(data.files, 'Uploaded documents');
                     frag.appendChild(buildNotification(data));
                  }
                }

                frag.appendChild(buildTable(data));
                frag.appendChild(buildResetLink(data));
                frag.appendChild(buildBackLink());
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                    frag.appendChild(buildBackLink());
                }
                render(frag);
                break;
            default:
                updateTitle(data.files, "Upload Documents");
                $restrictions.show();
                frag.appendChild(buildTable(data));
                frag.appendChild(buildUploadLink());
                $dropContainer.show();
                if(data.files.length === 0) {
                    var emptyFrag = document.createDocumentFragment();
                    frag = emptyFrag;
                }
                render(frag);
        }

    }

    function render(frag) {
        if($container.children().length > 0) {
            $container.empty();
            $container.append(frag);
        } else {
            $container.append(frag);
        }
    }

    function removeLinks() {
        if($links.length > 0) {
            $links.forEach(function() {
                removeEventListener('click', this.clicked, true);
            }, this);
        }
    }

    function progress(element, index, array) {
        return element.state === IN_PROGRESS
    }

    function failed(element, index, array) {
        return element.state === FAILED
    }

    function success(element, index, array) {
        return element.state === SUCCESS
    }

    function error(element, index, array) {
        return element.state === ERROR
    }

    function cancelled(element, index, array) {
        return element.state === CANCELLED
    }

    function updateTitle(data, defaultMessage) {
        var $title = $('#page-title');

        if (data.some(success)) {
          $title.text('Uploaded Documents');
        } else if (data.some(failed) && data.some(cancelled)) {
          $title.text('Upload was Unsuccessful');
        } else if (data.some(error) || data.some(failed)) {
          $title.text('Some of your documents didn\'t upload');
        } else if (data.length === 0) {
          $title.text('Upload Documents');
        } else if (data.some(cancelled)) {
          $title.text('Your upload was cancelled');
        } else {
          $title.text(defaultMessage);
        }
      }

    function buildTable(data) {
        var frag = document.createDocumentFragment(),
            table = document.createElement('table');

        table.appendChild(buildHeadings(data));
        table.appendChild(buildBody(data));
        frag.appendChild(table);
        return frag;
    }

    function buildHeadings(data) {
        var thead = document.createElement('thead'),
            headRow = document.createElement('tr'),
            fileTitle = document.createElement('th'),
            statusTitle = document.createElement('th'),
            actionTitle = document.createElement('th');

        fileTitle.innerHTML = 'Your selected files';
        statusTitle.innerHTML = 'Status';
        actionTitle.innerHTML = '';

        if(data.appState === 0) {
            statusTitle.innerHTML = 'Size';
        }

        if(data.appState === 3) {
            fileTitle.innerHTML = 'File name'
        }

        headRow.appendChild(fileTitle);
        headRow.appendChild(statusTitle);
        headRow.appendChild(actionTitle);
        thead.appendChild(headRow);

        return thead;
    }

    function buildBody(data) {

        var tbody = document.createElement('tbody');

        data.files.forEach(function(file, index) {
            var row = document.createElement('tr'),
                name = document.createElement('td'),
                status = document.createElement('td'),
                remove = document.createElement('td');

            var escapedFilename = escapeHtml(file.name);

            switch(file.state) {
                case ERROR:
                    var link = document.createElement('a');
                    name.innerHTML = escapedFilename;
                    name.className = 'error';
                    status.innerHTML = file.message;
                    status.className = 'error-field';
                    status.setAttribute('name', 'validation-error');
                    link.innerHTML = 'Delete';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'delete';
                    link.id = 'delete-' + file.name;
                    remove.appendChild(link);
                    break;
                case PENDING:
                    var link = document.createElement('a');
                    name.innerHTML = escapedFilename;
                    status.innerHTML = data.status[PENDING];
                    link.innerHTML = 'Delete';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'delete';
                    link.id = 'delete-' + file.name;
                    remove.appendChild(link);
                    break;
                case IN_PROGRESS:
                    var link = document.createElement('a');
                    name.innerHTML = escapedFilename;
                    status.innerHTML = data.status[IN_PROGRESS];
                    link.innerHTML = 'Cancel';
                    link.addEventListener('click', cancel, true);
                    link.setAttribute('data-file', file.uid);
                    link.className = 'cancel';
                    link.id = 'cancel-' + file.name;
                    remove.appendChild(link);
                    break;
                case CANCELLED:
                    var link = document.createElement('a');
                    name.innerHTML = escapedFilename;
                    status.innerHTML = data.status[CANCELLED];
                    link.innerHTML = 'Delete';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'delete';
                    link.id = 'delete-' + file.name;
                    remove.appendChild(link);
                    break;
                case FAILED:
                    var link = document.createElement('a');
                    name.innerHTML = escapedFilename;
                    status.innerHTML = data.status[FAILED];
                    remove.appendChild(link);
                    break;
                case SUCCESS:
                    name.innerHTML = file.name;
                    status.innerHTML = data.status[SUCCESS];
                    name.id = 'success-' + file.name;
                    break;
                default:
                    var link = document.createElement('a');
                    name.innerHTML = escapedFilename;
                    status.innerHTML = formatBytes(file.size);
                    link.innerHTML = 'Remove';
                    link.addEventListener('click', removeLink, true);
                    link.setAttribute('data-file', index);
                    link.className = 'remove';
                    link.id = 'remove-' + file.name;
                    remove.appendChild(link);
            }
            row.appendChild(name);
            row.appendChild(status);
            row.appendChild(remove);
            tbody.appendChild(row);
        }, this);

        return tbody;
    }

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'`=\/]/g, function (s) {
            return entityMap[s];
        });
    }

    function removeLink(event) {
        events.emit('remove', event.target.dataset.file);
        if(event.target.className !== 'remove' && event.target.className !== 'delete') {
            events.emit('upload', event);
        }
    }

    function cancel(event) {
        events.emit('cancelled', event.target.dataset.file);
    }

    function clear(event) {
        events.emit('reset', {files: [], 'appState': 0 });
    }

    function buildMessage(data) {
        var frag = document.createDocumentFragment();

        var onlyInvalidFiles = data.files.filter(error);
        var onlyFailedFiles = data.files.filter(failed);

        if (onlyFailedFiles.length || onlyInvalidFiles.length) {
            var message = document.createElement('div'),
            heading = document.createElement('h2'),
            list = document.createElement('ul');

            message.className = 'flash error-summary error-summary-show';
            heading.id = 'error-summary-heading';
            heading.className = 'h3-heading';
            heading.innerHTML = 'There were problems with your documents'

            createMessageElement(onlyInvalidFiles, "notificationMessage").forEach(function(errorItem) {
                list.appendChild(errorItem);
            });

            createMessageElement(onlyFailedFiles, "message").forEach(function(errorItem) {
                list.appendChild(errorItem);
            });

            // Only append errors if there are any messages

            message.appendChild(heading);
            message.appendChild(list);
            frag.appendChild(message);
        }

        return frag;
    }

    function createMessageElement(files, messageFieldName) {
        var errorItems = [];

        for (var prop in files) {
            if (files.hasOwnProperty(prop) || (!!navigator.userAgent.match(/Trident\/7\./) && typeof files[prop] === "object")) {
                var errorItem = document.createElement('li'),
                    fileLink = document.createElement('a');

                fileLink.href = '#delete-' + files[prop].name;
                fileLink.innerHTML = files[prop][messageFieldName];

                errorItem.appendChild(fileLink);
                errorItems.push(errorItem);
            }
        }
        return errorItems;
    }

    function buildNotification(data) {
        var frag = document.createDocumentFragment(),
            container = document.createElement('div'),
            message = document.createElement('p');

            container.className = 'alert alert--success';
            container.role = 'alert';
            message.className = 'alert__message';
            message.innerHTML = 'You’ve uploaded your documents. <br>'
            container.appendChild(message);
            frag.appendChild(container);

            return frag;
    }

    function buildResetLink(data) {
        var resetLink = document.createElement('a');
        resetLink.innerHTML = 'Upload more documents';
        resetLink.id = "reset-link";
        resetLink.className = "button reset-ready";

        var isPending = data.files.filter(progress).length === 0;

        if (isPending) {
            resetLink.addEventListener('click', function(event) {
                event.preventDefault();
                events.emit('reset', {files: [], 'appState': 0});
                $dropContainer.show();
            });
        } else {
            resetLink.className = 'button disabled';
        }

        return resetLink;
    }

    function buildUploadLink() {
        var upload = document.createElement('div'),
            uploadLink = document.createElement('a');
            upload.className = 'confirmUpload';
            uploadLink.className = 'button';
            uploadLink.id = "upload-link";
            uploadLink.innerHTML = 'Check for errors and upload these files';
            uploadLink.addEventListener('click', function(event) {
                event.preventDefault();
                events.emit('upload', event);
            });
            upload.appendChild(uploadLink);
        return upload;
    }

    function buildBackLink() {
        var backLink = document.createElement('a');
        backLink.className = 'back';
        backLink.innerHTML = 'Back to dashboard';
        backLink.href = '/sdes/verified-landing';
        return backLink;
    }

    function formatBytes(bytes,decimals) {
       if(bytes == 0) return '0 Bytes';
       var k = 1000,
           dm = decimals || 2,
           sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
           i = Math.floor(Math.log(bytes) / Math.log(k));
       return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function getSnr(url) {
        var url_parts = url.replace(/\/\s*$/,'').split('/');
        url_parts.shift();
        return url_parts[url_parts.length - 1];
    }

    return {
        init: init,

        // Exposed for testing
        getSnr: getSnr,
        formatBytes: formatBytes,
        buildBackLink: buildBackLink,
        escapeHtml: escapeHtml
    }

})();
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

/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderProgressiveDisclosure = (function() {

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    disclosure = document.getElementById('progressive-disclosure');
  }

  function watch() {
    events.on('renderSummaryTable', render.bind(this));
    events.on('allUploadsComplete', render.bind(this));
    events.on('applicationStateUpdated', render.bind(this));
  }

  function render(state, complete) {

    removeAllChildren(disclosure)

    switch(state) {
      case 'failed':
        disclosure.appendChild(buildDetails());
          $("details").details();
      break;
      case 'status_failed':
            disclosure.appendChild(buildDetails());
            $("details").details();
      break;
      case 'success_failed':
        disclosure.appendChild(buildDetails());
          $("details").details();
      break;
      case 'failed_cancelled':
        disclosure.appendChild(buildDetails());
          $("details").details();
      break;
      case 'success_failed_cancelled':
        disclosure.appendChild(buildDetails());
          $("details").details();
      break;
      default:
        // don't add button
      break;
    }
  }

  function buildDetails() {
    var frag = document.createDocumentFragment();
    // details
    var details = document.createElement('details');

    var summary = document.createElement('summary');
      summary.role = 'button';
      summary.setAttribute('aria-expanded', false);
      summary.innerHTML = 'Having problems uploading documents?';

    var div = document.createElement('div');
      div.className = 'indent';

    var p = document.createElement('p');
    p.innerHTML = 'You can <a href="https://www.gov.uk/government/organisations/hm-revenue-customs/contact/secure-data-exchange-service-sdes" target="_blank">contact us (opens in a new tab).</a>';
    div.appendChild(p);

    details.appendChild(summary);
    details.appendChild(div);

    frag.appendChild(details);

    return frag;
  }

  function removeAllChildren(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  return {
    init : init
  }

})();

/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderSummaryContent = (function() {

  var files = {};

  var paragraphs = {
    para1: 'We\'ll check your documents and send them to the right department. We\'ll email you when they\'ve been delivered, or if there are any problems.',
    para2: 'The department will then carry out their own checks and contact you if they need to.',
  }

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    summaryContent = document.getElementById('summary-content');
  }

  function watch() {
    events.on('modelUpdate', getFiles.bind(this));
    events.on('renderSummaryTable', render.bind(this));
  }

  function getFiles(obj) {
    files = obj.files;
  }

  function render(state, complete) {


    while (summaryContent.firstChild) {
      summaryContent.removeChild(summaryContent.firstChild);
    }

    var frag = document.createDocumentFragment();

    // print link
    var paragraph = document.createElement('p');
    var link = document.createElement('a');
    link.className = 'print-link print-hidden js-visible';
    link.innerHTML = 'Print';
    link.onclick = function() {
      //ga('send', { 'hitType': 'pageview', 'page': '/uploadpage/document-uploaded', 'title': 'Uploaded Confirmation Printed' })
      gtag('config','UA-43414424-36',{'page_path': '/uploadpage/document-uploaded','page_title': 'Uploaded Confirmation Printed'})
    }
    link.href = 'javascript:window:print()';

    paragraph.appendChild(link);
    frag.appendChild(paragraph);

    // details
    var details = document.createElement('details');

    var summary = document.createElement('summary');
    summary.role = 'button';
    summary.setAttribute('aria-expanded', false);
    summary.innerHTML = 'What happens next?';

    var div = document.createElement('div');
    div.className = 'indent';

    Object.keys(paragraphs).forEach(function(key, index) {
      var p = document.createElement('p');
      p.innerHTML = paragraphs[key];
      div.appendChild(p);
    });

    details.appendChild(summary);
    details.appendChild(div);

    frag.appendChild(details);
    summaryContent.appendChild(frag);
      $("details").details();
  }


  return {
    init: init
  }

})();

/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderSummaryHeader = (function() {

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    summaryHeader = document.getElementById('page-title');
  }

  function watch() {
    events.on('modelUpdate', getFiles.bind(this));
    events.on('renderSummaryTable', render.bind(this));
  }

  function getFiles(obj) {
    files = obj.files;
  }

  function render(state, complete) {


    while (summaryHeader.firstChild) {
      summaryHeader.removeChild(summaryHeader.firstChild);
    }

    var frag = document.createDocumentFragment();

    // message banner
    var div = document.createElement('div');
      div.className = 'transaction-banner--complete';
    var h1 = document.createElement('h1');
      h1.className = 'transaction-banner__heading';

      var totalSuccessFiles = 0;
      files.forEach(function(file, index) {
          if(file.state === 'success') {
              totalSuccessFiles += 1;
          }
      });

      h1.innerHTML = (totalSuccessFiles > 1 ? ' Documents' : ' Document') + ' uploaded';
    var p = document.createElement('p');
      p.innerHTML = 'By ' + document.getElementById('user').getAttribute('value') + ' on ' + formatDate(new Date());

    div.appendChild(h1);
    div.appendChild(p);
    frag.appendChild(div);

    summaryHeader.appendChild(frag)
  }

  function formatDate(date) {
      var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  return {
    init : init
  }

})();

/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderSummaryTable = (function() {

  var files = {};

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    summaryTable = document.getElementById('table');
  }

  function watch() {
    events.on('modelUpdate', getFiles.bind(this));
    events.on('renderSummaryTable', render.bind(this));
  }

  function getFiles(obj) {
    files = obj.files;
  }

  function buildSummaryTable() {
    var frag = document.createDocumentFragment();
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    var totalSuccessFiles = 0;

    files.forEach(function(file, index) {
      if(file.state === 'success') {
        totalSuccessFiles += 1;
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerHTML = "<span class='visuallyhidden'>Filename </span>" + file.name;
        tr.appendChild(td);
        tbody.appendChild(tr);
      }
    });

    var th = document.createElement('th');
        th.innerHTML = '1-' + totalSuccessFiles + ' of ' + totalSuccessFiles + (totalSuccessFiles > 1 ? ' documents' : ' document');

    thead.appendChild(th)
    table.appendChild(thead);
    table.appendChild(tbody);
    frag.appendChild(table);

    return frag;
  }

  function render(state, complete) {
    while (summaryTable.firstChild) {
      summaryTable.removeChild(summaryTable.firstChild);
    }
    summaryTable.appendChild(buildSummaryTable())
  }

  return {
    init : init
  }

})();

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



/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */
/* global reportProblemAjaxUrl */

HMRC.reportProblem = (function () {

    var response = $('#error-state-ccs-links');
    var feedbackForms = function () {
        var $feedbackForms = $('.form--feedback');

        // we have javascript enabled so change hidden input to reflect this
        $feedbackForms.find('input[name=isJavascript]').attr('value', true)
    }

    var showErrorMessage = function () {
        //var response = '<p>There was a problem sending your query.</p><p>Please try again later.</p>'

        //reportErrorContainer().html(response)
        reportErrorContainer().append(response);
        response.removeClass('hidden');
        enableSubmitButton()
    }

    var errorCheck = function () {
        if (response.is(":visible")) {
            response.remove();
        }
        else {
            return
        }

    }

    var reportErrorContainer = function () {
        return $('.report-error__content')
    }

    var submitButton = function () {
        return reportErrorContainer().find('.button')
    }

    // TODO: should refactor to use Javascript debounce
    var disableSubmitButton = function () {
        submitButton().prop('disabled', true)
    }

    var enableSubmitButton = function () {
        submitButton().prop('disabled', false)
    }

    var showConfirmation = function (data) {
        reportErrorContainer().html(data.message)
    }

    var submit = function (form, url) {
        $.ajax({
            type: 'POST',
            url: url,
            data: $(form).serialize(),

            beforeSend: function (xhr) {
                disableSubmitButton()
                xhr.setRequestHeader('Csrf-Token', 'nocheck')
            },

            success: function (data) {
                showConfirmation(data)
                setupFormValidation()
                errorCheck()
            },

            error: function (jqXHR, status) {
                if (status === 'error' || !jqXHR.responseText) {
                    showErrorMessage()
                }
            }
        })
    }

    var load = function (url) {
        var $formContainer = $('#report-error-partial-form')

        $formContainer.load(reportProblemAjaxUrl, function (response, status, xhr) {
            setupFormValidation();
            feedbackForms()
        })
    }

    var configureToggle = function () {
        var reportErrorToggle = $('.report-error__toggle')

        reportErrorToggle.on('click', function (e) {
            var $errorContent = $('.report-error__content')

            if ($errorContent.has('form').length === 0) {
                // show the spinner
                $errorContent.removeClass('hidden')
                $errorContent.removeClass('js-hidden')
                // the form or the form's submission result is not there, load the HTML asynchronously using Ajax
                // and replace the spinner with the form markup
                load(decodeURIComponent(reportProblemAjaxUrl))
            } else {
                $errorContent.toggleClass('js-hidden')
            }

            // Preventing navigation ONLY if element has "href" attribute
            if (reportErrorToggle.attr('href')) {
                e.preventDefault()
            }
        })
    }

    var setupFormValidation = function () {
        var $errorReportForm = $('.report-error__content form')

        if ($errorReportForm) {
            // Initialise validation for the feedback form
            $errorReportForm.validate({
                errorClass: 'error-notification',
                errorPlacement: function (error, element) {
                    error.insertBefore(element)
                },

                // Highlight invalid input
                highlight: function (element, errorClass) {
                    $(element).parent().addClass('form-field--error')

                    // TODO: temp fix for form submission bug. Report a problem needs a rewrite
                    $errorReportForm.find('.button').prop('disabled', false)
                },

                // Unhighlight valid input
                unhighlight: function (element, errorClass) {
                    $(element).parent().removeClass('form-field--error')
                },

                // When all fields are valid perform AJAX call
                submitHandler: function (form) {
                    submit(form, $('.report-error__content form').attr('action'))
                }
            })
        }
    }


    var setup = function () {

        configureToggle();
        setupFormValidation();
        feedbackForms();
    }

    return {
        setup: setup,
    }

})();

/**
 * Description: File type and size validation.
 * Author: David Birchall
 *
 */

HMRC.validation = (function() {

    var files,
        illegalCharsRegex = /[<>:"/\\|?*]+/g,
        validated = true;

    function init() {
        watch();
    }

    function watch() {
        events.on('modelUpdate', getData.bind(this))
        events.on('validate', validateFiles.bind(this))
    }

    function validateFiles() {
        validate(files);
    }

    function validate(files) {

        files.forEach(function(file) {
            var ext = getExtension(file);

            // Prototype code
            var size = getSize(file);
            var type = getType(file);

            var fileMessage = [];

            file.state = 'valid';
            file.message = 'Ready to upload';
            var illegalChars = getIllegalChars(file.name);

            if (size > 10000000000) {
                file.state = 'error';
                fileMessage.push('Your document will not upload because it\'s too large');
            }

            if (type === 'exe') {
                file.state = 'error';
                fileMessage.push('Your document will not upload because it\'s in the wrong format');
            }

            if (illegalChars) {
                file.state = 'error';
                fileMessage.push('Your document will not upload because it contains illegal characters');
            }

            if (fileMessage.length > 0) {
                file.message = fileMessage;
            }

        }, this);

        var valid = files.some(hasError) ? false : true;

        if (valid) {
            events.emit('validationPassed', { 'files' : files });
        } else {
            events.emit('validationFailed', { 'files' : files });
        }
    }

    function getData(data) {
        files = data.files;
    }

    function getType(file) {
        var filename = file.name.toLowerCase();
        if (filename.indexOf('exe') >= 0) {
            return 'exe';
        };
    }

    function getSize(file) {
        return file.size;
    }

    function hasError(element, index, array) {
        return element.state === 'error';
    }

    function getExtension(file) {
        var filename = file.name.toLowerCase();
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }

    function getIllegalChars(filename) {
        return filename.match(illegalCharsRegex);
    }

    function formatBytes(bytes, decimals) {
        if (bytes === 0) return '0 Bytes';
        var k = 1000,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    return {
        init: init,

        // Exposed for testing
        formatBytes: formatBytes,
        getExtension: getExtension,
        validate: validate
    }

})();

HMRC.valid = (function () {


    var $forms;


    var renderGlobalErrorSummary = function (validator, errorMessages) {
        var $template = $('<li role="tooltip"><a></a></li>');
        var $errorSummaryListElement;

        if (errorMessages.length) {

            $(errorMessages).each(function (index, errorDetail) {
                $errorSummaryListElement = $template.clone();
                createErrorSummaryListItem($errorSummaryListElement, validator, errorDetail);
            });
        }
    };

    var createErrorSummaryListItem = function ($liElement, validator, errorDetail) {
        var $errorSummaryMessages = $(validator.currentForm).find('.js-error-summary-messages');
        var $anchorElement = $liElement.find('a');

        $anchorElement.attr('data-focuses', errorDetail.name)
            .attr('id', errorDetail.name + '-error')
            .attr('href', '#' + errorDetail.name)
            .text(errorDetail.message);
        $errorSummaryMessages.append($liElement);
    };

    /**
     * Clear the following for hidden inputs error messages, reset inputs and remove errors from validator.invalid
     * @param invalidInputs
     */
    var flushHiddenElementErrors = function (invalidInputs) {
        for (var inputName in invalidInputs) {
            var $elem = $('[name="' + inputName + '"]');

            if ($elem.is(':hidden') && ($elem.length > 1 && $elem.is('visible'))) {
                delete invalidInputs[inputName];
                $elem.closest('.form-field-group').removeClass('form-field-group--error');
            }
        }
    };


    var handleErrors = function (validator, submitted) {
        var $currentForm = $(validator.currentForm);
        var $errorSummary = $('.error-summary', $currentForm);
        var errorSummaryContainer = $errorSummary.find('.js-error-summary-messages');
        var errorMessages;

        // show default errors so the messages get updated before we extract them
        validator.defaultShowErrors();
        errorMessages = getErrorMessages();
        errorSummaryContainer.html('');

        flushHiddenElementErrors(validator.invalid);

        // on submit or the error summary is already displayed
        if (submitted || $errorSummary.is(':visible')) {
            if (errorMessages.length) {
                renderGlobalErrorSummary(validator, errorMessages, $errorSummary);
                $errorSummary.addClass('error-summary--show').removeClass('visuallyhidden');
            } else {
                $errorSummary.removeClass('error-summary--show');
            }
        } else { // inline error
            if (errorMessages.length) {
                renderGlobalErrorSummary(validator, errorMessages, $errorSummary);
                $errorSummary.addClass('visuallyhidden');
            } else {
                $errorSummary.removeClass('visuallyhidden');
            }
        }
    };

    /**
     * Get the current global error messages show on the form
     *
     * NOTE: this has been create because it is not possible to get all messages via the exposed .errorList or .invalid when
     * using custom errors sent in via data-msg-* rules there is a bug/feature where the message in .invalid is set to "true"
     * in certain circumstances. There is also a feature with .showErrors() interface supplying local and global error lists
     * dependant on blur/click/focus or submit actions. This function normalizes this.
     * @returns {Array}
     */
    var getErrorMessages = function () {
        var errorMessages = [];

        $('.error-notification').each(function (index, errorMessageElem) {
            var $errorMessageElem = $(errorMessageElem);
            var name = $errorMessageElem.attr('data-input-name');
            var error = {};

            // only interested in current error messages
            if (!$errorMessageElem.is(':hidden')) {
                error.name = name;
                error.message = $errorMessageElem.text();
                errorMessages.push(error);
            }
        });

        return errorMessages;
    };


    var setupForm = function ($formElem) {
        var submitted = false;
        var validator = $formElem.validate({
            onfocusout: false,
            errorPlacement: function ($error, $element) {
                var $formFieldGroup = $element.closest('.form-field-group');
                $formFieldGroup.find('.error-notification').text($error.text());
            },
            highlight: function (element) {
                $(element).closest('.form-field-group').addClass('form-field-group--error');
            },
            unhighlight: function (element) {
                $(element).closest('.form-field-group').removeClass('form-field-group--error');
            },
            showErrors: function () {
                handleErrors(validator, submitted);
                submitted = false;
            },
            submitHandler: function (form) {
                form.submit();
            },
            invalidHandler: function () {
                submitted = true;
                // When invalid submission, re-enable the submit button as the preventDoubleSubmit module disables the submit onSubmit
                $formElem.find('.button[type=submit]').prop('disabled', false);
            }
        });
    };

    var setupValidation = function () {
        $forms.each(function (index, elem) {
            setupForm($(elem));
        });
    };

    var setup = function () {
        $forms = $('.js-form');
    };

    var init = function () {
        setup();

        if ($forms.length) {
            setupValidation();
        }
    };


    return {
        init: init,

        // Exposed for testing
        // forma
        // tBytes: formatBytes,
        //  getExtension: getExtension,
        //validate: validate
    }
})();

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
/**
 * Description: Used to execute scripts.
 * Author: David Birchall
 *
 */

HMRC.dropzone({
  dropzone: document.getElementById('dragandrop')
});
HMRC.files.init();
HMRC.model.watch();
HMRC.state.watch();
HMRC.renderErrorMessage.init();
HMRC.renderFiles.init();
HMRC.renderPageTitle.init();
HMRC.renderProgressiveDisclosure.init();
HMRC.renderSummaryHeader.init();
HMRC.renderSummaryTable.init();
HMRC.renderSummaryContent.init();
HMRC.renderUploadButton.init();
HMRC.reportProblem.setup();
HMRC.notify.watch();
HMRC.upload.init();
HMRC.message.watch();
HMRC.validation.init();
HMRC.valid.init();
