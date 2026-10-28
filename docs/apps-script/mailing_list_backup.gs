/**
 * Mailing_List_Backup: Apps Script web app that appends every website mailing list signup
 * to the shared Google Sheet "Mailing_List_Backup" (Shared Drive 06_SALES_OPS).
 *
 * Shopify is the list that gets emailed. This sheet is only the backup copy, so the list
 * can be moved to another tool later.
 *
 * SETUP (once, as hola@mezcalomano.com):
 *  1. Open the Mailing_List_Backup sheet > Extensions > Apps Script. Paste this file in,
 *     replacing any existing code. (Container-bound, so no sheet ID is needed.)
 *  2. Project Settings (gear) > Script properties > Add script property:
 *       SHARED_SECRET = a long random string (never paste it into chat or Git)
 *  3. Deploy > New deployment > type Web app. Execute as: Me. Who has access: Anyone.
 *     Copy the /exec URL.
 *  4. In Vercel (and .env.local) set MAILING_LIST_SHEET_URL = the /exec URL and
 *     MAILING_LIST_SHEET_TOKEN = the same string as SHARED_SECRET. Redeploy.
 *  5. Run testBackup() once from the editor to approve permissions and check a row lands.
 *     Delete the test row afterwards.
 *
 * Sheet columns: A Signed up (UTC), B Email, C Source, D Consent time (ISO).
 * Duplicate emails are skipped (case-insensitive).
 */

var SHEET_NAME = 'Sheet1'; // the first tab; rename here if the tab is renamed

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
    if (!secret || body.secret !== secret) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    var email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return json_({ ok: false, error: 'invalid email' });
    }
    var source = String(body.source || '').slice(0, 60);
    var consentedAt = String(body.consentedAt || '').slice(0, 40);

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) return json_({ ok: false, error: 'sheet not found' });

      if (!emailExists_(sheet, email)) {
        sheet.appendRow([new Date().toISOString(), email, source, consentedAt]);
      }
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function emailExists_(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === email) return true;
  }
  return false;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Run once from the editor: approves permissions and adds a test row. */
function testBackup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([new Date().toISOString(), 'test@example.com', 'manual-test', '']);
}
