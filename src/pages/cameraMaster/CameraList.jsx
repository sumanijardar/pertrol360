import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast, Swal } from '../../components/common/Toast';
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
import {
  getCamerasApi,
  createCameraApi,
  updateCameraApi,
  deleteCameraApi,
  getVehiclesApi
} from '../../services/api';

/**
 * =========================================================================
 * DYNAMIC CAMERA INVENTORY COLUMNS CONFIGURATION (LIVE BACKEND DATA)
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
    label: 'Camera ID & Channel',
    align: 'left',
    width: '190px',
    render: (row) => {
      const mountColors = {
        FRONT: 'bg-primary-subtle text-primary border-primary-subtle',
        REAR: 'bg-success-subtle text-success border-success-subtle',
        LEFT: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
        RIGHT: 'bg-info-subtle text-info-emphasis border-info-subtle'
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
          <div className="text-secondary small mt-0.5 text-truncate" style={{ fontSize: '11px', maxWidth: '180px' }} title={row.camera_name}>
            {row.camera_name}
          </div>
        </div>
      );
    }
  },
  {
    key: 'assigned_vehicle',
    label: 'Assigned Patrol Vehicle',
    align: 'left',
    width: '190px',
    render: (row) => (
      <div>
        <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '24px', padding: '1px 6px' }}>
          <span className="ind-flag" style={{ fontSize: '7px' }}>IND</span>
          <span style={{ fontSize: '10.5px', fontWeight: 700 }}>
            {row.registration_number || row.vehicle_id}
          </span>
        </div>
        <div className="text-muted small mt-0.5 text-truncate" style={{ fontSize: '11px', maxWidth: '180px' }}>
          {row.vehicle_id?.replace('PATROL_VAN_', 'Unit ') || 'Vehicle'} • {row.vehicle_model || 'Patrol Van'}
        </div>
      </div>
    )
  },
  {
    key: 'rtsp_url',
    label: 'RTSP Stream URL',
    align: 'left',
    width: '220px',
    render: (row) => (
      <div>
        <div
          className="fw-semibold text-dark font-mono text-truncate"
          style={{ fontSize: '11.5px', maxWidth: '210px' }}
          title={row.rtsp_url}
        >
          {row.rtsp_url || 'N/A'}
        </div>
        <div className="text-muted small" style={{ fontSize: '10.5px' }}>
          RTSP / H.264 • Port 554
        </div>
      </div>
    )
  },
  {
    key: 'resolution',
    label: 'Resolution & FPS',
    align: 'left',
    width: '150px',
    render: (row) => (
      <div className="d-flex align-items-center gap-1.5 flex-wrap">
        <span className="badge bg-light text-dark border font-mono small" style={{ fontSize: '10.5px' }}>
          {row.resolution || '1920x1080'}
        </span>
        <span className="badge bg-light text-secondary border font-mono small" style={{ fontSize: '10.5px' }}>
          {row.fps || 25} FPS
        </span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Stream Status',
    align: 'center',
    width: '130px',
    render: (row, handlers) => (
      <div>
        <button
          type="button"
          onClick={() => handlers.handleToggleStreaming(row)}
          className={`badge border font-mono px-2 py-1 d-inline-flex align-items-center gap-1 btn btn-sm ${row.is_streaming
            ? 'bg-success-subtle text-success border-success-subtle'
            : 'bg-secondary-subtle text-secondary border-secondary'
            }`}
          style={{ fontSize: '10.5px', cursor: 'pointer' }}
          title="Click to toggle streaming status"
        >
          {row.is_streaming ? (
            <>
              <span
                className="rounded-circle bg-success"
                style={{ width: '6px', height: '6px', animation: 'pulseGlow 1.5s infinite' }}
              />
              LIVE RTSP
            </>
          ) : (
            'OFFLINE'
          )}
        </button>
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

export default function CameraList({ stationFilter = 'ALL' }) {
  // Live State from Backend
  const [cameras, setCameras] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Form Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // 'ADD' | 'EDIT'
  const [currentCamera, setCurrentCamera] = useState(null);
  const [formData, setFormData] = useState({
    camera_id: '',
    camera_name: '',
    vehicle_id: '',
    mount_position: 'FRONT',
    rtsp_url: '',
    resolution: '1920x1080',
    fps: 25,
    is_streaming: true
  });

  // Fetch live cameras and vehicles from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [camsRes, vehsRes] = await Promise.all([
        getCamerasApi(),
        getVehiclesApi({ limit: 100 })
      ]);

      const vehicles = Array.isArray(vehsRes)
        ? vehsRes
        : (vehsRes?.data || []);
      setVehiclesList(vehicles);

      const vehicleMap = {};
      vehicles.forEach((v) => {
        if (v.vehicle_id) vehicleMap[v.vehicle_id] = v;
      });

      const rawCameras = Array.isArray(camsRes)
        ? camsRes
        : (camsRes?.data || []);

      const enrichedCameras = rawCameras.map((cam) => {
        const veh = vehicleMap[cam.vehicle_id] || {};
        return {
          ...cam,
          registration_number: veh.registration_number || 'UNASSIGNED',
          vehicle_model: veh.vehicle_model || 'Patrol Van',
          police_station: veh.police_station || 'HQ',
          is_streaming: Boolean(Number(cam.is_streaming) === 1 || cam.is_streaming === true)
        };
      });

      setCameras(enrichedCameras);
    } catch (err) {
      console.error('Failed to load cameras from backend:', err);
      setError(err?.response?.data?.error || err.message || 'Failed to load camera data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamic distinct list of vehicles from loaded list for filtering
  const availableVehicles = useMemo(() => {
    if (vehiclesList.length > 0) {
      return vehiclesList;
    }
    const uniqueIds = Array.from(new Set(cameras.map((c) => c.vehicle_id).filter(Boolean)));
    return uniqueIds.map((id) => ({ vehicle_id: id, registration_number: id }));
  }, [vehiclesList, cameras]);

  // Filter Logic
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cam.camera_id?.toLowerCase().includes(q) ||
        cam.camera_name?.toLowerCase().includes(q) ||
        cam.registration_number?.toLowerCase().includes(q) ||
        cam.vehicle_id?.toLowerCase().includes(q) ||
        cam.rtsp_url?.toLowerCase().includes(q) ||
        cam.mount_position?.toLowerCase().includes(q);

      const matchesPosition =
        positionFilter === 'ALL' ||
        cam.mount_position === positionFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'LIVE' && cam.is_streaming) ||
        (statusFilter === 'OFFLINE' && !cam.is_streaming);

      const matchesVehicle =
        vehicleFilter === 'ALL' ||
        cam.vehicle_id === vehicleFilter;

      const matchesStation =
        !stationFilter ||
        stationFilter === 'ALL' ||
        (cam.police_station && cam.police_station.trim().toLowerCase() === stationFilter.trim().toLowerCase());

      return matchesSearch && matchesPosition && matchesStatus && matchesVehicle && matchesStation;
    });
  }, [cameras, searchTerm, positionFilter, statusFilter, vehicleFilter, stationFilter]);

  // Pagination Slice
  const totalItems = filteredCameras.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCameras = filteredCameras.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, positionFilter, statusFilter, vehicleFilter, stationFilter]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchTerm('');
    setPositionFilter('ALL');
    setStatusFilter('ALL');
    setVehicleFilter('ALL');
    setCurrentPage(1);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setModalMode('ADD');
    setCurrentCamera(null);

    // Auto calculate recommended Camera ID
    const maxNum = cameras.reduce((max, c) => {
      const m = c.camera_id?.match(/CAM_(\d+)/i);
      return m ? Math.max(max, parseInt(m[1], 10)) : max;
    }, 0);
    const nextCamId = `CAM_${String(maxNum + 1).padStart(2, '0')}_FRONT`;
    const defaultVeh = vehiclesList[0]?.vehicle_id || 'PATROL_VAN_01';

    setFormData({
      camera_id: nextCamId,
      camera_name: 'Front ANPR Surveillance HD',
      vehicle_id: defaultVeh,
      mount_position: 'FRONT',
      rtsp_url: `rtsp://admin:12345@192.168.1.${100 + maxNum + 1}:554/stream1`,
      resolution: '1920x1080',
      fps: 25,
      is_streaming: true
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cam) => {
    setModalMode('EDIT');
    setCurrentCamera(cam);
    setFormData({
      camera_id: cam.camera_id || '',
      camera_name: cam.camera_name || '',
      vehicle_id: cam.vehicle_id || '',
      mount_position: cam.mount_position || 'FRONT',
      rtsp_url: cam.rtsp_url || '',
      resolution: cam.resolution || '1920x1080',
      fps: cam.fps || 25,
      is_streaming: Boolean(cam.is_streaming)
    });
    setIsFormModalOpen(true);
  };

  // Toggle Streaming Status via API
  const handleToggleStreaming = async (cam) => {
    const nextStreamingVal = cam.is_streaming ? 0 : 1;
    try {
      await updateCameraApi(cam.id || cam.camera_id, {
        is_streaming: nextStreamingVal
      });
      setCameras((prev) =>
        prev.map((c) =>
          c.camera_id === cam.camera_id ? { ...c, is_streaming: Boolean(nextStreamingVal) } : c
        )
      );
    } catch (err) {
      console.error('Toggle stream error:', err);
      Swal.fire({
        title: 'Update Failed',
        text: err.response?.data?.error || 'Failed to update streaming status.',
        icon: 'error'
      });
    }
  };

  // Decommission Camera Handler
  const handleDeleteCamera = (cam) => {
    Swal.fire({
      title: 'Decommission Camera?',
      html: `
        <p class="mb-1 text-muted">Are you sure you want to remove camera: <strong class="text-dark">${cam.camera_id}</strong>?</p>
        <p class="small text-danger mb-0">RTSP live stream bindings for vehicle <strong>${cam.registration_number || cam.vehicle_id}</strong> will be detached.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Decommission',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteCameraApi(cam.id || cam.camera_id);
          await loadData();
          Swal.fire({
            title: 'Decommissioned!',
            text: res?.message || `Camera ${cam.camera_id} has been removed.`,
            icon: 'success',
            timer: 1600,
            showConfirmButton: false
          });
        } catch (err) {
          console.error('Delete camera error:', err);
          Swal.fire({
            title: 'Decommission Failed',
            text: err.response?.data?.error || err.message || 'Server error occurred while deleting camera.',
            icon: 'error'
          });
        }
      }
    });
  };

  // Save Form (Add / Update)
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalMode === 'ADD') {
        const payload = {
          camera_id: formData.camera_id.trim(),
          vehicle_id: formData.vehicle_id.trim(),
          camera_name: formData.camera_name.trim(),
          mount_position: formData.mount_position,
          rtsp_url: formData.rtsp_url.trim(),
          resolution: formData.resolution || '1920x1080',
          fps: parseInt(formData.fps, 10) || 25,
          is_streaming: formData.is_streaming ? 1 : 0
        };

        const res = await createCameraApi(payload);
        setIsFormModalOpen(false);
        await loadData();

        Swal.fire({
          title: 'Camera Registered!',
          text: res.message || `Camera ${payload.camera_id} added successfully.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Edit mode - update camera fields
        const payload = {
          camera_name: formData.camera_name.trim(),
          mount_position: formData.mount_position,
          rtsp_url: formData.rtsp_url.trim(),
          resolution: formData.resolution || '1920x1080',
          fps: parseInt(formData.fps, 10) || 25,
          is_streaming: formData.is_streaming ? 1 : 0
        };

        const res = await updateCameraApi(currentCamera.id || currentCamera.camera_id, payload);
        setIsFormModalOpen(false);
        await loadData();

        Swal.fire({
          title: 'Camera Updated!',
          text: res.message || `Camera details updated successfully.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Save camera error:', err);
      let errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save camera.';
      if (err.response?.data?.details) {
        const details = err.response.data.details;
        const detailList = Object.entries(details)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        errMsg += `\n\n${detailList}`;
      }
      Swal.fire({
        title: 'Action Failed',
        text: errMsg,
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // KPI Metrics Calculation from live cameras
  const totalCameras = cameras.length;
  const streamingCount = cameras.filter((c) => c.is_streaming).length;
  const frontCameras = cameras.filter((c) => c.mount_position === 'FRONT').length;
  const highResCameras = cameras.filter(
    (c) => c.resolution?.includes('3840') || c.resolution?.includes('1920')
  ).length;

  return (
    <div className="container-fluid px-3 py-5">
      {/* 1. Page Title & Action Bar */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-primary d-inline-flex"><IconCamera size={22} /></span>
            <h1 className="h4 fw-bold text-dark mb-0">Surveillance Camera Master Registry</h1>
            <span className="badge bg-primary text-white ms-1 fw-bold">{totalCameras} CAMERAS</span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Manage 360° vehicle-mounted surveillance cameras, hardware sensors, RTSP live streams & channel configurations
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center gap-2 px-3 shadow-sm fw-semibold"
            style={{ height: '32px' }}
            title="Reload live camera data from backend"
          >
            <span className={isLoading ? 'spinner-border spinner-border-sm' : ''}>↻</span>
            <span>Refresh</span>
          </button>
          <ExportExcelButton
            data={filteredCameras}
            fileName="Patrol360_Camera_Master_Registry"
            columns={[
              { header: 'Camera ID', key: 'camera_id' },
              { header: 'Camera Channel Name', key: 'camera_name' },
              { header: 'Mount Position', key: 'mount_position' },
              { header: 'Assigned Vehicle ID', key: 'vehicle_id' },
              { header: 'Vehicle Plate', key: 'registration_number' },
              { header: 'RTSP Stream URL', key: 'rtsp_url' },
              { header: 'Resolution', key: 'resolution' },
              { header: 'FPS', key: 'fps' },
              { header: 'Streaming Active', key: 'is_streaming' }
            ]}
          />
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center gap-2 px-3 fw-bold shadow-sm"
            style={{ height: '32px' }}
          >
            <span>+</span>
            <span>Register New Camera</span>
          </button>
        </div>
      </div>

      {/* 2. KPI STATS OVERVIEW CARDS */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '8px', height: '8px' }} />
            <span className="small fw-bold text-dark text-uppercase" style={{ letterSpacing: '0.04em' }}>
              Camera Hardware & Streaming Overview (Live Backend)
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
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">DATABASE CAMS</span>
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
                    <span className="badge bg-success p-1 rounded-circle" /> Live Video Feeds
                  </span>
                  <span className="badge bg-success">STREAMING</span>
                </div>
              </div>
            </div>

            {/* Card 3: Front Facing Cameras */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-info shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Front ANPR Units</span>
                    <div className="kpi-num text-info mt-1">{frontCameras}</div>
                  </div>
                  <div className="kpi-icon-pill bg-info-subtle text-info">
                    <IconCheckCircle size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">Highway Patrol Facing</span>
                  <span className="badge bg-info text-dark">FRONT MOUNT</span>
                </div>
              </div>
            </div>

            {/* Card 4: HD / 4K Cameras */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-warning shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">FHD / 4K Optical</span>
                    <div className="kpi-num text-warning-emphasis mt-1">{highResCameras}</div>
                  </div>
                  <div className="kpi-icon-pill bg-warning-subtle text-warning-emphasis">
                    <IconShieldAlert size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">High Definition Sensors</span>
                  <span className="badge bg-warning-subtle text-dark border border-warning-subtle">1080P+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ERROR BANNER (if backend fails) */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-2 px-3 mb-3 shadow-sm" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold">Notice:</span> {error}
          </div>
          <button type="button" onClick={loadData} className="btn btn-sm btn-outline-danger">
            Retry Connection
          </button>
        </div>
      )}

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
              placeholder="Search Camera ID, Channel, RTSP, Vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Mount, Vehicle & Status Dropdown Filters */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Mount Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Mount:</span>
              <select
                className="form-select form-select-sm"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '110px', fontSize: '12px' }}
              >
                <option value="ALL">All Mounts</option>
                <option value="FRONT">FRONT</option>
                <option value="REAR">REAR</option>
                <option value="LEFT">LEFT</option>
                <option value="RIGHT">RIGHT</option>
              </select>
            </div>

            {/* Vehicle Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Vehicle:</span>
              <select
                className="form-select form-select-sm"
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '140px', fontSize: '12px' }}
              >
                <option value="ALL">All Vehicles</option>
                {availableVehicles.map((v) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.registration_number || v.vehicle_id} ({v.vehicle_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Status:</span>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '110px', fontSize: '12px' }}
              >
                <option value="ALL">All Status</option>
                <option value="LIVE">Live RTSP</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchTerm || positionFilter !== 'ALL' || vehicleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-sm btn-outline-secondary text-nowrap d-flex align-items-center gap-1"
                style={{ fontSize: '12px', height: '31px' }}
                title="Reset all filters"
              >
                <span>✕</span> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="table-responsive" style={{ minHeight: '360px' }}>
          {isLoading ? (
            <div className="py-5 text-center text-muted">
              <div className="spinner-border text-primary spinner-border-sm mb-2" role="status" />
              <div className="small fw-semibold">Loading live camera registry from backend...</div>
            </div>
          ) : (
            <table className="table table-hover align-middle mb-0 text-nowrap">
              <thead className="table-light text-uppercase font-mono" style={{ fontSize: '11px', letterSpacing: '0.04em', color: '#18181b', fontWeight: 700 }}>
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
                    <tr key={cam.id || cam.camera_id || idx} style={{ fontSize: '12.5px' }}>
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
                              handleDeleteCamera,
                              handleToggleStreaming
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
                        <h6 className="fw-bold mb-1 text-dark">No Cameras Found in Database</h6>
                        <p className="small text-muted mb-0">
                          {searchTerm || positionFilter !== 'ALL' || vehicleFilter !== 'ALL' || statusFilter !== 'ALL'
                            ? 'Try adjusting your search query or reset active filters.'
                            : 'Click "Register New Camera" above to add your first camera stream.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
      {/* ========================================================== */}
      {/* ADD / EDIT CAMERA MODAL (SPACIOUS & MODERN HIGH-TECH UI)   */}
      {/* ========================================================== */}
      {isFormModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 1055
          }}
          onClick={() => !isSubmitting && setIsFormModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '840px', width: '94%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.28)'
              }}
            >
              <form onSubmit={handleSaveForm}>
                {/* 1. Modal Header */}
                <div
                  className="modal-header py-3 px-4 border-bottom"
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderBottomColor: '#e2e8f0'
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                      }}
                    >
                      <IconCamera size={22} />
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5 className="modal-title h6 fw-bold mb-0 text-dark" style={{ fontSize: '16px' }}>
                          {modalMode === 'ADD' ? 'Register New Camera Sensor' : 'Edit Surveillance Camera'}
                        </h5>
                        <span
                          className={`badge font-mono border ${modalMode === 'ADD'
                              ? 'bg-primary-subtle text-primary border-primary-subtle'
                              : 'bg-info-subtle text-info-emphasis border-info-subtle'
                            }`}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          {modalMode === 'ADD' ? '+ NEW SENSOR' : formData.camera_id}
                        </span>
                      </div>
                      <p className="text-muted small mb-0 mt-0.5" style={{ fontSize: '12px' }}>
                        Configure 360° vehicle mount position, high-res optical sensor & live RTSP stream feed
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close shadow-none"
                    disabled={isSubmitting}
                    onClick={() => setIsFormModalOpen(false)}
                    style={{ fontSize: '11px' }}
                  />
                </div>

                {/* 2. Modal Body with Spacious Sections */}
                <div className="modal-body p-4" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
                  {/* --- Section 1: Camera & Vehicle Identification --- */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                      <span className="text-primary d-inline-flex"><IconCamera size={16} /></span>
                      <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        1. Sensor Identification & Vehicle Mount
                      </span>
                    </div>

                    <div className="row g-3">
                      {/* Camera ID */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between align-items-center">
                          <span>Camera ID <span className="text-danger">*</span></span>
                          <span className="text-muted fw-normal font-mono" style={{ fontSize: '10.5px' }}>
                            {modalMode === 'EDIT' ? '(Fixed ID)' : 'Unique System Code'}
                          </span>
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted font-mono" style={{ fontSize: '11px' }}>
                            ID:
                          </span>
                          <input
                            type="text"
                            required
                            className="form-control form-control-sm font-mono fw-semibold"
                            placeholder="e.g. CAM_01_FRONT"
                            value={formData.camera_id}
                            onChange={(e) => setFormData({ ...formData, camera_id: e.target.value })}
                            disabled={modalMode === 'EDIT' || isSubmitting}
                            style={{ borderColor: '#cbd5e1' }}
                          />
                        </div>
                        <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
                          Unique hardware camera tag used by backend & RTSP router.
                        </div>
                      </div>

                      {/* Camera Channel Name */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">
                          Camera Channel Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-control form-control-sm"
                          placeholder="e.g. Front Highway ANPR Telephoto"
                          value={formData.camera_name}
                          onChange={(e) => setFormData({ ...formData, camera_name: e.target.value })}
                          disabled={isSubmitting}
                          style={{ borderColor: '#cbd5e1' }}
                        />
                        <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
                          Descriptive name shown in live CCTV grids and alert feeds.
                        </div>
                      </div>

                      {/* Assigned Patrol Vehicle */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between align-items-center">
                          <span>Assigned Patrol Vehicle <span className="text-danger">*</span></span>
                          <span className="badge bg-light text-secondary border font-mono" style={{ fontSize: '10px' }}>
                            FLEET
                          </span>
                        </label>
                        <select
                          className="form-select form-select-sm font-mono fw-semibold text-dark"
                          value={formData.vehicle_id}
                          onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                          required
                          disabled={modalMode === 'EDIT' || isSubmitting}
                          style={{ borderColor: '#cbd5e1' }}
                        >
                          {vehiclesList.length > 0 ? (
                            vehiclesList.map((v) => (
                              <option key={v.vehicle_id} value={v.vehicle_id}>
                                {v.registration_number ? `${v.registration_number} • ` : ''}{v.vehicle_id} ({v.vehicle_model || 'Patrol Unit'})
                              </option>
                            ))
                          ) : (
                            <option value={formData.vehicle_id}>{formData.vehicle_id || 'Select Vehicle'}</option>
                          )}
                        </select>
                        <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
                          Only registered patrol vehicles from the database can be linked.
                        </div>
                      </div>

                      {/* Mount Position */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between align-items-center">
                          <span>Mount Position <span className="text-danger">*</span></span>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '10px' }}>
                            360° ORIENTATION
                          </span>
                        </label>
                        <select
                          className="form-select form-select-sm fw-bold font-mono"
                          value={formData.mount_position}
                          onChange={(e) => setFormData({ ...formData, mount_position: e.target.value })}
                          required
                          disabled={isSubmitting}
                          style={{ borderColor: '#cbd5e1' }}
                        >
                          <option value="FRONT">FRONT — Forward Windshield / Highway ANPR</option>
                          <option value="REAR">REAR — Rear Trunk / Trailing Traffic</option>
                          <option value="LEFT">LEFT — Left Flank / Sidewalk Pedestrians</option>
                          <option value="RIGHT">RIGHT — Right Flank / Overtaking Traffic</option>
                        </select>
                        <div className="text-muted small mt-1" style={{ fontSize: '11px' }}>
                          Defines spatial coordinates and visual perspective on vehicle map.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Section 2: RTSP Stream & Network Configuration --- */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                      <span className="text-primary d-inline-flex"><IconVideo size={16} /></span>
                      <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        2. RTSP Stream & Sensor Resolution
                      </span>
                    </div>

                    <div className="row g-3">
                      {/* RTSP Stream URL */}
                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between align-items-center">
                          <span>RTSP Live Stream URL <span className="text-danger">*</span></span>
                          <span className="badge bg-light text-muted border font-mono" style={{ fontSize: '10px' }}>
                            PORT 554 / 8554
                          </span>
                        </label>
                        <div className="input-group input-group-sm">
                          <span
                            className="input-group-text bg-light text-primary font-mono fw-bold border-end-0"
                            style={{ fontSize: '11.5px' }}
                          >
                            rtsp://
                          </span>
                          <input
                            type="text"
                            required
                            className="form-control form-control-sm font-mono border-start-0"
                            placeholder="admin:pass@192.168.1.101:554/stream1"
                            value={
                              formData.rtsp_url.startsWith('rtsp://')
                                ? formData.rtsp_url.slice(7)
                                : formData.rtsp_url
                            }
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setFormData({
                                ...formData,
                                rtsp_url: val.startsWith('rtsp://') ? val : `rtsp://${val}`
                              });
                            }}
                            disabled={isSubmitting}
                            style={{ borderColor: '#cbd5e1' }}
                          />
                        </div>
                        <div className="text-muted small mt-1 font-mono text-truncate" style={{ fontSize: '11px' }}>
                          Resolved Stream URI: <span className="text-dark fw-bold">{formData.rtsp_url || 'rtsp://...'}</span>
                        </div>
                      </div>

                      {/* Resolution */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">
                          Optical Resolution
                        </label>
                        <select
                          className="form-select form-select-sm font-mono"
                          value={formData.resolution}
                          onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                          disabled={isSubmitting}
                          style={{ borderColor: '#cbd5e1' }}
                        >
                          <option value="1920x1080">1920x1080 — Full HD 1080p (Standard)</option>
                          <option value="3840x2160">3840x2160 — 4K Ultra HD (High Optical)</option>
                          <option value="1280x720">1280x720 — 720p HD (Low Bandwidth)</option>
                        </select>
                      </div>

                      {/* FPS */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">
                          Target Frame Rate (FPS)
                        </label>
                        <div className="input-group input-group-sm">
                          <input
                            type="number"
                            min="1"
                            max="60"
                            className="form-control form-control-sm font-mono text-center fw-bold"
                            value={formData.fps}
                            onChange={(e) => setFormData({ ...formData, fps: Number(e.target.value) })}
                            disabled={isSubmitting}
                            style={{ borderColor: '#cbd5e1', maxWidth: '100px' }}
                          />
                          <span className="input-group-text bg-light text-muted font-mono" style={{ fontSize: '11px' }}>
                            Frames / Second (Recommended: 25 - 30)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Section 3: Streaming Status Highlight Card --- */}
                  <div
                    className={`p-3 rounded-3 border transition-all ${formData.is_streaming
                        ? 'border-success-subtle bg-success-subtle'
                        : 'border-secondary-subtle bg-light'
                      }`}
                  >
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2.5">
                        <span
                          className={`rounded-circle d-inline-block ${formData.is_streaming ? 'bg-success' : 'bg-secondary'
                            }`}
                          style={{
                            width: '10px',
                            height: '10px',
                            boxShadow: formData.is_streaming ? '0 0 8px #22c55e' : 'none'
                          }}
                        />
                        <div>
                          <div className="fw-bold small text-dark mb-0.5">
                            {formData.is_streaming ? 'Live RTSP Stream Enabled' : 'Live RTSP Stream Disabled'}
                          </div>
                          <div className="text-muted small" style={{ fontSize: '11.5px' }}>
                            {formData.is_streaming
                              ? 'AI edge server will automatically pull and decode video frames for ANPR & surveillance'
                              : 'Stream ingestion is paused. Camera sensor will appear offline in dashboards'}
                          </div>
                        </div>
                      </div>

                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="isStreamingSwitch"
                          checked={formData.is_streaming}
                          onChange={(e) => setFormData({ ...formData, is_streaming: e.target.checked })}
                          disabled={isSubmitting}
                          style={{ width: '42px', height: '22px', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Modal Footer with High-Contrast Action Buttons */}
                <div
                  className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: '#f8fafc', borderTopColor: '#e2e8f0' }}
                >
                  <div className="text-muted small d-none d-sm-block" style={{ fontSize: '11.5px' }}>
                    * Fields marked with red asterisk are required by backend API.
                  </div>

                  <div className="d-flex align-items-center gap-2 ms-auto">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm px-3 fw-semibold"
                      disabled={isSubmitting}
                      onClick={() => setIsFormModalOpen(false)}
                      style={{ height: '34px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                      disabled={isSubmitting}
                      style={{
                        height: '34px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <IconCheckCircle size={15} />
                          <span>{modalMode === 'ADD' ? 'Register Camera Unit' : 'Update Camera'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
