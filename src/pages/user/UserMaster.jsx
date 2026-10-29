import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { POLICE_OFFICERS, POLICE_VEHICLES } from '../../data/mockData';
import {
    getUsersApi,
    createUserApi,
    updateUserApi,
    deleteUserApi,
    getVehiclesApi,
    API_BASE_URL
} from '../../services/api';
import {
    IconUsers,
    IconSearch,
    IconShieldAlert,
    IconCheckCircle,
    IconCar,
    IconActivity,
    IconAlertTriangle
} from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';

/**
 * =========================================================================
 * 📋 DYNAMIC POLICE OFFICERS TABLE COLUMNS CONFIGURATION (API-READY)
 * =========================================================================
 * Jab aap Backend API integrate karein:
 * - Sirf yahan 'key' ko backend API response ke key se match karein.
 * - Table header aur rows automatically .map() se render honge!
 */
export const POLICE_COLUMNS = [
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
        key: 'badge_number',
        label: 'Badge No.',
        align: 'left',
        render: (row) => (
            <div className="d-inline-flex align-items-center gap-1.5">
                <span
                    className="badge bg-warning-subtle text-dark border border-warning fw-bold font-mono"
                    style={{ fontSize: '11px', letterSpacing: '0.04em' }}
                >
                    🎖️ {row.badge_number}
                </span>
            </div>
        )
    },
    {
        key: 'officer_name',
        label: 'Officer Name',
        align: 'left',
        render: (row) => (
            <div>
                <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                    {row.officer_name}
                </div>
                <div className="text-muted small" style={{ fontSize: '11px' }}>
                    {row.email}
                </div>
            </div>
        )
    },
    {
        key: 'rank',
        label: 'Designation / Rank',
        align: 'left',
        render: (row) => {
            let badgeStyle = { backgroundColor: '#e2e8f0', color: '#1e293b' };
            if (row.rank.includes('Inspector')) {
                badgeStyle = { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
            } else if (row.rank.includes('Sub-Inspector')) {
                badgeStyle = { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
            } else if (row.rank.includes('ASI')) {
                badgeStyle = { backgroundColor: '#fefce8', color: '#854d0e', border: '1px solid #fef08a' };
            }
            return (
                <span
                    className="badge fw-semibold"
                    style={{ ...badgeStyle, fontSize: '11px', padding: '4px 8px' }}
                >
                    {row.rank}
                </span>
            );
        }
    },
    {
        key: 'police_station',
        label: 'Police Station',
        align: 'left',
        render: (row) => (
            <span className="text-secondary fw-semibold" style={{ fontSize: '12.5px' }}>
                {row.police_station}
            </span>
        )
    },
    {
        key: 'contact_number',
        label: 'Mobile Contact',
        align: 'left',
        render: (row) => (
            <span className="font-mono text-dark small fw-semibold" style={{ fontSize: '12px' }}>
                {row.contact_number}
            </span>
        )
    },
    {
        key: 'assigned_vehicle_plate',
        label: 'Assigned Patrol Van',
        align: 'left',
        render: (row) => (
            row.assigned_vehicle_plate && row.assigned_vehicle_plate !== 'Unassigned' ? (
                <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '26px', padding: '1px 6px' }}>
                    <span className="ind-flag" style={{ fontSize: '7.5px' }}>IND</span>
                    <span style={{ fontSize: '11px' }}>{row.assigned_vehicle_plate}</span>
                </div>
            ) : (
                <span className="badge bg-light text-muted border" style={{ fontSize: '11px' }}>
                    Unassigned
                </span>
            )
        )
    },
    {
        key: 'shift',
        label: 'Assigned Shift',
        align: 'left',
        render: (row) => (
            <span className="badge bg-light text-dark border small fw-normal" style={{ fontSize: '11px' }}>
                🕒 {row.shift.split(' ')[0]} {row.shift.split(' ')[1]}
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
                onClick={() => actions.onToggleStatus(row.officer_id)}
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
                {/* View Profile Button */}
                <button
                    type="button"
                    className="btn btn-sm p-0 shadow-sm"
                    title="View Officer Service Profile"
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
                    title="Edit Officer Record"
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
                    title="Decommission Officer Record"
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

export default function PoliceMaster() {
    const [officers, setOfficers] = useState(POLICE_OFFICERS);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [stationFilter, setStationFilter] = useState('ALL');
    const [rankFilter, setRankFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingOfficer, setEditingOfficer] = useState(null);
    const [selectedOfficer, setSelectedOfficer] = useState(null);

    // Form State
    const initialFormState = {
        officer_id: '',
        badge_number: '',
        officer_name: '',
        email: '',
        password: '',
        role: 'user',
        rank: 'Police Sub-Inspector (PSI)',
        police_station: 'Navrangpura Police Station',
        contact_number: '',
        assigned_vehicle_id: 'PATROL_VAN_01',
        assigned_vehicle_plate: 'GJ-01-G-9999',
        shift: 'Day Shift (08:00 - 18:00)',
        blood_group: 'B+',
        emergency_contact: '',
        joined_date: '2022-01-01',
        is_active: true
    };
    const [formData, setFormData] = useState(initialFormState);

    const [isLiveApi, setIsLiveApi] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState([]);

    // -------------------------------------------------------------------------
    // 🔌 API INTEGRATION HANDLER (GET /api/users)
    // -------------------------------------------------------------------------
    const fetchOfficersApi = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const res = await getUsersApi({ page: 1, limit: 100 });
            const userList = Array.isArray(res?.data) ? res.data : (res?.data?.users || []);

            if (res && res.success && Array.isArray(userList)) {
                const mapped = userList.map((u, idx) => ({
                    id: u.id,
                    officer_id: u.id ? String(u.id) : (u.badge_number || `OFFICER_${idx + 1}`),
                    badge_number: u.badge_number || `POL-${u.id || idx + 1}`,
                    officer_name: u.name || u.officer_name || '-',
                    rank: u.role === 'admin' ? 'Super Admin' : (u.rank || 'Police Sub-Inspector (PSI)'),
                    role: u.role || 'user',
                    police_station: u.police_station || '-',
                    contact_number: u.phone || u.contact_number || '-',
                    email: u.email || '',
                    assigned_vehicle_id: u.assigned_vehicle_id || '-',
                    assigned_vehicle_plate: u.assigned_vehicle_plate || '-',
                    shift: u.shift || '-',
                    blood_group: u.blood_group || '-',
                    emergency_contact: u.emergency_contact || '-',
                    joined_date: u.created_at ? u.created_at.split(' ')[0] : '-',
                    is_active: u.is_active === undefined ? true : (u.is_active === 1 || u.is_active === true || u.is_active === '1')
                }));
                setOfficers(mapped);
                setIsLiveApi(true);
            } else if (res?.isAuthRestricted) {
                setApiError('Administrator login required to load officer records.');
                setOfficers([]);
                setIsLiveApi(false);
            } else {
                setOfficers([]);
                setIsLiveApi(false);
            }
        } catch (err) {
            console.warn('[UserMaster] API fetch error:', err.message);
            setOfficers([]);
            setIsLiveApi(false);
            setApiError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // 🔌 FETCH DYNAMIC VEHICLES FOR DROPDOWN (GET /api/vehicles)
    // -------------------------------------------------------------------------
    const fetchAvailableVehicles = async () => {
        try {
            const res = await getVehiclesApi({ page: 1, limit: 100 });
            const list = Array.isArray(res?.data) ? res.data : (res?.data?.vehicles || []);
            if (res && res.success && Array.isArray(list) && list.length > 0) {
                setAvailableVehicles(list);
            } else {
                setAvailableVehicles(POLICE_VEHICLES);
            }
        } catch (err) {
            console.warn('[UserMaster] fetchAvailableVehicles fallback:', err.message);
            setAvailableVehicles(POLICE_VEHICLES);
        }
    };

    useEffect(() => {
        fetchOfficersApi();
        fetchAvailableVehicles();
    }, []);

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, stationFilter, rankFilter, statusFilter]);

    // Excel Columns Config - Automatically mapped from POLICE_COLUMNS!
    const policeExcelColumns = POLICE_COLUMNS
        .filter(c => c.key !== 'index' && c.key !== 'actions')
        .map(c => ({ key: c.key, label: c.label }));

    // Dynamic unique stations derived from officers list
    const uniqueStations = Array.from(
        new Set(
            officers
                .map(o => o.police_station?.trim())
                .filter(station => Boolean(station) && station !== '-' && station !== 'Unassigned')
        )
    ).sort();

    // Dynamic unique ranks derived from officers list
    const uniqueRanks = Array.from(
        new Set(
            officers
                .map(o => o.rank?.trim())
                .filter(rank => Boolean(rank) && rank !== '-' && rank !== 'Unassigned')
        )
    ).sort();

    // Track if any filter is active
    const hasActiveFilters = searchQuery !== '' || stationFilter !== 'ALL' || rankFilter !== 'ALL' || statusFilter !== 'ALL';

    const handleResetFilters = () => {
        setSearchQuery('');
        setStationFilter('ALL');
        setRankFilter('ALL');
        setStatusFilter('ALL');
        setCurrentPage(1);
    };

    // Filtered officers
    const filteredOfficers = officers.filter(o => {
        const matchesSearch =
            (o.officer_id && o.officer_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.badge_number && o.badge_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.officer_name && o.officer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.police_station && o.police_station.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.contact_number && o.contact_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.assigned_vehicle_plate && o.assigned_vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStation =
            stationFilter === 'ALL' ||
            (o.police_station && o.police_station.trim().toLowerCase() === stationFilter.trim().toLowerCase());
        const matchesRank =
            rankFilter === 'ALL' ||
            (o.rank && o.rank.trim().toLowerCase() === rankFilter.trim().toLowerCase());
        const matchesStatus =
            statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && o.is_active) ||
            (statusFilter === 'INACTIVE' && !o.is_active);

        return matchesSearch && matchesStation && matchesRank && matchesStatus;
    });

    // Paginated officers slice
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedOfficers = filteredOfficers.slice(startIndex, startIndex + pageSize);

    // Open Form for Add
    const handleOpenAddModal = () => {
        setEditingOfficer(null);
        setFormData({
            ...initialFormState,
            officer_id: `OFFICER_00${officers.length + 1}`,
            badge_number: `GJ-NP-${Math.floor(100 + Math.random() * 900)}`,
            email: '',
            password: 'Officer@12345',
            role: 'user'
        });
        setIsFormModalOpen(true);
    };

    // Open Form for Edit
    const handleOpenEditModal = (officer) => {
        setEditingOfficer(officer);
        setFormData({
            id: officer.id,
            officer_id: officer.officer_id,
            badge_number: officer.badge_number,
            officer_name: officer.officer_name,
            password: '',
            role: officer.role || 'user',
            rank: officer.rank,
            police_station: officer.police_station,
            contact_number: officer.contact_number,
            email: officer.email || '',
            assigned_vehicle_id: officer.assigned_vehicle_id || 'None',
            assigned_vehicle_plate: officer.assigned_vehicle_plate || 'Unassigned',
            shift: officer.shift || 'Day Shift (08:00 - 18:00)',
            blood_group: officer.blood_group || 'B+',
            emergency_contact: officer.emergency_contact || '',
            joined_date: officer.joined_date || '2020-01-01',
            is_active: officer.is_active
        });
        setIsFormModalOpen(true);
    };

    // View Details
    const handleViewOfficer = (officer) => {
        setSelectedOfficer(officer);
        setIsViewModalOpen(true);
    };

    // Toggle Active Status (PUT /api/users/:id)
    const handleToggleStatus = async (officerId) => {
        const target = officers.find(o => o.officer_id === officerId || o.id === officerId);
        if (!target) return;
        const newStatus = !target.is_active;

        setOfficers(prev =>
            prev.map(o => (o.officer_id === officerId || o.id === officerId ? { ...o, is_active: newStatus } : o))
        );

        try {
            const res = await updateUserApi(target.id || officerId, { is_active: newStatus ? 1 : 0 });
            if (res && res.success === false) {
                throw new Error(res.error || 'Failed to update status on server');
            }
        } catch (apiErr) {
            setOfficers(prev =>
                prev.map(o => (o.officer_id === officerId || o.id === officerId ? { ...o, is_active: target.is_active } : o))
            );
            Swal.fire('Error', apiErr.response?.data?.error || apiErr.message || 'Status sync failed', 'error');
        }
    };

    // Delete Officer (DELETE /api/users/:id)
    const handleDeleteOfficer = (officer) => {
        Swal.fire({
            title: 'Remove Officer Record?',
            text: `Are you sure you want to remove ${officer.officer_name} (${officer.badge_number}) from the master directory?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Remove Record'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await deleteUserApi(officer.id || officer.officer_id);
                    if (res && res.success === false) {
                        throw new Error(res.error || 'Server rejected officer deletion');
                    }
                    setOfficers(prev => prev.filter(o => o.officer_id !== officer.officer_id && o.id !== officer.id));
                    Swal.fire('Removed!', `Record of ${officer.officer_name} has been archived.`, 'success');
                } catch (apiErr) {
                    Swal.fire('Error', apiErr.response?.data?.error || apiErr.message || 'Failed to remove officer', 'error');
                }
            }
        });
    };

    // Handle Form Submit (POST /api/users or PUT /api/users/:id)
    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (!formData.officer_name.trim()) {
            Swal.fire('Error', 'Please enter Officer Full Name.', 'error');
            return;
        }

        if (!formData.email.trim()) {
            Swal.fire('Error', 'Field "email" is required by server.', 'error');
            return;
        }

        setIsLoading(true);

        // Required by backend: name, email, password, role
        const payload = {
            name: formData.officer_name.trim(),
            email: formData.email.trim().toLowerCase(),
            role: formData.role || (formData.rank?.toLowerCase().includes('admin') ? 'admin' : 'user'),
            badge_number: formData.badge_number.trim(),
            phone: formData.contact_number.trim(),
            police_station: formData.police_station.trim(),
            rank: formData.rank,
            assigned_vehicle_id: formData.assigned_vehicle_id,
            assigned_vehicle_plate: formData.assigned_vehicle_plate,
            shift: formData.shift,
            blood_group: formData.blood_group,
            emergency_contact: formData.emergency_contact,
            is_active: formData.is_active ? 1 : 0
        };

        if (!editingOfficer || formData.password) {
            payload.password = formData.password ? formData.password.trim() : 'Officer@12345';
        }

        try {
            if (editingOfficer) {
                const targetId = editingOfficer.id || editingOfficer.officer_id;
                const res = await updateUserApi(targetId, payload);
                if (res && res.success === false) {
                    throw new Error(res.error || 'Server rejected officer update');
                }

                setOfficers(prev =>
                    prev.map(o => (o.officer_id === editingOfficer.officer_id || o.id === editingOfficer.id ? { ...o, ...formData, ...payload, officer_name: payload.name } : o))
                );
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: `Officer ${payload.name} details have been updated successfully.`,
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsFormModalOpen(false);
            } else {
                const res = await createUserApi(payload);
                if (res && res.success === false) {
                    let errMsg = res.error || 'Validation failed';
                    if (res.details) {
                        const detailMsgs = Object.values(res.details).flat().join('\n');
                        errMsg = `${errMsg}:\n${detailMsgs}`;
                    }
                    throw new Error(errMsg);
                }

                const createdUser = res?.data || {};
                const newOfficer = {
                    id: createdUser.id || Date.now(),
                    officer_id: String(createdUser.id || Date.now()),
                    badge_number: createdUser.badge_number || payload.badge_number,
                    officer_name: createdUser.name || payload.name,
                    rank: payload.rank,
                    role: createdUser.role || payload.role,
                    police_station: createdUser.police_station || payload.police_station,
                    contact_number: payload.phone,
                    email: createdUser.email || payload.email,
                    assigned_vehicle_id: payload.assigned_vehicle_id,
                    assigned_vehicle_plate: payload.assigned_vehicle_plate,
                    shift: payload.shift,
                    blood_group: payload.blood_group,
                    emergency_contact: payload.emergency_contact,
                    joined_date: new Date().toISOString().split('T')[0],
                    is_active: payload.is_active === 1
                };

                setOfficers(prev => [newOfficer, ...prev]);
                Swal.fire({
                    icon: 'success',
                    title: 'Registered!',
                    text: `New Officer ${newOfficer.officer_name} registered successfully.`,
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsFormModalOpen(false);
            }
        } catch (err) {
            let errorText = err.response?.data?.error || err.message || 'Operation failed';
            if (err.response?.data?.details) {
                const validationErrors = Object.values(err.response.data.details).flat().join('<br>• ');
                errorText = `<strong>${errorText}</strong><br><br>• ${validationErrors}`;
            }

            Swal.fire({
                icon: 'error',
                title: 'Validation Failed',
                html: errorText
            });
        } finally {
            setIsLoading(false);
        }
    };

    const totalOfficers = officers.length;
    const activeOfficers = officers.filter(o => o.is_active).length;
    const deployedOnVans = officers.filter(o => o.assigned_vehicle_plate && o.assigned_vehicle_plate !== 'Unassigned').length;
    const stationsCount = new Set(officers.map(o => o.police_station)).size;

    // Actions bundle passed dynamically to column render functions
    const tableActions = {
        onView: handleViewOfficer,
        onEdit: handleOpenEditModal,
        onDelete: handleDeleteOfficer,
        onToggleStatus: handleToggleStatus
    };

    return (
        <div className="container-fluid px-3 py-3">

            {/* Page Title & Breadcrumb (Bootstrap 5 Header) */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-primary d-inline-flex"><IconUsers size={22} /></span>
                        <h1 className="h4 fw-bold text-dark mb-0">Police Officer Master Registry</h1>
                        <span className="badge bg-primary text-white ms-1 fw-bold">{totalOfficers} ACTIVE PERSONNEL</span>
                    </div>

                </div>
            </div>

            {/* 1. SEPARATE KPI STATS OVERVIEW CARD */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <span className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '8px', height: '8px' }}></span>
                        <span className="small fw-bold text-dark text-uppercase letter-spacing">Personnel Deployment Overview</span>
                    </div>
                </div>

                <div className="card-body p-3">
                    <div className="row g-3">
                        {/* Card 1: Total Officers */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-primary shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Total Officers</span>
                                        <div className="kpi-num text-dark mt-1">{totalOfficers}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-primary-subtle text-primary">
                                        <IconUsers size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Registered in state directory</div>
                            </div>
                        </div>

                        {/* Card 2: Active on Duty */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-success shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Active On Duty</span>
                                        <div className="kpi-num text-success mt-1">{activeOfficers}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-success-subtle text-success">
                                        <IconCheckCircle size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Broadcast ready & active</div>
                            </div>
                        </div>

                        {/* Card 3: Deployed on Patrol Vans */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-info shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">On Patrol Vans</span>
                                        <div className="kpi-num text-info-emphasis mt-1">{deployedOnVans}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-info-subtle text-info">
                                        <IconCar size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Assigned to tactical fleet</div>
                            </div>
                        </div>

                        {/* Card 4: Stations Covered */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-warning shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Divisions Covered</span>
                                        <div className="kpi-num text-warning mt-1">{stationsCount}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-warning-subtle text-warning">
                                        <IconShieldAlert size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Jurisdiction police stations</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ACTIONS & TOOLBAR CARD */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {/* Left Side: Summary Context & API Status */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="p-2 bg-primary-subtle text-primary rounded d-flex align-items-center justify-content-center">
                            <IconUsers size={18} />
                        </div>
                        <div>
                            <div className="fw-bold text-dark small">Personnel Operations & Shift Management</div>
                            <div className="d-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>

                            </div>
                        </div>
                    </div>

                    {/* Right Side: Refresh, Excel Export & Register Button */}
                    <div className="d-flex align-items-center gap-2 ms-auto flex-wrap">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center gap-2 px-3 shadow-sm"
                            onClick={fetchOfficersApi}
                            disabled={isLoading}
                            title="Refresh from API"
                            style={{ height: '32px', fontSize: '12px' }}
                        >
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={isLoading ? 'spinner-border spinner-border-sm border-0' : ''}
                            >
                                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                <path d="M16 21h5v-5" />
                            </svg>
                            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
                        </button>
                        <ExportExcelButton
                            data={filteredOfficers}
                            fileName="Police_Officers_Registry"
                            columns={policeExcelColumns}
                            label="Export Officers Excel"
                        />
                        <button
                            className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold px-3"
                            style={{ height: '32px' }}
                            onClick={handleOpenAddModal}
                        >
                            <span>+</span>
                            <span>Register New Police Officer</span>
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
                            placeholder="Search officer, badge, station..."
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
                                {uniqueStations.map(station => (
                                    <option key={station} value={station}>
                                        {station}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Rank Filter */}
                        <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Rank:</span>
                            <select
                                value={rankFilter}
                                onChange={(e) => setRankFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '130px' }}
                            >
                                <option value="ALL">All Ranks ({uniqueRanks.length})</option>
                                {uniqueRanks.map(rank => (
                                    <option key={rank} value={rank}>
                                        {rank}
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
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        {/* Reset / Refresh Filters Button */}
                        <button
                            type="button"
                            className={`btn btn-sm d-inline-flex align-items-center gap-1.5 shadow-none ${hasActiveFilters ? 'btn-primary text-white' : 'btn-outline-secondary'
                                }`}
                            onClick={handleResetFilters}
                            title="Reset all filters"
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

                {/* Data Table Container with Horizontal Scroll */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1200px' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr className="text-uppercase small" style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                                {POLICE_COLUMNS.map((col, idx) => (
                                    <th
                                        key={col.key || idx}
                                        scope="col"
                                        className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                                        style={{
                                            width: col.width || 'auto',
                                            borderRight: idx < POLICE_COLUMNS.length - 1 ? '1px solid #e2e8f0' : 'none'
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
                                    <td colSpan={POLICE_COLUMNS.length} className="py-5 text-center text-muted fw-semibold">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                                        Loading police officer records from API...
                                    </td>
                                </tr>
                            ) : filteredOfficers.length === 0 ? (
                                <tr>
                                    <td colSpan={POLICE_COLUMNS.length} className="py-5 text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                                        No police officers found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedOfficers.map((officer, index) => {
                                    const rowIndex = (currentPage - 1) * pageSize + index + 1;
                                    return (
                                        <tr
                                            key={officer.officer_id || officer.id || index}
                                            style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}
                                        >
                                            {POLICE_COLUMNS.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                                                >
                                                    {col.render
                                                        ? col.render(officer, index, rowIndex, tableActions)
                                                        : (officer[col.key] || '-')}
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
                    totalItems={filteredOfficers.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[20, 50, 100, 500]}
                />
            </div>

            {/* ========================================================== */}
            {/* 4. ADD / EDIT POLICE OFFICER MODAL                         */}
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
                                        <IconUsers size={20} />
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                                                {editingOfficer ? 'Edit Police Officer Record' : 'Register New Police Officer'}
                                            </h5>
                                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                {editingOfficer ? editingOfficer.badge_number : 'NEW OFFICER'}
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

                                    {/* Section 1: Officer Identity & Badge */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                                            <span className="text-primary d-inline-flex"><IconUsers size={16} /></span>
                                            <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                                                1. Officer Identity & Badge Credentials
                                            </span>
                                        </div>

                                        <div className="row g-3">
                                            {/* Officer ID */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between">
                                                    <span>Officer System ID <span className="text-danger">*</span></span>
                                                    {editingOfficer && <span className="text-muted font-mono" style={{ fontSize: '10.5px' }}>[Locked System ID]</span>}
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm font-mono fw-bold"
                                                    required
                                                    value={formData.officer_id}
                                                    onChange={(e) => setFormData({ ...formData, officer_id: e.target.value })}
                                                    disabled={!!editingOfficer}
                                                    style={{
                                                        backgroundColor: editingOfficer ? '#f1f5f9' : '#ffffff',
                                                        borderColor: '#cbd5e1',
                                                        fontSize: '13px'
                                                    }}
                                                />
                                            </div>

                                            {/* Badge Number */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">Badge / Service Number <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm font-mono fw-bold"
                                                    required
                                                    placeholder="e.g. GJ-NP-402"
                                                    value={formData.badge_number}
                                                    onChange={(e) => setFormData({ ...formData, badge_number: e.target.value.toUpperCase() })}
                                                    style={{ borderColor: '#cbd5e1', fontSize: '13px' }}
                                                />
                                            </div>

                                            {/* Full Name */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">Full Name <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm fw-bold"
                                                    required
                                                    placeholder="e.g. Vikram Solanki"
                                                    value={formData.officer_name}
                                                    onChange={(e) => setFormData({ ...formData, officer_name: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1', fontSize: '13px' }}
                                                />
                                            </div>

                                            {/* Designation / Rank */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">Designation / Rank</label>
                                                <select
                                                    className="form-select form-select-sm fw-semibold text-dark"
                                                    value={formData.rank}
                                                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                                                >
                                                    <option value="Police Inspector (PI)">Police Inspector (PI)</option>
                                                    <option value="Police Sub-Inspector (PSI)">Police Sub-Inspector (PSI)</option>
                                                    <option value="Assistant Sub-Inspector (ASI)">Assistant Sub-Inspector (ASI)</option>
                                                    <option value="Head Constable (HC)">Head Constable (HC)</option>
                                                    <option value="Police Constable (PC)">Police Constable (PC)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Deployment & Jurisdiction */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                                            <span className="text-primary d-inline-flex"><IconShieldAlert size={16} /></span>
                                            <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                                                2. Police Station & Patrol Assignment
                                            </span>
                                        </div>

                                        <div className="row g-3">
                                            {/* Police Station */}

                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">
                                                    Jurisdiction Police Station{" "}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm fw-semibold text-dark"
                                                    placeholder="Enter Jurisdiction Police Station"
                                                    value={formData.police_station}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            police_station: e.target.value,
                                                        })
                                                    }
                                                    style={{
                                                        borderColor: '#cbd5e1',
                                                        fontSize: '12.5px',
                                                    }}
                                                    required
                                                />
                                            </div>


                                            {/* Assigned Patrol Van */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">
                                                    Assigned Tactical Patrol Van
                                                </label>
                                                <select
                                                    className="form-select form-select-sm fw-semibold text-dark font-mono"
                                                    value={formData.assigned_vehicle_plate}
                                                    onChange={(e) => {
                                                        const selectedPlate = e.target.value;
                                                        const vehicleOptions = availableVehicles.length > 0 ? availableVehicles : POLICE_VEHICLES;
                                                        const foundVehicle = vehicleOptions.find(
                                                            v => v.registration_number === selectedPlate
                                                        );
                                                        setFormData({
                                                            ...formData,
                                                            assigned_vehicle_plate: selectedPlate,
                                                            assigned_vehicle_id: foundVehicle ? foundVehicle.vehicle_id : 'None'
                                                        });
                                                    }}
                                                    style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                                                >
                                                    <option value="Unassigned">Unassigned (HQ / Station Duty)</option>
                                                    {(availableVehicles.length > 0 ? availableVehicles : POLICE_VEHICLES).map((v, i) => (
                                                        <option key={v.vehicle_id || v.id || i} value={v.registration_number}>
                                                            {v.vehicle_id} - {v.registration_number} {v.vehicle_model ? `(${v.vehicle_model})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Shift Timing */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">Duty Shift Timing</label>
                                                <select
                                                    className="form-select form-select-sm fw-semibold text-dark"
                                                    value={formData.shift}
                                                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                                                >
                                                    <option value="Day Shift (08:00 - 18:00)">Day Shift (08:00 - 18:00)</option>
                                                    <option value="Night Shift (18:00 - 04:00)">Night Shift (18:00 - 04:00)</option>
                                                    <option value="Emergency Response (24x7)">Emergency Response (24x7)</option>
                                                </select>
                                            </div>

                                            {/* Blood Group */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">Blood Group</label>
                                                <select
                                                    className="form-select form-select-sm fw-semibold text-dark"
                                                    value={formData.blood_group}
                                                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                                                >
                                                    <option value="O+">O Positive (O+)</option>
                                                    <option value="O-">O Negative (O-)</option>
                                                    <option value="A+">A Positive (A+)</option>
                                                    <option value="A-">A Negative (A-)</option>
                                                    <option value="B+">B Positive (B+)</option>
                                                    <option value="B-">B Negative (B-)</option>
                                                    <option value="AB+">AB Positive (AB+)</option>
                                                    <option value="AB-">AB Negative (AB-)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Contact Details */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center gap-2 pb-2 mb-3 border-bottom">
                                            <span className="text-primary d-inline-flex"><IconActivity size={16} /></span>
                                            <span className="fw-bold small text-uppercase text-secondary" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                                                3. Contact & Emergency Details
                                            </span>
                                        </div>

                                        <div className="row g-3">
                                            {/* Mobile Contact */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">Official Mobile Contact <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm font-mono"
                                                    required
                                                    placeholder="e.g. +91 98250 11201"
                                                    value={formData.contact_number}
                                                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1' }}
                                                />
                                            </div>

                                            {/* Email Address */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">Government Email <span className="text-danger">*</span></label>
                                                <input
                                                    type="email"
                                                    className="form-control form-control-sm"
                                                    required
                                                    placeholder="e.g. officer@police.gov.in"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1' }}
                                                />
                                            </div>

                                            {/* Account Password */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">
                                                    Login Password {!editingOfficer && <span className="text-danger">*</span>}
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control form-control-sm font-mono"
                                                    required={!editingOfficer}
                                                    placeholder={editingOfficer ? "Leave blank to keep current" : "e.g. Officer@12345"}
                                                    value={formData.password || ''}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1' }}
                                                />
                                            </div>

                                            {/* System Role */}
                                            <div className="col-12 col-md-6">
                                                <label className="form-label small fw-bold text-dark mb-1">System Role <span className="text-danger">*</span></label>
                                                <select
                                                    className="form-select form-select-sm fw-semibold text-dark"
                                                    value={formData.role || 'user'}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1', fontSize: '12.5px' }}
                                                    required
                                                >
                                                    <option value="user">Officer (Standard User)</option>
                                                    <option value="admin">Administrator (Full Access)</option>
                                                </select>
                                            </div>

                                            {/* Emergency Contact */}
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-dark mb-1">Emergency Next-of-Kin Contact</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm font-mono"
                                                    placeholder="e.g. +91 98250 99881 (Family / Kin)"
                                                    value={formData.emergency_contact}
                                                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                                    style={{ borderColor: '#cbd5e1' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Operational Duty Status */}
                                    <div className="p-3 rounded-3 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="form-check form-switch m-0">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="bsOfficerActiveCheck"
                                                        checked={formData.is_active}
                                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                        style={{ width: '2.5rem', height: '1.3rem', cursor: 'pointer' }}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="fw-bold small text-dark">Officer Active Service Duty Status</div>
                                                    <div className="text-muted small" style={{ fontSize: '11.5px' }}>
                                                        When active, officer is available for tactical patrol dispatch and C4i command alerts.
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
                                                        ● INACTIVE / ON LEAVE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Modal Footer */}
                                <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                                    <span className="text-muted small" style={{ fontSize: '11.5px' }}>
                                        <span className="text-danger">*</span> Required fields for police registry
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
                                            <span>{editingOfficer ? 'Update Record' : 'Save Officer Record'}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================== */}
            {/* 5. VIEW POLICE OFFICER DETAILS MODAL                       */}
            {/* ========================================================== */}
            {isViewModalOpen && selectedOfficer && (
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
                                        <IconUsers size={20} />
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                                                Police Officer Service & Deployment Profile
                                            </h5>
                                            <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                {selectedOfficer.badge_number}
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
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white fw-bold shadow-sm"
                                                style={{ width: '52px', height: '52px', fontSize: '20px' }}
                                            >
                                                {selectedOfficer.officer_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-white fs-5 mb-0.5">{selectedOfficer.officer_name}</div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="badge bg-warning text-dark fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                        🎖️ {selectedOfficer.badge_number}
                                                    </span>
                                                    <span className="badge bg-light text-dark fw-semibold" style={{ fontSize: '11px' }}>
                                                        {selectedOfficer.rank}
                                                    </span>
                                                </div>
                                                <div className="text-slate-400 small mt-1" style={{ color: '#94a3b8', fontSize: '12px' }}>
                                                    📍 {selectedOfficer.police_station}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            {selectedOfficer.is_active ? (
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
                                                    ACTIVE ON DUTY
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
                                                    OFFLINE / ON LEAVE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Specs 2-Column Grid */}
                                <div className="row g-3 mb-3">
                                    {/* Contact Info Card */}
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                                                <IconActivity size={16} />
                                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                    Official Communication
                                                </span>
                                            </div>
                                            <div className="fw-bold text-dark font-mono fs-6">{selectedOfficer.contact_number}</div>
                                            <div className="text-muted small text-truncate mt-1">{selectedOfficer.email}</div>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                <span className="badge bg-white text-dark border font-mono small">
                                                    Blood Group: <strong>{selectedOfficer.blood_group}</strong>
                                                </span>
                                                <span className="badge bg-danger-subtle text-danger small">
                                                    Emergency: {selectedOfficer.emergency_contact || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Patrol Assignment Card */}
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                                                <IconCar size={16} />
                                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                    Assigned Tactical Patrol Fleet
                                                </span>
                                            </div>
                                            {selectedOfficer.assigned_vehicle_plate && selectedOfficer.assigned_vehicle_plate !== 'Unassigned' ? (
                                                <div>
                                                    <div className="ind-number-plate d-inline-flex align-middle shadow-sm mb-2" style={{ height: '32px', padding: '1px 8px' }}>
                                                        <span className="ind-flag" style={{ fontSize: '8px' }}>IND</span>
                                                        <span className="fw-bold" style={{ fontSize: '12px' }}>{selectedOfficer.assigned_vehicle_plate}</span>
                                                    </div>
                                                    <div className="text-muted small">
                                                        Vehicle ID: <strong className="font-mono text-dark">{selectedOfficer.assigned_vehicle_id}</strong>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-muted small py-2">
                                                    No tactical patrol vehicle assigned. Station jurisdiction duty.
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                                                    🕒 {selectedOfficer.shift}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Service Record & Verification */}
                                {/* <div className="border rounded-3 p-3" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
                                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="text-primary d-inline-flex"><IconShieldAlert size={16} /></span>
                                            <span className="small fw-bold text-dark text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '11.5px' }}>
                                                Service History & Verification Credentials
                                            </span>
                                        </div>
                                        <span className="badge bg-success-subtle text-success small fw-bold" style={{ fontSize: '10px' }}>
                                            ✓ VERIFIED RECORD
                                        </span>
                                    </div>

                                    <div className="row g-2">
                                        <div className="col-6 col-md-4">
                                            <div className="p-2.5 rounded-2 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                                <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Date of Enlistment</div>
                                                <div className="fw-bold font-mono text-dark mt-1" style={{ fontSize: '13px' }}>
                                                    {selectedOfficer.joined_date || '2018-05-12'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-4">
                                            <div className="p-2.5 rounded-2 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                                <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>Command Region</div>
                                                <div className="fw-bold text-dark mt-1" style={{ fontSize: '13px' }}>
                                                    Ahmedabad Zone 1
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <div className="p-2.5 rounded-2 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                                <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>AI Access Clearance</div>
                                                <div className="fw-bold text-success mt-1" style={{ fontSize: '13px' }}>
                                                    Level 3 (ANPR + CCTV)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}

                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm fw-bold d-inline-flex align-items-center gap-1.5 shadow-none"
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        handleOpenEditModal(selectedOfficer);
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                    </svg>
                                    <span>Edit Officer Record</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm px-4 fw-semibold shadow-none"
                                    onClick={() => setIsViewModalOpen(false)}
                                >
                                    Close Profile
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
