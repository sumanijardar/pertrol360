import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehiclesApi } from '../../services/api';
import {
  IconCar,
  IconVideo,
  IconSearch,
  IconActivity,
  IconShieldAlert,
  IconUsers,
  IconRefreshCw
} from '../../components/common/Icons';

// Distinct fallback images for vehicles
const DISTINCT_VEHICLE_FALLBACKS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80'
];

export default function PatrollingList({ stationFilter }) {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch real police vehicles from backend API
  const fetchVehicles = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await getVehiclesApi({ limit: 100 });
      if (res && res.success && Array.isArray(res.data)) {
        setVehicles(res.data);
      } else if (Array.isArray(res?.data)) {
        setVehicles(res.data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error('Failed to fetch patrolling vehicles:', err);
      setApiError(err.message || 'Failed to retrieve vehicle fleet from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter vehicles - search and station filter
  const filteredVehicles = vehicles.filter((v) => {
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
      (statusFilter === 'ACTIVE' && (v.is_active === 1 || v.is_active === true)) ||
      (statusFilter === 'STANDBY' && (!v.is_active || v.is_active === 0));

    const matchesStation =
      !stationFilter ||
      stationFilter === 'ALL' ||
      stationFilter === 'All Police Stations' ||
      stationFilter === 'All Stations (Citywide)' ||
      v.police_station?.toLowerCase().includes(stationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesStation;
  });

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
        className="flex flex-col gap-4"
        style={{
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Responsive CSS for Grid Layout */}
        <style>{`
        .patrol-5grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        @media (min-width: 1280px) {
          .patrol-5grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 16px;
          }
        }
        @media (max-width: 1279px) and (min-width: 1024px) {
          .patrol-5grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
          }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .patrol-5grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
        }
        @media (max-width: 767px) and (min-width: 480px) {
          .patrol-5grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
        @media (max-width: 479px) {
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
      `}</style>

        {/* 1. TOP HEADER & FILTER CONTROLS */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-primary d-inline-flex">
                <IconCar size={22} />
              </span>
              <h1 className="h5 fw-bold mb-0 text-dark">Patrolling Fleet Surveillance</h1>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono small fw-bold">
                {filteredVehicles.length} {filteredVehicles.length === 1 ? 'Van Deployed' : 'Vans Deployed'}
              </span>
            </div>
            <p className="text-muted small mb-0 mt-0.5">
              Live mobile surveillance fleet, vehicle telemetry & multi-channel camera monitoring
            </p>
          </div>

          {/* Right Controls: Search, Status Filter & Refresh */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-white border-end-0 text-muted">
                <IconSearch size={13} />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0"
                placeholder="Search van, plate, officer..."
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select form-select-sm fw-semibold text-dark"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active (Live GPS)</option>
              <option value="STANDBY">Standby</option>
            </select>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchVehicles}
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
              disabled={isLoading}
              title="Refresh vehicle fleet"
            >
              <span className={isLoading ? 'spinner-border spinner-border-sm' : ''}>
                {!isLoading && <IconRefreshCw size={13} />}
              </span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="card shadow-sm border-0 p-5 text-center text-muted">
            <div className="spinner-border spinner-border-sm text-primary mx-auto mb-2" role="status" />
            <div className="small fw-semibold">Loading real-time patrolling fleet ...</div>
          </div>
        )}

        {/* API Error Message */}
        {apiError && !isLoading && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 rounded-3 shadow-xs mb-3">
            <div className="d-flex align-items-center gap-2">
              <IconShieldAlert size={18} />
              <span className="small fw-semibold">{apiError}</span>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm px-2.5 py-0.5"
              onClick={fetchVehicles}
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. DYNAMIC VEHICLE GRID */}
        {!isLoading && !apiError && (
          <div className="patrol-5grid mb-4">
            {filteredVehicles.map((vehicle, idx) => {
              const distinctImg =
                vehicle.vehicle_image || DISTINCT_VEHICLE_FALLBACKS[idx % DISTINCT_VEHICLE_FALLBACKS.length];
              const cameraCount = vehicle.camera_count || vehicle.cameras?.length || 0;
              const speed = vehicle.speed_kmph ? parseFloat(vehicle.speed_kmph).toFixed(1) : '0.0';
              const temp = vehicle.jetson_temperature_c || '-';
              const battery = vehicle.battery_voltage || '-';
              const signal = vehicle.network_signal_dbm || -68;
              const isActive = vehicle.is_active === 1 || vehicle.is_active === true;

              return (
                <div
                  key={vehicle.id || vehicle.vehicle_id}
                  onClick={() => navigate(`/patrolling/${vehicle.vehicle_id || vehicle.id}`)}
                  className="card h-100 border shadow-sm rounded-3 overflow-hidden patrol-vehicle-card bg-white"
                  title={`Click to view live 360° camera feeds & all alerts for ${vehicle.registration_number}`}
                >
                  {/* Vehicle Image Container */}
                  <div
                    className="position-relative w-100 bg-dark overflow-hidden"
                    style={{ height: '142px' }}
                  >
                    <img
                      src={distinctImg}
                      alt={vehicle.registration_number}
                      className="w-100 h-100 patrol-card-img"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DISTINCT_VEHICLE_FALLBACKS[idx % DISTINCT_VEHICLE_FALLBACKS.length];
                      }}
                    />

                    {/* Gradient bottom shadow */}
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        background:
                          'linear-gradient(to bottom, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0) 35%, rgba(15,23,42,0.85) 100%)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Top Overlay Badges */}
                    <div className="position-absolute top-0 start-0 end-0 p-2 d-flex justify-content-between align-items-center">
                      <span
                        className={`badge ${isActive ? 'bg-success' : 'bg-secondary'} d-inline-flex align-items-center gap-1 font-mono shadow-sm`}
                        style={{ fontSize: '9.5px', padding: '3px 7px' }}
                      >
                        <span
                          className="rounded-circle bg-white"
                          style={{
                            width: '5px',
                            height: '5px'
                          }}
                        />
                        {isActive ? 'LIVE GPS' : 'STANDBY'}
                      </span>

                      <span
                        className="badge bg-dark bg-opacity-75 text-white font-mono shadow-sm border border-secondary"
                        style={{ fontSize: '9.5px', padding: '3px 6px' }}
                      >
                        {speed} km/h
                      </span>
                    </div>

                    {/* Bottom Image Overlay: Unit & Cameras */}
                    <div className="position-absolute bottom-0 start-0 end-0 px-2 py-1.5 d-flex justify-content-between align-items-end text-white">
                      <div>
                        <span className="badge bg-primary text-white font-mono shadow-sm" style={{ fontSize: '10px' }}>
                          {(vehicle.vehicle_id || 'PATROL_VAN').replace('PATROL_VAN_', 'Unit ')}
                        </span>
                      </div>

                      <div
                        className="d-flex align-items-center gap-1 bg-black bg-opacity-80 px-1.5 py-0.5 rounded shadow-sm border border-dark"
                        style={{ fontSize: '9.5px' }}
                      >
                        <IconVideo size={11} color="#38bdf8" />
                        <span className="font-mono text-info fw-bold">
                          {cameraCount} {cameraCount === 1 ? 'CAM LIVE' : 'CAMS LIVE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body: Number Plate, Model, Driver, Station */}
                  <div className="card-body p-2.5 d-flex flex-column justify-content-between gap-2">
                    {/* Vehicle Plate & Model */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div
                          className="ind-number-plate d-inline-flex align-middle"
                          style={{ height: '50px', padding: '2px 6px' }}
                        >
                          <span className="ind-flag" style={{ fontSize: '7.5px' }}>
                            IND
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>
                            {vehicle.registration_number || 'GJ-01-XX-0000'}
                          </span>
                        </div>

                        <span
                          className={`badge ${isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'} font-mono`}
                          style={{ fontSize: '9.5px', padding: '5px 6px' }}
                        >
                          {isActive ? '✓ Active' : 'Idle'}
                        </span>
                      </div>

                      <div
                        className="text-dark fw-bold text-truncate"
                        style={{ fontSize: '12px' }}
                        title={vehicle.vehicle_model}
                      >
                        {vehicle.vehicle_model || 'Patrol Interceptor'}
                      </div>
                    </div>

                    {/* Driver & Police Station */}
                    <div className="border-top pt-2 d-flex flex-column gap-1" style={{ fontSize: '11.5px' }}>
                      <div className="d-flex align-items-center gap-1.5 text-secondary">
                        <span className="text-primary d-inline-flex">
                          <IconUsers size={13} />
                        </span>
                        <strong
                          className="text-dark text-truncate"
                          title={vehicle.assigned_driver_officer || vehicle.driver_name}
                        >
                          {vehicle.assigned_driver_officer || vehicle.driver_name || 'Assigned Officer'}
                        </strong>
                      </div>

                      <div
                        className="text-muted text-truncate small"
                        style={{ fontSize: '10.5px' }}
                        title={vehicle.police_station}
                      >
                        🏢 {vehicle.police_station || 'Headquarters'}
                      </div>
                    </div>

                    {/* Telemetry Hardware Mini-Bar */}
                    <div
                      className="bg-light p-1 rounded d-flex justify-content-between align-items-center font-mono small text-secondary"
                      style={{ fontSize: '9.5px' }}
                    >
                      <span>
                        BAT: <strong className="text-dark">{battery}V</strong>
                      </span>
                      <span>
                        TEMP: <strong className="text-dark">{temp}°C</strong>
                      </span>
                      <span>
                        LTE: <strong className="text-dark">{signal}dB</strong>
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm w-100 fw-bold d-flex justify-content-center align-items-center gap-1 mt-0.5 py-1 patrol-cta-btn"
                      style={{ fontSize: '11px', transition: 'all 0.15s ease' }}
                    >
                      <span>Enter Live Feeds & Cameras</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !apiError && filteredVehicles.length === 0 && (
          <div className="card shadow-sm border-0 p-5 text-center text-muted">
            <div className="py-4">
              <span className="text-secondary mb-2 d-inline-block">
                <IconCar size={42} />
              </span>
              <h5 className="fw-bold text-dark">No Patrol Vehicles Found</h5>
              <p className="small mb-3">
                {vehicles.length === 0
                  ? 'No vehicles are registered in the police fleet database yet.'
                  : 'No active vans matched the current search query or station filter.'}
              </p>
              {searchTerm && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
