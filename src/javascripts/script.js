/**
 * Description: Used to execute scripts.
 * Author: David Birchall
 *
 */

HMRC.dropzone({
  dropzone: document.getElementById('dragandrop')
});
HMRC.files.init();
HMRC.model.watch();
HMRC.state.watch();
HMRC.renderErrorMessage.init();
HMRC.renderFiles.init();
HMRC.renderPageTitle.init();
HMRC.renderProgressiveDisclosure.init();
HMRC.renderSummaryHeader.init();
HMRC.renderSummaryTable.init();
HMRC.renderSummaryContent.init();
HMRC.renderUploadButton.init();
HMRC.reportProblem.setup();
HMRC.notify.watch();
HMRC.upload.init();
HMRC.message.watch();
HMRC.validation.init();
HMRC.valid.init();
