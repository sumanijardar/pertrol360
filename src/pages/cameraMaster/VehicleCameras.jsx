import React, { useState, useEffect } from 'react';
import { toast, Swal } from '../../components/common/Toast';
import { VEHICLE_CAMERA_MAPPINGS, POLICE_VEHICLES } from '../../data/mockData';
import {
  IconVideo,
  IconSearch,
  IconCar,
  IconCheckCircle,
  IconActivity,
  IconShieldAlert
} from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';

/**
 * =========================================================================
 * DYNAMIC VEHICLE CAMERA TABLE COLUMNS CONFIGURATION (API-READY)
 * =========================================================================
 * When integrating with your backend API:
 * - Match the 'key' with your backend response attributes.
 * - Table header and data rows render dynamically via .map().
 */
export const CAMERA_COLUMNS = [
  {
    key: 'index',
    label: '#',
    width: '48px',
    align: 'center',
    render: (_row, _idx, rowIndex) => (
      <span className="text-muted fw-semibold" style={{ fontSize: '12.5px' }}>
        {rowIndex}
      </span>
    )
  },
  {
    key: 'registration_number',
    label: 'Assigned Vehicle',
    align: 'left',
    render: (row) => (
      <div>
        <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '26px', padding: '1px 7px' }}>
          <span className="ind-flag" style={{ fontSize: '7.5px' }}>IND</span>
          <span style={{ fontSize: '11px' }}>{row.registration_number}</span>
        </div>
        <div className="text-muted small mt-0.5" style={{ fontSize: '11px' }}>
          {row.vehicle_model}
        </div>
      </div>
    )
  },
  {
    key: 'camera_name',
    label: 'Camera Channel',
    align: 'left',
    render: (row) => (
      <div>
        <div className="fw-bold text-dark" style={{ fontSize: '12.5px' }}>
          {row.camera_name}
        </div>
        <div className="text-muted font-mono small" style={{ fontSize: '11px' }}>
          ID: {row.camera_id}
        </div>
      </div>
    )
  },
  {
    key: 'mount_position',
    label: 'Mount Position',
    align: 'left',
    render: (row) => {
      let badgeBg = '#f1f5f9';
      let textColor = '#334155';
      let borderColor = '#cbd5e1';

      if (row.mount_position === 'FRONT') {
        badgeBg = '#eff6ff';
        textColor = '#1d4ed8';
        borderColor = '#bfdbfe';
      } else if (row.mount_position === 'REAR') {
        badgeBg = '#f0fdf4';
        textColor = '#15803d';
        borderColor = '#bbf7d0';
      } else if (row.mount_position.includes('FLANK')) {
        badgeBg = '#fefce8';
        textColor = '#854d0e';
        borderColor = '#fef08a';
      } else if (row.mount_position.includes('CABIN')) {
        badgeBg = '#fdf2f8';
        textColor = '#9d174d';
        borderColor = '#fbcfe8';
      }

      return (
        <span
          className="badge fw-semibold"
          style={{
            backgroundColor: badgeBg,
            color: textColor,
            border: `1px solid ${borderColor}`,
            fontSize: '11px',
            padding: '4px 8px'
          }}
        >
          {row.mount_position.replace('_', ' ')}
        </span>
      );
    }
  },
  {
    key: 'resolution',
    label: 'Resolution & FPS',
    align: 'left',
    render: (row) => (
      <div className="d-flex align-items-center gap-1.5">
        <span className="badge bg-light text-dark border font-mono small" style={{ fontSize: '10.5px' }}>
          {row.resolution.split(' ')[0]}
        </span>
        <span className="badge bg-light text-secondary border font-mono small" style={{ fontSize: '10.5px' }}>
          {row.fps} FPS
        </span>
      </div>
    )
  },
  {
    key: 'ai_mode',
    label: 'Active AI Pipeline',
    align: 'left',
    render: (row) => (
      <span
        className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold"
        style={{ fontSize: '11px', padding: '4px 8px' }}
      >
        ⚡ {row.ai_mode}
      </span>
    )
  },
  {
    key: 'is_streaming',
    label: 'Stream Status',
    width: '120px',
    align: 'center',
    render: (row, _idx, _rowIndex, actions) => (
      <button
        onClick={() => actions.onToggleStream(row.mapping_id)}
        className="btn btn-link p-0 text-decoration-none border-0 shadow-none"
        title="Click to toggle streaming state"
        style={{ cursor: 'pointer' }}
      >
        {row.is_streaming ? (
          <span
            className="badge rounded-pill shadow-sm"
            style={{
              backgroundColor: '#22c55e',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '5px 14px',
              letterSpacing: '0.02em',
              display: 'inline-block'
            }}
          >
            ● LIVE
          </span>
        ) : (
          <span
            className="badge rounded-pill shadow-sm"
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '5px 14px',
              letterSpacing: '0.02em',
              display: 'inline-block'
            }}
          >
            ● OFFLINE
          </span>
        )}
      </button>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    width: '120px',
    align: 'center',
    render: (row, _idx, _rowIndex, actions) => (
      <div className="d-inline-flex align-items-center justify-content-center gap-2">
        {/* View Stream Button */}
        <button
          type="button"
          className="btn btn-sm p-0 shadow-sm"
          title="Preview Live RTSP Stream"
          onClick={() => actions.onView(row)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* Edit Button */}
        <button
          type="button"
          className="btn btn-sm p-0 shadow-sm"
          title="Edit Camera Channel"
          onClick={() => actions.onEdit(row)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#0d6efd',
            color: '#ffffff',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>

        {/* Delete / Unmount Button */}
        <button
          type="button"
          className="btn btn-sm p-0 shadow-sm"
          title="Unmount Camera Channel"
          onClick={() => actions.onDelete(row)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#dc3545',
            color: '#ffffff',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      </div>
    )
  }
];

