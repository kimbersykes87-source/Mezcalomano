# Matrix Cards Asset Pipeline

Automated pipeline to convert 40 print-ready TIFF files into web-optimized Matrix card images.

## Quick Start

```bash
npm run build:matrix-cards
```

## Requirements

### Input Files

**Primary location** (Windows):
```
C:\Users\kimbe\Desktop\FINAL#\CMYK_JapanColor2001\_PRINT_READY_V4\
```

**Fallback location** (if primary is not accessible):
```
source/print_ready_v4/
```

### Required TIFF Files (40 total)

Files must be named: `{rank}_{suit}_final.tif`

**Ranks** (in order): `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `a`

**Suits** (in order): `clubs`, `diamonds`, `hearts`, `spades`

**Example filenames:**
- `2_clubs_final.tif`
- `2_diamonds_final.tif`
- `2_hearts_final.tif`
- `2_spades_final.tif`
- `3_clubs_final.tif`
- ...
- `10_spades_final.tif`
- `a_clubs_final.tif`
- ...
- `a_spades_final.tif`

**Important**: Do NOT include jokers, J, Q, K cards.

## Output

### Location
```
public/assets/matrix/cards/
```

### Generated Files

1. **80 WebP images** (40 species × 2 sizes):
   - `species_XX_{scientific_slug}_{common_slug}_card_800.webp` (800 × 1120)
   - `species_XX_{scientific_slug}_{common_slug}_card_400.webp` (400 × 560)

2. **index.json** manifest with 40 entries containing:
   - `species_id` (01-40)
   - `scientific_name`
   - `common_name`
   - `one_liner`
   - `habitat`
   - `height`
   - `image_800` (relative path)
   - `image_400` (relative path)
   - `source_tif` (original filename)

## Image Processing

- **Color conversion**: CMYK → sRGB
- **Resize method**: "contain" (preserves aspect ratio, no cropping)
- **Background**: White
- **Format**: WebP
- **Quality**: 82
- **Metadata**: Stripped

## Species Data

The script uses `data/species_matrix_v1.csv` which must contain:
- `scientific_name`
- `common_name`
- `one_liner`
- `habitat`
- `height`

The first 40 rows are used, mapped in order to the TIFF files.

## Mapping Order

CSV row 1 → `2_clubs_final.tif` → `species_01`
CSV row 2 → `2_diamonds_final.tif` → `species_02`
CSV row 3 → `2_hearts_final.tif` → `species_03`
CSV row 4 → `2_spades_final.tif` → `species_04`
...
CSV row 40 → `a_spades_final.tif` → `species_40`

## Validation

The script automatically validates:
- ✓ Exactly 40 input TIFFs found
- ✓ Exactly 80 WebP outputs created
- ✓ index.json with 40 entries
- ✓ No duplicate filenames
- ✓ First 5 mappings displayed

## Troubleshooting

### "Neither source folder is accessible"

Copy the 40 TIFF files to: `source/print_ready_v4/`

### "Missing X TIFF files"

Ensure all 40 files are present with exact naming: `{rank}_{suit}_final.tif`

### "CSV has only X rows, need 40"

Check `data/species_matrix_v1.csv` has at least 40 data rows (plus header).

### Sharp/Image Processing Errors

Ensure TIFF files are valid and not corrupted. Sharp requires valid image files.
