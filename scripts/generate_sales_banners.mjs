#!/usr/bin/env node

/**
 * Generate sales banner images using OpenAI's DALL-E API
 * 
 * This script generates 6 variations of biblical collage banners
 * and saves them to the public/images directory.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'public', 'images', 'sales', 'variants');
const finalImagePath = path.join(projectRoot, 'public', 'images', 'complete-bible.jpg');

// Resolve API key from multiple possible env vars
const apiKey = process.env.OPENAI_API_KEY || 
               process.env.VITE_OPENAI_API_KEY || 
               process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  console.error('Error: No OpenAI API key found in environment variables.');
  console.error('Please set OPENAI_API_KEY, VITE_OPENAI_API_KEY, or NEXT_PUBLIC_OPENAI_API_KEY in your .env file.');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey
});

// Define image generation prompts - variations on biblical collage theme
const prompts = [
  // Prompt 1: Epic cinematic collage
  "Epic collage of Old and New Testament scenes: prophets, apostles, shepherds, ark on stormy waters, desert caravan, doves, golden light breaking through clouds; solemn, reverent tone; painterly realism; deep navy blue (#0b2254) with gold (#facc15) accents; dramatic rim lighting; no text; cinematic, highly detailed, coherent composition",
  
  // Prompt 2: Character-focused montage
  "Row of iconic biblical figures facing different directions, layered over sweeping landscapes (wilderness, sea, ancient city), subtle animals (lambs, doves), warm gold highlights (#facc15) against deep navy background (#0b2254), baroque composition, photoreal-painterly blend, no text, reverent tone",
  
  // Prompt 3: Timeline approach
  "Left-to-right timeline of Scripture: creation light → patriarchs → exodus/ark → prophets → gospel scenes → early church, unified by golden light ray; cohesive palette (navy #0b2254, gold #facc15), reverent, museum-quality, no text, cinematic composition",
  
  // Prompt 4: Symbolic approach
  "Biblical symbolism collage: scrolls, ark, burning bush, stone tablets, cross, empty tomb, dove, fish, bread and wine, all arranged in an artistic composition with navy blue (#0b2254) background and gold (#facc15) highlights, reverent tone, no text, dramatic lighting",
  
  // Prompt 5: Landscape-focused
  "Sweeping biblical landscapes: Eden, Mount Ararat, Red Sea, Mount Sinai, Jerusalem, Sea of Galilee, with small figures and symbols; panoramic vista style; deep navy (#0b2254) and gold (#facc15) color scheme; dramatic lighting; reverent atmosphere; no text",
  
  // Prompt 6: Artistic interpretation
  "Artistic interpretation of biblical narrative: abstract-meets-realistic composition of biblical elements, flowing composition with visual hierarchy, deep navy blue (#0b2254) background with golden (#facc15) light effects, reverent atmosphere, no text, painterly style"
];

/**
 * Generate an image using OpenAI and save it to the specified path
 */
async function generateAndSaveImage(prompt, outputPath, index) {
  const shortLabel = `Banner ${index + 1}: ${prompt.split(':')[0]}`;
  console.log(`Generating ${shortLabel}...`);
  
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1536x1024"
    });
    
    // Get base64 data
    const imageData = response.data[0].b64_json;
    if (!imageData) {
      throw new Error('No image data received from API');
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');
    
    // Write to file
    await fs.writeFile(outputPath, buffer);
    console.log(`✓ Saved ${path.basename(outputPath)}`);
    
    return outputPath;
  } catch (error) {
    console.error(`× Error generating ${shortLabel}:`, error.message);
    if (error.code) {
      console.error(`  Error code: ${error.code}`);
    }
    return null;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('FaithTalkAI Sales Banner Generator');
  console.log('=================================');
  
  try {
    // Ensure directories exist
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.dirname(finalImagePath), { recursive: true });
    
    console.log(`Output directory: ${outputDir}`);
    
    // Generate all images
    const generatedFiles = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const outputPath = path.join(outputDir, `banner-${String(i + 1).padStart(2, '0')}.png`);
      const result = await generateAndSaveImage(prompts[i], outputPath, i);
      if (result) {
        generatedFiles.push(result);
      }
    }
    
    // Copy first image to complete-bible.jpg if it doesn't exist
    if (generatedFiles.length > 0) {
      try {
        await fs.access(finalImagePath);
        console.log(`Note: ${finalImagePath} already exists, not overwriting.`);
      } catch (err) {
        // File doesn't exist, copy it
        await fs.copyFile(generatedFiles[0], finalImagePath);
        console.log(`✓ Copied first banner to ${finalImagePath}`);
      }
    }
    
    console.log('\nSummary:');
    console.log(`Generated ${generatedFiles.length} of ${prompts.length} images`);
    console.log(`Images saved to: ${outputDir}`);
    
    if (generatedFiles.length === 0) {
      console.error('No images were successfully generated.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error in main execution:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
