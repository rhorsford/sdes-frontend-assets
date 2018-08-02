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
