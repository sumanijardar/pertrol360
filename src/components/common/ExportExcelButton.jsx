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
      className={`inline-flex items-center justify-center gap-2 h-8 px-3.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-2xs transition-colors cursor-pointer ${className}`}
      style={{ minHeight: '32px', paddingLeft: '12px', paddingRight: '12px', gap: '8px', ...style }}
    >
      <IconFileSpreadsheet size={14} className="text-emerald-700 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}
