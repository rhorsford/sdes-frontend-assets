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
