import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Configuration
const SOURCE_FOLDER_PRIMARY = 'C:\\Users\\kimbe\\Desktop\\FINAL#\\CMYK_JapanColor2001\\_PRINT_READY_V4\\';
const SOURCE_FOLDER_FALLBACK = path.join(projectRoot, 'source', 'print_ready_v4');
const OUTPUT_FOLDER = path.join(projectRoot, 'public', 'assets', 'matrix', 'cards');
const CSV_PATH = path.join(projectRoot, 'data', 'species_matrix_v1.csv');

// Rank and suit order (explicit, not lexicographic)
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'a'];
const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];

/**
 * Create a URL-friendly slug from a string
 */
function createSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove punctuation
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

/**
 * Generate TIFF filename from rank and suit
 */
function getTiffFilename(rank, suit) {
  return `${rank}_${suit}_final.tif`;
}

/**
 * Generate all expected TIFF filenames in order
 */
function generateExpectedTiffFilenames() {
  const filenames = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      filenames.push(getTiffFilename(rank, suit));
    }
  }
  return filenames;
}

/**
 * Find source folder (try primary, fallback to relative)
 */
async function findSourceFolder() {
  try {
    await fs.access(SOURCE_FOLDER_PRIMARY);
    console.log(`✓ Using primary source folder: ${SOURCE_FOLDER_PRIMARY}`);
    return SOURCE_FOLDER_PRIMARY;
  } catch (error) {
    console.log(`⚠ Primary source folder not accessible, trying fallback: ${SOURCE_FOLDER_FALLBACK}`);
    try {
      await fs.access(SOURCE_FOLDER_FALLBACK);
      console.log(`✓ Using fallback source folder: ${SOURCE_FOLDER_FALLBACK}`);
      return SOURCE_FOLDER_FALLBACK;
    } catch (error2) {
      throw new Error(`Neither source folder is accessible. Please ensure TIFFs are in: ${SOURCE_FOLDER_FALLBACK}`);
    }
  }
}

/**
 * Load and parse CSV
 */
async function loadSpeciesData() {
  const csvContent = await fs.readFile(CSV_PATH, 'utf-8');
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  
  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }
  
  // Take first 40 rows
  const species = result.data.slice(0, 40);
  
  if (species.length < 40) {
    throw new Error(`CSV has only ${species.length} rows, need 40`);
  }
  
  return species;
}

/**
 * Process a single TIFF to WebP
 */
async function processImage(inputPath, outputPath800, outputPath400) {
  const image = sharp(inputPath);
  
  // Get image metadata
  const metadata = await image.metadata();
  
  // Convert CMYK to sRGB and resize with "contain" behavior
  // sharp automatically handles CMYK to RGB conversion when outputting
  // WebP output strips most metadata by default
  const pipeline800 = image
    .clone()
    .toColorspace('srgb') // Convert to sRGB first
    .resize(800, 1120, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // white background
    })
    .webp({ quality: 82, effort: 6 });
  
  const pipeline400 = image
    .clone()
    .toColorspace('srgb') // Convert to sRGB first
    .resize(400, 560, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // white background
    })
    .webp({ quality: 82, effort: 6 });
  
  // Strip metadata and write
  await Promise.all([
    pipeline800.toFile(outputPath800),
    pipeline400.toFile(outputPath400),
  ]);
}

/**
 * Main processing function
 */
