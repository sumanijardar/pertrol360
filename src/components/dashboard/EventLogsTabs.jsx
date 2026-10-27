import React, { useState, useEffect, useMemo } from 'react';
import {
  IconCar,
  IconCrosshair,
  IconFlame,
  IconUsers,
  IconSend
} from '../common/Icons';
import Pagination from '../common/Pagination';
import ExportExcelButton from '../common/ExportExcelButton';

export default function EventLogsTabs({
  anprEvents = [],
  weaponThreats = [],
  fireHazards = [],
  crowdEvents = [],
  dispatchQueue = [],
  onOpenEventModal
}) {
  const [activeTab, setActiveTab] = useState('ANPR'); // 'ANPR' | 'WEAPONS' | 'FIRE' | 'CROWD' | 'QUEUE'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Centralized Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Reset to page 1 on active tab or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Compute filtered dataset for each tab
  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    switch (activeTab) {
      case 'ANPR':
        return anprEvents.filter(e =>
          !q ||
          e.detected_plate_number.toLowerCase().includes(q) ||
          (e.fir_reference && e.fir_reference.toLowerCase().includes(q)) ||
          e.location_name.toLowerCase().includes(q) ||
          e.vehicle_id.toLowerCase().includes(q)
        );
      case 'WEAPONS':
        return weaponThreats.filter(w =>
          !q ||
          w.weapon_class.toLowerCase().includes(q) ||
          w.location_name.toLowerCase().includes(q) ||
          w.threat_id.toLowerCase().includes(q) ||
          w.vehicle_id.toLowerCase().includes(q)
        );
      case 'FIRE':
        return fireHazards.filter(f =>
          !q ||
          f.hazard_type.toLowerCase().includes(q) ||
          f.location_name.toLowerCase().includes(q) ||
          f.hazard_id.toLowerCase().includes(q) ||
          f.vehicle_id.toLowerCase().includes(q)
        );
      case 'CROWD':
        return crowdEvents.filter(c =>
          !q ||
          c.location_name.toLowerCase().includes(q) ||
          c.crowd_event_id.toLowerCase().includes(q) ||
          c.density_category.toLowerCase().includes(q) ||
          c.vehicle_id.toLowerCase().includes(q)
        );
      case 'QUEUE':
        return dispatchQueue.filter(qu =>
          !q ||
          qu.event_id.toLowerCase().includes(q) ||
          qu.event_type.toLowerCase().includes(q) ||
          qu.destination_url.toLowerCase().includes(q) ||
          qu.delivery_status.toLowerCase().includes(q)
        );
      default:
        return [];
    }
  }, [activeTab, searchTerm, anprEvents, weaponThreats, fireHazards, crowdEvents, dispatchQueue]);

  // Slice for pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Excel filename and custom columns for each tab
  const excelConfig = useMemo(() => {
    switch (activeTab) {
      case 'ANPR':
        return {
          fileName: 'ANPR_Watchlist_Detections',
          columns: [
            { key: 'event_id', label: 'Event ID' },
            { key: 'detected_plate_number', label: 'Plate Number' },
            { key: 'vehicle_classification', label: 'Vehicle Class' },
            { key: 'ocr_confidence', label: 'OCR Confidence (%)' },
            { key: 'is_stolen_match', label: 'Stolen Hotlist Match' },
            { key: 'fir_reference', label: 'FIR Reference' },
            { key: 'vehicle_id', label: 'Patrol Vehicle ID' },
            { key: 'camera_id', label: 'Camera Sensor' },
            { key: 'location_name', label: 'Location' },
            { key: 'timestamp', label: 'Detection Timestamp' },
            { key: 'hq_sync_status', label: 'HQ Sync Status' }
          ]
        };
      case 'WEAPONS':
        return {
          fileName: 'Weapon_Threat_Incidents',
          columns: [
            { key: 'threat_id', label: 'Threat ID' },
            { key: 'weapon_class', label: 'Weapon Class' },
            { key: 'confidence', label: 'Confidence Score (%)' },
            { key: 'severity_level', label: 'Severity Level' },
            { key: 'target_summary', label: 'Target Summary' },
            { key: 'vehicle_id', label: 'Patrol Vehicle' },
            { key: 'location_name', label: 'Incident Location' },
            { key: 'timestamp', label: 'Timestamp' },
            { key: 'operator_ack_by', label: 'Operator Acknowledged' }
          ]
        };
      case 'FIRE':
        return {
          fileName: 'Fire_Hazard_Incidents',
          columns: [
            { key: 'hazard_id', label: 'Hazard ID' },
            { key: 'hazard_type', label: 'Hazard Type' },
            { key: 'confidence', label: 'Confidence (%)' },
            { key: 'smoke_density_level', label: 'Smoke Density' },
            { key: 'location_name', label: 'Location' },
            { key: 'vehicle_id', label: 'Patrol Vehicle' },
            { key: 'fire_brigade_notified', label: 'Fire Brigade Alerted' },
            { key: 'notes', label: 'Officer Field Notes' }
          ]
        };
      case 'CROWD':
        return {
          fileName: 'Crowd_Density_Analytics',
          columns: [
            { key: 'crowd_event_id', label: 'Crowd Event ID' },
            { key: 'location_name', label: 'Location' },
            { key: 'head_count', label: 'Head Count' },
            { key: 'density_category', label: 'Density Category' },
            { key: 'threshold_limit', label: 'Threshold Limit' },
            { key: 'is_threshold_exceeded', label: 'Threshold Exceeded' },
            { key: 'vehicle_id', label: 'Patrol Vehicle' },
            { key: 'trend', label: 'Trend' }
          ]
        };
      case 'QUEUE':
        return {
          fileName: 'HQ_Dispatch_Outbox_Queue',
          columns: [
            { key: 'queue_id', label: 'Queue ID' },
            { key: 'event_id', label: 'Event ID' },
            { key: 'event_type', label: 'Event Type' },
            { key: 'destination_url', label: 'Target URL' },
            { key: 'retry_count', label: 'Retry Attempts' },
            { key: 'delivery_status', label: 'Delivery Status' }
          ]
        };
      default:
        return { fileName: 'Patrol360_Export', columns: null };
    }
  }, [activeTab]);

  const tabs = [
    { id: 'ANPR', label: 'ANPR Watchlist', count: anprEvents.length, icon: <IconCar size={15} />, badgeColor: 'bg-danger' },
    { id: 'WEAPONS', label: 'Weapon Threats', count: weaponThreats.length, icon: <IconCrosshair size={15} />, badgeColor: 'bg-warning text-dark' },
    { id: 'FIRE', label: 'Fire & Hazards', count: fireHazards.length, icon: <IconFlame size={15} />, badgeColor: 'bg-warning text-dark' },
    { id: 'CROWD', label: 'Crowd Analytics', count: crowdEvents.length, icon: <IconUsers size={15} />, badgeColor: 'bg-info text-dark' },
    { id: 'QUEUE', label: 'Outbox Queue', count: dispatchQueue.length, icon: <IconSend size={15} />, badgeColor: 'bg-primary' }
  ];

  return (
    <div className="card shadow-sm border-0 w-100">
      {/* Bootstrap 5 Tab Header Strip */}
      <div className="card-header bg-light border-bottom p-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
        {/* Navigation Tabs */}
        <ul className="nav nav-pills gap-1 flex-nowrap overflow-x-auto pb-1 mb-0">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="nav-item">
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn btn-sm d-flex align-items-center gap-1 text-nowrap fw-bold ${isActive ? 'btn-primary shadow-sm' : 'btn-outline-secondary bg-white text-dark'}`}
                  style={{ fontSize: '11px' }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`badge ms-1 ${isActive ? 'bg-white text-primary' : tab.badgeColor}`} style={{ fontSize: '10px' }}>
                    {tab.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Action Tools: Excel Export + Search */}
        <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
          {/* Centralized Bootstrap Excel Button */}
          <ExportExcelButton
            data={filteredData}
            fileName={excelConfig.fileName}
            columns={excelConfig.columns}
            label={`Export ${activeTab} Excel`}
          />

          {/* Quick Search Box */}
          <div className="input-group input-group-sm" style={{ maxWidth: '240px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">🔍</span>
            <input
              type="text"
              className="form-control form-control-sm border-start-0"
              placeholder="Search active log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content Tables (Bootstrap 5 table-responsive) */}
      <div className="table-responsive" style={{ maxHeight: '440px' }}>
        {/* ======================= TAB 1: ANPR ======================= */}
        {activeTab === 'ANPR' && (
          <table className="table table-hover table-bordered table-striped align-middle text-center mb-0 text-nowrap">
            <thead className="table-light text-uppercase small text-dark fw-bold sticky-top">
              <tr>
                <th scope="col" className="py-2 px-3">Plate Number</th>
                <th scope="col" className="py-2 px-3">Vehicle Class</th>
                <th scope="col" className="py-2 px-3">OCR Conf.</th>
                <th scope="col" className="py-2 px-3">Watchlist / FIR Status</th>
                <th scope="col" className="py-2 px-3">Patrol Van & Camera</th>
                <th scope="col" className="py-2 px-3">Location & Time</th>
                <th scope="col" className="py-2 px-3">HQ Sync</th>
                <th scope="col" className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-muted fw-semibold">
                    No ANPR detection records match the current filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map(event => (
                  <tr key={event.event_id} className={event.is_stolen_match ? 'table-danger' : ''}>
                    <td>
                      <div className="ind-number-plate d-inline-flex align-middle">
                        <span className="ind-flag">IND</span>
                        <span>{event.detected_plate_number}</span>
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">{event.vehicle_classification}</td>
                    <td className="font-mono fw-bold">
                      <span className={event.ocr_confidence > 98 ? 'text-success' : 'text-warning'}>
                        {event.ocr_confidence}%
                      </span>
                    </td>
                    <td>
                      {event.is_stolen_match ? (
                        <div className="d-flex flex-column align-items-center gap-1">
                          <span className="badge bg-danger shadow-sm">🚨 STOLEN HOTLIST MATCH</span>
                          <span className="text-danger small font-mono fw-bold">{event.fir_reference}</span>
                        </div>
                      ) : (
                        <span className="badge bg-success">CLEAN / REGISTERED</span>
                      )}
                    </td>
                    <td className="font-mono text-dark">
                      <div className="fw-bold">{event.vehicle_id}</div>
                      <span className="small text-muted">{event.camera_id}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark small">{event.location_name}</div>
                      <div className="text-muted small font-mono">{event.timestamp}</div>
                    </td>
                    <td>
                      <span className="badge bg-info text-dark">{event.hq_sync_status}</span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${event.is_stolen_match ? 'btn-danger fw-bold' : 'btn-outline-primary'}`}
                        onClick={() => onOpenEventModal({ type: 'ANPR', data: event })}
                      >
                        {event.is_stolen_match ? '⚡ Intercept Unit' : 'View Snapshot'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ======================= TAB 2: WEAPON THREATS ======================= */}
        {activeTab === 'WEAPONS' && (
          <table className="table table-hover table-bordered table-striped align-middle text-center mb-0 text-nowrap">
            <thead className="table-light text-uppercase small text-dark fw-bold sticky-top">
              <tr>
                <th scope="col" className="py-2 px-3">Threat ID</th>
                <th scope="col" className="py-2 px-3">Weapon Classification</th>
                <th scope="col" className="py-2 px-3">AI Confidence</th>
                <th scope="col" className="py-2 px-3">Severity Level</th>
                <th scope="col" className="py-2 px-3">Detection Summary</th>
                <th scope="col" className="py-2 px-3">Assigned Patrol</th>
                <th scope="col" className="py-2 px-3">Operator Acknowledgment</th>
                <th scope="col" className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-muted fw-semibold">
                    No weapon threats detected matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map(threat => (
                  <tr key={threat.threat_id} className={threat.severity_level === 'CRITICAL_RED' ? 'table-danger' : ''}>
                    <td className="font-mono fw-bold text-danger">{threat.threat_id}</td>
                    <td>
                      <div className="d-inline-flex align-items-center gap-1 fw-bold text-dark">
                        <span>{threat.weapon_class === 'HANDGUN' ? '🔫' : threat.weapon_class === 'RIFLE' ? '🎯' : '🔪'}</span>
                        <span>{threat.weapon_class}</span>
                      </div>
                    </td>
                    <td className="font-mono fw-bold text-warning">{threat.confidence}%</td>
                    <td>
                      <span className={`badge ${threat.severity_level === 'CRITICAL_RED' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {threat.severity_level}
                      </span>
                    </td>
                    <td>
                      <div className="small fw-semibold text-dark">{threat.target_summary}</div>
                      <div className="small text-muted font-mono">{threat.location_name} • {threat.timestamp}</div>
                    </td>
                    <td className="font-mono fw-bold text-dark">{threat.vehicle_id}</td>
                    <td>
                      <span className={`badge ${threat.operator_ack_by.includes('Pending') ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                        {threat.operator_ack_by}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm fw-bold"
                        onClick={() => onOpenEventModal({ type: 'WEAPON', data: threat })}
                      >
                        ⚡ Tactical Response
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ======================= TAB 3: FIRE & SMOKE ======================= */}
        {activeTab === 'FIRE' && (
          <table className="table table-hover table-bordered table-striped align-middle text-center mb-0 text-nowrap">
            <thead className="table-light text-uppercase small text-dark fw-bold sticky-top">
              <tr>
                <th scope="col" className="py-2 px-3">Hazard ID</th>
                <th scope="col" className="py-2 px-3">Hazard Type</th>
                <th scope="col" className="py-2 px-3">Confidence</th>
                <th scope="col" className="py-2 px-3">Smoke Density</th>
                <th scope="col" className="py-2 px-3">Location Notes</th>
                <th scope="col" className="py-2 px-3">Patrol Vehicle</th>
                <th scope="col" className="py-2 px-3">Fire Dept Dispatched</th>
                <th scope="col" className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-muted fw-semibold">
                    No active fire or smoke hazards detected.
                  </td>
                </tr>
              ) : (
                paginatedData.map(f => (
                  <tr key={f.hazard_id}>
                    <td className="font-mono fw-bold text-warning">{f.hazard_id}</td>
                    <td><span className="badge bg-warning text-dark">🔥 {f.hazard_type}</span></td>
                    <td className="font-mono fw-bold text-success">{f.confidence}%</td>
                    <td className="fw-semibold text-dark">{f.smoke_density_level}</td>
                    <td>
                      <div className="fw-bold text-dark small">{f.location_name}</div>
                      <div className="text-muted small">{f.notes}</div>
                    </td>
                    <td className="font-mono fw-bold text-dark">{f.vehicle_id}</td>
                    <td>
                      {f.fire_brigade_notified ? (
                        <span className="badge bg-success">✓ YES (ALERTED)</span>
                      ) : (
                        <span className="badge bg-danger">NOT NOTIFIED</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-warning btn-sm text-dark fw-bold"
                        onClick={() => onOpenEventModal({ type: 'FIRE', data: f })}
                      >
                        Inspect Hazard
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ======================= TAB 4: CROWD ANALYTICS ======================= */}
        {activeTab === 'CROWD' && (
          <table className="table table-hover table-bordered table-striped align-middle text-center mb-0 text-nowrap">
            <thead className="table-light text-uppercase small text-dark fw-bold sticky-top">
              <tr>
                <th scope="col" className="py-2 px-3">Event ID</th>
                <th scope="col" className="py-2 px-3">Location</th>
                <th scope="col" className="py-2 px-3">Head Count</th>
                <th scope="col" className="py-2 px-3">Density Category</th>
                <th scope="col" className="py-2 px-3">Threshold Limit</th>
                <th scope="col" className="py-2 px-3">Breach Status</th>
                <th scope="col" className="py-2 px-3">Patrol Vehicle</th>
                <th scope="col" className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-muted fw-semibold">
                    No crowd anomalies detected in this view.
                  </td>
                </tr>
              ) : (
                paginatedData.map(c => (
                  <tr key={c.crowd_event_id} className={c.is_threshold_exceeded ? 'table-danger' : ''}>
                    <td className="font-mono fw-bold text-primary">{c.crowd_event_id}</td>
                    <td>
                      <div className="fw-bold text-dark small">{c.location_name}</div>
                      <div className="text-muted small">{c.trend}</div>
                    </td>
                    <td className="font-mono fs-6 fw-bold">
                      <span className={c.is_threshold_exceeded ? 'text-danger' : 'text-success'}>
                        {c.head_count}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.is_threshold_exceeded ? 'bg-danger' : 'bg-info text-dark'}`}>
                        {c.density_category}
                      </span>
                    </td>
                    <td className="font-mono text-dark">{c.threshold_limit} persons</td>
                    <td>
                      {c.is_threshold_exceeded ? (
                        <span className="badge bg-danger shadow-sm">⚠ LIMIT EXCEEDED</span>
                      ) : (
                        <span className="badge bg-success">NORMAL FLOW</span>
                      )}
                    </td>
                    <td className="font-mono fw-bold text-dark">{c.vehicle_id}</td>
                    <td>
                      <button
                        className="btn btn-outline-info btn-sm text-dark fw-bold"
                        onClick={() => onOpenEventModal({ type: 'CROWD', data: c })}
                      >
                        Heatmap Analytics
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ======================= TAB 5: CENTRAL QUEUE ======================= */}
        {activeTab === 'QUEUE' && (
          <table className="table table-hover table-bordered table-striped align-middle text-center mb-0 text-nowrap">
            <thead className="table-light text-uppercase small text-dark fw-bold sticky-top">
              <tr>
                <th scope="col" className="py-2 px-3">Queue ID</th>
                <th scope="col" className="py-2 px-3">Event ID</th>
                <th scope="col" className="py-2 px-3">Event Type</th>
                <th scope="col" className="py-2 px-3">Destination URL</th>
                <th scope="col" className="py-2 px-3">Retries</th>
                <th scope="col" className="py-2 px-3">Delivery Status</th>
                <th scope="col" className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-muted fw-semibold">
                    Outbox dispatch queue is empty.
                  </td>
                </tr>
              ) : (
                paginatedData.map(q => (
                  <tr key={q.queue_id}>
                    <td className="font-mono fw-bold text-primary">#{q.queue_id}</td>
                    <td className="font-mono fw-bold text-dark">{q.event_id}</td>
                    <td><span className="badge bg-primary">{q.event_type}</span></td>
                    <td className="font-mono small text-secondary">{q.destination_url}</td>
                    <td className="font-mono text-dark">{q.retry_count} retries</td>
                    <td>
                      <span className={`badge ${q.delivery_status === 'DELIVERED' ? 'bg-success' : q.delivery_status === 'QUEUED' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        {q.delivery_status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => alert(`Resending payload for ${q.event_id} to Central HQ server...`)}
                      >
                        Force Re-sync
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Centralized Universal Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  );
}
