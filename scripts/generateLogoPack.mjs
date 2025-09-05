#!/usr/bin/env node

/**
 * generateLogoPack.mjs
 * 
 * Generates a logo pack ZIP file with placeholder SVGs, PNGs, and a brand guide PDF
 * Uses JSZip for ZIP creation and PDFKit for PDF generation
 * 
 * Run with: npm run generate:logo-pack
 */

import fs from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import PDFDocument from 'pdfkit';

// Brand colors
const BRAND = {
  primary: '#0b3b8c',
  accent: '#fbbf24',
  white: '#ffffff',
  black: '#333333',
  gray: '#f0f4ff'
};

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const downloadsDir = path.join(rootDir, 'public', 'downloads');

// Font configurations
const FONTS = {
  normal: {
    family: 'Helvetica',
    weight: 'normal'
  },
  bold: {
    family: 'Helvetica-Bold',
    weight: 'bold'
  }
};

/**
 * Ensures the downloads directory exists
 */
async function ensureDirectoryExists() {
  try {
    if (!existsSync(downloadsDir)) {
      await fs.mkdir(downloadsDir, { recursive: true });
      console.log(`Created directory: ${downloadsDir}`);
    }
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
}

/**
 * Creates a color SVG logo
 * @returns {string} SVG content
 */
function createColorSVG() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="300" height="80" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .logo-text { font-family: Arial, sans-serif; font-weight: bold; }
    .faith { fill: ${BRAND.primary}; }
    .talk { fill: ${BRAND.primary}; }
    .ai { fill: ${BRAND.accent}; }
    .shield { fill: ${BRAND.primary}; stroke: ${BRAND.accent}; stroke-width: 2; }
  </style>
  <rect class="shield" x="10" y="10" width="60" height="60" rx="10" />
  <text x="80" y="50" class="logo-text" font-size="32">
    <tspan class="faith">Faith</tspan>
    <tspan class="talk">Talk</tspan>
    <tspan class="ai">AI</tspan>
  </text>
</svg>`;
}

/**
 * Creates a black SVG logo
 * @returns {string} SVG content
 */
function createBlackSVG() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="300" height="80" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .logo-text { font-family: Arial, sans-serif; font-weight: bold; }
    .shield { fill: #000000; stroke: #000000; stroke-width: 2; }
  </style>
  <rect class="shield" x="10" y="10" width="60" height="60" rx="10" />
  <text x="80" y="50" class="logo-text" font-size="32" fill="#000000">
    <tspan>Faith</tspan>
    <tspan>Talk</tspan>
    <tspan>AI</tspan>
  </text>
</svg>`;
}

/**
 * Creates a white SVG logo
 * @returns {string} SVG content
 */
function createWhiteSVG() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="300" height="80" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .logo-text { font-family: Arial, sans-serif; font-weight: bold; }
    .shield { fill: #FFFFFF; stroke: #FFFFFF; stroke-width: 2; }
  </style>
  <rect class="shield" x="10" y="10" width="60" height="60" rx="10" />
  <text x="80" y="50" class="logo-text" font-size="32" fill="#FFFFFF">
    <tspan>Faith</tspan>
    <tspan>Talk</tspan>
    <tspan>AI</tspan>
  </text>
</svg>`;
}

/**
 * Creates a color icon SVG
 * @returns {string} SVG content
 */
function createColorIconSVG() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .shield { fill: ${BRAND.primary}; stroke: ${BRAND.accent}; stroke-width: 3; }
    .text { font-family: Arial, sans-serif; font-weight: bold; fill: ${BRAND.accent}; }
  </style>
  <rect class="shield" x="5" y="5" width="70" height="70" rx="10" />
  <text x="20" y="50" class="text" font-size="24">FTA</text>
</svg>`;
}

/**
 * Creates a black icon SVG
 * @returns {string} SVG content
 */
