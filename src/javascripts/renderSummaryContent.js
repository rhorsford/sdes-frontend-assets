/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderSummaryContent = (function() {

  var files = {};

  var paragraphs = {
    para1: 'We\'ll check your documents and send them to the right department. We\'ll email you when they\'ve been delivered, or if there are any problems.',
    para2: 'The department will then carry out their own checks and contact you if they need to.',
  }

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    summaryContent = document.getElementById('summary-content');
  }

  function watch() {
    events.on('modelUpdate', getFiles.bind(this));
    events.on('renderSummaryTable', render.bind(this));
  }

  function getFiles(obj) {
    files = obj.files;
  }

  function render(state, complete) {


    while (summaryContent.firstChild) {
      summaryContent.removeChild(summaryContent.firstChild);
    }

    var frag = document.createDocumentFragment();

    // print link
    var paragraph = document.createElement('p');
    var link = document.createElement('a');
    link.className = 'print-link print-hidden js-visible';
    link.innerHTML = 'Print';
    link.onclick = function() {
      //ga('send', { 'hitType': 'pageview', 'page': '/uploadpage/document-uploaded', 'title': 'Uploaded Confirmation Printed' })
      gtag('config','UA-43414424-36',{'page_path': '/uploadpage/document-uploaded','page_title': 'Uploaded Confirmation Printed'})
    }
    link.href = 'javascript:window:print()';

    paragraph.appendChild(link);
    frag.appendChild(paragraph);

    // details
    var details = document.createElement('details');

    var summary = document.createElement('summary');
    summary.role = 'button';
    summary.setAttribute('aria-expanded', false);
    summary.innerHTML = 'What happens next?';

    var div = document.createElement('div');
    div.className = 'indent';

    Object.keys(paragraphs).forEach(function(key, index) {
      var p = document.createElement('p');
      p.innerHTML = paragraphs[key];
      div.appendChild(p);
    });

    details.appendChild(summary);
    details.appendChild(div);

    frag.appendChild(details);
    summaryContent.appendChild(frag);
      $("details").details();
  }


  return {
    init: init
  }

})();
