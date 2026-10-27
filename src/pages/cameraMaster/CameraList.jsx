import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { VEHICLE_CAMERA_MAPPINGS, POLICE_VEHICLES } from '../../data/mockData';
import {
  IconCamera,
  IconVideo,
  IconSearch,
  IconCheckCircle,
  IconActivity,
  IconShieldAlert,
  IconCar,
  IconCpu
} from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';

/**
 * =========================================================================
 * DYNAMIC CAMERA INVENTORY COLUMNS CONFIGURATION (API-READY)
 * =========================================================================
 */
export const CAMERA_INVENTORY_COLUMNS = [
  {
    key: 'index',
    label: '#',
    width: '45px',
    align: 'center',
    render: (_row, _idx, rowIndex) => (
      <span className="text-muted fw-semibold" style={{ fontSize: '12.5px' }}>
        {rowIndex}
      </span>
    )
  },
  {
    key: 'camera_id',
    label: 'Camera ID & Mount',
    align: 'left',
    width: '180px',
    render: (row) => {
      const mountColors = {
        FRONT: 'bg-primary-subtle text-primary border-primary-subtle',
        REAR: 'bg-success-subtle text-success border-success-subtle',
        LEFT: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
        RIGHT: 'bg-info-subtle text-info-emphasis border-info-subtle',
        LEFT_FLANK: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
        RIGHT_FLANK: 'bg-info-subtle text-info-emphasis border-info-subtle'
      };

      return (
        <div>
          <div className="d-flex align-items-center gap-1.5 flex-wrap">
            <span className="font-mono fw-bold text-dark" style={{ fontSize: '13px' }}>
              {row.camera_id}
            </span>
            <span
              className={`badge border font-mono ${mountColors[row.mount_position] || 'bg-light text-dark'}`}
              style={{ fontSize: '9.5px', padding: '2px 5px' }}
            >
              {row.mount_position}
            </span>
          </div>
          <div className="text-secondary small mt-0.5" style={{ fontSize: '11px' }}>
            {row.camera_name}
          </div>
        </div>
      );
    }
  },
  {
    key: 'assigned_vehicle',
    label: 'Assigned Vehicle',
    align: 'left',
    width: '180px',
    render: (row) => (
      <div>
        <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '24px', padding: '1px 6px' }}>
          <span className="ind-flag" style={{ fontSize: '7px' }}>IND</span>
          <span style={{ fontSize: '10.5px', fontWeight: 700 }}>{row.registration_number}</span>
        </div>
        <div className="text-muted small mt-0.5 text-truncate" style={{ fontSize: '11px', maxWidth: '170px' }}>
          {row.vehicle_id?.replace('PATROL_VAN_', 'Unit ')} • {row.vehicle_model}
        </div>
      </div>
    )
  },
  {
    key: 'hardware_model',
    label: 'Sensor Hardware',
    align: 'left',
    width: '200px',
    render: (row) => (
      <div>
        <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '12px', maxWidth: '190px' }}>
          {row.hardware_model || 'Sony STARVIS IMX415 (4K 8MP)'}
        </div>
        <div className="text-muted small text-truncate" style={{ fontSize: '10.5px', maxWidth: '190px' }}>
          Optics: {row.lens_type || '2.8-12mm Varifocal'}
        </div>
      </div>
    )
  },
  {
    key: 'resolution',
    label: 'Resolution & FPS',
    align: 'left',
    width: '160px',
    render: (row) => (
      <div className="d-flex align-items-center gap-1.5">
        <span className="badge bg-light text-dark border font-mono small" style={{ fontSize: '10.5px' }}>
          {row.resolution?.split(' ')[0] || '1080p'}
        </span>
        <span className="badge bg-light text-secondary border font-mono small" style={{ fontSize: '10.5px' }}>
          {row.fps || 25} FPS
        </span>
      </div>
    )
  },
  {
    key: 'ai_mode',
    label: 'AI Pipeline',
    align: 'left',
    width: '170px',
    render: (row) => {
      const isThreat = row.ai_mode?.includes('Threat') || row.ai_mode?.includes('Weapon');
      const isAnpr = row.ai_mode?.includes('ANPR');

      let badgeClass = 'bg-primary-subtle text-primary border-primary-subtle';
      if (isThreat) badgeClass = 'bg-danger-subtle text-danger border-danger-subtle';
      else if (isAnpr) badgeClass = 'bg-info-subtle text-info border-info-subtle';

      return (
        <div>
          <span
            className={`badge border font-mono ${badgeClass}`}
            style={{ fontSize: '10.5px', whiteSpace: 'normal', textAlign: 'left', lineHeight: 1.25 }}
          >
            {row.ai_mode}
          </span>
        </div>
      );
    }
  },
  {
    key: 'status',
    label: 'Stream Status',
    align: 'center',
    width: '130px',
    render: (row) => (
      <div>
        {row.is_streaming ? (
          <span
            className="badge bg-success-subtle text-success border border-success-subtle font-mono px-2 py-1 d-inline-flex align-items-center gap-1"
            style={{ fontSize: '10.5px' }}
          >
            <span
              className="rounded-circle bg-success"
              style={{ width: '5px', height: '5px', animation: 'pulseGlow 1.5s infinite' }}
            />
            LIVE RTSP
          </span>
        ) : (
          <span
            className="badge bg-secondary-subtle text-secondary border border-secondary font-mono px-2 py-1"
            style={{ fontSize: '10.5px' }}
          >
            OFFLINE
          </span>
        )}
      </div>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'center',
    width: '120px',
    render: (row, handlers) => (
      <div className="d-flex justify-content-center align-items-center gap-1">
        <button
          type="button"
          onClick={() => handlers.handleOpenEditModal(row)}
          className="btn btn-sm btn-outline-primary py-0 px-2 fw-semibold"
          style={{ fontSize: '11px', height: '26px' }}
          title="Edit Camera Details"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => handlers.handleDeleteCamera(row)}
          className="btn btn-sm btn-outline-danger py-0 px-2"
          style={{ fontSize: '11px', height: '26px' }}
          title="Decommission Camera"
        >
          ✕
        </button>
      </div>
    )
  }
];

