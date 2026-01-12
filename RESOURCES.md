# Mezcalomano Project Setup Resources

## 1. Linking Cloudflare & Google Workspace

To link your Cloudflare domain (`mezcalomano.com`) with your Google Workspace (`hola@mezcalomano.com`), follow these steps:

### Step A: Google Workspace Verification
1. Log in to your [Google Admin Console](https://admin.google.com/).
2. Go to **Account** > **Domains** > **Manage domains**.
3. Click **Add a domain** or **Verify domain**.
4. Choose **TXT Record** verification. Google will provide a string like `google-site-verification=...`.

### Step B: Cloudflare DNS Configuration
1. Log in to [Cloudflare](https://dash.cloudflare.com/) using `kimbersykes87@gmail.com`.
2. Select the `mezcalomano.com` site.
3. Go to the **DNS** tab.
4. **Add TXT Record:**
   - Type: `TXT`
   - Name: `@` (or `mezcalomano.com`)
   - Content: Paste the verification string from Google.
5. **Add MX Records (for Email):**
   - Type: `MX`
   - Name: `@`
   - Mail Server: `SMTP.GOOGLE.COM`
   - Priority: `1`
   - TTL: `Auto`
   *(Note: Older setups used 5 different records, but Google now recommends just this one.)*

---

## 2. Git Repository Setup (GitHub)

To host your code on GitHub:
1. Create a new repository on [GitHub](https://github.com/new) named `Mezcalomano`.
2. Run the following commands in this terminal:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Mezcalomano.git
   git branch -M main
   git push -u origin main
   ```

---

## 3. Email Signature

You can find your email signature template in `email_signature.html`.
1. Open `email_signature.html` in a browser.
2. Select all and copy.
3. In Gmail, go to **Settings** > **See all settings** > **General** > **Signature**.
4. Paste into the signature box.