function createBlackIconSVG() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .shield { fill: #000000; stroke: #000000; stroke-width: 2; }
    .text { font-family: Arial, sans-serif; font-weight: bold; fill: #FFFFFF; }
  </style>
  <rect class="shield" x="5" y="5" width="70" height="70" rx="10" />
  <text x="20" y="50" class="text" font-size="24">FTA</text>
</svg>`;
}

/**
 * Creates a white icon SVG
 * @returns {string} SVG content
 */
function createWhiteIconSVG() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <style>
    .shield { fill: #FFFFFF; stroke: #FFFFFF; stroke-width: 2; }
    .text { font-family: Arial, sans-serif; font-weight: bold; fill: #000000; }
  </style>
  <rect class="shield" x="5" y="5" width="70" height="70" rx="10" />
  <text x="20" y="50" class="text" font-size="24">FTA</text>
</svg>`;
}

/**
 * Creates a Safari pinned tab SVG
 * @returns {string} SVG content
 */
function createSafariPinnedTabSVG() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="14" height="14" rx="2" fill="#000000" />
  <text x="3" y="12" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="#FFFFFF">F</text>
</svg>`;
}

/**
 * Creates a 1x1 transparent PNG (base64 encoded)
 * @returns {Buffer} PNG content
 */
function createTransparentPNG() {
  // 1x1 transparent PNG in base64
  const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  return Buffer.from(base64PNG, 'base64');
}

/**
 * Creates a README.md file
 * @returns {string} README content
 */
function createReadme() {
  return `# FaithTalkAI Logo Pack

Thank you for downloading the FaithTalkAI logo pack. This package contains all the assets you need to represent our brand consistently across various media.

## Contents

1. Full-Color Logos  
   • PNG – 300 dpi, transparent background  
   • SVG – resolution-independent vector

2. Monochrome (1-color) Logos  
   • PNG – white on transparent  
   • PNG – black on transparent  
   • SVG – vector versions

3. Icon-Only Marks  
   • "FTA shield" icon in color + mono (PNG & SVG)

4. Favicon / App Icons  
   • 16 × 16, 32 × 32, 180 × 180 PNG  
   • SVG mask icon

5. Brand Guide (PDF)  
   • Clear-space rules  
   • Minimum sizes  
   • Color values (HEX / CMYK)  
   • Do's & Don'ts examples

## Brand Colors

- Primary Blue: #0b3b8c
- Accent Yellow: #fbbf24
- Black: #333333
- White: #ffffff

## Usage Guidelines

- Always maintain the logo's proportions when resizing
- Maintain adequate clear space around the logo (minimum: height of the "F")
- Do not alter the colors unless using the provided monochrome versions
- Do not add effects, shadows, or distortions to the logo
- For dark backgrounds, use the white monochrome version

## Questions?

Contact us at brand@faithtalkai.com

© 2025 FaithTalkAI
`;
}

/**
 * Creates a brand guide PDF
 * @returns {Promise<Buffer>} PDF content as buffer
 */
async function createBrandGuidePDF() {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({
        margins: { top: 72, left: 72, right: 72, bottom: 72 },
        size: 'LETTER'
      });
      
      // Collect PDF data chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Add header with brand colors
      doc.rect(0, 0, doc.page.width, 120)
         .fill(BRAND.primary);
         
      // Add title
      doc.font(FONTS.bold.family)
         .fontSize(24)
         .fillColor(BRAND.white)
         .text('FaithTalkAI Brand Guidelines', 72, 50, { align: 'center' });
      
      // Add accent bar
      doc.rect(0, 120, doc.page.width, 10)
         .fill(BRAND.accent);
      
      // Brand colors section
      doc.moveDown(4);
      doc.font(FONTS.bold.family)
         .fontSize(18)
         .fillColor(BRAND.primary)
         .text('Brand Colors', { align: 'left' });
      
      doc.moveDown(1);
      
      // Primary color
      doc.rect(72, doc.y, 50, 50)
         .fill(BRAND.primary);
      
      doc.font(FONTS.bold.family)
         .fontSize(14)
         .fillColor(BRAND.primary)
         .text('Primary Blue', 140, doc.y - 40);
      
      doc.font(FONTS.normal.family)
         .fontSize(12)
         .fillColor(BRAND.black)
         .text(`HEX: ${BRAND.primary}`, 140, doc.y + 5);
      
      doc.moveDown(3);
      
      // Accent color
      doc.rect(72, doc.y, 50, 50)
         .fill(BRAND.accent);
      
      doc.font(FONTS.bold.family)
         .fontSize(14)
         .fillColor(BRAND.primary)
         .text('Accent Yellow', 140, doc.y - 40);
      
      doc.font(FONTS.normal.family)
         .fontSize(12)
         .fillColor(BRAND.black)
         .text(`HEX: ${BRAND.accent}`, 140, doc.y + 5);
      
      doc.moveDown(3);
      
      // Logo usage section
      doc.font(FONTS.bold.family)
         .fontSize(18)
         .fillColor(BRAND.primary)
         .text('Logo Usage Guidelines', { align: 'left' });
      
      doc.moveDown(1);
      
      const guidelines = [
        'Always maintain the logo\'s proportions when resizing',
        'Maintain adequate clear space around the logo (minimum: height of the "F")',
        'Do not alter the colors unless using the provided monochrome versions',
        'Do not add effects, shadows, or distortions to the logo',
        'For dark backgrounds, use the white monochrome version'
      ];
      
      guidelines.forEach(guideline => {
        doc.font(FONTS.normal.family)
           .fontSize(12)
           .fillColor(BRAND.black)
           .text(`• ${guideline}`, { indent: 20, align: 'left' });
        
        doc.moveDown(0.5);
      });
      
      doc.moveDown(2);
      
      // Minimum size section
      doc.font(FONTS.bold.family)
         .fontSize(18)
         .fillColor(BRAND.primary)
         .text('Minimum Size', { align: 'left' });
      
      doc.moveDown(1);
      
      doc.font(FONTS.normal.family)
         .fontSize(12)
         .fillColor(BRAND.black)
         .text('To ensure legibility, do not use the logo smaller than:');
      
      doc.moveDown(0.5);
      
      doc.font(FONTS.normal.family)
         .fontSize(12)
         .fillColor(BRAND.black)
         .text('• Full logo: 100px wide or 1 inch in print', { indent: 20 });
      
      doc.moveDown(0.5);
      
      doc.font(FONTS.normal.family)
         .fontSize(12)
         .fillColor(BRAND.black)
         .text('• Icon only: 32px wide or 0.35 inch in print', { indent: 20 });
      
      // Add footer with brand colors
      doc.rect(0, doc.page.height - 50, doc.page.width, 50)
         .fill(BRAND.primary);
         
      // Add copyright text
      doc.font(FONTS.normal.family)
         .fontSize(10)
         .fillColor(BRAND.white)
         .text('© 2025 FaithTalkAI | FaithTalkAI.com', 0, doc.page.height - 30, { align: 'center' });
      
      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generates the logo pack ZIP file
 */
async function generateLogoPack() {
  try {
    console.log('Starting logo pack generation...');
    
    // Ensure downloads directory exists
    await ensureDirectoryExists();
    
    // Create a new JSZip instance
    const zip = new JSZip();
    
    // Add logos
    console.log('Adding logo files...');
    
    // Color logos
    const colorFolder = zip.folder('logos/color');
    colorFolder.file('faithtalkai-logo-color.svg', createColorSVG());
    
    // Mono black logos
    const blackFolder = zip.folder('logos/mono-black');
    blackFolder.file('faithtalkai-logo-black.svg', createBlackSVG());
    
    // Mono white logos
    const whiteFolder = zip.folder('logos/mono-white');
    whiteFolder.file('faithtalkai-logo-white.svg', createWhiteSVG());
    
    // Icon logos
    const iconFolder = zip.folder('logos/icon');
    iconFolder.file('fta-icon-color.svg', createColorIconSVG());
    iconFolder.file('fta-icon-black.svg', createBlackIconSVG());
    iconFolder.file('fta-icon-white.svg', createWhiteIconSVG());
    
    // Favicons
    console.log('Adding favicon files...');
    const faviconFolder = zip.folder('favicons');
    faviconFolder.file('favicon-16.png', createTransparentPNG());
    faviconFolder.file('favicon-32.png', createTransparentPNG());
    faviconFolder.file('favicon-180.png', createTransparentPNG());
    faviconFolder.file('safari-pinned-tab.svg', createSafariPinnedTabSVG());
    
    // Add README
    console.log('Adding README...');
    zip.file('README.md', createReadme());
    
    // Generate and add brand guide PDF
    console.log('Generating brand guide PDF...');
    const brandGuidePDF = await createBrandGuidePDF();
    zip.file('brand-guide.pdf', brandGuidePDF);
    
    // Generate ZIP file
    console.log('Generating ZIP file...');
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Save ZIP file
    const outputPath = path.join(downloadsDir, 'logo-pack.zip');
    await fs.writeFile(outputPath, zipContent);
    
    console.log(`✅ Logo pack generated successfully: ${outputPath}`);
  } catch (error) {
    console.error('Error generating logo pack:', error);
    process.exit(1);
  }
}

// Run the main function
generateLogoPack();
