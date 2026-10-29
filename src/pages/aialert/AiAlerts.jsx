import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
    IconCrosshair,
    IconSearch,
    IconShieldAlert,
    IconAlertTriangle,
    IconCheckCircle,
    IconCar,
    IconVideo,
    IconClock,
    IconRefreshCw
} from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';
import { getAiAlertsApi, getAiAlertByIdApi, updateAiAlertApi, getDashboardStatsApi, getCurrentUser } from '../../services/api';

/**
 * =========================================================================
 * AI ALERTS DYNAMIC EXCEL COLUMNS CONFIGURATION
 * =========================================================================
 */
export const AI_ALERT_COLUMNS = [
    { key: 'id', label: 'Alert ID' },
    { key: 'alerttype', label: 'Detection Type' },
    { key: 'status', label: 'Status' },
    { key: 'vehicle_id', label: 'Vehicle ID' },
    { key: 'scanned_vehicle_numberplate', label: 'Scanned Plate' },
    { key: 'camera_id', label: 'Camera Channel' },
    { key: 'location', label: 'Location' },
    { key: 'ATMCode', label: 'Site / ATM Code' },
    { key: 'lat', label: 'Latitude' },
    { key: 'lon', label: 'Longitude' },
    { key: 'createtime', label: 'Created Time' },
    { key: 'receivedtime', label: 'Received Time' },
    { key: 'comment', label: 'Comments / Remarks' },
    { key: 'closedBy', label: 'Closed By' },
    { key: 'closedtime', label: 'Closed Time' },
    { key: 'sendip', label: 'Source Node IP' }
];

