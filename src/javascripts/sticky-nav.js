$(function () {
  // value to add a margin of padding when scrolling through selections
  var SCROLL_PADDING = 40;

  var requireStickySideNav = $('*[data-sticky-left-nav]').length;

  function isElementInViewport (el) {
      if (typeof jQuery !== 'undefined' && el instanceof jQuery) {
        el = el[0];
      }

      var rect = el.getBoundingClientRect();

      return !(rect.bottom < 0
            || rect.right < 0
            || rect.left > window.innerWidth
            || rect.top > window.innerHeight);
  }

  function scrolledToBottom(bottomPadding) {
    bottomPadding = parseInt(bottomPadding) || 0;
    return ((window.innerHeight + window.scrollY + bottomPadding) >= document.body.offsetHeight);
  }

  function removeActiveState (links) {
    $.each(links, function (index, el) {
      if (el) {
        $(el).parent().removeClass('side-nav__list--selected');
      }
    })
  }

  function resizeMenu () {
    $('.affix').css('width', $('.grid-layout__column--1-4').width());
  }

  function checkMenuActiveState (menuItems, scrollTop, atBottom) {
    var selectedItem = null;

    menuItems.each(function(index, item) {
      var target = $(item.hash);
      var listItem = $(item).parent();
      var previousTarget = index > 0 ? $(menuItems[index - 1])
                                     : null;
      var targetOffset = target.offset();

      if (   (targetOffset && scrollTop > targetOffset.top - SCROLL_PADDING)
          || (   previousTarget && atBottom
              && isElementInViewport(target)
              && !isElementInViewport($(previousTarget[0].hash)) )) {
        listItem.addClass('side-nav__list--selected');
        removeActiveState([menuItems[index + 1], menuItems[index - 1]]);
        selectedItem = item;
      }
    });

    if (selectedItem) {
      var subMenuItems = $(selectedItem).parent().find('.fixed-navigation__sub-list a');
      if (subMenuItems.length) {
        checkMenuActiveState(subMenuItems, scrollTop, atBottom);
      }
    }
  }

  function setActiveStateOnScroll () {
    if (!requireStickySideNav) return;

    var scrollTop = $(this).scrollTop();
    var bottomPadding = $('#footer').height();
    var atBottom = scrolledToBottom(bottomPadding);
    var navHeight = $('.side-nav__component').height();
    var bounds = $('*[data-sticky-left-nav]')[0].getBoundingClientRect();

    $('.grid-layout').each(function () {
      var topDistance = $(this).offset().top - SCROLL_PADDING;

      if (scrollTop === 0 && requireStickySideNav) {
        $('.side-nav__component li').removeClass('side-nav__list--selected');
      }

      if ( bounds.bottom - navHeight < 0) {
        $('.side-nav__component.affix')
          .removeClass('affix')
          .addClass('affix-bottom');
      } else if (topDistance < scrollTop) {
        $('.side-nav__component.affix-top')
          .removeClass('affix-top')
          .addClass('affix');
        $('.side-nav__component.affix-bottom')
          .removeClass('affix-bottom')
          .addClass('affix');
      } else {
        $('.side-nav__component.affix')
          .removeClass('affix')
          .addClass('affix-top');
      }
    });

    var topLevelMenuItems = $('.side-nav__component.affix a').not('.fixed-navigation__sub-list a');

    checkMenuActiveState(topLevelMenuItems, scrollTop, atBottom);

    resizeMenu();
  }

  if (requireStickySideNav) {
    $('ul.side-nav__component').addClass('affix-top');
  }
  $(window).on('scroll', setActiveStateOnScroll).on('resize', resizeMenu);
});
