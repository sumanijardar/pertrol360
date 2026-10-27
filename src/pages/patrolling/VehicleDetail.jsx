import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  POLICE_VEHICLES,
  ANPR_DETECTION_EVENTS,
  WEAPON_THREAT_DETECTIONS,
  FIRE_SMOKE_DETECTIONS,
  CROWD_ANALYTICS_EVENTS
} from '../../data/mockData';
import QuadCameraStream from '../../components/dashboard/QuadCameraStream';
import {
  IconCar,
  IconVideo,
  IconShieldAlert,
  IconCrosshair,
  IconFlame,
  IconUsers,
  IconActivity,
  IconCheckCircle,
  IconAlertTriangle,
  IconDownload
} from '../../components/common/Icons';

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  // Find target vehicle from mock DB
  const vehicle =
    POLICE_VEHICLES.find((v) => v.vehicle_id === vehicleId) ||
    POLICE_VEHICLES[0];

  const [activeAlertTab, setActiveAlertTab] = useState('ALL');

  // Pull vehicle specific alerts from database
  const anprAlerts = ANPR_DETECTION_EVENTS.filter(
    (e) => e.vehicle_id === vehicle.vehicle_id && e.is_stolen_match
  );
  const weaponAlerts = WEAPON_THREAT_DETECTIONS.filter(
    (e) => e.vehicle_id === vehicle.vehicle_id
  );
  const fireAlerts = FIRE_SMOKE_DETECTIONS.filter(
    (e) => e.vehicle_id === vehicle.vehicle_id
  );
  const crowdAlerts = CROWD_ANALYTICS_EVENTS.filter(
    (e) => e.vehicle_id === vehicle.vehicle_id
  );

  // Combine alerts into a unified list
  const combinedAlerts = [
    ...anprAlerts.map((a) => ({
      id: a.event_id,
      category: 'ANPR',
      type: 'STOLEN VEHICLE DETECTED',
      badgeClass: 'bg-danger',
      description: `Target Plate: ${a.detected_plate_number} • ${a.vehicle_classification}`,
      confidence: a.ocr_confidence,
      camera_id: a.camera_id,
      timestamp: a.timestamp,
      location: a.location_name,
      snapshot_url: a.scene_snapshot_url,
      fir_reference: a.fir_reference,
      severity: 'CRITICAL_RED'
    })),
    ...weaponAlerts.map((w) => ({
      id: w.threat_id,
      category: 'WEAPON',
      type: `${w.weapon_class} DETECTED`,
      badgeClass: 'bg-danger',
      description: `Armed Threat detected by patrol camera lens (${w.detection_details?.detected_class || w.weapon_class})`,
      confidence: w.confidence,
      camera_id: w.camera_id,
      timestamp: w.timestamp,
      location: w.location_name,
      snapshot_url: w.snapshot_url,
      fir_reference: 'Immediate Threat Alert',
      severity: w.severity_level || 'CRITICAL_RED'
    })),
    ...fireAlerts.map((f) => ({
      id: f.hazard_id,
      category: 'FIRE',
      type: `${f.hazard_type.replace('_', ' ')}`,
      badgeClass: 'bg-warning text-dark',
      description: `Thermal Hazard Plume: ${f.smoke_density_level || 'Moderate Plume'}`,
      confidence: f.confidence,
      camera_id: f.camera_id,
      timestamp: f.timestamp,
      location: f.location_name,
      snapshot_url: f.snapshot_url,
      fir_reference: 'Hazard Log #FL-902',
      severity: 'HIGH_WARNING'
    })),
    ...crowdAlerts.map((c) => ({
      id: c.crowd_event_id,
      category: 'CROWD',
      type: 'CROWD THRESHOLD EXCEEDED',
      badgeClass: 'bg-info text-dark',
      description: `Headcount: ${c.head_count} persons (Threshold: ${c.threshold_limit}) • ${c.density_category}`,
      confidence: 96.5,
      camera_id: c.camera_id,
      timestamp: c.timestamp,
      location: 'Pedestrian Concourse Area',
      snapshot_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
      fir_reference: 'Crowd Advisory #CR-114',
      severity: 'MODERATE'
    }))
  ];

  // Filter combined alerts by active tab
  const displayAlerts = combinedAlerts.filter((item) => {
    if (activeAlertTab === 'ALL') return true;
    return item.category === activeAlertTab;
  });

  const handleDispatchBackup = (alertItem) => {
    Swal.fire({
      title: 'Dispatch Interception Unit?',
      html: `<p class="mb-1 text-muted">Dispatching nearest backup team to assist <strong class="text-dark">${vehicle.registration_number}</strong> at <strong class="text-primary">${alertItem.location}</strong>.</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Confirm Intercept Unit Dispatch',
      cancelButtonText: 'Cancel'
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire({
          title: 'Unit Dispatched!',
          text: `Command alert transmitted to nearby patrol vans.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const handleGenerate65BCertificate = (alertItem) => {
    Swal.fire({
      title: 'Section 65B Legal Evidence Certificate',
      html: `
        <div class="text-start font-mono small p-2 bg-light border rounded mt-2">
          <div class="fw-bold text-dark border-bottom pb-1 mb-2">GUJARAT STATE POLICE COMMAND - BSA 2023 CERTIFICATE</div>
          <div><strong>Vehicle Unit:</strong> ${vehicle.vehicle_id} (${vehicle.registration_number})</div>
          <div><strong>Event ID:</strong> ${alertItem.id}</div>
          <div><strong>Threat Type:</strong> ${alertItem.type}</div>
          <div><strong>Camera ID:</strong> ${alertItem.camera_id}</div>
          <div><strong>Time of Capture:</strong> ${alertItem.timestamp}</div>
          <div><strong>GPS Coordinates:</strong> ${vehicle.telemetry.latitude}, ${vehicle.telemetry.longitude}</div>
          <div><strong>SHA-256 Hash:</strong> <span class="text-primary">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
          <div class="mt-2 text-success fw-bold">✓ Evidentiary Integrity Verified under Sec 65B Bharatiya Sakshya Adhiniyam</div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Print / Download Certificate PDF',
      confirmButtonColor: '#0d6efd',
      showCancelButton: true,
      cancelButtonText: 'Close'
    });
  };

  return (
    <div className="container-fluid px-3 py-4">
      {/* 1. Header Navigation & Back Button */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/patrolling')}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 fw-bold"
            style={{ fontSize: '12px' }}
          >
            <span>←</span> Back to Patrol Fleet
          </button>

          <div>
            <div className="d-flex align-items-center gap-2">
              <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '28px', padding: '1px 8px' }}>
                <span className="ind-flag" style={{ fontSize: '8px' }}>IND</span>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>{vehicle.registration_number}</span>
              </div>
              <span className="badge bg-primary font-mono fw-bold">
                {vehicle.vehicle_id.replace('PATROL_VAN_', 'Unit ')}
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle font-mono">
                ● LIVE ON PATROL
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-dark border font-mono small">
            Jetson: <strong className="text-primary">{vehicle.jetson_device_serial}</strong>
          </span>
          <span className="badge bg-light text-dark border font-mono small">
            SIM: <strong className="text-secondary">{vehicle.sim_card_phone}</strong>
          </span>
        </div>
      </div>

      {/* 2. Vehicle Telemetry & Driver Strip */}
      <div className="card shadow-sm border-0 mb-3 bg-white">
        <div className="card-body p-2.5 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center">
              <IconCar size={20} />
            </div>
            <div>
              <div className="fw-bold text-dark small">{vehicle.vehicle_model}</div>
              <div className="text-muted small" style={{ fontSize: '11px' }}>
                Assigned Station: <strong>{vehicle.police_station}</strong>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 border-start ps-3">
            <div className="text-secondary d-inline-flex"><IconUsers size={16} /></div>
            <div>
              <div className="small fw-bold text-dark">
                {vehicle.driver_name || vehicle.assigned_driver_officer}
              </div>
              <div className="text-success small fw-semibold" style={{ fontSize: '10.5px' }}>
                Duty Status: Armed Escort Active
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Stats */}
          <div className="d-flex align-items-center gap-3 font-mono small bg-light p-1.5 rounded border">
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>SPEED:</span>{' '}
              <strong className="text-primary">{vehicle.telemetry.speed_kmph} km/h</strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>BATTERY:</span>{' '}
              <strong className="text-success">{vehicle.telemetry.battery_voltage}V</strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>JETSON:</span>{' '}
              <strong className={vehicle.telemetry.jetson_temperature_c > 50 ? 'text-warning' : 'text-success'}>
                {vehicle.telemetry.jetson_temperature_c}°C
              </strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>5G LTE:</span>{' '}
              <strong className="text-purple">{vehicle.telemetry.network_signal_dbm} dBm</strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>GPS:</span>{' '}
              <strong className="text-dark">{vehicle.telemetry.latitude}, {vehicle.telemetry.longitude}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Body: Split Layout (Multi-Camera Live Matrix on Left / Live Alerts on Right) */}
      <div className="row g-3">
        {/* Left Column: 360° Multi-Camera Live Feeds */}
        <div className="col-12 col-xl-7 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
            <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-danger d-flex"><IconVideo size={17} /></span>
                <h2 className="h6 fw-bold mb-0 text-dark">360° Vehicle Camera Matrix</h2>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono small">
                  ● 4 RTSP CHANNELS LIVE
                </span>
              </div>
              <span className="text-muted font-mono small">
                Click any camera feed to zoom
              </span>
            </div>

            <div className="card-body p-2 flex-grow-1 d-flex flex-column justify-content-between">
              <QuadCameraStream vehicle={vehicle} />
            </div>
          </div>
        </div>

        {/* Right Column: Vehicle Dedicated Realtime Alerts */}
        <div className="col-12 col-xl-5 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
            <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="text-danger d-flex"><IconShieldAlert size={17} /></span>
                <h2 className="h6 fw-bold mb-0 text-dark">Vehicle Alerts & Threats</h2>
                <span className="badge bg-danger text-white font-mono small">
                  {combinedAlerts.length} Captured
                </span>
              </div>

              {/* Alert Tabs Filter */}
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn btn-sm py-0.5 px-2 ${activeAlertTab === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveAlertTab('ALL')}
                  style={{ fontSize: '10.5px' }}
                >
                  All ({combinedAlerts.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm py-0.5 px-2 ${activeAlertTab === 'ANPR' ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveAlertTab('ANPR')}
                  style={{ fontSize: '10.5px' }}
                >
                  ANPR ({anprAlerts.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm py-0.5 px-2 ${activeAlertTab === 'WEAPON' ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveAlertTab('WEAPON')}
                  style={{ fontSize: '10.5px' }}
                >
                  Weapons ({weaponAlerts.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm py-0.5 px-2 ${activeAlertTab === 'FIRE' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveAlertTab('FIRE')}
                  style={{ fontSize: '10.5px' }}
                >
                  Fire ({fireAlerts.length})
                </button>
              </div>
            </div>

            {/* Alerts Feed List */}
            <div
              className="card-body p-2 flex-grow-1 d-flex flex-column gap-2"
              style={{ maxHeight: '520px', overflowY: 'auto' }}
            >
              {displayAlerts.length > 0 ? (
                displayAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded border bg-light d-flex flex-column gap-2"
                    style={{ fontSize: '12px' }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div className="d-flex align-items-center gap-1.5 flex-wrap">
                        <span className={`badge ${alert.badgeClass} font-mono`} style={{ fontSize: '10px' }}>
                          {alert.type}
                        </span>
                        <span className="badge bg-dark-subtle text-dark border font-mono" style={{ fontSize: '9.5px' }}>
                          {alert.camera_id}
                        </span>
                        <span className="text-muted font-mono small">
                          ⏱ {alert.timestamp}
                        </span>
                      </div>

                      <span className="badge bg-success-subtle text-success border border-success-subtle font-mono" style={{ fontSize: '10px' }}>
                        Confidence {alert.confidence}%
                      </span>
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                      {alert.snapshot_url && (
                        <div
                          className="rounded overflow-hidden flex-shrink-0 border"
                          style={{ width: '64px', height: '48px', backgroundColor: '#0f172a' }}
                        >
                          <img
                            src={alert.snapshot_url}
                            alt="Threat crop"
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      <div className="flex-grow-1">
                        <div className="text-dark fw-bold mb-0.5">
                          {alert.description}
                        </div>
                        <div className="text-secondary small font-mono" style={{ fontSize: '11px' }}>
                          📍 {alert.location}
                        </div>
                        <div className="text-muted small font-mono" style={{ fontSize: '10.5px' }}>
                          Ref: <span className="text-dark">{alert.fir_reference}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex justify-content-end align-items-center gap-2 pt-1 border-top">
                      <button
                        type="button"
                        onClick={() => handleGenerate65BCertificate(alert)}
                        className="btn btn-sm btn-outline-secondary py-0.5 px-2 d-flex align-items-center gap-1"
                        style={{ fontSize: '10.5px' }}
                      >
                        <IconDownload size={12} />
                        <span>Sec 65B Certificate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDispatchBackup(alert)}
                        className="btn btn-sm btn-danger py-0.5 px-2 d-flex align-items-center gap-1 fw-bold"
                        style={{ fontSize: '10.5px' }}
                      >
                        <IconShieldAlert size={12} />
                        <span>Dispatch Intercept</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5 text-muted my-auto">
                  <IconCheckCircle size={36} color="#10b981" />
                  <h6 className="fw-bold text-dark mt-2 mb-1">No Alerts for this Category</h6>
                  <p className="small text-muted mb-0">Patrol van {vehicle.registration_number} has not logged any incidents under this filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