export default function AiAlerts() {
    // Alert Data State
    const [alerts, setAlerts] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        total_pages: 1,
        has_next: false,
        has_prev: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Modal State for Investigation & Closing Alert
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [modalDetails, setModalDetails] = useState(null);
    const [isLoadingModalDetails, setIsLoadingModalDetails] = useState(false);

    // Modal Form Inputs
    const [editStatus, setEditStatus] = useState('O');
    const [editComment, setEditComment] = useState('');
    const [editClosedBy, setEditClosedBy] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // System-wide Overall KPI Metrics (Database totals across all pages)
    const [overallMetrics, setOverallMetrics] = useState({
        total: 0,
        open: 0,
        closed: 0,
        vehicles: 1,
        isLoading: true
    });

    // Dynamic List of Detection Types populated from backend
    const [availableTypes, setAvailableTypes] = useState([]);

    // Concurrency and mount guards
    const latestRequestId = useRef(0);
    const isInitialSearchMount = useRef(true);

    // Logged in user info
    const currentUser = getCurrentUser();
    const defaultOfficerName =
        currentUser?.name || currentUser?.officer_name || '-';

    // -------------------------------------------------------------------------
    // FAST ASYNC OVERALL SYSTEM METRICS & DETECTION TYPES
    // -------------------------------------------------------------------------
    const fetchOverallMetrics = async () => {
        try {
            // High-speed parallel query: limit=1 payload is only ~0.6KB (executes in <90ms)
            const [openRes, closedRes] = await Promise.all([
                getAiAlertsApi({ status: 'O', limit: 1 }),
                getAiAlertsApi({ status: 'C', limit: 1 })
            ]);

            const open = openRes?.pagination?.total ?? 0;
            const closed = closedRes?.pagination?.total ?? 0;
            const total = open + closed;

            setOverallMetrics((prev) => ({
                ...prev,
                total: total || prev.total,
                open,
                closed,
                isLoading: false
            }));

            // Lazy background fetch for unique detection types (non-blocking)
            getAiAlertsApi({ limit: 100 })
                .then((res) => {
                    if (res?.data && Array.isArray(res.data)) {
                        const extractedTypes = Array.from(
                            new Set(res.data.map((item) => item.alerttype).filter(Boolean))
                        ).sort((a, b) => a.localeCompare(b));
                        setAvailableTypes(extractedTypes);
                    }
                })
                .catch(() => {});
        } catch (err) {
            console.warn('Could not fetch overall system metrics:', err);
        }
    };

    // Initial load of overall counts and types
    useEffect(() => {
        fetchOverallMetrics();
    }, []);

    // -------------------------------------------------------------------------
    // FETCH AI ALERTS FROM BACKEND API (OPTIMIZED & SEQUENCED)
    // -------------------------------------------------------------------------
    const fetchAlerts = async (page = currentPage, limit = pageSize) => {
        const reqId = ++latestRequestId.current;
        setIsLoading(true);
        setApiError(null);

        try {
            const response = await getAiAlertsApi({
                page,
                limit,
                status: statusFilter,
                alerttype: typeFilter,
                search: searchQuery
            });

            // Prevent stale race condition response from overwriting newer query
            if (reqId !== latestRequestId.current) return;

            if (response && response.success) {
                const dataList = response.data || [];
                setAlerts(dataList);

                if (response.pagination) {
                    setPagination(response.pagination);
                    // Fast sync overall total if not yet populated
                    setOverallMetrics((prev) => ({
                        ...prev,
                        total: prev.total || response.pagination.total
                    }));
                }

                // Immediately extract available types from loaded data
                if (dataList.length > 0) {
                    setAvailableTypes((prev) => {
                        const combined = new Set([...prev, ...dataList.map((a) => a.alerttype).filter(Boolean)]);
                        return Array.from(combined).sort((a, b) => a.localeCompare(b));
                    });
                }
            } else {
                setAlerts(response?.data || []);
            }
        } catch (err) {
            if (reqId !== latestRequestId.current) return;
            console.error('Failed to fetch AI alerts:', err);
            setApiError(err.message || 'Unable to retrieve AI alerts from command server.');
        } finally {
            if (reqId === latestRequestId.current) {
                setIsLoading(false);
            }
        }
    };

    // Trigger fetch on page/status/type changes
    useEffect(() => {
        fetchAlerts(currentPage, pageSize);
    }, [currentPage, pageSize, statusFilter, typeFilter]);

    // Handle Search Input with debounce (skips redundant initial mount run)
    useEffect(() => {
        if (isInitialSearchMount.current) {
            isInitialSearchMount.current = false;
            return;
        }

        const handler = setTimeout(() => {
            setCurrentPage(1);
            fetchAlerts(1, pageSize);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // -------------------------------------------------------------------------
    // OPEN INVESTIGATION & RESOLUTION MODAL
    // -------------------------------------------------------------------------
    const handleOpenModal = async (alertItem) => {
        setSelectedAlert(alertItem);
        setModalDetails(alertItem);

        // Initialize form fields
        setEditStatus(alertItem.status || 'O');
        const existingComment = (alertItem.comment || '').replace(/^Close Remark:\s*/i, '');
        setEditComment(existingComment);
        setEditClosedBy(alertItem.closedBy || defaultOfficerName);

        setIsModalOpen(true);
        setIsLoadingModalDetails(true);

        // Fetch full alert record including File_loc base64 image
        try {
            const detailRes = await getAiAlertByIdApi(alertItem.id);
            if (detailRes && detailRes.success && detailRes.data) {
                setModalDetails(detailRes.data);
            }
        } catch (err) {
            console.warn('Could not load detailed snapshot image:', err);
        } finally {
            setIsLoadingModalDetails(false);
        }
    };

    // -------------------------------------------------------------------------
    // SAVE / CLOSE ALERT HANDLER
    // -------------------------------------------------------------------------
    const handleSaveAlert = async (e) => {
        if (e) e.preventDefault();
        if (!selectedAlert) return;

        setIsSaving(true);
        try {
            const payload = {
                status: editStatus,
                comment: editComment.trim() || 'Reviewed by Command Center',
                closedBy: editClosedBy.trim() || defaultOfficerName
            };

            const res = await updateAiAlertApi(selectedAlert.id, payload);

            if (res && res.success) {
                // Update local alerts list
                setAlerts((prev) =>
                    prev.map((item) =>
                        item.id === selectedAlert.id
                            ? {
                                ...item,
                                status: payload.status,
                                comment: res.data?.comment || payload.comment,
                                closedBy: payload.closedBy,
                                closedtime: res.data?.closedtime || new Date().toISOString().replace('T', ' ').slice(0, 19)
                            }
                            : item
                    )
                );

                // Update modal details
                if (modalDetails) {
                    setModalDetails((prev) => ({
                        ...prev,
                        status: payload.status,
                        comment: res.data?.comment || payload.comment,
                        closedBy: payload.closedBy,
                        closedtime: res.data?.closedtime || new Date().toISOString().replace('T', ' ').slice(0, 19)
                    }));
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Alert Status Updated',
                    text: `Alert #${selectedAlert.id} marked as ${payload.status === 'C' ? 'Closed' : 'Open'}.`,
                    timer: 2000,
                    showConfirmButton: false
                });

                setIsModalOpen(false);
                fetchOverallMetrics();
            } else {
                throw new Error(res?.message || 'Failed to update alert');
            }
        } catch (err) {
            console.error('Error updating AI alert:', err);
            Swal.fire({
                icon: 'error',
                title: 'Save Failed',
                text: err.message || 'Could not update alert on server.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Overall System-Wide Database Metrics (Entire Database Counts)
    const totalCount = overallMetrics.total || pagination.total || alerts.length;
    const openCount = overallMetrics.open;
    const closedCount = overallMetrics.closed;
    const vehicleCount = overallMetrics.vehicles;

    return (
        <div className="container-fluid px-3 py-3">
            {/* 1. Header Title & Live Status */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-danger d-inline-flex">
                            <IconCrosshair size={22} />
                        </span>
                        <h1 className="h4 fw-bold text-dark mb-0">AI Threat & Telemetry Alerts Ingestion</h1>
                        <span className="badge bg-danger text-white ms-1 fw-bold font-mono">
                            {totalCount} TOTAL DETECTIONS
                        </span>
                    </div>
                    <p className="text-muted small mb-0 mt-0.5">
                        Real-time automated edge AI classification from deployed mobile patrol vans and CCTV sensors
                    </p>
                </div>

                {/* Refresh & Controls */}
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            fetchAlerts(currentPage, pageSize);
                            fetchOverallMetrics();
                        }}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 shadow-xs"
                        disabled={isLoading}
                        title="Reload latest alerts from edge nodes"
                    >
                        <span className={isLoading ? 'spinner-border spinner-border-sm' : ''}>
                            {!isLoading && <IconRefreshCw size={14} />}
                        </span>
                        <span>Refresh Feed</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI Metrics Summary Cards (Overall Database Metrics) */}
            <div className="row g-3 mb-3">
                {/* Total Ingested Alerts */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card h-100 border-0 border-start border-4 border-primary shadow-sm p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">Total Ingested Alerts</span>
                                <div className="h3 fw-bold text-dark mt-1 mb-0">
                                    {overallMetrics.isLoading && totalCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        totalCount
                                    )}
                                </div>
                            </div>
                            <div
                                className="rounded-3 p-2 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px' }}
                            >
                                <IconCrosshair size={20} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted small">Citywide edge sensor alerts</div>
                    </div>
                </div>

                {/* Active Open Incidents */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card h-100 border-0 border-start border-4 border-danger shadow-sm p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">Active Open Incidents</span>
                                <div className="h3 fw-bold text-danger mt-1 mb-0">
                                    {overallMetrics.isLoading && openCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        openCount
                                    )}
                                </div>
                            </div>
                            <div
                                className="rounded-3 p-2 bg-danger-subtle text-danger d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px' }}
                            >
                                <IconAlertTriangle size={20} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted small">Requires surveillance review</div>
                    </div>
                </div>

                {/* Closed & Neutralized */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card h-100 border-0 border-start border-4 border-success shadow-sm p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">Closed & Neutralized</span>
                                <div className="h3 fw-bold text-success mt-1 mb-0">
                                    {overallMetrics.isLoading && closedCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        closedCount
                                    )}
                                </div>
                            </div>
                            <div
                                className="rounded-3 p-2 bg-success-subtle text-success d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px' }}
                            >
                                <IconCheckCircle size={20} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted small">Investigated & cleared</div>
                    </div>
                </div>

                {/* Patrol Nodes Reporting */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="card h-100 border-0 border-start border-4 border-info shadow-sm p-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <span className="text-muted small fw-bold text-uppercase">Patrol Vans Reporting</span>
                                <div className="h3 fw-bold text-info mt-1 mb-0">
                                    {overallMetrics.isLoading && vehicleCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        vehicleCount || 1
                                    )}
                                </div>
                            </div>
                            <div
                                className="rounded-3 p-2 bg-info-subtle text-info d-flex align-items-center justify-content-center"
                                style={{ width: '38px', height: '38px' }}
                            >
                                <IconCar size={20} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted small">Active mobile camera transmitters</div>
                    </div>
                </div>
            </div>

            {/* 3. Toolbar & Filter Section */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {/* Search Bar */}
                    <div className="input-group input-group-sm" style={{ maxWidth: '340px' }}>
                        <span className="input-group-text bg-white border-end-0 text-muted">
                            <IconSearch size={14} />
                        </span>
                        <input
                            type="text"
                            className="form-control form-control-sm border-start-0"
                            placeholder="Search alert type, vehicle ID, location, plate..."
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

                    {/* Filter Dropdowns */}
                    <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
                        {/* Status Filter */}
                        <div className="d-flex align-items-center gap-1.5">
                            <span className="small text-muted fw-semibold">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '130px' }}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="O">Open</option>
                                <option value="C">Closed</option>
                            </select>
                        </div>

                        {/* Dynamic Alert Type Filter */}
                        <div className="d-flex align-items-center gap-1.5">
                            <span className="small text-muted fw-semibold">Detection Type:</span>
                            <select
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '150px' }}
                            >
                                <option value="ALL">
                                    All Detections ({availableTypes.length > 0 ? `${availableTypes.length} types` : 'All'})
                                </option>
                                {availableTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Excel Export Button */}
                        <ExportExcelButton
                            data={alerts}
                            fileName="Patrol360_AI_Alerts_Report"
                            columns={AI_ALERT_COLUMNS}
                            label="Export Excel"
                        />
                    </div>
                </div>
            </div>

            {/* 4. Main AI Alerts Data Table */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1150px' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr
                                className="text-uppercase small"
                                style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}
                            >
                                <th className="py-3 px-3 text-center" style={{ width: '60px' }}>
                                    #
                                </th>
                                <th className="py-3 px-3">Alert ID</th>
                                <th className="py-3 px-3">Detection Type</th>
                                <th className="py-3 px-3">Status</th>
                                <th className="py-3 px-3">Patrol Vehicle</th>
                                <th className="py-3 px-3">Scanned Plate</th>
                                <th className="py-3 px-3">Location & GPS</th>
                                <th className="py-3 px-3">Event Timestamp</th>
                                <th className="py-3 px-3">Remarks & Review</th>
                                <th className="py-3 px-3 text-center" style={{ width: '110px' }}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="py-5 text-center text-muted fw-semibold">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                                        Fetching real-time AI alert stream ....
                                    </td>
                                </tr>
                            ) : apiError ? (
                                <tr>
                                    <td colSpan={10} className="py-5 text-center text-danger fw-semibold">
                                        <IconAlertTriangle size={20} className="me-2" />
                                        {apiError}
                                    </td>
                                </tr>
                            ) : alerts.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-5 text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                                        No AI alerts found matching the current search & filter parameters.
                                    </td>
                                </tr>
                            ) : (
                                alerts.map((item, index) => {
                                    const rowIndex = (pagination.page - 1) * pagination.limit + index + 1;
                                    const isClosed = item.status === 'C';

                                    // Dynamic Badge color based on alerttype
                                    let typeBadgeClass = 'bg-primary-subtle text-primary border border-primary-subtle';
                                    if (item.alerttype?.toLowerCase().includes('motorcycle')) {
                                        typeBadgeClass = 'bg-info-subtle text-info-emphasis border border-info-subtle';
                                    } else if (item.alerttype?.toLowerCase().includes('unknown')) {
                                        typeBadgeClass = 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
                                    } else if (item.alerttype?.toLowerCase().includes('chair')) {
                                        typeBadgeClass = 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
                                    }

                                    return (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                backgroundColor: isClosed ? '#fafafa' : '#ffffff'
                                            }}
                                        >
                                            {/* Row Index */}
                                            <td className="py-3 px-3 text-center text-muted fw-semibold" style={{ fontSize: '12px' }}>
                                                {rowIndex}
                                            </td>

                                            {/* Alert ID */}
                                            <td className="py-3 px-3">
                                                <span
                                                    className="badge font-mono fw-bold px-2 py-1 shadow-xs"
                                                    style={{
                                                        backgroundColor: '#0f172a',
                                                        color: '#ffffff',
                                                        fontSize: '11px',
                                                        letterSpacing: '0.04em'
                                                    }}
                                                >
                                                    #{item.id}
                                                </span>
                                            </td>

                                            {/* Alert Type */}
                                            <td className="py-3 px-3">
                                                <div className="d-flex align-items-center gap-1.5">
                                                    <span
                                                        className={`badge px-2 py-1 font-mono fw-bold text-uppercase ${typeBadgeClass}`}
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        ● {item.alerttype || 'Generic Alert'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3 px-3">
                                                {isClosed ? (
                                                    <span
                                                        className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-1 fw-bold d-inline-flex align-items-center gap-1"
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        <IconCheckCircle size={12} />
                                                        CLOSED
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 fw-bold d-inline-flex align-items-center gap-1"
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        <span
                                                            className="spinner-grow spinner-grow-sm"
                                                            role="status"
                                                            style={{ width: '6px', height: '6px' }}
                                                        />
                                                        OPEN
                                                    </span>
                                                )}
                                            </td>

                                            {/* Patrol Vehicle & Cam */}
                                            <td className="py-3 px-3">
                                                <div className="fw-bold text-dark font-mono" style={{ fontSize: '12px' }}>
                                                    {item.vehicle_registration || item.vehicle_id || 'PATROL_VAN'}
                                                </div>
                                                <div className="text-muted small font-mono mt-0.5" style={{ fontSize: '10.5px' }}>
                                                    <IconVideo size={11} className="me-1" />
                                                    CAM-{item.camera_id || '1'} • IP: {item.sendip || '127.0.0.1'}
                                                </div>
                                            </td>

                                            {/* Scanned Number Plate */}
                                            <td className="py-3 px-3">
                                                {item.scanned_vehicle_numberplate ? (
                                                    <div
                                                        className="ind-number-plate d-inline-flex align-middle shadow-xs"
                                                        style={{ height: '24px', padding: '1px 6px' }}
                                                        title="Automated ANPR scan from video feed"
                                                    >
                                                        <span className="ind-flag" style={{ fontSize: '7.5px' }}>
                                                            IND
                                                        </span>
                                                        <span style={{ fontSize: '11px', fontWeight: 700 }}>
                                                            {item.scanned_vehicle_numberplate}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small font-mono" style={{ fontSize: '11px' }}>
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Location & GPS */}
                                            <td className="py-3 px-3">
                                                <div
                                                    className="fw-semibold text-dark text-truncate"
                                                    style={{ fontSize: '12px', maxWidth: '180px' }}
                                                    title={item.location}
                                                >
                                                    📍 {item.location || 'Patrol Jurisdiction'}
                                                </div>
                                                {item.lat && item.lon && (
                                                    <a
                                                        href={`https://maps.google.com/?q=${item.lat},${item.lon}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-decoration-none font-mono text-muted small mt-0.5 d-inline-block"
                                                        style={{ fontSize: '10.5px' }}
                                                        title="View GPS coordinates on Google Maps"
                                                    >
                                                        {item.lat}, {item.lon} ↗
                                                    </a>
                                                )}
                                            </td>

                                            {/* Timestamps */}
                                            <td className="py-3 px-3">
                                                <div className="font-mono text-secondary fw-semibold" style={{ fontSize: '11.5px' }}>
                                                    🕒 {item.createtime}
                                                </div>
                                                {item.receivedtime && (
                                                    <div className="text-muted small font-mono mt-0.5" style={{ fontSize: '10px' }}>
                                                        Rec: {item.receivedtime}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Remarks & Officer */}
                                            <td className="py-3 px-3">
                                                {item.comment ? (
                                                    <div>
                                                        <div
                                                            className="text-dark small fw-medium text-truncate"
                                                            style={{ maxWidth: '200px', fontSize: '11.5px' }}
                                                            title={item.comment}
                                                        >
                                                            {item.comment}
                                                        </div>
                                                        {item.closedBy && (
                                                            <div className="text-muted small font-mono mt-0.5" style={{ fontSize: '10px' }}>
                                                                By: {item.closedBy}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small font-italic" style={{ fontSize: '11px' }}>
                                                        Pending review
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary px-2.5 py-1 shadow-xs d-inline-flex align-items-center gap-1"
                                                    style={{ fontSize: '11.5px', fontWeight: 600, borderRadius: '6px' }}
                                                    onClick={() => handleOpenModal(item)}
                                                    title="Inspect AI alert, review snapshot & update status"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>

                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Centralized Universal Pagination Component */}
                <Pagination
                    currentPage={pagination.page}
                    totalItems={pagination.total}
                    pageSize={pagination.limit}
                    onPageChange={(newPage) => {
                        setCurrentPage(newPage);
                        fetchAlerts(newPage, pageSize);
                    }}
                    onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setCurrentPage(1);
                        fetchAlerts(1, newSize);
                    }}
                    pageSizeOptions={[10, 20, 50, 100]}
                />
            </div>

            {/* ===================================================================== */}
            {/* 5. AI ALERT INSPECTION & RESOLUTION MODAL                              */}
            {/* ===================================================================== */}
            {isModalOpen && selectedAlert && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                            {/* Modal Header */}
                            <div className="modal-header py-3 px-4 border-bottom bg-light">
                                <div className="d-flex align-items-center gap-2.5">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white"
                                        style={{
                                            width: '38px',
                                            height: '38px',
                                            backgroundColor: selectedAlert.status === 'C' ? '#10b981' : '#dc3545'
                                        }}
                                    >
                                        <IconCrosshair size={20} />
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                                                AI Alert Resolution & Snapshot Inspection
                                            </h5>
                                            <span className="badge bg-dark text-white fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                #{selectedAlert.id}
                                            </span>
                                        </div>
                                        <span className="text-muted small" style={{ fontSize: '11.5px' }}>
                                            Detection Type: <strong>{selectedAlert.alerttype}</strong> • Vehicle:{' '}
                                            <strong>{selectedAlert.vehicle_id}</strong>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close shadow-none"
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label="Close"
                                />
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
                                {/* Visual Snapshot & Telemetry Banner */}
                                <div className="row g-3 mb-4">
                                    {/* Left Column: Image Snapshot */}
                                    <div className="col-12 col-md-7">
                                        <div
                                            className="rounded-3 p-2 position-relative overflow-hidden shadow-sm d-flex flex-column justify-content-center align-items-center"
                                            style={{
                                                backgroundColor: '#020617',
                                                border: '1px solid #1e293b',
                                                minHeight: '230px'
                                            }}
                                        >
                                            {isLoadingModalDetails ? (
                                                <div className="text-center py-5 text-white">
                                                    <div className="spinner-border text-danger spinner-border-sm mb-2" role="status" />
                                                    <div className="small font-mono text-muted">Retrieving raw sensor capture...</div>
                                                </div>
                                            ) : modalDetails?.File_loc ? (
                                                <div className="position-relative w-100 text-center">
                                                    <img
                                                        src={
                                                            modalDetails.File_loc.startsWith('data:')
                                                                ? modalDetails.File_loc
                                                                : `data:image/jpeg;base64,${modalDetails.File_loc}`
                                                        }
                                                        alt={`Alert ${selectedAlert.id} Snapshot`}
                                                        className="img-fluid rounded shadow"
                                                        style={{ maxHeight: '250px', objectFit: 'contain', width: '100%' }}
                                                    />
                                                    {/* Live Target Reticle overlay */}
                                                    <div
                                                        className="position-absolute top-0 start-0 m-2 badge bg-danger text-white font-mono px-2 py-1 shadow"
                                                        style={{ fontSize: '10px' }}
                                                    >
                                                        AI TARGET: {selectedAlert.alerttype}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-white">
                                                    <IconCrosshair size={36} className="text-danger mb-2" />
                                                    <div className="small fw-bold font-mono text-white">EDGE SENSOR TELEMETRY LOCK</div>
                                                    <div className="text-muted small font-mono mt-1">
                                                        CAM-{selectedAlert.camera_id} • IP: {selectedAlert.sendip || '223.182.122.63'}
                                                    </div>
                                                    {selectedAlert.scanned_vehicle_numberplate && (
                                                        <div className="mt-2">
                                                            <span className="badge bg-warning text-dark font-mono fw-bold">
                                                                PLATE: {selectedAlert.scanned_vehicle_numberplate}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Viewport Bottom Overlay */}
                                            <div
                                                className="w-100 d-flex justify-content-between align-items-center text-muted font-mono pt-2 mt-2 border-top border-secondary border-opacity-25"
                                                style={{ fontSize: '10.5px' }}
                                            >
                                                <span>Van: {selectedAlert.vehicle_id}</span>
                                                <span className="text-emerald-400">Node GPS: {selectedAlert.lat}, {selectedAlert.lon}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Key Details */}
                                    <div className="col-12 col-md-5">
                                        <div className="p-3 rounded-3 border bg-light h-100 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-2">
                                                    <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10.5px' }}>
                                                        Incident Details
                                                    </span>
                                                    <span
                                                        className={`badge ${selectedAlert.status === 'C' ? 'bg-success' : 'bg-danger'} font-mono`}
                                                    >
                                                        {selectedAlert.status === 'C' ? 'RESOLVED' : 'ACTIVE'}
                                                    </span>
                                                </div>

                                                <div className="d-flex flex-column gap-1.5" style={{ fontSize: '11.5px' }}>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Detection:</span>
                                                        <strong className="text-dark text-uppercase">{selectedAlert.alerttype}</strong>
                                                    </div>

                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Vehicle ID:</span>
                                                        <span className="font-mono text-dark fw-bold">{selectedAlert.vehicle_id}</span>
                                                    </div>

                                                    {selectedAlert.scanned_vehicle_numberplate && (
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted">Scanned Plate:</span>
                                                            <span className="badge bg-warning text-dark font-mono">
                                                                {selectedAlert.scanned_vehicle_numberplate}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Camera Ch:</span>
                                                        <span className="font-mono text-dark">Channel {selectedAlert.camera_id}</span>
                                                    </div>

                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Location:</span>
                                                        <span className="text-dark fw-semibold text-truncate" style={{ maxWidth: '140px' }}>
                                                            {selectedAlert.location}
                                                        </span>
                                                    </div>

                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-muted">Created:</span>
                                                        <span className="font-mono text-dark">{selectedAlert.createtime}</span>
                                                    </div>

                                                    {selectedAlert.closedtime && (
                                                        <div className="d-flex justify-content-between">
                                                            <span className="text-muted">Closed At:</span>
                                                            <span className="font-mono text-success">{selectedAlert.closedtime}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Google Maps Shortcut */}
                                            {/* {selectedAlert.lat && selectedAlert.lon && (
                                                <div className="mt-3 pt-2 border-top">
                                                    <a
                                                        href={`https://maps.google.com/?q=${selectedAlert.lat},${selectedAlert.lon}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1.5"
                                                        style={{ fontSize: '11px', fontWeight: 600 }}
                                                    >
                                                        <span>Open GPS on Satellite Map</span>
                                                        <span>↗</span>
                                                    </a>
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Form: Alert ID, Comments, Status & Closed Fields */}
                                <form onSubmit={handleSaveAlert}>
                                    <div className="card border p-3 bg-white shadow-2xs rounded-3">
                                        <h6 className="fw-bold text-dark mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                                            <IconShieldAlert size={16} className="text-primary" />
                                            <span>Investigate & Update Alert Status</span>
                                        </h6>

                                        <div className="row g-3">
                                            {/* Alert ID Display (Readonly) */}
                                            <div className="col-12 col-md-3">
                                                <label className="form-label small fw-bold text-muted mb-1">Alert ID</label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm font-mono fw-bold bg-light"
                                                    value={`#${selectedAlert.id}`}
                                                    disabled
                                                />
                                            </div>

                                            {/* Status / Closed Field */}
                                            <div className="col-12 col-md-4">
                                                <label className="form-label small fw-bold text-muted mb-1">
                                                    Alert Status <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select form-select-sm fw-bold text-dark"
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                >
                                                    <option value="O">🔴 Open (Under Active Surveillance)</option>
                                                    <option value="C">🟢 Closed (Investigated & Resolved)</option>
                                                </select>
                                            </div>

                                            {/* Closed By / Investigating Officer */}
                                            <div className="col-12 col-md-5">
                                                <label className="form-label small fw-bold text-muted mb-1">
                                                    Investigating Officer (Closed By)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    value={editClosedBy}
                                                    onChange={(e) => setEditClosedBy(e.target.value)}
                                                    placeholder="Officer Name / Badge"
                                                />
                                            </div>

                                            {/* Comments / Resolution Remarks */}
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted mb-1">
                                                    Officer Remarks / Investigation Comments <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    className="form-control form-control-sm"
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    placeholder="Enter investigation observations, action taken, ground verification notes..."
                                                    required
                                                />
                                                <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                                                    These comments and closure records are permanently logged into the central police surveillance database.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer Controls */}
                                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm px-3"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="btn btn-primary btn-sm px-4 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" />
                                                    <span>Saving to Server...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <IconCheckCircle size={15} />
                                                    <span>Save & Update Alert</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
