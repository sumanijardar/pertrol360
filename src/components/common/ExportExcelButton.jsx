import React from 'react';
import { exportToExcel } from '../../utils/excelExport';
import { IconFileSpreadsheet } from './Icons';

/**
 * Reusable One-Click Export to Excel / CSV Button (Bootstrap 5)
 * 
 * @param {Array<Object>} data - Dataset array to export
 * @param {string} fileName - File name to save as
 * @param {Array<{key: string, label: string}>} [columns] - Optional specific columns
 * @param {string} [label="Export Excel"] - Button label text
 * @param {Object} [style] - Custom inline styles
 * @param {string} [className] - Optional extra class names
 */
export default function ExportExcelButton({
  data,
  fileName = 'Export_Report',
  columns = null,
  label = 'Export Excel',
  className = '',
  style = {}
}) {
  const handleExport = () => {
    exportToExcel(data, fileName, columns);
  };

  return (
    <button
      onClick={handleExport}
      type="button"
      title="Download Excel Spreadsheet (.csv/.xls)"
      className={`btn btn-success btn-sm d-inline-flex align-items-center gap-1 shadow-sm fw-semibold px-3 py-1 ${className}`}
      style={{ fontSize: '12px', ...style }}
    >
      <IconFileSpreadsheet size={16} color="#ffffff" />
      <span>{label}</span>
    </button>
  );
}
