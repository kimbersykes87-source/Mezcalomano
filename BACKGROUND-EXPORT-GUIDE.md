# Background Image Export Guide - Mezcalomano

## Photoshop Script Method (Recommended)

1. **Install the Script:**
   - Copy `export-background-images.jsx` to your Photoshop Scripts folder:
     - **Windows:** `C:\Program Files\Adobe\Adobe Photoshop [Version]\Presets\Scripts\`
     - **Mac:** `/Applications/Adobe Photoshop [Version]/Presets/Scripts/`
   - Restart Photoshop

2. **Use the Script:**
   - Open your 2400x1200px image in Photoshop
   - Go to **File > Scripts > export-background-images**
   - Select your `assets` folder when prompted
   - The script will export:
     - `desktop.jpg` (2400x1200px, 85% quality)
     - `tablet.jpg` (1600x800px, 80% quality)
     - `mobile.jpg` (1200x600px, 75% quality)

## Manual Export Method

If you prefer to export manually:

1. **Desktop (2400x1200px):**
   - Image > Image Size: 2400px width, 1200px height
   - File > Export > Export As > JPEG
   - Quality: 85%
   - Save as: `desktop.jpg` in `assets/` folder

2. **Tablet (1600x800px):**
   - Image > Image Size: 1600px width, 800px height
   - File > Export > Export As > JPEG
   - Quality: 80%
   - Save as: `tablet.jpg` in `assets/` folder

3. **Mobile (1200x600px):**
   - Image > Image Size: 1200px width, 600px height
   - File > Export > Export As > JPEG
   - Quality: 75%
   - Save as: `mobile.jpg` in `assets/` folder

## Recommended Sizes

The script exports at these sizes optimized for web:
- **Desktop:** 2400x1200px (original size, high quality)
- **Tablet:** 1600x800px (medium quality, smaller file)
- **Mobile:** 1200x600px (good quality, optimized for mobile)

These sizes ensure:
- Fast loading on mobile devices
- High quality on desktop displays
- Appropriate file sizes for web use

## After Export

After exporting, update the CSS to use responsive images:

```css
body {
    background-image: url('/assets/desktop.jpg');
}

@media (max-width: 1024px) {
    body {
        background-image: url('/assets/tablet.jpg');
    }
}

@media (max-width: 768px) {
    body {
        background-image: url('/assets/mobile.jpg');
    }
}
```
