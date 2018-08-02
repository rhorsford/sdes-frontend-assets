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
