#!/usr/bin/env node

/**
 * generateDownloads.mjs
 * 
 * Generates branded PDFs and PPTX files from text sources in public/downloads
 * Uses pdfkit for PDFs and pptxgenjs for PPTX
 * 
 * Run with: npm run generate:downloads
 */

import fs from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import PptxGenJS from 'pptxgenjs';

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
 * Reads a text file and returns its content
 * @param {string} filename - The name of the file to read
 * @returns {Promise<string>} The file content
 */
async function readTextFile(filename) {
  try {
    const filePath = path.join(downloadsDir, filename);
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw error;
  }
}

/**
 * Parses text content into sections
 * @param {string} content - The text content to parse
 * @returns {Array<{title: string, content: string}>} Parsed sections
 */
function parseTextContent(content) {
  const lines = content.split('\n');

  /* -------------------- #
   * 1) FIRST PASS: split on numbered headings like
   *    \"1. Title & Vision\"
   * -------------------- */
  const numSections = [];
  let current = null;
  for (const raw of lines) {
    const line = raw.trimEnd();
    const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numMatch) {
      // Start new section
      if (current) {
        numSections.push({
          title: current.title.trim(),
          content: current.content.join('\n').trim()
        });
      }
      current = { title: numMatch[2].trim(), content: [] };
    } else {
      // push line to current section or to a holding section
      if (!current) {
        current = { title: '', content: [] };
      }
      current.content.push(line);
    }
  }
  if (current && (current.title || current.content.length)) {
    numSections.push({
      title: current.title.trim(),
      content: current.content.join('\n').trim()
    });
  }

  // If we detected multiple numbered sections, use them.
  if (numSections.length > 1) {
    return numSections;
  }

  /* -------------------- #
   * 2) FALLBACK: original upper-case / === parsing
   * -------------------- */
  const fallbackSections = [];
  let cur = { title: '', content: [] };
  let inSection = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.match(/^[A-Z\\s–\\-]+$/) || line.match(/^={3,}$/)) {
      if (line.match(/^[=\\-–]{3,}$/)) continue; // skip separators

      if (inSection && cur.title) {
        fallbackSections.push({
          title: cur.title.trim(),
          content: cur.content.join('\\n').trim()
        });
      }
      cur = { title: line.trim(), content: [] };
      inSection = true;
    } else if (inSection) {
      cur.content.push(line);
    } else {
      if (!cur.title) {
        cur.title = line.trim();
      } else {
        cur.content.push(line);
      }
    }
  }
  if (inSection && cur.title) {
    fallbackSections.push({
      title: cur.title.trim(),
      content: cur.content.join('\\n').trim()
    });
  }

  return fallbackSections.length ? fallbackSections : numSections;
}

/**
 * Generates a PDF from an HTML file using Puppeteer
 * @param {string} htmlFile - Source HTML filename (relative to downloadsDir)
 * @param {string} pdfFile  - Output PDF filename (relative to downloadsDir)
 */
async function generatePDFFromHTML(htmlFile, pdfFile) {
  console.log(`Generating ${pdfFile} from ${htmlFile} (Puppeteer)…`);
  const htmlPath = path.join(downloadsDir, htmlFile);
  const pdfPath  = path.join(downloadsDir, pdfFile);

  // Ensure source exists
  if (!existsSync(htmlPath)) {
    throw new Error(`Source HTML not found: ${htmlPath}`);
  }

  const browser = await puppeteer.launch({
    headless: 'new'
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
    });
    console.log(`✅ Generated ${pdfFile}`);
  } finally {
    await browser.close();
  }
}

/**
 * Generates a PPTX file from text content
 * @param {string} inputFile - The input text file
 * @param {string} outputFile - The output PPTX file
 */
