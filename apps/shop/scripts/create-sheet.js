const { google } = require("googleapis");

const required = [
  "GOOGLE_SHEETS_CLIENT_EMAIL",
  "GOOGLE_SHEETS_PRIVATE_KEY",
  "GOOGLE_SHEETS_SPREADSHEET_NAME",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing env vars: ${missing.join(", ")}`);
}

const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n");
const auth = new google.auth.JWT(
  process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  undefined,
  privateKey,
  ["https://www.googleapis.com/auth/spreadsheets"],
);
const sheets = google.sheets({ version: "v4", auth });

const run = async () => {
  const title = process.env.GOOGLE_SHEETS_SPREADSHEET_NAME;
  const sheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
      sheets: [
        { properties: { title: "Orders" } },
        { properties: { title: "Inventory" } },
        { properties: { title: "InventorySnapshots" } },
        { properties: { title: "Marketing" } },
      ],
    },
  });

  const spreadsheetId = sheet.data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error("Spreadsheet creation failed.");
  }

  const headers = {
    Orders: [
      [
        "order_id",
        "created_at",
        "payment_status",
        "fulfillment_status",
        "total_amount",
        "currency",
        "tracking_number",
        "refund_status",
      ],
    ],
    Inventory: [["product_id", "on_hand", "reserved", "updated_at"]],
    InventorySnapshots: [["product_id", "source", "on_hand", "snapshot_at"]],
    Marketing: [["total_customers", "marketing_opt_in"]],
  };

  for (const [sheetName, values] of Object.entries(headers)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }

  console.log(`Spreadsheet created: ${spreadsheetId}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
