$(function () {


    $('.filter-head').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass('closed');
        $(this).closest('.filter-wrapper').find('.options-wrapper').toggleClass('js-hidden');
    });

    var r = jsRoutes.controllers.FileHistoryController.pagedHistoryResultsPartial();
    var resultsArea = '#paginated-results';

    var FilterUpdate = function (e) {
        e.preventDefault();
        FilterUpdate.Change();
    };

    //Filter Functionality
    FilterUpdate.Change = function () {

        $.ajax({
            dataType: 'html',
            type: r.type,
            url: r.url,
            data: $('#filters_form').serializeArray(),
            success: function (msg) {
                $(resultsArea).html(msg);
            },
            error: function () {
                ajaxErrorState(resultsArea);
            }
        });
    };

    //Filter on Change Event
    $('#filters_form').on('change', 'input[type=checkbox]', function (e) {
        FilterUpdate(e);
    });

    //Filter Clear functionality
    $('#filters_form').on('click', '.filter-clear a', function(e){
        e.preventDefault();
        $(':input').not(':button, :submit, :reset, :hidden, :checkbox, :radio').val();
        $(':checkbox, :radio').prop('checked', false);
        FilterUpdate(e);
    });

    //Pagination First Button
    $(resultsArea).on('click', '.pager__controls .pager__first', function (e) {
        e.preventDefault();
        paginationChange(e.target.href);
    });

    //Pagination Last Button
    $(resultsArea).on('click', '.pager__controls .pager__last', function (e) {
        e.preventDefault();
        paginationChange(e.target.href);
    });

    //Pagination Previous Button
    $(resultsArea).on('click', '.pager__controls .pager__prev', function (e) {
        e.preventDefault();
        paginationChange(e.currentTarget.href);
    });

    //Pagination Next Button
    $(resultsArea).on('click', '.pager__controls .pager__next', function (e) {
        e.preventDefault();
        paginationChange(e.currentTarget.href);
    });

    //Pagination Page Number Button
    $(resultsArea).on('click', '.pager__controls ul li a', function (e, jqXHR, loggedOut, textStatus) {
        if(loggedOut){
            console.log(jqXHR +'200');
        }else {
            e.preventDefault();
            paginationChange(e.target.href);
        }

    });

    var paginationChange = function (ahref) {

        var url;
        var ua = window.navigator.userAgent;

        if (ua.indexOf("Trident/7.0") > 0) {
            url = document.createElement('a');
            url.href = ahref;

        } else {
             url = new URL(ahref);
        }

        url.pathname = r.url;

        $.ajax({
            dataType: 'html',
            type: 'get',
            url: url.href,
            success: function (msg, jqXHR, textStatus) {

                $(resultsArea).html(msg);

                if(jqXHR.status===200) {
                    console.log('test');
                }
            },

            error: function (jqXHR, textStatus, loggedOut) {
                ajaxErrorState(resultsArea + ' #results');

                if(jqXHR.status===200) {
                    console.log('test');

                    return loggedOut
                }
            }
        });
    };

    var ajaxErrorState = function (targetArea) {
        var $myDiv = $(targetArea);
        $myDiv.empty();
        ajaxErrorStateContent().appendTo($myDiv);
    };

    var ajaxErrorStateContent = function () {
        return $('#error-state').clone().removeClass('hidden');
    };

    //intialise Js check for no js

    jsCheck = function() {
        var jsfilters = $('.form-group');
        jsfilters.removeClass('hidden');
    };
    jsCheck();
});