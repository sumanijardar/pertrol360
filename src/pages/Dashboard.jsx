import React, { useState } from 'react';
import {
  POLICE_VEHICLES,
  ANPR_DETECTION_EVENTS,
  WEAPON_THREAT_DETECTIONS,
  FIRE_SMOKE_DETECTIONS,
  CROWD_ANALYTICS_EVENTS,
  CENTRAL_API_DISPATCH_QUEUE,
  HOURLY_TIMELINE_DATA,
  THREAT_DISTRIBUTION_DATA,
  JETSON_FLEET_HARDWARE,
  VEHICLE_CLASSIFICATION_STATS
} from '../data/mockData';

import TimelineActivityChart from '../components/charts/TimelineActivityChart';
import ThreatDonutChart from '../components/charts/ThreatDonutChart';
import JetsonFleetTelemetryChart from '../components/charts/JetsonFleetTelemetryChart';
import VehicleClassificationChart from '../components/charts/VehicleClassificationChart';
import CrowdHourlyChart from '../components/charts/CrowdHourlyChart';

import TacticalMapWidget from '../components/dashboard/TacticalMapWidget';
import QuadCameraStream from '../components/dashboard/QuadCameraStream';
import EventLogsTabs from '../components/dashboard/EventLogsTabs';
import IncidentModal from '../components/dashboard/IncidentModal';

import {
  IconCar,
  IconShieldAlert,
  IconCrosshair,
  IconFlame,
  IconSend,
  IconActivity,
  IconVideo,
  IconRadar
} from '../components/common/Icons';