export default function VehicleCameras() {
  const [mappings, setMappings] = useState(VEHICLE_CAMERA_MAPPINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [selectedMapping, setSelectedMapping] = useState(null);

  // Add/Edit Form State
  const initialFormState = {
    mapping_id: '',
    vehicle_id: 'PATROL_VAN_01',
    registration_number: 'GJ-01-G-9999',
    vehicle_model: 'Mahindra Scorpio-N (Tactical 4x4)',
    police_station: 'Navrangpura Police Station',
    camera_id: '',
    camera_name: '',
    mount_position: 'FRONT',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    ai_mode: 'ANPR + Weapon AI',
    rtsp_url: '',
    codec: 'H.265 / HEVC',
    is_streaming: true
  };
  const [formData, setFormData] = useState(initialFormState);

  // -------------------------------------------------------------------------
  // API INTEGRATION HANDLER
  // -------------------------------------------------------------------------
  const fetchCameraMappingsApi = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Backend API call template:
      // const res = await axios.get('/api/vehicle-cameras');
      // setMappings(res.data);
      setMappings(VEHICLE_CAMERA_MAPPINGS);
    } catch (err) {
      console.error('API Error:', err);
      setApiError('Failed to fetch camera mappings from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCameraMappingsApi();
  }, []);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, vehicleFilter, positionFilter, statusFilter]);

  // Excel Columns Config - Automatically mapped from CAMERA_COLUMNS
  const cameraExcelColumns = CAMERA_COLUMNS
    .filter(c => c.key !== 'index' && c.key !== 'actions')
    .map(c => ({ key: c.key, label: c.label }));

  // Filtered Mappings List
  const filteredMappings = mappings.filter(m => {
    const matchesSearch =
      m.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.camera_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.camera_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mount_position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ai_mode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVehicle = vehicleFilter === 'ALL' || m.vehicle_id === vehicleFilter;
    const matchesPosition = positionFilter === 'ALL' || m.mount_position === positionFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'STREAMING' && m.is_streaming) ||
      (statusFilter === 'OFFLINE' && !m.is_streaming);

    return matchesSearch && matchesVehicle && matchesPosition && matchesStatus;
  });

  // Paginated Mappings Slice
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMappings = filteredMappings.slice(startIndex, startIndex + pageSize);

  // Open Form for Add
  const handleOpenAddModal = () => {
    setEditingMapping(null);
    const defaultVehicle = POLICE_VEHICLES[0] || {};
    setFormData({
      ...initialFormState,
      mapping_id: `VCM-0${mappings.length + 1}`,
      vehicle_id: defaultVehicle.vehicle_id || 'PATROL_VAN_01',
      registration_number: defaultVehicle.registration_number || 'GJ-01-G-9999',
      vehicle_model: defaultVehicle.vehicle_model || 'Mahindra Scorpio-N',
      police_station: defaultVehicle.police_station || 'Navrangpura Police Station',
      camera_id: `CAM_0${mappings.length + 1}_CH`,
      camera_name: 'Tactical Surveillance Channel',
      rtsp_url: `rtsp://stream.police.gov.in/${defaultVehicle.vehicle_id || 'van01'}/cam_stream`
    });
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (item) => {
    setEditingMapping(item);
    setFormData({ ...item });
    setIsFormModalOpen(true);
  };

  // View Details
  const handleViewStream = (item) => {
    setSelectedMapping(item);
    setIsViewModalOpen(true);
  };

  // Toggle Streaming State
  const handleToggleStream = (mappingId) => {
    setMappings(prev =>
      prev.map(m => (m.mapping_id === mappingId ? { ...m, is_streaming: !m.is_streaming } : m))
    );
  };

  // Unmount / Delete Mapping
  const handleDeleteMapping = (item) => {
    Swal.fire({
      title: 'Unmount Camera Channel?',
      text: `Are you sure you want to unmount ${item.camera_name} (${item.camera_id}) from vehicle ${item.registration_number}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Unmount Channel'
    }).then((result) => {
      if (result.isConfirmed) {
        setMappings(prev => prev.filter(m => m.mapping_id !== item.mapping_id));
        Swal.fire('Unmounted!', `Camera channel ${item.camera_id} has been unmounted.`, 'success');
      }
    });
  };

  // Form Submit Handler
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (editingMapping) {
      setMappings(prev =>
        prev.map(m => (m.mapping_id === editingMapping.mapping_id ? { ...m, ...formData } : m))
      );
      Swal.fire('Updated!', `Camera channel ${formData.camera_id} configuration updated.`, 'success');
    } else {
      const newMapping = {
        ...formData,
        mapping_id: formData.mapping_id || `VCM-0${mappings.length + 1}`
      };
      setMappings(prev => [newMapping, ...prev]);
      Swal.fire('Mounted!', `Camera channel ${newMapping.camera_id} mounted to vehicle successfully.`, 'success');
    }
    setIsFormModalOpen(false);
  };

  // KPI Calculations
  const totalMapped = mappings.length;
  const activeStreams = mappings.filter(m => m.is_streaming).length;
  const uniqueVehicles = new Set(mappings.map(m => m.vehicle_id)).size;
  const uniqueAiModes = new Set(mappings.map(m => m.ai_mode)).size;

  // Actions bundle passed dynamically to column renderers
  const tableActions = {
    onView: handleViewStream,
    onEdit: handleOpenEditModal,
    onDelete: handleDeleteMapping,
    onToggleStream: handleToggleStream
  };

  return (
    <div className="container-fluid px-3 py-3">

      {/* Page Title & Breadcrumb Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-5">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-primary d-inline-flex"><IconVideo size={22} /></span>
            <h1 className="h4 fw-bold text-dark mb-0">Vehicle Camera Fleet Mapping</h1>
            <span className="badge bg-primary text-white ms-1 fw-bold">{totalMapped} CAMERA CHANNELS</span>
          </div>

        </div>
      </div>

      {/* 1. SEPARATE KPI STATS OVERVIEW CARD */}
      <div className="card shadow-sm border-0 mb-5">
        {/* <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '8px', height: '8px' }}></span>
            <span className="small fw-bold text-dark text-uppercase letter-spacing">Camera Deployment Overview</span>
          </div>
        </div> */}


        <div className="row g-3">
          {/* Card 1: Total Cameras */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card h-100 border-0 border-start border-4 border-primary shadow-sm p-3 kpi-count-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="text-muted small fw-bold text-uppercase">Mounted Cameras</span>
                  <div className="kpi-num text-dark mt-1">{totalMapped}</div>
                </div>
                <div className="kpi-icon-pill bg-primary-subtle text-primary">
                  <IconVideo size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small">Active hardware sensors</div>
            </div>
          </div>

          {/* Card 2: Live Streaming */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card h-100 border-0 border-start border-4 border-success shadow-sm p-3 kpi-count-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="text-muted small fw-bold text-uppercase">Streaming Live</span>
                  <div className="kpi-num text-success mt-1">{activeStreams}</div>
                </div>
                <div className="kpi-icon-pill bg-success-subtle text-success">
                  <IconCheckCircle size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small">RTSP streams broadcasting</div>
            </div>
          </div>

          {/* Card 3: Vehicles Covered */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card h-100 border-0 border-start border-4 border-info shadow-sm p-3 kpi-count-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="text-muted small fw-bold text-uppercase">Fleet Vans Fitted</span>
                  <div className="kpi-num text-info-emphasis mt-1">{uniqueVehicles}</div>
                </div>
                <div className="kpi-icon-pill bg-info-subtle text-info">
                  <IconCar size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small">Vehicles equipped with cameras</div>
            </div>
          </div>

          {/* Card 4: AI Pipelines */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card h-100 border-0 border-start border-4 border-warning shadow-sm p-3 kpi-count-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="text-muted small fw-bold text-uppercase">AI Pipelines</span>
                  <div className="kpi-num text-warning mt-1">{uniqueAiModes}</div>
                </div>
                <div className="kpi-icon-pill bg-warning-subtle text-warning">
                  <IconShieldAlert size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small">ANPR, Threat & Crowd models</div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. ACTIONS & TOOLBAR CARD */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Left Side: Summary Context */}
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-primary-subtle text-primary rounded d-flex align-items-center justify-content-center">
              <IconVideo size={18} />
            </div>
            <div>
              <div className="fw-bold text-dark small">Multi-Channel Camera Mapping & RTSP Gateways</div>
            </div>
          </div>

          {/* Right Side: Excel Export & Register Button */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <ExportExcelButton
              data={filteredMappings}
              fileName="Vehicle_Cameras_Mapping"
              columns={cameraExcelColumns}
              label="Export Cameras Excel"
            />
            <button
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm fw-bold px-3 py-1"
              onClick={handleOpenAddModal}
            >
              <span>+</span>
              <span>Mount New Camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN DATA TABLE CARD */}
      <div className="card shadow-sm border-0 mb-4">
        {/* Table Filter Strip */}
        <div className="card-header bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Search Box */}
          <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm border-start-0"
              placeholder="Search plate, camera ID, position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btn btn-outline-secondary btn-sm"
                type="button"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Vehicle Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Vehicle:</span>
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="form-select form-select-sm fw-semibold text-dark font-mono"
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="ALL">All Vehicles</option>
                {POLICE_VEHICLES.map(v => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.vehicle_id} ({v.registration_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Mount Position Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Position:</span>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="form-select form-select-sm fw-semibold text-dark"
                style={{ width: 'auto', minWidth: '130px' }}
              >
                <option value="ALL">All Positions</option>
                <option value="FRONT">FRONT</option>
                <option value="REAR">REAR</option>
                <option value="LEFT_FLANK">LEFT FLANK</option>
                <option value="RIGHT_FLANK">RIGHT FLANK</option>
                <option value="CABIN_INTERIOR">CABIN INTERIOR</option>
              </select>
            </div>

            {/* Stream Status Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select form-select-sm fw-semibold text-dark"
                style={{ width: 'auto', minWidth: '100px' }}
              >
                <option value="ALL">All</option>
                <option value="STREAMING">Streaming</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table Container with Horizontal Scroll */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1150px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr className="text-uppercase small" style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                {CAMERA_COLUMNS.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    scope="col"
                    className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                    style={{
                      width: col.width || 'auto',
                      borderRight: idx < CAMERA_COLUMNS.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={CAMERA_COLUMNS.length} className="py-5 text-center text-muted fw-semibold">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading vehicle camera mappings from API...
                  </td>
                </tr>
              ) : filteredMappings.length === 0 ? (
                <tr>
                  <td colSpan={CAMERA_COLUMNS.length} className="py-5 text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                    No camera channels found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedMappings.map((item, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={item.mapping_id || item.id || index}
                      style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}
                    >
                      {CAMERA_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                        >
                          {col.render
                            ? col.render(item, index, rowIndex, tableActions)
                            : (item[col.key] || '-')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Centralized Reusable Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredMappings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* ========================================================== */}
      {/* 4. MOUNT / EDIT VEHICLE CAMERA MODAL                       */}
      {/* ========================================================== */}
      {isFormModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
          onClick={() => setIsFormModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>

              {/* Modal Header */}
              <div className="modal-header py-3 px-4 border-bottom" style={{ backgroundColor: '#f8fafc' }}>
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white"
                    style={{ width: '38px', height: '38px', backgroundColor: '#0d6efd' }}
                  >
                    <IconVideo size={20} />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                        {editingMapping ? 'Edit Vehicle Camera Channel' : 'Mount New Vehicle Camera'}
                      </h5>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold font-mono" style={{ fontSize: '11px' }}>
                        {editingMapping ? editingMapping.camera_id : 'NEW CAMERA'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setIsFormModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSubmitForm}>
                <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>

                  {/* Section 1: Target Vehicle & Channel Identity */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                      <span className="text-primary d-inline-flex"><IconCar size={16} /></span>
                      <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        1. Target Vehicle & Camera Hardware Identity
                      </span>
                    </div>

                    <div className="row g-3">
                      {/* Target Vehicle */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Target Patrol Vehicle <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark font-mono"
                          value={formData.vehicle_id}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const foundVehicle = POLICE_VEHICLES.find(v => v.vehicle_id === selectedId);
                            setFormData({
                              ...formData,
                              vehicle_id: selectedId,
                              registration_number: foundVehicle ? foundVehicle.registration_number : '',
                              vehicle_model: foundVehicle ? foundVehicle.vehicle_model : '',
                              police_station: foundVehicle ? foundVehicle.police_station : ''
                            });
                          }}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          {POLICE_VEHICLES.map(v => (
                            <option key={v.vehicle_id} value={v.vehicle_id}>
                              {v.vehicle_id} - {v.registration_number} ({v.vehicle_model})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Camera ID */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Camera Channel ID <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-sm font-mono fw-bold"
                          required
                          placeholder="e.g. CAM_01_FRONT"
                          value={formData.camera_id}
                          onChange={(e) => setFormData({ ...formData, camera_id: e.target.value.toUpperCase() })}
                          style={{ borderColor: '#cbd5e1', fontSize: '13px' }}
                        />
                      </div>

                      {/* Camera Friendly Name */}
                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1">Camera Friendly Description <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-sm fw-semibold"
                          required
                          placeholder="e.g. Front Windshield 4K Tactical ANPR"
                          value={formData.camera_name}
                          onChange={(e) => setFormData({ ...formData, camera_name: e.target.value })}
                          style={{ borderColor: '#cbd5e1', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Mount Position & Optical Specs */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                      <span className="text-primary d-inline-flex"><IconVideo size={16} /></span>
                      <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        2. Mounting Geometry & Optical Stream Specs
                      </span>
                    </div>

                    <div className="row g-3">
                      {/* Mount Position */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Physical Mount Position <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark"
                          value={formData.mount_position}
                          onChange={(e) => setFormData({ ...formData, mount_position: e.target.value })}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          <option value="FRONT">FRONT (Windshield / Bullbar)</option>
                          <option value="REAR">REAR (Bumper / Tailgate)</option>
                          <option value="LEFT_FLANK">LEFT FLANK (Driver Side Blindspot)</option>
                          <option value="RIGHT_FLANK">RIGHT FLANK (Passenger Flank)</option>
                          <option value="CABIN_INTERIOR">CABIN INTERIOR (Driver Dashcam)</option>
                        </select>
                      </div>

                      {/* Resolution */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Resolution Standard</label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark font-mono"
                          value={formData.resolution}
                          onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          <option value="1920x1080 (1080p)">1920x1080 (1080p Full HD)</option>
                          <option value="3840x2160 (4K UHD)">3840x2160 (4K Ultra HD)</option>
                          <option value="1280x720 (720p HD)">1280x720 (720p HD)</option>
                        </select>
                      </div>

                      {/* Frame Rate FPS */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Frame Rate (FPS)</label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark font-mono"
                          value={formData.fps}
                          onChange={(e) => setFormData({ ...formData, fps: Number(e.target.value) })}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          <option value="25">25 FPS (PAL Surveillance Standard)</option>
                          <option value="30">30 FPS (Smooth Optical Flow)</option>
                          <option value="15">15 FPS (Bandwidth Saving)</option>
                        </select>
                      </div>

                      {/* Video Codec */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Encoding Codec</label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark font-mono"
                          value={formData.codec}
                          onChange={(e) => setFormData({ ...formData, codec: e.target.value })}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          <option value="H.265 / HEVC">H.265 / HEVC (High Compression)</option>
                          <option value="H.264 / AVC">H.264 / AVC (Broad Compatibility)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: AI Pipeline Engine */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                      <span className="text-primary d-inline-flex"><IconActivity size={16} /></span>
                      <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        3. AI Pipeline Engine
                      </span>
                    </div>

                    <div className="row g-3">
                      {/* AI Pipeline */}
                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1">Jetson Edge AI Model</label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark"
                          value={formData.ai_mode}
                          onChange={(e) => setFormData({ ...formData, ai_mode: e.target.value })}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          <option value="ANPR + Weapon AI">ANPR + Weapon Detection AI</option>
                          <option value="ANPR Watchlist">ANPR Stolen Vehicle Watchlist</option>
                          <option value="Crowd & Fire AI">Crowd Surge & Fire Hazard AI</option>
                          <option value="Crowd Analytics">Crowd Density Analytics</option>
                          <option value="Driver Drowsiness Alert">Driver Attention & Cabin Dashcam</option>
                          <option value="Multi-Object AI">Multi-Object Vehicle Classifier</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Operational Stream Status */}
                  <div className="p-3 rounded-3 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="bsCameraActiveCheck"
                            checked={formData.is_streaming}
                            onChange={(e) => setFormData({ ...formData, is_streaming: e.target.checked })}
                            style={{ width: '2.5rem', height: '1.3rem', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <div className="fw-bold small text-dark">Active RTSP Broadcast Gateway</div>
                          <div className="text-muted small" style={{ fontSize: '11.5px' }}>
                            When active, camera feed is ingested into Jetson Edge AI pipelines and Command Center.
                          </div>
                        </div>
                      </div>
                      <div>
                        {formData.is_streaming ? (
                          <span className="badge rounded-pill bg-success px-3 py-1.5 shadow-sm fw-bold" style={{ fontSize: '11px' }}>
                            ● STREAMING LIVE
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-danger px-3 py-1.5 shadow-sm fw-bold" style={{ fontSize: '11px' }}>
                            ● CHANNEL OFFLINE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                  <span className="text-muted small" style={{ fontSize: '11.5px' }}>
                    <span className="text-danger">*</span> Required fields for camera streaming gateway
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm px-3 fw-semibold shadow-none"
                      onClick={() => setIsFormModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                    >
                      <IconCheckCircle size={15} />
                      <span>{editingMapping ? 'Update Channel' : 'Mount Camera'}</span>
                    </button>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. VIEW CAMERA STREAM & OPTICAL AUDIT MODAL                */}
      {/* ========================================================== */}
      {isViewModalOpen && selectedMapping && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
          onClick={() => setIsViewModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>

              {/* Modal Header */}
              <div className="modal-header py-3 px-4 border-bottom" style={{ backgroundColor: '#f8fafc' }}>
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white"
                    style={{ width: '38px', height: '38px', backgroundColor: '#0284c7' }}
                  >
                    <IconVideo size={20} />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                        RTSP Camera Stream Inspection
                      </h5>
                      <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-bold font-mono" style={{ fontSize: '11px' }}>
                        {selectedMapping.camera_id}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setIsViewModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4" style={{ maxHeight: '74vh', overflowY: 'auto' }}>

                {/* 1. Hero Identity Banner */}
                <div
                  className="p-3 rounded-3 shadow-sm mb-3 text-white position-relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid #334155'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="ind-number-plate d-inline-flex align-middle shadow-sm" style={{ height: '36px', padding: '2px 9px' }}>
                        <span className="ind-flag" style={{ fontSize: '8.5px' }}>IND</span>
                        <span className="fw-bold" style={{ fontSize: '13px' }}>{selectedMapping.registration_number}</span>
                      </div>
                      <div>
                        <div className="fw-bold text-white fs-6 mb-0.5">{selectedMapping.camera_name}</div>
                        <div className="text-slate-400 small" style={{ color: '#94a3b8', fontSize: '12px' }}>
                          Mounted on {selectedMapping.vehicle_model} ({selectedMapping.police_station})
                        </div>
                      </div>
                    </div>

                    <div>
                      {selectedMapping.is_streaming ? (
                        <span
                          className="badge rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5"
                          style={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '6px 14px'
                          }}
                        >
                          <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: '6px', height: '6px' }}></span>
                          LIVE STREAM ACTIVE
                        </span>
                      ) : (
                        <span
                          className="badge rounded-pill shadow-sm"
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '6px 14px'
                          }}
                        >
                          CHANNEL OFFLINE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Simulated Video Feed Viewport */}
                <div
                  className="rounded-3 mb-3 p-3 position-relative overflow-hidden shadow-sm"
                  style={{
                    backgroundColor: '#020617',
                    border: '1px solid #1e293b',
                    minHeight: '190px'
                  }}
                >
                  {/* Viewport Header Overlay */}
                  <div className="d-flex justify-content-between align-items-center text-white font-mono small mb-4">
                    <span className="d-inline-flex align-items-center gap-1.5 text-danger fw-bold">
                      <span className="rounded-circle bg-danger" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                      REC [{selectedMapping.mount_position}]
                    </span>
                    <span className="text-secondary small">
                      {selectedMapping.resolution} | {selectedMapping.fps} FPS | {selectedMapping.codec}
                    </span>
                  </div>

                  {/* Viewport Center Crosshair Graphic */}
                  <div className="text-center py-4 my-2">
                    <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-dark-subtle border border-secondary border-opacity-25 text-primary">
                      <IconVideo size={32} />
                    </div>
                    <div className="text-white small fw-bold font-mono mt-2">
                      RTSP FEED: {selectedMapping.camera_name}
                    </div>
                    <div className="text-success small font-mono mt-0.5">
                      AI INGESTION PIPELINE: {selectedMapping.ai_mode}
                    </div>
                  </div>

                  {/* Viewport Footer Overlay */}
                  <div className="d-flex justify-content-between align-items-center text-muted font-mono small pt-2 border-top border-secondary border-opacity-25" style={{ fontSize: '11px' }}>
                    <span>Bitrate: ~3.8 Mbps (H.265 Constant Bitrate)</span>
                    <span className="text-light">Latency: 42ms (Edge Accelerated)</span>
                  </div>
                </div>

                {/* 3. Specs 2-Column Grid */}
                <div className="row g-3 mb-3">
                  {/* Stream Network Card */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                        <IconActivity size={16} />
                        <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                          RTSP Stream Ingestion URL
                        </span>
                      </div>
                      <div className="font-mono text-dark small text-truncate p-2 bg-white rounded border fw-semibold">
                        {selectedMapping.rtsp_url}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <span className="badge bg-white text-dark border font-mono small">
                          Encoding: {selectedMapping.codec}
                        </span>
                        <span className="badge bg-success-subtle text-success small">
                          TCP / RTSP Port 8554
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mount & Hardware Card */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                        <IconCar size={16} />
                        <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                          Mounted Tactical Geometry
                        </span>
                      </div>
                      <div className="fw-bold text-dark fs-6">
                        {selectedMapping.mount_position.replace('_', ' ')}
                      </div>
                      <div className="text-muted small mt-1">
                        Deployed on <strong className="text-dark font-mono">{selectedMapping.vehicle_id}</strong>
                      </div>
                      <div className="mt-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                          ⚡ {selectedMapping.ai_mode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm fw-bold d-inline-flex align-items-center gap-1.5 shadow-none"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(selectedMapping);
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  <span>Edit Channel Specs</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-4 fw-semibold shadow-none"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
