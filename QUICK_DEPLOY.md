# Quick Deploy Script

## To deploy via Cloudflare Pages with GitHub:

1. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name it `Mezcalomano`
   - Don't initialize with README
   - Click "Create repository"

2. **Run these commands** (replace YOUR_USERNAME with your GitHub username):
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/Mezcalomano.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Cloudflare:**
   - Go to https://dash.cloudflare.com/
   - Click "Pages" → "Create a project"
   - Connect GitHub and select your repository
   - Build settings: Framework preset = "None", Output directory = "/"
   - Click "Save and Deploy"
   - Add custom domain: mezcalomano.com

## Or deploy directly via Cloudflare Pages upload:

1. Go to https://dash.cloudflare.com/ → Pages → Create a project → Upload assets
2. Select all files from this folder
3. Deploy and add custom domain