export default function Dashboard({ stationFilter = 'ALL' }) {
  const [vehicles, setVehicles] = useState(POLICE_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState(POLICE_VEHICLES[0].vehicle_id);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeAlertNotification, setActiveAlertNotification] = useState(
    'CRITICAL INTERCEPT: Stolen Hyundai Creta (GJ01AB1234) detected by PATROL_VAN_01 at Navrangpura Cross Roads'
  );

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v =>
    stationFilter === 'ALL' ? true : v.police_station.toLowerCase().includes(stationFilter.toLowerCase())
  );

  const selectedVehicle = vehicles.find(v => v.vehicle_id === selectedVehicleId) || vehicles[0];

  // Dispatch intercept action
  const handleDispatchIntercept = (item) => {
    alert(`🚨 TACTICAL DISPATCH ISSUED!\n\nPatrol units in Sector 1 alerted.\nVehicle Target: ${item.detected_plate_number || item.weapon_class || 'Target'}\nIntercept coordinated with City Control Room.`);
  };

  return (
    <div className="container-fluid px-3 py-2 overflow-x-hidden">

      {/* Live Threat Strobe Banner (Bootstrap 5 Alert) */}
      {activeAlertNotification && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-1.5 px-3 mb-2 shadow-sm border border-danger-subtle" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-grow spinner-grow-sm text-danger" role="status" style={{ width: '8px', height: '8px' }}></span>
            <strong className="text-danger small">{activeAlertNotification}</strong>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-danger btn-sm py-0 px-2 fw-bold"
              style={{ fontSize: '11px' }}
              onClick={() => setSelectedIncident({ type: 'ANPR', data: ANPR_DETECTION_EVENTS[0] })}
            >
              Inspect Intercept
            </button>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => setActiveAlertNotification(null)}
            ></button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ROW 1: KEY PERFORMANCE INDICATORS (Balanced Responsive Grid) */}
      {/* ============================================================ */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5 g-2 mb-2">
        {/* Card 1: Active Fleet */}
        <div className="col">
          <div className="card shadow-sm border-0 border-top border-3 border-primary h-100 p-2.5 bg-white kpi-count-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-primary d-flex"><IconCar size={15} /></span>
                <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Patrol Fleet</span>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle font-mono" style={{ fontSize: '9.5px' }}>85.7% ACTIVE</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-4 fw-bold font-mono text-dark">12</span>
              <span className="small text-muted fw-semibold">/ 14 units</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-1 mt-1 small text-muted text-nowrap" style={{ fontSize: '9.5px' }}>
              <span>Avg: <strong className="text-primary">41.2 km/h</strong></span>
              <span>Jetson: <strong className="text-success">48.9°C</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: ANPR Scans Today */}
        <div className="col">
          <div className="card shadow-sm border-0 border-top border-3 border-info h-100 p-2.5 bg-white kpi-count-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-info d-flex"><IconShieldAlert size={15} /></span>
                <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>ANPR Scans</span>
              </div>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono" style={{ fontSize: '9.5px' }}>7 STOLEN</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-4 fw-bold font-mono text-info">3,842</span>
              <span className="small text-muted fw-semibold">scanned</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-1 mt-1 small text-muted text-nowrap" style={{ fontSize: '9.5px' }}>
              <span>OCR: <strong className="text-success">98.4%</strong></span>
              <span>Watchlist: <strong className="text-danger">Synced</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Critical Threat Level */}
        <div className="col">
          <div className="card shadow-sm border-0 border-top border-3 border-danger h-100 p-2.5 bg-white kpi-count-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-danger d-flex"><IconCrosshair size={15} /></span>
                <span className="small text-danger fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Threats</span>
              </div>
              <span className="badge bg-danger text-white font-mono" style={{ fontSize: '9.5px' }}>CRITICAL</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-4 fw-bold font-mono text-danger">3</span>
              <span className="small text-danger fw-bold">Active Pings</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-1 mt-1 small text-muted text-nowrap" style={{ fontSize: '9.5px' }}>
              <span>Rifle • Handgun</span>
              <span className="text-success fw-bold">2 Dispatched</span>
            </div>
          </div>
        </div>

        {/* Card 4: Fire & Smoke Hazards */}
        <div className="col">
          <div className="card shadow-sm border-0 border-top border-3 border-warning h-100 p-2.5 bg-white kpi-count-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-warning d-flex"><IconFlame size={15} /></span>
                <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Hazards</span>
              </div>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle font-mono" style={{ fontSize: '9.5px' }}>FIRE DEPT</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-4 fw-bold font-mono text-warning">2</span>
              <span className="small text-muted fw-semibold">Events</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-1 mt-1 small text-muted text-nowrap" style={{ fontSize: '9.5px' }}>
              <span>Flame / Smoke</span>
              <span className="text-primary fw-semibold">En Route</span>
            </div>
          </div>
        </div>

        {/* Card 5: Store & Forward Dispatch Queue */}
        <div className="col">
          <div className="card shadow-sm border-0 border-top border-3 border-secondary h-100 p-2.5 bg-white kpi-count-card">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary d-flex"><IconSend size={15} /></span>
                <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.04em' }}>Dispatch</span>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono" style={{ fontSize: '9.5px' }}>SYNC 99.8%</span>
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-4 fw-bold font-mono text-primary">1,482</span>
              <span className="small text-warning fw-bold">+3 Queued</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-1 mt-1 small text-muted text-nowrap" style={{ fontSize: '9.5px' }}>
              <span>Store & Forward</span>
              <span className="text-success fw-bold">0 Loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: TACTICAL GPS MAP & 4-CAMERA LIVE STREAM HUB          */}
      {/* ============================================================ */}
      <div className="row g-2 mb-2 align-items-stretch">
        {/* Tactical GPS Radar Grid */}
        <div className="col-12 col-xl-8 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ height: '360px', minHeight: '360px' }}>
            <div className="card-header bg-white border-bottom py-1.5 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                <span className="text-primary d-flex"><IconRadar size={15} /></span>
                <span>Fleet GPS Radar & Threat Coordinates</span>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono" style={{ fontSize: '10px' }}>{filteredVehicles.length} Units Tracked</span>
            </div>
            <div className="card-body p-1.5 flex-grow-1 d-flex flex-column position-relative overflow-hidden">
              <TacticalMapWidget
                vehicles={filteredVehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
                onOpenThreatModal={(t) => {
                  const ev = ANPR_DETECTION_EVENTS.find(e => e.detected_plate_number.includes('GJ01AB1234')) || ANPR_DETECTION_EVENTS[0];
                  setSelectedIncident({ type: 'ANPR', data: ev });
                }}
              />
            </div>
          </div>
        </div>

        {/* Selected Patrol Van Quad-Camera Matrix */}
        <div className="col-12 col-xl-4 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column" style={{ height: '360px', minHeight: '360px' }}>
            <div className="card-header bg-white border-bottom py-1.5 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                <span className="text-danger d-flex"><IconVideo size={15} /></span>
                <span>4-Channel AI Camera Matrix</span>
              </div>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="form-select form-select-sm py-0 px-2 fw-bold text-dark border-secondary-subtle"
                style={{ width: 'auto', fontSize: '11px', height: '26px' }}
              >
                {vehicles.map(v => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.vehicle_id.replace('PATROL_VAN_', 'Unit ')} ({v.registration_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="card-body p-1.5 flex-grow-1 d-flex flex-column justify-content-between overflow-hidden">
              <QuadCameraStream vehicle={selectedVehicle} />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 3: TIMELINE & THREAT RATIO                               */}
      {/* ============================================================ */}
      <div className="row g-3 mb-3 align-items-stretch">
        {/* Chart 1: 24h Activity Timeline */}
        <div className="col-12 col-xl-8 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
            <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                <span className="text-primary d-flex"><IconActivity size={16} /></span>
                <span>24-Hour Threat & ANPR Detection Timeline</span>
              </div>
              <span className="badge bg-info-subtle text-info border border-info-subtle font-mono">Realtime Telemetry</span>
            </div>
            <div className="card-body p-3 flex-grow-1 d-flex flex-column justify-content-center">
              <TimelineActivityChart data={HOURLY_TIMELINE_DATA} />
            </div>
          </div>
        </div>

        {/* Chart 2: Threat Distribution Donut */}
        <div className="col-12 col-xl-4 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
            <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                <span className="text-danger d-flex"><IconCrosshair size={16} /></span>
                <span>Threat Distribution Ratio</span>
              </div>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono">84 Incidents</span>
            </div>
            <div className="card-body p-3 flex-grow-1 d-flex align-items-center justify-content-center">
              <ThreatDonutChart data={THREAT_DISTRIBUTION_DATA} />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 4: HARDWARE & OBJECT ANALYTICS CHARTS (3 COLUMNS)        */}
      {/* ============================================================ */}
      <div className="row g-3 mb-3 align-items-stretch">
        {/* Chart 3: Jetson Edge AI Fleet Telemetry */}
        <div className="col-12 col-md-4 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
            <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                <span className="text-success d-flex"><IconCar size={16} /></span>
                <span>Jetson Thermal Health</span>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle font-mono">8 Online</span>
            </div>
            <div className="card-body p-3 flex-grow-1">
              <JetsonFleetTelemetryChart data={JETSON_FLEET_HARDWARE} />
            </div>
          </div>
        </div>

        {/* Chart 4: ANPR Vehicle Types */}
        <div className="col-12 col-md-4 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
            <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                <span className="text-primary d-flex"><IconCar size={16} /></span>
                <span>Vehicle Classification</span>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono">3.8K Plates</span>
            </div>
            <div className="card-body p-3 flex-grow-1">
              <VehicleClassificationChart data={VEHICLE_CLASSIFICATION_STATS} />
            </div>
          </div>
        </div>

        {/* Chart 5: Crowd Hourly Density */}
        <div className="col-12 col-md-4 d-flex flex-column">
          <div className="card shadow-sm border-0 flex-grow-1 d-flex flex-column">
            <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 fw-bold text-dark small">
                <span className="text-warning d-flex"><IconShieldAlert size={16} /></span>
                <span>Crowd Density vs Limits</span>
              </div>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle font-mono">Limit: 40</span>
            </div>
            <div className="card-body p-3 flex-grow-1">
              <CrowdHourlyChart />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 5: COMPREHENSIVE EVENT LOGS & OUTBOX QUEUE TABS         */}
      {/* ============================================================ */}
      <div className="row g-3 mb-3">
        <div className="col-12">
          <EventLogsTabs
            anprEvents={ANPR_DETECTION_EVENTS}
            weaponThreats={WEAPON_THREAT_DETECTIONS}
            fireHazards={FIRE_SMOKE_DETECTIONS}
            crowdEvents={CROWD_ANALYTICS_EVENTS}
            dispatchQueue={CENTRAL_API_DISPATCH_QUEUE}
            onOpenEventModal={(item) => setSelectedIncident(item)}
          />
        </div>
      </div>

      {/* Tactical Incident Detail Modal */}
      <IncidentModal
        modalData={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onDispatchUnit={handleDispatchIntercept}
      />
    </div>
  );
}
