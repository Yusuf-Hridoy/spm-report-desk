/**
 * Receives waitlist sign-ups from the SPM Report Desk prototype and appends
 * them to a sheet named "waitlist" in the spreadsheet this script is bound to.
 *
 * Deploy: Extensions → Apps Script → paste this file → Deploy → New deployment
 * → type "Web app" → Execute as "Me" → Who has access "Anyone".
 * Put the web app URL in VITE_WAITLIST_URL. See README.md.
 */

var SHEET_NAME = 'waitlist';
var HEADERS = [
  'Timestamp',
  'Name',
  'Work email',
  'Company',
  'Country',
  'Wants to test a prototype',
  'Message',
  'Submitted from',
];
var MAX_FIELD_LENGTH = 2000;

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var sheet = getWaitlistSheet_();
    sheet.appendRow([
      new Date(),
      clean_(data.name),
      clean_(data.email),
      clean_(data.company),
      clean_(data.country),
      data.wantsToTestPrototype === true ? 'yes' : 'no',
      clean_(data.message),
      clean_(data.submittedFrom),
    ]);
    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error) });
  }
}

function getWaitlistSheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

// Trims, limits length and stops spreadsheet formulas (cells starting with = + - @).
function clean_(value) {
  var text = String(value == null ? '' : value)
    .trim()
    .slice(0, MAX_FIELD_LENGTH);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
