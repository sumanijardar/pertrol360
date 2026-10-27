import React, { useState } from 'react';
import { ANPR_DETECTION_EVENTS } from '../../data/mockData';
import { IconShieldAlert, IconSearch } from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';

export default function AnprWatchlist() {
  const [events, setEvents] = useState(ANPR_DETECTION_EVENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredEvents = events.filter(e =>
    !searchTerm ||
    e.detected_plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.fir_reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const excelColumns = [
    { key: 'event_id', label: 'Event ID' },
    { key: 'detected_plate_number', label: 'Plate Number' },
    { key: 'vehicle_id', label: 'Patrol Van' },
    { key: 'location_name', label: 'Location' },
    { key: 'fir_reference', label: 'FIR Reference' },
    { key: 'stolen_status', label: 'Status' },
    { key: 'detected_timestamp', label: 'Timestamp' }
  ];

  return (
    <div className="container-fluid px-3 py-3 overflow-x-hidden">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-danger d-flex"><IconShieldAlert size={22} /></span>
            <h1 className="h4 fw-bold text-dark mb-0">ANPR Stolen Vehicle Watchlist</h1>
            <span className="badge bg-danger text-white ms-1 font-mono fw-bold">{events.length} HITS</span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Real-time automatic number plate recognition hits against National Crime Records Bureau (NCRB) database
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0 mb-3 bg-white">
        <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Search Box */}
          <div className="input-group input-group-sm shadow-sm" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-light text-muted border-end-0">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm border-start-0 text-dark fw-semibold"
              placeholder="Search plate, FIR, location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Export Button */}
          <ExportExcelButton
            data={filteredEvents}
            filename="ANPR_Stolen_Watchlist"
            columns={excelColumns}
            label="Export Watchlist"
          />
        </div>

        {/* Data Table Container */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1000px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr className="text-uppercase small" style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                <th scope="col" className="py-3 px-3 text-center align-middle" style={{ width: '48px', borderRight: '1px solid #e2e8f0' }}>#</th>
                <th scope="col" className="py-3 px-3 align-middle" style={{ borderRight: '1px solid #e2e8f0' }}>Registration Plate</th>
                <th scope="col" className="py-3 px-3 align-middle" style={{ borderRight: '1px solid #e2e8f0' }}>FIR / Crime Reference</th>
                <th scope="col" className="py-3 px-3 align-middle" style={{ borderRight: '1px solid #e2e8f0' }}>Detecting Van</th>
                <th scope="col" className="py-3 px-3 align-middle" style={{ borderRight: '1px solid #e2e8f0' }}>Intercept Location</th>
                <th scope="col" className="py-3 px-3 align-middle" style={{ borderRight: '1px solid #e2e8f0' }}>OCR Confidence</th>
                <th scope="col" className="py-3 px-3 text-center align-middle" style={{ width: '130px', borderRight: '1px solid #e2e8f0' }}>Status</th>
                <th scope="col" className="py-3 px-3 text-center align-middle" style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-5 text-center text-muted fw-semibold">
                    No stolen vehicle alerts found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((item, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={item.event_id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                      <td className="py-3 px-3 text-center align-middle text-muted fw-semibold" style={{ fontSize: '12.5px' }}>
                        {rowIndex}
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <div className="ind-number-plate d-inline-flex align-middle">
                          <span className="ind-flag">IND</span>
                          <span>{item.detected_plate_number}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-middle font-mono fw-bold text-danger" style={{ fontSize: '12.5px' }}>
                        {item.fir_reference}
                      </td>

                      <td className="py-3 px-3 align-middle font-mono text-dark fw-bold" style={{ fontSize: '12.5px' }}>
                        {item.vehicle_id}
                      </td>

                      <td className="py-3 px-3 align-middle text-secondary" style={{ fontSize: '12.5px' }}>
                        {item.location_name}
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '80px' }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${item.ocr_confidence * 100}%` }}
                            />
                          </div>
                          <span className="font-mono small text-success fw-bold">
                            {(item.ocr_confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center align-middle">
                        <span
                          className="badge rounded-pill shadow-sm"
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '5px 14px',
                            letterSpacing: '0.02em',
                            display: 'inline-block'
                          }}
                        >
                          {item.stolen_status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center align-middle">
                        <button
                          type="button"
                          className="btn btn-sm p-0 shadow-sm"
                          title="Intercept Alert"
                          onClick={() => alert(`🚨 Intercepting vehicle ${item.detected_plate_number} at ${item.location_name}`)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredEvents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
