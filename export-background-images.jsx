/*
 * Photoshop Export Script for Mezcalomano Background Images
 * 
 * Usage:
 * 1. Open your 2400x1200px image in Photoshop
 * 2. Go to File > Scripts > Browse...
 * 3. Select this script file
 * 4. The script will export images at different sizes to the assets folder
 * 
 * Or install to Photoshop Scripts folder:
 * Windows: C:\Program Files\Adobe\Adobe Photoshop [Version]\Presets\Scripts\
 * Mac: /Applications/Adobe Photoshop [Version]/Presets/Scripts/
 */

// Configuration - adjust these paths as needed
var basePath = Folder.selectDialog("Select the assets folder for Mezcalomano");
var doc = app.activeDocument;

// Check if a document is open
if (!doc) {
    alert("Please open an image in Photoshop first!");
} else {
    // Export settings
    var exportSizes = [
        { name: "desktop", width: 2400, height: 1200, quality: 85 },
        { name: "tablet", width: 1600, height: 800, quality: 80 },
        { name: "mobile", width: 1200, height: 600, quality: 75 }
    ];
    
    // Save current state
    var originalState = doc.activeHistoryState;
    
    try {
        // Export each size
        for (var i = 0; i < exportSizes.length; i++) {
            var size = exportSizes[i];
            
            // Resize document
            doc.resizeImage(
                UnitValue(size.width, "px"),
                UnitValue(size.height, "px"),
                null,
                ResampleMethod.BICUBICSHARPER
            );
            
            // Save as JPEG
            var saveFile = new File(basePath + "/" + size.name + ".jpg");
            var jpegOptions = new JPEGSaveOptions();
            jpegOptions.quality = size.quality;
            jpegOptions.embedColorProfile = true;
            jpegOptions.formatOptions = FormatOptions.STANDARDBASELINE;
            jpegOptions.matte = MatteType.NONE;
            
            doc.saveAs(saveFile, jpegOptions);
            
            // Restore original size for next iteration
            doc.activeHistoryState = originalState;
        }
        
        alert("Successfully exported " + exportSizes.length + " images to:\n" + basePath.fsName);
        
    } catch (e) {
        alert("Error: " + e.message);
        // Restore original state on error
        doc.activeHistoryState = originalState;
    }
}
