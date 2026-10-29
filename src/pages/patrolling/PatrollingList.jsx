import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  POLICE_VEHICLES,
  ANPR_DETECTION_EVENTS,
  WEAPON_THREAT_DETECTIONS,
  FIRE_SMOKE_DETECTIONS,
  CROWD_ANALYTICS_EVENTS
} from '../../data/mockData';
import {
  IconCar,
  IconVideo,
  IconSearch,
  IconActivity,
  IconShieldAlert,
  IconUsers,
  IconCrosshair
} from '../../components/common/Icons';

// Guaranteed distinct fallback images for each vehicle
const DISTINCT_VEHICLE_FALLBACKS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', // Unit 01 White SUV
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80', // Unit 02 Black Police SUV
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80', // Unit 03 Patrol Interceptor
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80', // Unit 04 Silver SUV
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80', // Unit 05 Blue SUV
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80', // Unit 06 Force Gurkha 4x4
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80', // Unit 07 Dark Sport SUV
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80', // Unit 08 Safari Dark Edition
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80', // Unit 09 White Offroad SUV
  'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80'  // Unit 10 Fortuner Special Ops
];

export default function PatrollingList({ stationFilter }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Compute alerts count per vehicle
  const getVehicleAlertsCount = (vehicleId) => {
    const anprHits = ANPR_DETECTION_EVENTS.filter(
      (e) => e.vehicle_id === vehicleId && e.is_stolen_match
    ).length;
    const weaponHits = WEAPON_THREAT_DETECTIONS.filter(
      (e) => e.vehicle_id === vehicleId
    ).length;
    const fireHits = FIRE_SMOKE_DETECTIONS.filter(
      (e) => e.vehicle_id === vehicleId
    ).length;
    const crowdHits = CROWD_ANALYTICS_EVENTS.filter(
      (e) => e.vehicle_id === vehicleId && e.is_threshold_exceeded
    ).length;

    return anprHits + weaponHits + fireHits + crowdHits;
  };

  // Filter vehicles - robust match for station filter
  const filteredVehicles = POLICE_VEHICLES.filter((v) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.registration_number?.toLowerCase().includes(q) ||
      v.vehicle_id?.toLowerCase().includes(q) ||
      v.driver_name?.toLowerCase().includes(q) ||
      v.assigned_driver_officer?.toLowerCase().includes(q) ||
      v.police_station?.toLowerCase().includes(q) ||
      v.vehicle_model?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && v.is_active) ||
      (statusFilter === 'STANDBY' && !v.is_active);

    const matchesStation =
      !stationFilter ||
      stationFilter === 'ALL' ||
      stationFilter === 'All Police Stations' ||
      stationFilter === 'All Stations (Citywide)' ||
      v.police_station?.toLowerCase().includes(stationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesStation;
  });

  const totalUnits = POLICE_VEHICLES.length;
  const activeUnits = POLICE_VEHICLES.filter((v) => v.is_active).length;
  const totalCameras = POLICE_VEHICLES.reduce((acc, v) => acc + (v.cameras?.length || 4), 0);
  const totalAlertsFleet = ANPR_DETECTION_EVENTS.filter(e => e.is_stolen_match).length +
    WEAPON_THREAT_DETECTIONS.length + FIRE_SMOKE_DETECTIONS.length;

  return (
    <div
      className="flex flex-col flex-1 w-full min-h-screen text-slate-800 font-sans patrolling-fleet-page"
      style={{
        backgroundColor: '#f8fafc',
        padding: '24px 32px 64px 32px',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="flex flex-col gap-6"
        style={{
          width: '100%',
          boxSizing: 'border-box'
        }}
      >

      {/* Embedded CSS for 5-grid layout and interactive card styling */}
      <style>{`
        .patrol-5grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1400px) {
          .patrol-5grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 14px;
          }
        }
        @media (max-width: 1200px) {
          .patrol-5grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }
        }
        @media (max-width: 992px) {
          .patrol-5grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
        }
        @media (max-width: 768px) {
          .patrol-5grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
        @media (max-width: 480px) {
          .patrol-5grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        .patrol-vehicle-card {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease;
          border-color: #e2e8f0;
          cursor: pointer;
        }
        .patrol-vehicle-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(13, 110, 253, 0.25) !important;
          border-color: #93c5fd !important;
        }
        .patrol-vehicle-card:hover .patrol-card-img {
          transform: scale(1.06);
        }
        .patrol-card-img {
          transition: transform 0.35s ease;
        }
        .patrol-vehicle-card:hover .patrol-cta-btn {
          background-color: #0d6efd !important;
          color: #ffffff !important;
          border-color: #0d6efd !important;
        }

        /* Large Animated Fleet KPI Cards */
        .kpi-stat-card {
          position: relative;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 16px 18px;
          overflow: hidden;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .kpi-stat-card:hover {
          transform: translateY(-4px);
        }
        .kpi-card-blue:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 14px 28px -6px rgba(37, 99, 235, 0.25) !important;
        }
        .kpi-card-green:hover {
          border-color: #22c55e !important;
          box-shadow: 0 14px 28px -6px rgba(22, 163, 74, 0.25) !important;
        }
        .kpi-card-cyan:hover {
          border-color: #06b6d4 !important;
          box-shadow: 0 14px 28px -6px rgba(2, 132, 199, 0.25) !important;
        }
        .kpi-card-red:hover {
          border-color: #ef4444 !important;
          box-shadow: 0 14px 28px -6px rgba(220, 38, 38, 0.25) !important;
        }

        /* Animated Pulse Rings */
        @keyframes kpiPulseRing {
          0% {
            transform: scale(0.9);
            opacity: 0.85;
          }
          60% {
            transform: scale(1.35);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .kpi-pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          animation: kpiPulseRing 2.2s infinite ease-out;
          pointer-events: none;
        }
        .kpi-pulse-ring-blue {
          border: 2px solid #3b82f6;
        }
        .kpi-pulse-ring-green {
          border: 2px solid #22c55e;
        }
        .kpi-pulse-ring-cyan {
          border: 2px solid #06b6d4;
        }
        .kpi-pulse-ring-red {
          border: 2px solid #ef4444;
          animation-duration: 1.5s;
        }

        /* Animated Progress Shimmer */
        @keyframes kpiShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .kpi-progress-bar {
          position: relative;
          height: 6px;
          border-radius: 999px;
          background-color: #f1f5f9;
          overflow: hidden;
          margin-top: 10px;
        }
        .kpi-progress-fill {
          height: 100%;
          border-radius: 999px;
          position: relative;
          overflow: hidden;
        }
        .kpi-progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
          animation: kpiShimmer 2.2s infinite linear;
        }

        /* Top Accent Glow Bar */
        .kpi-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }
      `}</style>

      {/* 1. TOP HEADER & FILTER CONTROLS */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-primary d-inline-flex"><IconCar size={22} /></span>
            <h1 className="h5 fw-bold mb-0 text-dark">Patrolling Fleet Surveillance</h1>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono small fw-bold">
              {filteredVehicles.length} Vans Deployed
            </span>

          </div>

        </div>

      </div>

      {/* 2. FLEET KPI STATS OVERVIEW CARDS (ENLARGED & ANIMATED) */}
      <div className="row g-3 mx-0 mb-4">
        {/* Card 1: Total Fleet Units */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-stat-card kpi-card-blue h-100 shadow-sm"
            style={{
              background: 'radial-gradient(circle at 90% 15%, rgba(37,99,235,0.08) 0%, #ffffff 65%)'
            }}
          >
            {/* Top accent bar */}
            <div className="kpi-top-bar" style={{ background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />

            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                  Total Fleet Units
                </span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fw-black font-mono text-dark" style={{ fontSize: '32px', lineHeight: 1 }}>
                    {totalUnits}
                  </span>
                  <span className="text-primary fw-bold" style={{ fontSize: '14px' }}>
                    Patrol Vans
                  </span>
                </div>
              </div>

              {/* Icon Container with Animated Pulse Ring */}
              <div
                className="position-relative d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb'
                }}
              >
                <div className="kpi-pulse-ring kpi-pulse-ring-blue" />
                <IconCar size={26} />
              </div>
            </div>

            {/* Subtitle Status */}
            <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '11.5px' }}>
              <span>Ahmedabad Citywide Force</span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono fw-bold" style={{ fontSize: '10px' }}>
                100% DEPLOYED
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #2563eb, #60a5fa)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Active on Patrol */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-stat-card kpi-card-green h-100 shadow-sm"
            style={{
              background: 'radial-gradient(circle at 90% 15%, rgba(22,163,74,0.08) 0%, #ffffff 65%)'
            }}
          >
            {/* Top accent bar */}
            <div className="kpi-top-bar" style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)' }} />

            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                  Active On Patrol
                </span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fw-black font-mono text-success" style={{ fontSize: '32px', lineHeight: 1 }}>
                    {activeUnits}
                  </span>
                  <span className="text-success fw-bold" style={{ fontSize: '14px' }}>
                    GPS Online
                  </span>
                </div>
              </div>

              {/* Icon Container with Animated Pulse Ring */}
              <div
                className="position-relative d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                  color: '#16a34a'
                }}
              >
                <div className="kpi-pulse-ring kpi-pulse-ring-green" />
                <IconActivity size={26} />
              </div>
            </div>

            {/* Subtitle Status */}
            <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '11.5px' }}>
              <span>Live Telemetry & Speed Active</span>
              <span className="badge bg-success-subtle text-success border border-success-subtle font-mono fw-bold d-inline-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: '5px', height: '5px' }} />
                SECTOR PATROL
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{
                  width: `${(activeUnits / Math.max(totalUnits, 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #16a34a, #4ade80)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: 360° Cameras Online */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-stat-card kpi-card-cyan h-100 shadow-sm"
            style={{
              background: 'radial-gradient(circle at 90% 15%, rgba(2,132,199,0.08) 0%, #ffffff 65%)'
            }}
          >
            {/* Top accent bar */}
            <div className="kpi-top-bar" style={{ background: 'linear-gradient(90deg, #0284c7, #38bdf8)' }} />

            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                  360° Cameras Online
                </span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fw-black font-mono text-info" style={{ fontSize: '32px', lineHeight: 1 }}>
                    {totalCameras}
                  </span>
                  <span className="text-info fw-bold" style={{ fontSize: '14px' }}>
                    Feeds Active
                  </span>
                </div>
              </div>

              {/* Icon Container with Animated Pulse Ring */}
              <div
                className="position-relative d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  color: '#0284c7'
                }}
              >
                <div className="kpi-pulse-ring kpi-pulse-ring-cyan" />
                <IconVideo size={26} />
              </div>
            </div>

            {/* Subtitle Status */}
            <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '11.5px' }}>
              <span>4-Way Quad HD Video Channels</span>
              <span className="badge bg-info-subtle text-info border border-info-subtle font-mono fw-bold" style={{ fontSize: '10px' }}>
                25 FPS RTSP
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #38bdf8)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Fleet Threat Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="kpi-stat-card kpi-card-red h-100 shadow-sm"
            style={{
              background: 'radial-gradient(circle at 90% 15%, rgba(220,38,38,0.08) 0%, #ffffff 65%)'
            }}
          >
            {/* Top accent bar */}
            <div className="kpi-top-bar" style={{ background: 'linear-gradient(90deg, #dc2626, #f87171)' }} />

            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                  Fleet Threat Alerts
                </span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fw-black font-mono text-danger" style={{ fontSize: '32px', lineHeight: 1 }}>
                    {totalAlertsFleet}
                  </span>
                  <span className="text-danger fw-bold" style={{ fontSize: '14px' }}>
                    Active Hits
                  </span>
                </div>
              </div>

              {/* Icon Container with Animated Pulse Ring */}
              <div
                className="position-relative d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  color: '#dc2626'
                }}
              >
                <div className="kpi-pulse-ring kpi-pulse-ring-red" />
                <IconShieldAlert size={26} />
              </div>
            </div>

            {/* Subtitle Status */}
            <div className="d-flex justify-content-between align-items-center text-muted small" style={{ fontSize: '11.5px' }}>
              <span>ANPR & Weapon AI Incident Triggers</span>
              <span className="badge bg-danger text-white font-mono fw-bold d-inline-flex align-items-center gap-1 shadow-sm" style={{ fontSize: '10px' }}>
                <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: '5px', height: '5px' }} />
                ACTION REQ
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{
                  width: '78%',
                  background: 'linear-gradient(90deg, #dc2626, #f87171)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 5-GRID COLUMN LAYOUT LISTING ALL VEHICLES */}
      <div className="patrol-5grid mb-4">
        {filteredVehicles.map((vehicle, idx) => {
          const alertsCount = getVehicleAlertsCount(vehicle.vehicle_id);
          const hasThreats = alertsCount > 0;
          const distinctImg = vehicle.vehicle_image || DISTINCT_VEHICLE_FALLBACKS[idx % DISTINCT_VEHICLE_FALLBACKS.length];

          return (
            <div
              key={vehicle.vehicle_id}
              onClick={() => navigate(`/patrolling/${vehicle.vehicle_id}`)}
              className="card h-100 border shadow-sm rounded-3 overflow-hidden patrol-vehicle-card bg-white"
              title={`Click to view live 360° camera feeds & all alerts for ${vehicle.registration_number}`}
            >
              {/* 1. Vehicle Image Container with Badges */}
              <div
                className="position-relative w-100 bg-dark overflow-hidden"
                style={{ height: '142px' }}
              >
                <img
                  src={distinctImg}
                  alt={vehicle.registration_number}
                  className="w-100 h-100 patrol-card-img"
                  style={{
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DISTINCT_VEHICLE_FALLBACKS[idx % DISTINCT_VEHICLE_FALLBACKS.length];
                  }}
                />

                {/* Gradient bottom shadow */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0) 35%, rgba(15,23,42,0.85) 100%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Top Overlay Badges */}
                <div className="position-absolute top-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center">
                  <span
                    className={`badge ${vehicle.is_active ? 'bg-success' : 'bg-secondary'} d-inline-flex align-items-center gap-1 font-mono shadow-sm`}
                    style={{ fontSize: '9.5px', padding: '3px 7px' }}
                  >
                    <span
                      className="rounded-circle bg-white"
                      style={{
                        width: '5px',
                        height: '5px'
                      }}
                    />
                    {vehicle.is_active ? 'LIVE GPS' : 'STANDBY'}
                  </span>

                  <span
                    className="badge bg-dark bg-opacity-75 text-white font-mono shadow-sm border border-secondary"
                    style={{ fontSize: '9.5px', padding: '3px 6px' }}
                  >
                    {vehicle.telemetry?.speed_kmph || 0} km/h
                  </span>
                </div>

                {/* Bottom Image Overlay: Unit & Cameras */}
                <div className="position-absolute bottom-0 start-0 end-0 px-2 py-1.5 d-flex justify-content-between align-items-end text-white">
                  <div>
                    <span className="badge bg-primary text-white font-mono shadow-sm" style={{ fontSize: '10px' }}>
                      {vehicle.vehicle_id.replace('PATROL_VAN_', 'Unit ')}
                    </span>
                  </div>

                  <div
                    className="d-flex align-items-center gap-1 bg-black bg-opacity-80 px-1.5 py-0.5 rounded shadow-sm border border-dark"
                    style={{ fontSize: '9.5px' }}
                  >
                    <IconVideo size={11} color="#38bdf8" />
                    <span className="font-mono text-info fw-bold">
                      {vehicle.cameras?.length || 4} CAMS LIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Card Body: Vehicle Number, Driver, Station */}
              <div className="card-body p-2.5 d-flex flex-column justify-content-between gap-2">
                {/* Vehicle Number Plate & Threat Alert Tag */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    {/* Authentic IND Plate Styling */}
                    <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '26px', padding: '1px 6px' }}>
                      <span className="ind-flag" style={{ fontSize: '7.5px' }}>IND</span>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{vehicle.registration_number}</span>
                    </div>

                    {/* Threat Count Badge */}
                    {hasThreats ? (
                      <span
                        className="badge bg-danger text-white font-mono d-inline-flex align-items-center gap-1 shadow-sm"
                        style={{ fontSize: '10px', padding: '3px 6px' }}
                      >
                        <IconShieldAlert size={10} />
                        {alertsCount} {alertsCount === 1 ? 'Alert' : 'Alerts'}
                      </span>
                    ) : (
                      <span
                        className="badge bg-success-subtle text-success border border-success-subtle font-mono"
                        style={{ fontSize: '9.5px', padding: '3px 6px' }}
                      >
                        ✓ Safe
                      </span>
                    )}
                  </div>

                  {/* Vehicle Model Name */}
                  <div className="text-dark fw-bold text-truncate" style={{ fontSize: '12px' }} title={vehicle.vehicle_model}>
                    {vehicle.vehicle_model}
                  </div>
                </div>

                {/* Driver Name & Station Row */}
                <div className="border-top pt-2 d-flex flex-column gap-1" style={{ fontSize: '11.5px' }}>
                  <div className="d-flex align-items-center gap-1.5 text-secondary">
                    <span className="text-primary d-inline-flex"><IconUsers size={13} /></span>
                    <strong className="text-dark text-truncate" title={vehicle.driver_name || vehicle.assigned_driver_officer}>
                      {vehicle.driver_name || vehicle.assigned_driver_officer?.split(' (')[0]}
                    </strong>
                  </div>

                  <div className="text-muted text-truncate small" style={{ fontSize: '10.5px' }} title={vehicle.police_station}>
                    🏢 {vehicle.police_station}
                  </div>
                </div>

                {/* Telemetry Hardware Mini-Bar */}
                <div className="bg-light p-1 rounded d-flex justify-content-between align-items-center font-mono small text-secondary" style={{ fontSize: '9.5px' }}>
                  <span>BAT: <strong className="text-dark">{vehicle.telemetry?.battery_voltage || 13.2}V</strong></span>
                  <span>TEMP: <strong className="text-dark">{vehicle.telemetry?.jetson_temperature_c || 46}°C</strong></span>
                  <span>LTE: <strong className="text-dark">{vehicle.telemetry?.network_signal_dbm || -65}dB</strong></span>
                </div>

                {/* Dedicated Action Button */}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm w-100 fw-bold d-flex justify-content-center align-items-center gap-1 mt-0.5 py-1 patrol-cta-btn"
                  style={{ fontSize: '11px', transition: 'all 0.15s ease' }}
                >
                  <span>Enter Live Feeds & Alerts</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="card shadow-sm border-0 p-5 text-center text-muted">
          <div className="py-4">
            <span className="text-secondary mb-2 d-inline-block"><IconCar size={42} /></span>
            <h5 className="fw-bold text-dark">No Patrol Vehicles Found</h5>
            <p className="small mb-3">No active vans matched the current search query or station filter.</p>
            <div>
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 fw-bold"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
              >
                Reset Search Filters
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
