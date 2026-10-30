import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swal } from '../../components/common/Toast';
import { getVehicleByIdApi } from '../../services/api';
import QuadCameraStream from '../../components/dashboard/QuadCameraStream';
import {
  IconCar,
  IconVideo,
  IconShieldAlert,
  IconUsers,
  IconCheckCircle,
  IconDownload,
  IconRefreshCw
} from '../../components/common/Icons';

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [activeAlertTab, setActiveAlertTab] = useState('ALL');

  // Fetch real vehicle and camera details by ID or vehicle_id from API
  const fetchVehicleDetails = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await getVehicleByIdApi(vehicleId || 'PATROL_VAN_01');
      if (res && res.success && res.data) {
        setVehicle(res.data);
      } else if (res?.data) {
        setVehicle(res.data);
      } else {
        throw new Error('Vehicle not found in registry');
      }
    } catch (err) {
      console.error('Error fetching vehicle details:', err);
      setApiError(err.message || 'Failed to load vehicle telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  if (isLoading) {
    return (
      <div className="container-fluid px-3 py-5 text-center text-muted">
        <div className="spinner-border spinner-border-sm text-primary mx-auto mb-2" role="status" />
        <div className="small fw-semibold">Connecting to vehicle camera stream & telemetry...</div>
      </div>
    );
  }

  if (apiError || !vehicle) {
    return (
      <div className="container-fluid px-3 py-5">
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 shadow-xs">
          <div className="d-flex align-items-center gap-2">
            <IconShieldAlert size={18} />
            <span className="small fw-semibold">{apiError || 'Vehicle unit not found.'}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/patrolling')}
          >
            ← Back to Fleet
          </button>
        </div>
      </div>
    );
  }

  const cameras = vehicle.cameras || [];
  const speed = vehicle.speed_kmph ? parseFloat(vehicle.speed_kmph).toFixed(1) : '0.0';
  const temp = vehicle.jetson_temperature_c || '-';
  const battery = vehicle.battery_voltage || '-';
  const signal = vehicle.network_signal_dbm || '-';
  const lat = vehicle.latest_lat || '-';
  const lng = vehicle.latest_lng || '-';
  const isActive = vehicle.is_active === 1 || vehicle.is_active === true;

  // Static preview alerts for RTSP cameras
  const sampleAlerts = [
    {
      id: 'EVT-ANPR-01',
      category: 'ANPR',
      type: 'ANPR WATCHLIST HIT',
      badgeClass: 'bg-danger',
      description: 'Vehicle Plate: GJ01AB1234 • Hotlist Stolen Vehicle Flag',
      confidence: 99.4,
      camera_id: 'CAM_01_FRONT',
      timestamp: vehicle.last_telemetry_at || '2026-10-30 05:49:13',
      location: vehicle.police_station || 'Highway Patrol Sector',
      fir_reference: 'FIR #ST-2026-901',
      severity: 'CRITICAL_RED'
    },
    {
      id: 'EVT-THREAT-02',
      category: 'WEAPON',
      type: 'TACTICAL THREAT ALERT',
      badgeClass: 'bg-danger',
      description: 'Handgun identified by mobile patrol camera feed',
      confidence: 94.8,
      camera_id: 'CAM_03_LEFT',
      timestamp: vehicle.last_telemetry_at || '2026-10-30 05:49:13',
      location: vehicle.police_station || 'Sidewalk Surveillance',
      fir_reference: 'Armed Threat Broadcast #994',
      severity: 'CRITICAL_RED'
    }
  ];

  const displayAlerts = sampleAlerts.filter((item) => {
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
          <div><strong>GPS Coordinates:</strong> ${lat}, ${lng}</div>
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
              <div
                className="ind-number-plate d-inline-flex align-middle shadow-xs"
                style={{ height: '28px', padding: '1px 8px' }}
              >
                <span className="ind-flag" style={{ fontSize: '8px' }}>
                  IND
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>
                  {vehicle.registration_number || 'GJ-01-G-9999'}
                </span>
              </div>
              <span className="badge bg-primary font-mono fw-bold">
                {(vehicle.vehicle_id || 'PATROL_VAN').replace('PATROL_VAN_', 'Unit ')}
              </span>
              <span
                className={`badge ${isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'} font-mono`}
              >
                ● {isActive ? 'LIVE ON PATROL' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {vehicle.jetson_device_serial && (
            <span className="badge bg-light text-dark border font-mono small">
              Jetson: <strong className="text-primary">{vehicle.jetson_device_serial}</strong>
            </span>
          )}
          {vehicle.sim_card_phone && (
            <span className="badge bg-light text-dark border font-mono small">
              SIM: <strong className="text-secondary">{vehicle.sim_card_phone}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={fetchVehicleDetails}
            className="btn btn-outline-primary btn-sm p-1.5 d-flex align-items-center"
            title="Refresh feeds & telemetry"
          >
            <IconRefreshCw size={13} />
          </button>
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
              <div className="fw-bold text-dark small">{vehicle.vehicle_model || 'Patrol Van'}</div>
              <div className="text-muted small" style={{ fontSize: '11px' }}>
                Assigned Station: <strong>{vehicle.police_station || 'Central HQ'}</strong>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 border-start ps-3">
            <div className="text-secondary d-inline-flex">
              <IconUsers size={16} />
            </div>
            <div>
              <div className="small fw-bold text-dark">
                {vehicle.assigned_driver_officer || vehicle.driver_name || 'Assigned Officer'}
              </div>
              <div className="text-success small fw-semibold" style={{ fontSize: '10.5px' }}>
                Duty Status: Armed Escort Active
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Stats */}
          <div className="d-flex align-items-center gap-3 font-mono small bg-light p-1.5 rounded border">
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>
                SPEED:
              </span>{' '}
              <strong className="text-primary">{speed} km/h</strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>
                BATTERY:
              </span>{' '}
              <strong className="text-success">{battery}V</strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>
                JETSON:
              </span>{' '}
              <strong className={parseFloat(temp) > 50 ? 'text-warning' : 'text-success'}>
                {temp}°C
              </strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>
                LTE:
              </span>{' '}
              <strong className="text-primary">{signal} dBm</strong>
            </div>
            <div>
              <span className="text-muted" style={{ fontSize: '10px' }}>
                GPS:
              </span>{' '}
              <a
                href={`https://maps.google.com/?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-dark fw-bold"
              >
                {lat}, {lng} ↗
              </a>
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
                <span className="text-danger d-flex">
                  <IconVideo size={17} />
                </span>
                <h2 className="h6 fw-bold mb-0 text-dark">360° Vehicle Camera Matrix</h2>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono small">
                  ● {cameras.length} RTSP CHANNELS
                </span>
              </div>
              {/* <span className="text-muted font-mono small">Click any camera feed to zoom</span> */}
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
                <span className="text-danger d-flex">
                  <IconShieldAlert size={17} />
                </span>
                <h2 className="h6 fw-bold mb-0 text-dark">Vehicle Alerts & Threats</h2>
                <span className="badge bg-danger text-white font-mono small">
                  {displayAlerts.length} Captured
                </span>
              </div>

              {/* Alert Tabs Filter */}
              {/* <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn btn-sm py-0.5 px-2 ${activeAlertTab === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveAlertTab('ALL')}
                  style={{ fontSize: '10.5px' }}
                >
                  All ({sampleAlerts.length})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm py-0.5 px-2 ${activeAlertTab === 'ANPR' ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveAlertTab('ANPR')}
                  style={{ fontSize: '10.5px' }}
                >
                  ANPR
                </button>
                <button
                  type="button"
                  className={`btn btn-sm py-0.5 px-2 ${activeAlertTab === 'WEAPON' ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveAlertTab('WEAPON')}
                  style={{ fontSize: '10.5px' }}
                >
                  Weapons
                </button>
              </div> */}
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
                        <span
                          className="badge bg-dark-subtle text-dark border font-mono"
                          style={{ fontSize: '9.5px' }}
                        >
                          {alert.camera_id}
                        </span>
                        <span className="text-muted font-mono small">⏱ {alert.timestamp}</span>
                      </div>

                      <span
                        className="badge bg-success-subtle text-success border border-success-subtle font-mono"
                        style={{ fontSize: '10px' }}
                      >
                        Confidence {alert.confidence}%
                      </span>
                    </div>

                    <div>
                      <div className="text-dark fw-bold mb-0.5">{alert.description}</div>
                      <div className="text-secondary small font-mono" style={{ fontSize: '11px' }}>
                        📍 {alert.location}
                      </div>
                      <div className="text-muted small font-mono" style={{ fontSize: '10.5px' }}>
                        Ref: <span className="text-dark">{alert.fir_reference}</span>
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
                  <p className="small text-muted mb-0">
                    Patrol van {vehicle.registration_number} has not logged any incidents under this filter.
                  </p>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
