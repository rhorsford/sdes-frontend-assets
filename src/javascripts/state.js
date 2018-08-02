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
