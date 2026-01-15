# Google Sheets Sync

## Service account

1. Create a service account in Google Cloud.
2. Enable the Google Sheets API.
3. Create a JSON key and set:
   - `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `GOOGLE_SHEETS_PRIVATE_KEY`

## Create spreadsheet

```bash
GOOGLE_SHEETS_CLIENT_EMAIL=... \
GOOGLE_SHEETS_PRIVATE_KEY="..." \
GOOGLE_SHEETS_SPREADSHEET_NAME="Mezcalomano Ops" \
npm run sheets:create
```

Record the Spreadsheet ID and set `GOOGLE_SHEETS_SPREADSHEET_ID`.

## Sync data

- Use the admin dashboard button or call the sync job.
- Tabs: `Orders`, `Inventory`, `InventorySnapshots`, `Marketing`.
