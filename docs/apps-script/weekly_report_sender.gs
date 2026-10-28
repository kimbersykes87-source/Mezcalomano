/**
 * MM_Weekly_Report_Sender: sends the Monday dashboard email from hola@mezcalomano.com.
 *
 * Set up once, signed in as hola@mezcalomano.com:
 * 1. script.google.com > New project, name it MM_Weekly_Report_Sender, paste this file.
 * 2. Project Settings > Script properties > Add: SHARED_SECRET = a long random string
 *    (the same value goes into Vercel as WEEKLY_EMAIL_TOKEN, Sensitive, Production).
 * 3. Deploy > New deployment > Web app: Execute as "Me (hola@)", Who has access "Anyone".
 *    Authorize when asked. Copy the /exec URL into Vercel as WEEKLY_EMAIL_URL.
 * 4. Move the script file into the Shared Drive 05_WEBSITE folder (the URL stays the same).
 *
 * Code changes later: Deploy > Manage deployments > Edit > New version keeps the same URL.
 * The website sends: { token, to, subject, html, text }. Only mezcalomano.com addresses are allowed.
 */
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var secret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
    if (!secret || body.token !== secret) return json_({ ok: false, error: "unauthorized" });

    var to = String(body.to || "hola@mezcalomano.com").trim();
    if (!/@mezcalomano\.com$/i.test(to)) return json_({ ok: false, error: "recipient not allowed" });
    if (!body.subject || !body.html) return json_({ ok: false, error: "missing subject or html" });

    GmailApp.sendEmail(to, String(body.subject).slice(0, 200), String(body.text || ""), {
      htmlBody: String(body.html),
      name: "Mezcalómano Dashboard",
    });
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
