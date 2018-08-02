$(function () {

    function ieCheck() {
        var ua = window.navigator.userAgent;
        if (ua.indexOf("Trident/7.0") > 0)
            return $('#error-summary-display').removeClass('hidden');
        // else if (ua.indexOf("Trident/6.0") > 0)
        //     return 10; //IE 10
        // else if (ua.indexOf("Trident/5.0") > 0)
        //     return 9;// IE 9
        else

            return false; // not IE9, 10 or 11
    }

    function errorRemoval() {

        $('.button--table input[type=file]').on('click', function () {
            $('#error-summary-display').addClass('hidden');
        });
    }

    function ieVersion() {
        errorRemoval();
        ieCheck();

    }


    ieVersion();


});