async function generatePPTX(inputFile, outputFile) {
  console.log(`Generating ${outputFile} from ${inputFile}...`);
  
  try {
    const content = await readTextFile(inputFile);
    const sections = parseTextContent(content);
    
    // Create presentation
    const pres = new PptxGenJS();
    
    // Set presentation properties
    pres.layout = 'LAYOUT_16x9';
    pres.company = 'FaithTalkAI';
    pres.title = sections[0]?.title || 'FaithTalkAI Presentation';
    
    // Create master slide with brand colors
    pres.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: { color: BRAND.white },
      objects: [
        { rect: { x: 0, y: 0, w: '100%', h: 1.0, fill: { color: BRAND.primary } } },
        { rect: { x: 0, y: 1.0, w: '100%', h: 0.1, fill: { color: BRAND.accent } } },
        { rect: { x: 0, y: '96%', w: '100%', h: 0.5, fill: { color: BRAND.primary } } },
        { text: { text: '© 2025 FaithTalkAI | FaithTalkAI.com', x: 0.5, y: '96.5%', w: '100%', align: 'center', color: BRAND.white, fontSize: 10 } }
      ]
    });
    
    // Create title slide
    const titleSlide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    
    // Add title
    titleSlide.addText(sections[0]?.title || 'FaithTalkAI Presentation', {
      x: 0.5,
      y: 2.0,
      w: '90%',
      h: 1.5,
      align: 'center',
      fontSize: 44,
      bold: true,
      color: BRAND.primary
    });
    
    // Add subtitle if available
    if (sections[0]?.content) {
      const subtitleMatch = sections[0].content.match(/^(.+)$/m);
      if (subtitleMatch) {
        titleSlide.addText(subtitleMatch[1], {
          x: 0.5,
          y: 3.5,
          w: '90%',
          h: 0.8,
          align: 'center',
          fontSize: 28,
          color: BRAND.primary
        });
      }
    }
    
    // Skip the first section as it's the title
    // Each section becomes a slide
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
      
      // Add slide number
      slide.addText(`${i}`, {
        x: 0.5,
        y: 1.3,
        w: 0.6,
        h: 0.6,
        align: 'center',
        fontSize: 18,
        bold: true,
        color: BRAND.primary,
        fill: { color: BRAND.accent },
        shape: pres.ShapeType.ellipse
      });
      
      // Add section title
      slide.addText(section.title, {
        x: 1.2,
        y: 1.3,
        w: '80%',
        h: 0.6,
        fontSize: 28,
        bold: true,
        color: BRAND.primary
      });
      
      // Process content for bullets
      const contentLines = section.content.split('\n').filter(line => line.trim());
      const bulletPoints = [];
      
      for (const line of contentLines) {
        // Check if line is a bullet point
        if (line.match(/^[\s]*[•\-–][\s]/) || line.match(/^[\s]*\d+\.[\s]/)) {
          const bulletText = line.replace(/^[\s]*[•\-–][\s]/, '').replace(/^[\s]*\d+\.[\s]/, '').trim();
          bulletPoints.push(bulletText);
        }
      }
      
      // Add bullet points
      if (bulletPoints.length > 0) {
        slide.addText(bulletPoints, {
          x: 1.0,
          y: 2.2,
          w: '80%',
          h: 4.0,
          fontSize: 20,
          color: BRAND.black,
          bullet: { type: 'bullet' }
        });
      } else {
        // If no bullet points, add the whole content as text
        slide.addText(section.content, {
          x: 1.0,
          y: 2.2,
          w: '80%',
          h: 4.0,
          fontSize: 20,
          color: BRAND.black
        });
      }
    }
    
    // Save presentation
    const outputPath = path.join(downloadsDir, outputFile);
    await pres.writeFile({ fileName: outputPath });
    console.log(`✅ Generated ${outputFile}`);
    
  } catch (error) {
    console.error(`Error generating ${outputFile}:`, error);
    throw error;
  }
}

/**
 * Main function to generate all download files
 */
async function generateDownloads() {
  try {
    console.log('Starting download file generation...');
    
    // Ensure downloads directory exists
    await ensureDirectoryExists();
    
    // Generate PDFs from branded HTML (better layout)
    await generatePDFFromHTML('one-pager.html', 'one-pager.pdf');
    await generatePDFFromHTML('pastor-demo-script.html', 'pastor-demo-script.pdf');
    await generatePDFFromHTML('small-group-launch-guide.html', 'small-group-launch-guide.pdf');
    
    // Generate PPTX
    await generatePPTX('slide-deck-outline.txt', 'slide-deck.pptx');
    
    console.log('✅ All download files generated successfully!');
    console.log('Files available in:', downloadsDir);
  } catch (error) {
    console.error('Error generating download files:', error);
    process.exit(1);
  }
}

// Run the main function
generateDownloads();
