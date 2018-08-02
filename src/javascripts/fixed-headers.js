$(function() {
    function UpdateTableHeaders() {
        $(".persist-area").each(function() {
            var el, offset, scrollTop, floatingHeader;

            el = $(this);
            offset = el.offset();
            scrollTop = $(window).scrollTop();
            floatingHeader = $(".floatingHeader", this);

            var visible = ((scrollTop > offset.top) && (scrollTop < offset.top + (el.height() - floatingHeader.innerHeight())))
                ? 'visible'
                : 'hidden';

            floatingHeader.css({"visibility": visible});
        });
    }

    $(".persist-area:not(.expanded)").each(function() {
        var clonedHeaderRow = $("div.persist-header", this).not(".floatingHeader");
        clonedHeaderRow.before(clonedHeaderRow.clone(true)).css("width", clonedHeaderRow.width()).addClass("floatingHeader");
    });

    $(window).scroll(UpdateTableHeaders).trigger("scroll");
});
