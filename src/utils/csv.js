import Papa from 'papaparse';

// Convert array of objects to CSV string with headers
export function toCsv(rows, { quotes = true } = {}) {
  return Papa.unparse(rows || [], {
    quotes,
    header: true,
    skipEmptyLines: true,
  });
}

// Parse CSV string/file to objects (header-based)
export function parseCsv(content) {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => String(h || '').trim(),
      complete: (res) => resolve(res.data || []),
      error: (err) => reject(err),
    });
  });
}

// Download a blob as a file in browser
export function download(filename, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
