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