async function main() {
  console.log('🎴 Matrix Card Asset Pipeline\n');
  console.log('=' .repeat(60));
  
  // Step 1: Find source folder
  const sourceFolder = await findSourceFolder();
  
  // Step 2: Load species data
  console.log('\n📊 Loading species data...');
  const species = await loadSpeciesData();
  console.log(`✓ Loaded ${species.length} species from CSV`);
  
  // Step 3: Generate expected TIFF filenames
  const expectedTiffs = generateExpectedTiffFilenames();
  console.log(`✓ Generated ${expectedTiffs.length} expected TIFF filenames`);
  
  // Step 4: Verify TIFF files exist
  console.log('\n🔍 Verifying input TIFFs...');
  const foundTiffs = [];
  const missingTiffs = [];
  
  for (const tiffName of expectedTiffs) {
    const tiffPath = path.join(sourceFolder, tiffName);
    try {
      await fs.access(tiffPath);
      foundTiffs.push(tiffName);
    } catch {
      missingTiffs.push(tiffName);
    }
  }
  
  if (missingTiffs.length > 0) {
    throw new Error(`Missing ${missingTiffs.length} TIFF files:\n${missingTiffs.slice(0, 5).join('\n')}${missingTiffs.length > 5 ? '\n...' : ''}`);
  }
  
  if (foundTiffs.length !== 40) {
    throw new Error(`Expected exactly 40 TIFF files, found ${foundTiffs.length}`);
  }
  
  console.log(`✓ Found exactly ${foundTiffs.length} input TIFFs`);
  
  // Step 5: Create output directory
  console.log('\n📁 Creating output directory...');
  await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
  console.log(`✓ Output directory: ${OUTPUT_FOLDER}`);
  
  // Step 6: Process images
  console.log('\n🖼️  Processing images...');
  const manifest = [];
  const outputFilenames = new Set();
  
  for (let i = 0; i < 40; i++) {
    const speciesData = species[i];
    const tiffName = expectedTiffs[i];
    const speciesId = String(i + 1).padStart(2, '0');
    
    // Create slugs
    const scientificSlug = createSlug(speciesData.scientific_name);
    const commonSlug = createSlug(speciesData.common_name);
    
    // Generate output filenames
    const baseFilename = `species_${speciesId}_${scientificSlug}_${commonSlug}_card`;
    const filename800 = `${baseFilename}_800.webp`;
    const filename400 = `${baseFilename}_400.webp`;
    
    // Check for duplicates
    if (outputFilenames.has(filename800) || outputFilenames.has(filename400)) {
      throw new Error(`Duplicate filename detected: ${filename800} or ${filename400}`);
    }
    outputFilenames.add(filename800);
    outputFilenames.add(filename400);
    
    // Process image
    const inputPath = path.join(sourceFolder, tiffName);
    const outputPath800 = path.join(OUTPUT_FOLDER, filename800);
    const outputPath400 = path.join(OUTPUT_FOLDER, filename400);
    
    await processImage(inputPath, outputPath800, outputPath400);
    
    // Add to manifest
    manifest.push({
      species_id: speciesId,
      scientific_name: speciesData.scientific_name,
      common_name: speciesData.common_name,
      one_liner: speciesData.one_liner || '',
      habitat: speciesData.habitat || '',
      height: speciesData.height || '',
      image_800: `/assets/matrix/cards/${filename800}`,
      image_400: `/assets/matrix/cards/${filename400}`,
      source_tif: tiffName,
    });
    
    if ((i + 1) % 10 === 0) {
      console.log(`  Processed ${i + 1}/40...`);
    }
  }
  
  console.log(`✓ Processed all 40 images (80 WebP files)`);
  
  // Step 7: Write manifest
  console.log('\n📝 Writing index.json...');
  const manifestPath = path.join(OUTPUT_FOLDER, 'index.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`✓ Wrote index.json with ${manifest.length} entries`);
  
  // Step 8: Verification and summary
  console.log('\n✅ Verification Summary');
  console.log('=' .repeat(60));
  
  // Count output files
  const outputFiles = await fs.readdir(OUTPUT_FOLDER);
  const webpFiles = outputFiles.filter(f => f.endsWith('.webp'));
  
  console.log(`✓ Found exactly ${foundTiffs.length} input TIFFs that match the allowed pattern and range`);
  console.log(`✓ Wrote exactly ${webpFiles.length} WebP outputs to public/assets/matrix/cards/`);
  console.log(`✓ Wrote index.json with ${manifest.length} entries`);
  console.log(`✓ No duplicate output filenames`);
  
  // Show first 5 mappings
  console.log('\n📋 First 5 Mappings:');
  console.log('─'.repeat(60));
  console.log('Species ID | Common Name          | TIF File              | WebP 800');
  console.log('─'.repeat(60));
  for (let i = 0; i < Math.min(5, manifest.length); i++) {
    const m = manifest[i];
    const commonName = (m.common_name || '').padEnd(20).substring(0, 20);
    const tifFile = (m.source_tif || '').padEnd(22).substring(0, 22);
    const webpFile = path.basename(m.image_800);
    console.log(`  ${m.species_id}      | ${commonName} | ${tifFile} | ${webpFile}`);
  }
  console.log('─'.repeat(60));
  
  console.log('\n🎉 Pipeline completed successfully!');
}

// Run
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
