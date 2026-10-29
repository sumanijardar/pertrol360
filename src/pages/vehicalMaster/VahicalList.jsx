import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { POLICE_VEHICLES } from '../../data/mockData';
import {
  getVehiclesApi,
  createVehicleApi,
  updateVehicleApi,
  deleteVehicleApi
} from '../../services/api';
import {
  IconCar,
  IconSearch,
  IconCpu,
  IconShieldAlert,
  IconCheckCircle,
  IconVideo,
  IconActivity,
  IconAlertTriangle,
  IconUsers
} from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';



/**
 * =========================================================================
 * 📋 DYNAMIC TABLE COLUMNS CONFIGURATION (MAP-DRIVEN / API-READY)
 * =========================================================================
 * Jab aap Backend API integrate karein:
 * - Sirf yahan 'key' ko backend API response ke key se match karein.
 * - Naya column add karne ke liye bas 1 object add karein.
 * - Table header aur rows automatically .map() se render honge!
 */
export const VEHICLE_COLUMNS = [
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
    key: 'vehicle_id',
    label: 'Vehicle ID',
    align: 'left',
    render: (row) => (
      <span className="fw-bold font-mono text-dark" style={{ fontSize: '13px' }}>
        {row.vehicle_id}
      </span>
    )
  },
  {
    key: 'registration_number',
    label: 'Registration Plate',
    align: 'left',
    render: (row) => (
      <div className="ind-number-plate d-inline-flex align-middle">
        <span className="ind-flag">IND</span>
        <span>{row.registration_number}</span>
      </div>
    )
  },
  {
    key: 'vehicle_model',
    label: 'Model',
    align: 'left',
    render: (row) => (
      <span className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
        {row.vehicle_model}
      </span>
    )
  },
  {
    key: 'police_station',
    label: 'Police Station',
    align: 'left',
    render: (row) => (
      <span className="text-secondary" style={{ fontSize: '12.5px' }}>
        {row.police_station}
      </span>
    )
  },
  {
    key: 'assigned_driver_officer',
    label: 'Assigned Officer',
    align: 'left',
    render: (row) => (
      <span className="fw-bold text-dark" style={{ fontSize: '12.5px' }}>
        {row.assigned_driver_officer || '-'}
      </span>
    )
  },
  {
    key: 'jetson_device_serial',
    label: 'Jetson AI Device',
    align: 'left',
    render: (row) => (
      <div className="d-inline-flex align-items-center gap-1.5 font-mono text-secondary small" style={{ fontSize: '11.5px' }}>
        <span className="rounded-circle bg-success" style={{ width: '6px', height: '6px', display: 'inline-block' }}></span>
        <span className="fw-semibold text-dark">{row.jetson_device_serial || 'JETSON-ORIN-DEFAULT'}</span>
      </div>
    )
  },
  {
    key: 'sim_card_phone',
    label: 'SIM / Contact',
    align: 'left',
    render: (row) => (
      <span className="font-mono text-dark small fw-semibold" style={{ fontSize: '12px' }}>
        {row.sim_card_phone || '-'}
      </span>
    )
  },
  {
    key: 'is_active',
    label: 'Status',
    width: '120px',
    align: 'center',
    render: (row, _idx, _rowIndex, actions) => (
      <button
        onClick={() => actions.onToggleStatus(row.vehicle_id || row.id)}
        className="btn btn-link p-0 text-decoration-none border-0 shadow-none"
        title="Click to toggle status"
        style={{ cursor: 'pointer' }}
      >
        {row.is_active ? (
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
            Active
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
            Inactive
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
        {/* View Live Feed Button */}
        <button
          type="button"
          className="btn btn-sm p-0 shadow-sm"
          title="View Live CCTV & Telemetry"
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
          title="Edit Vehicle"
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

        {/* Delete Button */}
        <button
          type="button"
          className="btn btn-sm p-0 shadow-sm"
          title="Decommission Vehicle"
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

export default function VahicalList() {
  const [vehicles, setVehicles] = useState(POLICE_VEHICLES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form State
  const initialFormState = {
    vehicle_id: '',
    registration_number: '',
    vehicle_model: '',
    police_station: '',
    assigned_driver_officer: '',
    jetson_device_serial: '',
    sim_card_phone: '',
    is_active: true
  };
  const [formData, setFormData] = useState(initialFormState);

  // -------------------------------------------------------------------------
  // 🔌 API INTEGRATION HANDLER (GET /api/vehicles)
  // -------------------------------------------------------------------------
  const fetchVehiclesApi = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await getVehiclesApi({ page: 1, limit: 100 });
      const vehicleList = Array.isArray(res?.data) ? res.data : (res?.data?.vehicles || []);

      if (res && res.success && Array.isArray(vehicleList) && vehicleList.length > 0) {
        const mappedVehicles = vehicleList.map((v, idx) => ({
          id: v.id || idx + 1,
          vehicle_id: v.vehicle_id || `PATROL_VAN_0${idx + 1}`,
          registration_number: v.registration_number || '-',
          vehicle_model: v.vehicle_model || '-',
          police_station: v.police_station || '-',
          assigned_driver_officer: v.assigned_driver_officer || '-',
          jetson_device_serial: v.jetson_device_serial || 'NV-ORIN-16GB-001',
          sim_card_phone: v.sim_card_phone || '-',
          is_active: v.is_active === 1 || v.is_active === true || v.is_active === '1',
          created_at: v.created_at || new Date().toISOString(),
          cameras: Array.isArray(v.cameras) && v.cameras.length > 0 ? v.cameras : [
            { camera_id: 'cam_01', mount_position: 'FRONT_WINDSHIELD', rtsp_url: `rtsp://stream.police.gov.in/${v.vehicle_id}/front` },
            { camera_id: 'cam_02', mount_position: 'REAR_BUMPER', rtsp_url: `rtsp://stream.police.gov.in/${v.vehicle_id}/rear` },
            { camera_id: 'cam_03', mount_position: 'CABIN_INTERIOR', rtsp_url: `rtsp://stream.police.gov.in/${v.vehicle_id}/cabin` },
            { camera_id: 'cam_04', mount_position: 'LEFT_ANPR', rtsp_url: `rtsp://stream.police.gov.in/${v.vehicle_id}/anpr` }
          ],
          telemetry: {
            speed_kmph: v.speed_kmph != null ? parseFloat(v.speed_kmph) : 42.0,
            latitude: v.latest_lat != null ? parseFloat(v.latest_lat) : 23.0338,
            longitude: v.latest_lng != null ? parseFloat(v.latest_lng) : 72.5850,
            battery_voltage: v.battery_voltage != null ? parseFloat(v.battery_voltage) : 13.8,
            jetson_temperature_c: v.jetson_temperature_c != null ? parseFloat(v.jetson_temperature_c) : 44.5,
            network_signal_dbm: v.network_signal_dbm != null ? parseInt(v.network_signal_dbm) : -65
          }
        }));
        setVehicles(mappedVehicles);
        setIsLiveApi(true);
      } else {
        setVehicles(POLICE_VEHICLES);
        setIsLiveApi(false);
      }
    } catch (err) {
      console.warn('[VahicalList] API fetch error, falling back:', err.message);
      setVehicles(POLICE_VEHICLES);
      setIsLiveApi(false);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiclesApi();
  }, []);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stationFilter, statusFilter]);

  // Excel Columns Config - Automatically mapped from VEHICLE_COLUMNS!
  const vehicleExcelColumns = VEHICLE_COLUMNS
    .filter(c => c.key !== 'index' && c.key !== 'actions')
    .map(c => ({ key: c.key, label: c.label }));

  // Dynamic Unique Police Stations derived from vehicles list
  const uniqueStations = Array.from(
    new Set(
      vehicles
        .map(v => v.police_station?.trim())
        .filter(station => Boolean(station) && station !== '-' && station !== 'Unassigned')
    )
  ).sort();

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      (v.vehicle_id && v.vehicle_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.registration_number && v.registration_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.vehicle_model && v.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.police_station && v.police_station.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.assigned_driver_officer && v.assigned_driver_officer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.jetson_device_serial && v.jetson_device_serial.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStation =
      stationFilter === 'ALL' ||
      (v.police_station && v.police_station.trim().toLowerCase() === stationFilter.trim().toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && v.is_active) ||
      (statusFilter === 'INACTIVE' && !v.is_active);

    return matchesSearch && matchesStation && matchesStatus;
  });

  // Track if any filter or search query is currently active
  const hasActiveFilters = searchQuery !== '' || stationFilter !== 'ALL' || statusFilter !== 'ALL';

  // Reset all filters and search query back to defaults
  const handleResetFilters = () => {
    setSearchQuery('');
    setStationFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  // Paginated vehicles slice
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + pageSize);

  // Open Form for Add
  const handleOpenAddModal = () => {
    setEditingVehicle(null);

    // Calculate highest existing PATROL_VAN number to suggest next unique ID
    const maxNum = vehicles.reduce((max, v) => {
      const match = v.vehicle_id?.match(/PATROL_VAN_(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextVehicleId = `PATROL_VAN_${String(maxNum + 1).padStart(2, '0')}`;

    setFormData({
      ...initialFormState,
      vehicle_id: nextVehicleId
    });
    setIsFormModalOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_id: vehicle.vehicle_id,
      registration_number: vehicle.registration_number,
      vehicle_model: vehicle.vehicle_model,
      police_station: vehicle.police_station,
      assigned_driver_officer: vehicle.assigned_driver_officer || '',
      jetson_device_serial: vehicle.jetson_device_serial || '',
      sim_card_phone: vehicle.sim_card_phone || '',
      is_active: vehicle.is_active
    });
    setIsFormModalOpen(true);
  };

  // View Details
  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewModalOpen(true);
  };

  // Toggle Active Status (PUT /api/vehicles/:id)
  const handleToggleStatus = async (vehicleId) => {
    const target = vehicles.find(v => v.vehicle_id === vehicleId || v.id === vehicleId);
    if (!target) return;
    const newStatus = !target.is_active;

    // Optimistic UI update
    setVehicles(prev =>
      prev.map(v => (v.vehicle_id === vehicleId || v.id === vehicleId ? { ...v, is_active: newStatus } : v))
    );

    try {
      const res = await updateVehicleApi(target.id || target.vehicle_id, { is_active: newStatus ? 1 : 0 });
      if (res && res.success === false) {
        throw new Error(res.error || 'Failed to update vehicle status on server');
      }
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Status set to ${newStatus ? 'Active' : 'Inactive'}`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (apiErr) {
      // Revert if server failed
      setVehicles(prev =>
        prev.map(v => (v.vehicle_id === vehicleId || v.id === vehicleId ? { ...v, is_active: target.is_active } : v))
      );
      const msg = apiErr.response?.data?.error || apiErr.message || 'Status update failed on server.';
      Swal.fire('Error', msg, 'error');
    }
  };

  // Delete Vehicle (DELETE /api/vehicles/:id)
  const handleDeleteVehicle = (vehicle) => {
    Swal.fire({
      title: 'Decommission Vehicle?',
      text: `Are you sure you want to remove ${vehicle.registration_number} (${vehicle.vehicle_id}) from active police registry?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Decommission'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteVehicleApi(vehicle.id || vehicle.vehicle_id);
          if (res && res.success === false) {
            throw new Error(res.error || 'Failed to delete vehicle from server');
          }
          setVehicles(prev => prev.filter(v => v.vehicle_id !== vehicle.vehicle_id && v.id !== vehicle.id));
          Swal.fire('Decommissioned!', `${vehicle.vehicle_id} has been removed from active fleet.`, 'success');
        } catch (apiErr) {
          const msg = apiErr.response?.data?.error || apiErr.message || 'Could not delete vehicle from server.';
          Swal.fire('Error', msg, 'error');
        }
      }
    });
  };

  // Form Submit (POST /api/vehicles or PUT /api/vehicles/:id)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.registration_number.trim()) {
      Swal.fire('Error', 'Please enter a valid vehicle registration number.', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      vehicle_id: formData.vehicle_id.trim().toUpperCase(),
      registration_number: formData.registration_number.trim().toUpperCase(),
      vehicle_model: formData.vehicle_model || 'Mahindra Scorpio Classic',
      police_station: formData.police_station || 'Navrangpura Police Station',
      assigned_driver_officer: formData.assigned_driver_officer || '',
      jetson_device_serial: formData.jetson_device_serial || '',
      sim_card_phone: formData.sim_card_phone || '',
      is_active: formData.is_active ? 1 : 0
    };

    try {
      if (editingVehicle) {
        const vehicleRecordId = editingVehicle.id || editingVehicle.vehicle_id;
        const res = await updateVehicleApi(vehicleRecordId, payload);
        if (res && res.success === false) {
          throw new Error(res.error || 'Server rejected vehicle update');
        }

        setVehicles(prev =>
          prev.map(v => (v.vehicle_id === editingVehicle.vehicle_id || v.id === editingVehicle.id ? { ...v, ...formData } : v))
        );
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Vehicle ${formData.vehicle_id} details have been updated.`,
          timer: 2000,
          showConfirmButton: false
        });
        setIsFormModalOpen(false);
      } else {
        const res = await createVehicleApi(payload);
        if (res && res.success === false) {
          throw new Error(res.error || 'Server rejected vehicle registration');
        }

        const createdId = res?.data?.id || Date.now();
        const newVehicle = {
          id: createdId,
          ...formData,
          vehicle_id: payload.vehicle_id,
          registration_number: payload.registration_number,
          vehicle_model: payload.vehicle_model,
          police_station: payload.police_station,
          created_at: new Date().toISOString(),
          cameras: [
            { camera_id: 'CAM_FRONT', mount_position: 'FRONT_DASH', rtsp_url: `rtsp://jetson.local:8554/${payload.vehicle_id}/front` },
            { camera_id: 'CAM_REAR', mount_position: 'REAR_DASH', rtsp_url: `rtsp://jetson.local:8554/${payload.vehicle_id}/rear` },
            { camera_id: 'CAM_LEFT', mount_position: 'LEFT_SIDE', rtsp_url: `rtsp://jetson.local:8554/${payload.vehicle_id}/left` },
            { camera_id: 'CAM_RIGHT', mount_position: 'RIGHT_SIDE', rtsp_url: `rtsp://jetson.local:8554/${payload.vehicle_id}/right` }
          ],
          telemetry: {
            speed_kmph: 0,
            latitude: 23.0338,
            longitude: 72.585,
            battery_voltage: 13.8,
            jetson_temperature_c: 42.0,
            network_signal_dbm: -65
          }
        };

        setVehicles(prev => [newVehicle, ...prev]);
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: `New Patrol Vehicle ${newVehicle.registration_number} registered successfully.`,
          timer: 2000,
          showConfirmButton: false
        });
        setIsFormModalOpen(false);
      }
    } catch (err) {
      const serverErrMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Vehicle registration failed. Please check details.';

      Swal.fire({
        icon: 'error',
        title: 'Registration Error',
        text: serverErrMsg,
        footer: 'Vehicle ID ya Registration Plate check karein, ye already exist kar raha hai.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUnits = vehicles.length;
  const activeUnits = vehicles.filter(v => v.is_active).length;
  const inactiveUnits = totalUnits - activeUnits;

  // Actions bundle passed dynamically into column render functions
  const tableActions = {
    onView: handleViewVehicle,
    onEdit: handleOpenEditModal,
    onDelete: handleDeleteVehicle,
    onToggleStatus: handleToggleStatus
  };

  return (
    <div className="container-fluid px-3 py-5">

      {/* Page Title & Breadcrumb (Bootstrap 5 Header) */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-primary d-inline-flex"><IconCar size={22} /></span>
            <h1 className="h4 fw-bold text-dark mb-0">Police Vehicle Master Registry</h1>
            <span className="badge bg-primary text-white ms-1 fw-bold">{totalUnits} FLEET UNITS</span>

          </div>
          <p className="text-muted small mb-0 mt-1">
            Manage police patrol vehicles, onboard Jetson AI device serials, assigned drivers & telemetry
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center gap-2 shadow-sm px-3"
            style={{ height: '32px' }}
            onClick={fetchVehiclesApi}
            disabled={isLoading}
            title="Refresh fleet data from server"
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <span>🔄</span>
            )}
            <span className="fw-semibold">Sync Fleet</span>
          </button>
        </div>
      </div>

      {/* 1. SEPARATE KPI STATS OVERVIEW CARD (Bootstrap 5 Card & Grid) */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '8px', height: '8px' }}></span>
            <span className="small fw-bold text-dark text-uppercase letter-spacing">Fleet Operational Overview</span>
          </div>

        </div>

        <div className="card-body p-3">
          <div className="row g-3">
            {/* Card 1: Total Registered Fleet */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-primary shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Total Fleet</span>
                    <div className="kpi-num text-dark mt-1">{totalUnits}</div>
                  </div>
                  <div className="kpi-icon-pill bg-primary-subtle text-primary">
                    <IconCar size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">Mahindra Scorpio & Tata Safari</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">FLEET</span>
                </div>
              </div>
            </div>

            {/* Card 2: Active On Patrol */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-success shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Active On Patrol</span>
                    <div className="kpi-num text-success mt-1">{activeUnits}</div>
                  </div>
                  <div className="kpi-icon-pill bg-success-subtle text-success">
                    <IconActivity size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-success fw-bold d-flex align-items-center gap-1">
                    <span className="badge bg-success p-1 rounded-circle"></span> Live GPS Breadcrumbs
                  </span>
                  <span className="badge bg-success">DEPLOYED</span>
                </div>
              </div>
            </div>

            {/* Card 3: Inactive / Maintenance */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-warning shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Standby / Workshop</span>
                    <div className="kpi-num text-warning mt-1">{inactiveUnits}</div>
                  </div>
                  <div className="kpi-icon-pill bg-warning-subtle text-warning">
                    <IconAlertTriangle size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">Base Workshop Servicing</span>
                  <span className="badge bg-warning text-dark">STANDBY</span>
                </div>
              </div>
            </div>

            {/* Card 4: Jetson AI Boxes */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border-0 border-start border-4 border-info shadow-sm p-3 kpi-count-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-muted small fw-bold text-uppercase">Jetson AI Edge</span>
                    <div className="kpi-num text-primary mt-1">
                      {totalUnits} <span className="small text-muted fs-6">/ {totalUnits}</span>
                    </div>
                  </div>
                  <div className="kpi-icon-pill bg-info-subtle text-info">
                    <IconCpu size={20} />
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                  <span className="small text-muted">AGX Orin & Nano Compute</span>
                  <span className="badge bg-info text-dark">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEPARATE ACTIONS & TOOLBAR CARD (Buttons on Right Side) */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Left Side: Summary Context */}
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-primary-subtle text-primary rounded d-flex align-items-center justify-content-center">
              <IconCar size={18} />
            </div>
            <div>
              <div className="fw-bold text-dark small">Fleet Operations & Registry Management</div>

            </div>
          </div>

          {/* Right Side: Excel Export Button & Add New Patrol Van Button */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <ExportExcelButton
              data={filteredVehicles}
              fileName="Police_Vehicles_Registry"
              columns={vehicleExcelColumns}
              label="Export Fleet Excel"
            />
            <button
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm fw-bold px-3 py-1"
              onClick={handleOpenAddModal}
            >
              <span>+</span>
              <span>Register New Patrol Van</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN DATA TABLE CARD (Bootstrap 5 Responsive Table with Center Align & Single-Line Data) */}
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
              placeholder="Search registration, driver, Jetson..."
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
          <div className="d-flex align-items-center gap-2">
            {/* Station Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Station:</span>
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="form-select form-select-sm fw-semibold text-dark"
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="ALL">All Stations ({uniqueStations.length})</option>
                {uniqueStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="d-flex align-items-center gap-1">
              <span className="small text-muted fw-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select form-select-sm fw-semibold text-dark"
                style={{ width: 'auto', minWidth: '100px' }}
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active (On Duty)</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Reset / Refresh Filters Button */}
            <button
              type="button"
              className={`btn btn-sm d-inline-flex align-items-center gap-1.5 shadow-none ${hasActiveFilters ? 'btn-primary text-white' : 'btn-outline-secondary'
                }`}
              onClick={handleResetFilters}
              title="Reset all search and dropdown filters"
              style={{ fontSize: '12px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Data Table Container with Horizontal Scroll (Bootstrap 5 table-responsive) */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1200px' }}>
            <thead style={{ backgroundColor: '#f4f4f5', borderBottom: '1px solid #e4e4e7' }}>
              <tr className="text-uppercase small" style={{ fontSize: '11px', fontWeight: 700, color: '#18181b', letterSpacing: '0.04em' }}>
                {VEHICLE_COLUMNS.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    scope="col"
                    className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                    style={{
                      width: col.width || 'auto',
                      borderRight: idx < VEHICLE_COLUMNS.length - 1 ? '1px solid #e2e8f0' : 'none'
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
                  <td colSpan={VEHICLE_COLUMNS.length} className="py-5 text-center text-muted fw-semibold">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Loading fleet records from API...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={VEHICLE_COLUMNS.length} className="py-5 text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                    No police vehicles found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((vehicle, index) => {
                  const rowIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={vehicle.vehicle_id || vehicle.id || index}
                      style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}
                    >
                      {VEHICLE_COLUMNS.map((col) => (
                        <td
                          key={col.key}
                          className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                        >
                          {col.render
                            ? col.render(vehicle, index, rowIndex, tableActions)
                            : (vehicle[col.key] || '-')}
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
          totalItems={filteredVehicles.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[20, 50, 100, 500]}
        />
      </div>

      {/* ========================================================== */}
      {/* 4. ADD / EDIT VEHICLE MODAL (Modern Bootstrap 5 UI)        */}
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
                    <IconCar size={20} />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                        {editingVehicle ? `Edit Patrol Vehicle Registry` : 'Register New Patrol Van'}
                      </h5>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold font-mono" style={{ fontSize: '11px' }}>
                        {editingVehicle ? editingVehicle.vehicle_id : 'NEW REGISTRY'}
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

                  {/* --- Section 1: Vehicle Identity & Specs --- */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                      <span className="text-primary d-inline-flex"><IconCar size={16} /></span>
                      <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        1. Vehicle Identity & Specifications
                      </span>
                    </div>

                    <div className="row g-3">
                      {/* Vehicle ID */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between">
                          <span>Vehicle ID <span className="text-danger">*</span></span>
                          {editingVehicle && <span className="text-muted font-mono" style={{ fontSize: '10.5px' }}>[Locked System ID]</span>}
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm font-mono fw-bold"
                          required
                          value={formData.vehicle_id}
                          onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                          disabled={!!editingVehicle}
                          style={{
                            backgroundColor: editingVehicle ? '#f1f5f9' : '#ffffff',
                            borderColor: '#cbd5e1',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      {/* Registration Plate */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between">
                          <span>Registration Plate (HSRP) <span className="text-danger">*</span></span>
                          <span className="text-muted" style={{ fontSize: '10.5px' }}>Indian HSRP Format</span>
                        </label>
                        <div className="d-flex gap-2 align-items-center">
                          <input
                            type="text"
                            className="form-control form-control-sm font-mono fw-bold"
                            required
                            placeholder="e.g. GJ-01-G-9999"
                            value={formData.registration_number}
                            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
                            style={{ borderColor: '#cbd5e1', fontSize: '13px' }}
                          />
                          {formData.registration_number && (
                            <div className="ind-number-plate d-inline-flex align-middle flex-shrink-0" style={{ height: '31px', padding: '1px 8px' }}>
                              <span className="ind-flag" style={{ fontSize: '8px' }}>IND</span>
                              <span style={{ fontSize: '11.5px' }}>{formData.registration_number}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Vehicle Model */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Vehicle Model / Fleet Type</label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark"
                          value={formData.vehicle_model}
                          onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          <option value="Mahindra Scorpio-N (Tactical 4x4)">Mahindra Scorpio-N (Tactical 4x4)</option>
                          <option value="Tata Safari Stealth Patrol">Tata Safari Stealth Patrol</option>
                          <option value="Toyota Innova Crysta Command">Toyota Innova Crysta Command</option>
                          <option value="Mahindra Scorpio Classic">Mahindra Scorpio Classic</option>
                          <option value="Tata Nexon EV Police">Tata Nexon EV Police</option>
                        </select>
                      </div>

                      {/* Police Station */}
                      {/* <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Assigned Police Station / Division <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm fw-semibold text-dark"
                          value={formData.police_station}
                          onChange={(e) => setFormData({ ...formData, police_station: e.target.value })}
                          style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                        >
                          <option value="Navrangpura Police Station">Navrangpura Police Station</option>
                          <option value="Vastrapur Police Station">Vastrapur Police Station</option>
                          <option value="Satellite Police Station">Satellite Police Station</option>
                          <option value="SG Highway Police Station">SG Highway Police Station</option>
                          <option value="Ellis Bridge Police Station">Ellis Bridge Police Station</option>
                        </select>
                      </div> */}



                      {/* Police Station */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">
                          Assigned Police Station / Division{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm fw-semibold text-dark"
                          placeholder="Enter Police Station / Division"
                          value={formData.police_station}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              police_station: e.target.value,
                            })
                          }
                          style={{ borderColor: "#cbd5e1", fontSize: "12.5px" }}
                          required
                        />
                      </div>



                    </div>
                  </div>

                  {/* --- Section 2: Hardware & Officer Deployment --- */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                      <span className="text-primary d-inline-flex"><IconCpu size={16} /></span>
                      <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        2. Edge AI Hardware & Driver Assignment
                      </span>
                    </div>

                    <div className="row g-3">
                      {/* Assigned Officer */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Assigned Driver / Pilot Officer</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-white text-muted border-end-0">
                            <IconUsers size={14} />
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm border-start-0"
                            placeholder="e.g. Insp. Vikram Solanki"
                            value={formData.assigned_driver_officer}
                            onChange={(e) => setFormData({ ...formData, assigned_driver_officer: e.target.value })}
                            style={{ borderColor: '#cbd5e1' }}
                          />
                        </div>
                      </div>

                      {/* SIM Card Phone */}
                      <div className="col-12 col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">M2M SIM Card / Telemetry Link</label>
                        <input
                          type="text"
                          className="form-control form-control-sm font-mono"
                          placeholder="e.g. +91 98250 11201"
                          value={formData.sim_card_phone}
                          onChange={(e) => setFormData({ ...formData, sim_card_phone: e.target.value })}
                          style={{ borderColor: '#cbd5e1' }}
                        />
                      </div>

                      {/* Jetson Serial */}
                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between">
                          <span>NVIDIA Jetson Edge AI Unit Serial</span>
                          <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '10px' }}>
                            YOLOv8 & ANPR Engine
                          </span>
                        </label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted font-mono" style={{ fontSize: '11px' }}>
                            ORIN-SN:
                          </span>
                          <input
                            type="text"
                            className="form-control form-control-sm font-mono fw-semibold"
                            placeholder="e.g. JETSON-AGX-8821-X1"
                            value={formData.jetson_device_serial}
                            onChange={(e) => setFormData({ ...formData, jetson_device_serial: e.target.value })}
                            style={{ borderColor: '#cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Section 3: Operational Duty Status --- */}
                  <div className="p-3 rounded-3 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="form-check form-switch m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="bsActiveCheck"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            style={{ width: '2.5rem', height: '1.3rem', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <div className="fw-bold small text-dark">Patrol Unit Active Duty Status</div>
                          <div className="text-muted small" style={{ fontSize: '11.5px' }}>
                            When active, vehicle broadcasts live GPS telemetry and AI detection events to Command Center.
                          </div>
                        </div>
                      </div>
                      <div>
                        {formData.is_active ? (
                          <span className="badge rounded-pill bg-success px-3 py-1.5 shadow-sm fw-bold" style={{ fontSize: '11px' }}>
                            ● ACTIVE (ON DUTY)
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-danger px-3 py-1.5 shadow-sm fw-bold" style={{ fontSize: '11px' }}>
                            ● INACTIVE / STANDBY
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                  <span className="text-muted small" style={{ fontSize: '11.5px' }}>
                    <span className="text-danger">*</span> Required fields for fleet telemetry sync
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
                      disabled={isSubmitting}
                      className="btn btn-primary btn-sm px-4 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <IconCheckCircle size={15} />
                          <span>{editingVehicle ? 'Update Vehicle' : 'Save Patrol Unit'}</span>
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

      {/* ========================================================== */}
      {/* 5. VIEW VEHICLE DETAILS MODAL (High-Tech Inspection Card)  */}
      {/* ========================================================== */}
      {isViewModalOpen && selectedVehicle && (
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
                    className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white gap-2"
                    style={{ width: '38px', height: '38px', backgroundColor: '#0284c7' }}
                  >
                    <IconCar size={20} />
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                        Patrol Fleet Telemetry & Hardware Audit
                      </h5>
                      <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-bold font-mono" style={{ fontSize: '11px' }}>
                        {selectedVehicle.vehicle_id}
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
                      {/* Realistic HSRP Plate */}
                      <div className="ind-number-plate d-inline-flex align-middle shadow-sm" style={{ height: '38px', padding: '2px 10px' }}>
                        <span className="ind-flag" style={{ fontSize: '9px' }}>IND</span>
                        <span className="fw-bold" style={{ fontSize: '14px', letterSpacing: '0.05em' }}>
                          {selectedVehicle.registration_number}
                        </span>
                      </div>
                      <div>
                        <div className="fw-bold text-white fs-6 mb-0.5">{selectedVehicle.vehicle_model}</div>
                        <div className="small" style={{ color: '#d4d4d8', fontSize: '12px', fontWeight: 500 }}>
                          📍 {selectedVehicle.police_station}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {selectedVehicle.is_active ? (
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
                          LIVE ON DUTY
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
                          OFFLINE / STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Specs 2-Column Grid */}
                <div className="row g-3 mb-3">
                  {/* Officer Info Card */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                        <IconUsers size={16} />
                        <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                          Assigned Officer & Contact
                        </span>
                      </div>
                      <div className="fw-bold text-dark fs-6">{selectedVehicle.assigned_driver_officer || 'Unassigned'}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="badge bg-white text-dark border font-mono small">
                          📱 {selectedVehicle.sim_card_phone || 'No SIM registered'}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Jetson AI Unit Card */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                        <IconCpu size={16} />
                        <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                          Edge AI Hardware Serial
                        </span>
                      </div>
                      <div className="fw-bold text-dark font-mono fs-6">{selectedVehicle.jetson_device_serial || 'JETSON-DEFAULT'}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">

                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 4-Channel RTSP Camera Stream Array */}
                <div className="border rounded-3 p-3 mb-3" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2.5">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-primary d-inline-flex"><IconVideo size={16} /></span>
                      <span className="small fw-bold text-dark text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        Onboard 4-Channel RTSP Camera Stream Array
                      </span>
                    </div>

                  </div>

                  <div className="row g-2">
                    {(selectedVehicle.cameras || [
                      { camera_id: 'cam_01', mount_position: 'FRONT_WINDSHIELD', rtsp_url: `rtsp://stream.police.gov.in/${selectedVehicle.vehicle_id}/front` },
                      { camera_id: 'cam_02', mount_position: 'REAR_BUMPER', rtsp_url: `rtsp://stream.police.gov.in/${selectedVehicle.vehicle_id}/rear` },
                      { camera_id: 'cam_03', mount_position: 'CABIN_INTERIOR', rtsp_url: `rtsp://stream.police.gov.in/${selectedVehicle.vehicle_id}/cabin` },
                      { camera_id: 'cam_04', mount_position: 'LEFT_ANPR', rtsp_url: `rtsp://stream.police.gov.in/${selectedVehicle.vehicle_id}/anpr` }
                    ]).map(cam => (
                      <div key={cam.camera_id} className="col-12 col-sm-6">
                        <div
                          className="p-2.5 rounded-2 border"
                          style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0', transition: 'all 0.15s' }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark small d-inline-flex align-items-center gap-1.5" style={{ fontSize: '12px' }}>
                              <span className="rounded-circle bg-danger" style={{ width: '6px', height: '6px', display: 'inline-block' }}></span>
                              {cam.mount_position}
                            </span>
                            <span className="badge bg-white text-secondary border font-mono" style={{ fontSize: '10px' }}>
                              1080p @ 25 FPS
                            </span>
                          </div>
                          <div
                            className="font-mono text-muted text-truncate mt-1.5 px-2 py-1 rounded bg-white border"
                            style={{ fontSize: '10.5px' }}
                            title={cam.rtsp_url}
                          >
                            {cam.rtsp_url}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Live Telemetry & CAN-Bus Gauges */}
                {selectedVehicle.telemetry && (
                  <div className="border rounded-3 p-3" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                    <div className="d-flex align-items-center gap-2 mb-2.5">
                      <span className="text-primary d-inline-flex"><IconActivity size={16} /></span>
                      <span className="small fw-bold text-dark text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                        Real-Time CAN-Bus & Sensor Telemetry Gauges
                      </span>
                    </div>

                    <div className="row g-2">
                      {/* Speed */}
                      <div className="col-6 col-md-3">
                        <div className="p-2.5 rounded-2 text-center border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                          <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Current Speed</div>
                          <div className="fw-bold font-mono text-dark mt-1" style={{ fontSize: '18px' }}>
                            {selectedVehicle.telemetry.speed_kmph} <span className="text-muted fw-normal" style={{ fontSize: '11px' }}>km/h</span>
                          </div>
                          <div className="text-success small fw-semibold" style={{ fontSize: '10.5px' }}>GPS Calibrated</div>
                        </div>
                      </div>

                      {/* Battery Voltage */}
                      <div className="col-6 col-md-3">
                        <div className="p-2.5 rounded-2 text-center border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                          <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Alternator / Battery</div>
                          <div className="fw-bold font-mono text-success mt-1" style={{ fontSize: '18px' }}>
                            {selectedVehicle.telemetry.battery_voltage} <span className="text-muted fw-normal" style={{ fontSize: '11px' }}>V</span>
                          </div>
                          <div className="text-muted small" style={{ fontSize: '10.5px' }}>Healthy </div>
                        </div>
                      </div>

                      {/* Jetson Core Temp */}
                      <div className="col-6 col-md-3">
                        <div className="p-2.5 rounded-2 text-center border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                          <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Edge Core Temp</div>
                          <div className="fw-bold font-mono text-primary mt-1" style={{ fontSize: '18px' }}>
                            {selectedVehicle.telemetry.jetson_temperature_c} <span className="text-muted fw-normal" style={{ fontSize: '11px' }}>°C</span>
                          </div>
                          <div className="text-success small fw-semibold" style={{ fontSize: '10.5px' }}>Thermal Normal</div>
                        </div>
                      </div>

                      {/* Network Signal */}
                      <div className="col-6 col-md-3">
                        <div className="p-2.5 rounded-2 text-center border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                          <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>4G M2M Signal</div>
                          <div className="fw-bold font-mono text-dark mt-1" style={{ fontSize: '18px' }}>
                            {selectedVehicle.telemetry.network_signal_dbm} <span className="text-muted fw-normal" style={{ fontSize: '11px' }}>dBm</span>
                          </div>
                          <div className="text-success small fw-semibold" style={{ fontSize: '10.5px' }}>Strong Telemetry</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm fw-bold d-inline-flex align-items-center gap-1.5 shadow-none"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(selectedVehicle);
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  <span>Edit Vehicle Specs</span>
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
