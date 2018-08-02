/**
 * Description: upload CTA button rendering.
 * Author: David Birchall
 *
 */

HMRC.renderSummaryTable = (function() {

  var files = {};

  function init() {
    cacheDom();
    watch();
  }

  function cacheDom() {
    summaryTable = document.getElementById('table');
  }

  function watch() {
    events.on('modelUpdate', getFiles.bind(this));
    events.on('renderSummaryTable', render.bind(this));
  }

  function getFiles(obj) {
    files = obj.files;
  }

  function buildSummaryTable() {
    var frag = document.createDocumentFragment();
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');
    var totalSuccessFiles = 0;

    files.forEach(function(file, index) {
      if(file.state === 'success') {
        totalSuccessFiles += 1;
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerHTML = "<span class='visuallyhidden'>Filename </span>" + file.name;
        tr.appendChild(td);
        tbody.appendChild(tr);
      }
    });

    var th = document.createElement('th');
        th.innerHTML = '1-' + totalSuccessFiles + ' of ' + totalSuccessFiles + (totalSuccessFiles > 1 ? ' documents' : ' document');

    thead.appendChild(th)
    table.appendChild(thead);
    table.appendChild(tbody);
    frag.appendChild(table);

    return frag;
  }

  function render(state, complete) {
    while (summaryTable.firstChild) {
      summaryTable.removeChild(summaryTable.firstChild);
    }
    summaryTable.appendChild(buildSummaryTable())
  }

  return {
    init : init
  }

})();
