/**
 * PATROL360 Universal Excel & CSV Export Utility
 * Generates formatted Excel-compatible CSV with UTF-8 BOM so it opens seamlessly in Microsoft Excel, Google Sheets, etc.
 * 
 * @param {Array<Object>} data - Array of data rows
 * @param {string} filename - Output file name without extension
 * @param {Array<{key: string, label: string}>} [columns] - Optional column key and label mapping
 */
export function exportToExcel(data, filename = 'Export_Report', columns = null) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // 1. Determine columns and headers
  let headers = [];
  let keys = [];

  if (columns && Array.isArray(columns) && columns.length > 0) {
    headers = columns.map(c => c.label);
    keys = columns.map(c => c.key);
  } else {
    // Auto-detect keys from first object
    keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object' || data[0][k] === null);
    headers = keys.map(k => k.replace(/_/g, ' ').toUpperCase());
  }

  // Helper to escape CSV values
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    str = str.replace(/"/g, '""'); // escape double quotes
    return `"${str}"`;
  };

  // 2. Build CSV rows
  const headerRow = headers.map(h => escapeCsv(h)).join(',');
  const dataRows = data.map(row => {
    return keys.map(key => escapeCsv(row[key])).join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\r\n');

  // 3. Add UTF-8 BOM (\uFEFF) so Excel correctly recognizes characters and formatting
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 4. Trigger download
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalFilename = `${filename}_${dateStr}.csv`;

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, finalFilename);
  } else {
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', finalFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}
