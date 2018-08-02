/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderSummaryHeader = (function() {

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    summaryHeader = document.getElementById('page-title');
  }

  function watch() {
    events.on('modelUpdate', getFiles.bind(this));
    events.on('renderSummaryTable', render.bind(this));
  }

  function getFiles(obj) {
    files = obj.files;
  }

  function render(state, complete) {


    while (summaryHeader.firstChild) {
      summaryHeader.removeChild(summaryHeader.firstChild);
    }

    var frag = document.createDocumentFragment();

    // message banner
    var div = document.createElement('div');
      div.className = 'transaction-banner--complete';
    var h1 = document.createElement('h1');
      h1.className = 'transaction-banner__heading';

      var totalSuccessFiles = 0;
      files.forEach(function(file, index) {
          if(file.state === 'success') {
              totalSuccessFiles += 1;
          }
      });

      h1.innerHTML = (totalSuccessFiles > 1 ? ' Documents' : ' Document') + ' uploaded';
    var p = document.createElement('p');
      p.innerHTML = 'By ' + document.getElementById('user').getAttribute('value') + ' on ' + formatDate(new Date());

    div.appendChild(h1);
    div.appendChild(p);
    frag.appendChild(div);

    summaryHeader.appendChild(frag)
  }

  function formatDate(date) {
      var monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }

  return {
    init : init
  }

})();
