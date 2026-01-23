#!/usr/bin/env node
// Convert GetBible JSON format to KJV-style format for consistency
const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Usage: node convert-bible.js <input.json> <output.json>');
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// GetBible format: { books: [{ name, chapters: [{ verses: [{ text }] }] }] }
// KJV format: [{ name, abbrev, chapters: [[verse1, verse2, ...], ...] }]

const books = raw.books.map(book => {
  const chapters = book.chapters.map(ch => 
    ch.verses.map(v => v.text.trim())
  );
  return {
    abbrev: book.name.toLowerCase().replace(/\s+/g, '').slice(0, 2),
    name: book.name,
    chapters
  };
});

fs.writeFileSync(outputFile, JSON.stringify(books));
console.log(`Converted ${inputFile} -> ${outputFile}`);
console.log(`Books: ${books.length}, Total chapters: ${books.reduce((s, b) => s + b.chapters.length, 0)}`);
