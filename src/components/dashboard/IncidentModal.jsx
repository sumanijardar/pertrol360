import React from 'react';

export default function IncidentModal({ modalData, onClose, onDispatchUnit }) {
  if (!modalData) return null;

  const { type, data } = modalData;

  const getTitle = () => {
    if (type === 'ANPR') return `ANPR DETECTION: ${data.detected_plate_number}`;
    if (type === 'WEAPON') return `WEAPON THREAT ALERT: ${data.weapon_class}`;
    if (type === 'FIRE') return `ENVIRONMENTAL HAZARD: ${data.hazard_type}`;
    if (type === 'CROWD') return `CROWD SURGE ANOMALY: ${data.location_name}`;
    return 'TACTICAL INCIDENT DETAIL';
  };

  const getSubtitle = () => {
    if (type === 'ANPR') return data.is_stolen_match ? '🚨 STOLEN VEHICLE WATCHLIST MATCH' : 'Standard License Plate Scan';
    if (type === 'WEAPON') return `Severity: ${data.severity_level} (AI Confidence: ${data.confidence}%)`;
    if (type === 'FIRE') return `Smoke Density: ${data.smoke_density_level}`;
    if (type === 'CROWD') return `Head Count: ${data.head_count} (Limit: ${data.threshold_limit})`;
    return '';
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1055 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content shadow border-0 rounded-3">
          {/* Modal Header */}
          <div className="modal-header bg-light py-2 px-3 border-bottom">
            <div>
              <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                {getTitle()}
              </h5>
              <div className="text-danger small fw-bold mt-1">
                {getSubtitle()}
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-3" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {/* Snapshot Imagery */}
            <div className="position-relative w-100 rounded overflow-hidden border mb-3" style={{ height: '240px', background: '#0f172a' }}>
              <img
                src={data.scene_snapshot_url || data.plate_crop_image_url || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80'}
                alt="Scene preview"
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
              <div className="position-absolute bottom-0 start-0 m-2 bg-dark bg-opacity-75 text-white px-2 py-1 rounded small font-mono">
                <span>AI VISION LOCK: </span>
                <strong className="text-success">GEO: {data.latitude || '23.0372'}°N, {data.longitude || '72.5613'}°E</strong>
              </div>
            </div>

            {/* Details Grid */}
            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <div className="p-2 bg-light rounded border">
                  <div className="text-muted small fw-bold text-uppercase">Source Vehicle Unit</div>
                  <div className="fw-bold text-primary font-mono fs-6">{data.vehicle_id || 'PATROL_VAN_01'}</div>
                  <div className="text-secondary small">Sensor: {data.camera_id || 'CAM_01_FRONT'}</div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-2 bg-light rounded border">
                  <div className="text-muted small fw-bold text-uppercase">Location & Timestamp</div>
                  <div className="fw-bold text-dark">{data.location_name || 'Ahmedabad Metro Route 1'}</div>
                  <div className="text-muted small font-mono">{data.timestamp || 'Real-time Telemetry'}</div>
                </div>
              </div>
            </div>

            {/* Specific Data Details */}
            {type === 'ANPR' && (
              <div className="p-3 bg-danger-subtle border border-danger-subtle rounded">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="ind-number-plate d-inline-flex">
                    <span className="ind-flag">IND</span>
                    <span>{data.detected_plate_number}</span>
                  </div>
                  <span className="badge bg-danger">CONFIDENCE: {data.ocr_confidence}%</span>
                </div>
                {data.is_stolen_match && (
                  <div className="text-danger small">
                    <div><strong>Crime Record:</strong> {data.fir_reference} (Theft reported at Navrangpura Police Station)</div>
                    <div><strong>Owner on File:</strong> Devendra K. Sharma (Vehicle: White Hyundai Creta SX)</div>
                  </div>
                )}
              </div>
            )}

            {type === 'WEAPON' && (
              <div className="p-3 bg-danger-subtle border border-danger-subtle rounded">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold text-danger">THREAT TYPE: {data.weapon_class}</span>
                  <span className="badge bg-danger">CONF: {data.confidence}%</span>
                </div>
                <p className="text-dark small mb-1">{data.target_summary}</p>
                <div className="font-mono text-muted small" style={{ fontSize: '10px' }}>
                  Bounding Box Matrix: {data.bounding_box_json}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light py-2 px-3 border-top">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Inspector
            </button>
            <button
              className="btn btn-danger btn-sm fw-bold"
              onClick={() => {
                if (onDispatchUnit) onDispatchUnit(data);
                onClose();
              }}
            >
              ⚡ Dispatch Tactical Intercept Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