export default function CameraList({ stationFilter }) {
  // Convert vehicle camera mappings into comprehensive camera inventory
  const initialCameras = VEHICLE_CAMERA_MAPPINGS.map((cam, idx) => ({
    ...cam,
    hardware_model:
      idx % 2 === 0
        ? 'Sony STARVIS IMX415 (4K 8MP Ultra-Low-Light)'
        : 'Hikvision ColorVu DarkFighter IP',
    lens_type: idx % 2 === 0 ? '4mm Fixed F1.4 Iris' : '2.8-12mm Motorized Varifocal',
    firmware_ver: 'v4.2.1-jetpack5.1'
  }));

  const [cameras, setCameras] = useState(initialCameras);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD');
  const [currentCamera, setCurrentCamera] = useState(null);
  const [formData, setFormData] = useState({
    camera_id: '',
    camera_name: '',
    vehicle_id: POLICE_VEHICLES[0]?.vehicle_id || '',
    mount_position: 'FRONT',
    hardware_model: 'Sony STARVIS IMX415 (4K 8MP)',
    lens_type: '2.8-12mm Motorized Zoom',
    rtsp_url: 'rtsp://10.0.1.100:8554/live',
    resolution: '1920x1080 (1080p)',
    fps: 25,
    codec: 'H.265 / HEVC',
    ai_mode: 'YOLOv8 Edge Realtime',
    is_streaming: true
  });

  // Filter logic
  const filteredCameras = cameras.filter((cam) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cam.camera_id?.toLowerCase().includes(q) ||
      cam.camera_name?.toLowerCase().includes(q) ||
      cam.registration_number?.toLowerCase().includes(q) ||
      cam.vehicle_id?.toLowerCase().includes(q) ||
      cam.rtsp_url?.toLowerCase().includes(q) ||
      cam.hardware_model?.toLowerCase().includes(q);

    const matchesPosition =
      positionFilter === 'ALL' ||
      cam.mount_position === positionFilter ||
      (positionFilter === 'LEFT' && cam.mount_position?.startsWith('LEFT')) ||
      (positionFilter === 'RIGHT' && cam.mount_position?.startsWith('RIGHT'));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'LIVE' && cam.is_streaming) ||
      (statusFilter === 'OFFLINE' && !cam.is_streaming);

    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Pagination Slice
  const totalItems = filteredCameras.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCameras = filteredCameras.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, positionFilter, statusFilter]);

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode('ADD');
    setCurrentCamera(null);
    setFormData({
      camera_id: `CAM_${String(cameras.length + 1).padStart(2, '0')}_FRONT`,
      camera_name: 'Roof Front 4K ANPR Telephoto',
      vehicle_id: POLICE_VEHICLES[0]?.vehicle_id || '',
      mount_position: 'FRONT',
      hardware_model: 'Sony STARVIS IMX415 (4K 8MP Ultra-Low-Light)',
      lens_type: '2.8-12mm Motorized Zoom',
      rtsp_url: 'rtsp://10.0.1.100:8554/live/front_ch1',
      resolution: '1920x1080 (1080p)',
      fps: 25,
      codec: 'H.265 / HEVC',
      ai_mode: 'ANPR + Threat Detection',
      is_streaming: true
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (cam) => {
    setModalMode('EDIT');
    setCurrentCamera(cam);
    setFormData({ ...cam });
    setIsFormModalOpen(true);
  };

  const handleDeleteCamera = (cam) => {
    Swal.fire({
      title: 'Decommission Camera?',
      html: `<p class="mb-1 text-muted">Are you sure you want to remove camera: <strong class="text-dark">${cam.camera_id}</strong>?</p><p class="small text-danger mb-0">RTSP live stream bindings for ${cam.registration_number || cam.vehicle_id} will be detached.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Decommission',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setCameras((prev) => prev.filter((c) => c.camera_id !== cam.camera_id));
        Swal.fire({
          title: 'Decommissioned!',
          text: `Camera ${cam.camera_id} has been removed.`,
          icon: 'success',
          timer: 1600,
          showConfirmButton: false
        });
      }
    });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    const assignedVeh = POLICE_VEHICLES.find((v) => v.vehicle_id === formData.vehicle_id) || {};

    const updatedRecord = {
      ...formData,
      registration_number: assignedVeh.registration_number || 'UNASSIGNED',
      vehicle_model: assignedVeh.vehicle_model || 'Patrol Unit',
      police_station: assignedVeh.police_station || 'Central HQ'
    };

    if (modalMode === 'ADD') {
      setCameras((prev) => [updatedRecord, ...prev]);
      Swal.fire({
        title: 'Camera Registered!',
        text: `Camera ${formData.camera_id} added successfully.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      setCameras((prev) =>
        prev.map((c) => (c.camera_id === currentCamera.camera_id ? updatedRecord : c))
      );
      Swal.fire({
        title: 'Updated!',
        text: `Camera ${formData.camera_id} details updated.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
    setIsFormModalOpen(false);
  };

  // KPI Metrics Calculation
  const totalCameras = cameras.length;
  const streamingCount = cameras.filter((c) => c.is_streaming).length;
  const anprCameras = cameras.filter((c) => c.ai_mode?.includes('ANPR')).length;
  const threatCameras = cameras.filter(
    (c) => c.ai_mode?.includes('Threat') || c.ai_mode?.includes('Weapon')
  ).length;

  return (
    <div className="container-fluid px-3 py-4">
      {/* 1. Page Title & Breadcrumb Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-primary d-inline-flex"><IconCamera size={22} /></span>
            <h1 className="h4 fw-bold text-dark mb-0">Surveillance Camera Master Registry</h1>
            <span className="badge bg-primary text-white ms-1 fw-bold">{totalCameras} CAMERAS</span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Manage 360° vehicle mounted surveillance cameras, hardware sensors, RTSP live streams & AI edge pipelines
          </p>
        </div>
      </div>

      {/* 2. KPI STATS OVERVIEW CARD (Matching VahicalList styling) */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '8px', height: '8px' }} />
            <span className="small fw-bold text-dark text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Camera Hardware & Streaming Overview
            </span>
          </div>
        </div>

        <div className="card-body p-3">
          <div className="row g-3">
            {/* Card 1: Total Cameras */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-primary shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Total Cameras</span>
                    <div className="kpi-num text-dark mt-1">{totalCameras}</div>
                  </div>
                  <div className="kpi-icon-pill bg-primary-subtle text-primary">
                    <IconCamera size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">Surveillance Inventory</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">FLEET CAMS</span>
                </div>
              </div>
            </div>

            {/* Card 2: Live RTSP Streaming */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-success shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Live RTSP Streams</span>
                    <div className="kpi-num text-success mt-1">{streamingCount}</div>
                  </div>
                  <div className="kpi-icon-pill bg-success-subtle text-success">
                    <IconActivity size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-success fw-bold d-flex align-items-center gap-1">
                    <span className="badge bg-success p-1 rounded-circle" /> Live RTSP Video Feeds
                  </span>
                  <span className="badge bg-success">STREAMING</span>
                </div>
              </div>
            </div>

            {/* Card 3: ANPR OCR Pipeline */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-info shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">ANPR License AI</span>
                    <div className="kpi-num text-info mt-1">{anprCameras}</div>
                  </div>
                  <div className="kpi-icon-pill bg-info-subtle text-info">
                    <IconCheckCircle size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">Automatic License Plate OCR</span>
                  <span className="badge bg-info text-dark">ANPR ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Card 4: Weapons & Threat Detection */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-danger shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Weapon Threat AI</span>
                    <div className="kpi-num text-danger mt-1">{threatCameras}</div>
                  </div>
                  <div className="kpi-icon-pill bg-danger-subtle text-danger">
                    <IconShieldAlert size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">Firearm & Blade Edge AI</span>
                  <span className="badge bg-danger">HIGH THREAT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEPARATE ACTIONS & TOOLBAR CARD */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Left Context */}
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-primary-subtle text-primary rounded d-flex align-items-center justify-content-center">
              <IconCamera size={18} />
            </div>
            <div>
              <div className="fw-bold text-dark small">Camera Fleet & Stream Connectivity</div>
              <div className="text-muted small" style={{ fontSize: '11px' }}>
                Inspect hardware status, lens models, RTSP URLs and AI inference pipelines
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <ExportExcelButton
              data={filteredCameras}
              fileName="Patrol360_Camera_Master_Registry"
              columns={[
                { header: 'Camera ID', key: 'camera_id' },
                { header: 'Camera Name', key: 'camera_name' },
                { header: 'Mount Position', key: 'mount_position' },
                { header: 'Assigned Vehicle', key: 'registration_number' },
                { header: 'Vehicle ID', key: 'vehicle_id' },
                { header: 'Hardware Sensor', key: 'hardware_model' },
                { header: 'Lens Type', key: 'lens_type' },
                { header: 'RTSP URL', key: 'rtsp_url' },
                { header: 'Resolution', key: 'resolution' },
                { header: 'FPS', key: 'fps' },
                { header: 'AI Pipeline', key: 'ai_mode' },
                { header: 'Is Streaming', key: 'is_streaming' }
              ]}
            />
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 fw-bold shadow-sm"
              style={{ height: '32px' }}
            >
              <span>+</span> Register New Camera
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN FILTER & TABLE CARD */}
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
        {/* Table Header Filter Toolbar */}
        <div className="card-header bg-white py-2.5 px-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Search Input */}
          <div className="position-relative" style={{ maxWidth: '320px', flex: '1 1 220px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ps-2.5 text-muted">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              className="form-control form-control-sm ps-4"
              placeholder="Search Camera ID, Model, RTSP, Plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Mount & Status Dropdown Filters */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="small text-muted fw-semibold">Mount:</span>
            <select
              className="form-select form-select-sm"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              style={{ width: '130px', fontSize: '12px' }}
            >
              <option value="ALL">All Mounts</option>
              <option value="FRONT">FRONT</option>
              <option value="REAR">REAR</option>
              <option value="LEFT">LEFT FLANK</option>
              <option value="RIGHT">RIGHT FLANK</option>
            </select>

            <span className="small text-muted fw-semibold ms-2">Status:</span>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '120px', fontSize: '12px' }}
            >
              <option value="ALL">All Status</option>
              <option value="LIVE">Live RTSP</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="table-responsive" style={{ minHeight: '360px' }}>
          <table className="table table-hover align-middle mb-0 text-nowrap">
            <thead className="table-light text-uppercase font-mono" style={{ fontSize: '11px', letterSpacing: '0.04em' }}>
              <tr>
                {CAMERA_INVENTORY_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-end' : 'text-start'}
                    style={{ width: col.width || 'auto', padding: '10px 14px' }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedCameras.length > 0 ? (
                paginatedCameras.map((cam, idx) => (
                  <tr key={cam.camera_id || idx} style={{ fontSize: '12.5px' }}>
                    {CAMERA_INVENTORY_COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-end' : 'text-start'}
                        style={{ padding: '9px 14px' }}
                      >
                        {col.render(
                          cam,
                          {
                            handleOpenEditModal,
                            handleDeleteCamera
                          },
                          startIndex + idx + 1
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={CAMERA_INVENTORY_COLUMNS.length} className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <span className="text-secondary mb-2"><IconCamera size={36} /></span>
                      <h6 className="fw-bold mb-1 text-dark">No Cameras Found</h6>
                      <p className="small text-muted mb-0">Try adjusting your search query or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="card-footer bg-white border-top py-2 px-3">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ========================================================== */}
      {/* ADD / EDIT CAMERA MODAL                                    */}
      {/* ========================================================== */}
      {isFormModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1055 }}
          onClick={() => setIsFormModalOpen(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow border-0 rounded-3">
              <form onSubmit={handleSaveForm}>
                <div className="modal-header bg-light py-2 px-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-primary d-flex"><IconCamera size={18} /></span>
                    <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                      {modalMode === 'ADD' ? 'Register New Camera Unit' : `Edit Camera: ${formData.camera_id}`}
                    </h5>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setIsFormModalOpen(false)} />
                </div>

                <div className="modal-body p-3">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Camera ID *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm font-mono"
                        placeholder="e.g. CAM_01_FRONT"
                        value={formData.camera_id}
                        onChange={(e) => setFormData({ ...formData, camera_id: e.target.value })}
                        disabled={modalMode === 'EDIT'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Camera Channel Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        placeholder="e.g. Front Windshield 4K ANPR"
                        value={formData.camera_name}
                        onChange={(e) => setFormData({ ...formData, camera_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Assigned Patrol Vehicle *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.vehicle_id}
                        onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                        required
                      >
                        {POLICE_VEHICLES.map((v) => (
                          <option key={v.vehicle_id} value={v.vehicle_id}>
                            {v.registration_number} ({v.vehicle_id}) - {v.vehicle_model}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Mount Position *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.mount_position}
                        onChange={(e) => setFormData({ ...formData, mount_position: e.target.value })}
                        required
                      >
                        <option value="FRONT">FRONT (Forward Facing)</option>
                        <option value="REAR">REAR (Backward Facing)</option>
                        <option value="LEFT">LEFT (Left Flank / Sidewalk)</option>
                        <option value="RIGHT">RIGHT (Right Flank / Traffic)</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-dark">Hardware Sensor & Lens</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Sony STARVIS IMX415 (4K 8MP)"
                        value={formData.hardware_model}
                        onChange={(e) => setFormData({ ...formData, hardware_model: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-dark">Resolution</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.resolution}
                        onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                      >
                        <option value="3840x2160 (4K UHD)">3840x2160 (4K UHD)</option>
                        <option value="1920x1080 (1080p)">1920x1080 (1080p)</option>
                        <option value="1280x720 (720p)">1280x720 (720p)</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-dark">Frame Rate (FPS)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        className="form-control form-control-sm"
                        value={formData.fps}
                        onChange={(e) => setFormData({ ...formData, fps: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-dark">AI Inference Pipeline</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.ai_mode}
                        onChange={(e) => setFormData({ ...formData, ai_mode: e.target.value })}
                      >
                        <option value="ANPR + Threat Detection">ANPR + Threat Detection</option>
                        <option value="ANPR Watchlist">ANPR Watchlist</option>
                        <option value="Weapon AI (Handgun/Rifle/Knife)">Weapon AI (Handgun/Rifle/Knife)</option>
                        <option value="Crowd & Fire Analytics">Crowd & Fire Analytics</option>
                        <option value="YOLOv8 Edge Realtime">YOLOv8 Edge Realtime</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isStreamingCheck"
                          checked={formData.is_streaming}
                          onChange={(e) => setFormData({ ...formData, is_streaming: e.target.checked })}
                        />
                        <label className="form-check-label small fw-bold text-dark" htmlFor="isStreamingCheck">
                          Active Live RTSP Stream Streaming Status
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2 px-3 border-top">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsFormModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold">
                    {modalMode === 'ADD' ? 'Save & Register Camera' : 'Update Camera'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
