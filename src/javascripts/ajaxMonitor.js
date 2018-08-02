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

