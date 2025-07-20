/**
 * csvParser.js
 * 
 * A robust CSV parser that correctly handles:
 * - Quoted fields (fields inside double quotes can contain commas)
 * - Escaped quotes inside quoted fields
 * - Newlines inside quoted fields
 * - Empty fields
 */

/**
 * Parses CSV text into an array of objects
 * @param {string} csvText - The CSV text to parse
 * @returns {Array<Object>} - Array of objects where each object represents a row
 */
export const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    return [];
  }

  // Split into lines, preserving newlines inside quoted fields
  const rows = splitIntoRows(csvText.trim());
  if (rows.length === 0) {
    return [];
  }

  // Parse header row
  const headers = parseRow(rows[0]);
  
  // Parse data rows
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].trim();
    if (!row) continue; // Skip empty rows
    
    const values = parseRow(row);
    const rowObject = {};
    
    // Map values to headers
    headers.forEach((header, index) => {
      // Trim header and value
      const trimmedHeader = header.trim();
      const value = index < values.length ? values[index] : '';
      rowObject[trimmedHeader] = value;
    });
    
    data.push(rowObject);
  }
  
  return data;
};

/**
 * Splits CSV text into rows, respecting quoted fields that may contain newlines
 * @param {string} csvText - The CSV text to split
 * @returns {Array<string>} - Array of row strings
 */
function splitIntoRows(csvText) {
  const rows = [];
  let currentRow = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = i < csvText.length - 1 ? csvText[i + 1] : '';
    
    // Handle escaped quotes
    if (char === '"' && nextChar === '"') {
      currentRow += '"';
      i++; // Skip the next quote
      continue;
    }
    
    // Toggle quote state
    if (char === '"') {
      inQuotes = !inQuotes;
      currentRow += char;
      continue;
    }
    
    // Handle newlines
    if (char === '\n' && !inQuotes) {
      rows.push(currentRow);
      currentRow = '';
      continue;
    }
    
    // Handle carriage return (Windows-style line endings)
    if (char === '\r' && nextChar === '\n' && !inQuotes) {
      // Skip the \r, we'll handle the \n in the next iteration
      continue;
    }
    
    // Add character to current row
    currentRow += char;
  }
  
  // Add the last row if there's content
  if (currentRow) {
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Parses a single CSV row into an array of values
 * @param {string} row - The CSV row to parse
 * @returns {Array<string>} - Array of values
 */
function parseRow(row) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = i < row.length - 1 ? row[i + 1] : '';
    
    // Handle escaped quotes
    if (char === '"' && nextChar === '"') {
      currentValue += '"';
      i++; // Skip the next quote
      continue;
    }
    
    // Toggle quote state
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    
    // Handle commas
    if (char === ',' && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }
    
    // Add character to current value
    currentValue += char;
  }
  
  // Add the last value
  values.push(currentValue.trim());
  
  return values;
}

/**
 * Attempts to parse a JSON string, returning null if parsing fails
 * @param {string} str - The string to parse as JSON
 * @returns {Object|null} - Parsed object or null if parsing fails
 */
export const tryParseJson = (str) => {
  if (!str || typeof str !== 'string') {
    return null;
  }
  
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn(`Failed to parse JSON: ${str.substring(0, 50)}${str.length > 50 ? '...' : ''}`);
    return null;
  }
};

export default {
  parseCSV,
  tryParseJson
};
