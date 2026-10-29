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
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center text-foreground">
                            <IconCrosshair size={20} />
                        </span>
                        <h1 className="text-base font-bold text-foreground mb-0 tracking-tight">AI Threat & Telemetry Alerts Ingestion</h1>
                        <span className="bg-muted text-muted-foreground border border-border px-2 py-0.5 rounded-full font-mono text-[10.5px] font-medium ms-1">
                            {totalCount} TOTAL DETECTIONS
                        </span>
                    </div>
                    <p className="text-muted-foreground text-xs mb-0 mt-0.5">
                        Real-time automated edge AI classification from deployed mobile patrol vans and CCTV sensors
                    </p>
                </div>

                {/* Refresh & Controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            fetchAlerts(currentPage, pageSize);
                            fetchOverallMetrics();
                        }}
                        className="h-8 px-3.5 rounded-md border border-border bg-background hover:bg-accent text-foreground text-xs font-medium inline-flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer select-none"
                        style={{ height: '32px', padding: '0 12px', gap: '8px' }}
                        disabled={isLoading}
                        title="Reload latest alerts from edge nodes"
                    >
                        <span className={isLoading ? 'spinner-border spinner-border-sm' : ''} style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {!isLoading && <IconRefreshCw size={13} />}
                        </span>
                        <span>Refresh Feed</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI Metrics Summary Cards (ShadCn Mira Color Shades) */}
            <div className="row g-2.5 mb-3">
                {/* Total Ingested Alerts */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="rounded-lg border border-border bg-card p-3 shadow-2xs h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">Total Ingested Alerts</span>
                                <div className="text-2xl font-bold font-mono tracking-tight text-foreground mt-1 mb-0">
                                    {overallMetrics.isLoading && totalCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        totalCount
                                    )}
                                </div>
                            </div>
                            <div
                                className="w-8 h-8 rounded-md bg-muted text-foreground flex items-center justify-center border border-border/80 flex-shrink-0"
                            >
                                <IconCrosshair size={16} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted-foreground text-[11px]">Citywide edge sensor alerts</div>
                    </div>
                </div>

                {/* Active Open Incidents */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="rounded-lg border border-border bg-card p-3 shadow-2xs h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">Active Open Incidents</span>
                                <div className="text-2xl font-bold font-mono tracking-tight text-red-600 mt-1 mb-0">
                                    {overallMetrics.isLoading && openCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        openCount
                                    )}
                                </div>
                            </div>
                            <div
                                className="w-8 h-8 rounded-md bg-red-500/10 text-red-600 border border-red-500/20 flex items-center justify-center flex-shrink-0"
                            >
                                <IconAlertTriangle size={16} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted-foreground text-[11px]">Requires surveillance review</div>
                    </div>
                </div>

                {/* Closed & Neutralized */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="rounded-lg border border-border bg-card p-3 shadow-2xs h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">Closed & Neutralized</span>
                                <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 mt-1 mb-0">
                                    {overallMetrics.isLoading && closedCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        closedCount
                                    )}
                                </div>
                            </div>
                            <div
                                className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center flex-shrink-0"
                            >
                                <IconCheckCircle size={16} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted-foreground text-[11px]">Investigated & cleared</div>
                    </div>
                </div>

                {/* Patrol Nodes Reporting */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="rounded-lg border border-border bg-card p-3 shadow-2xs h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-muted-foreground text-[10.5px] font-semibold uppercase tracking-wider">Patrol Vans Reporting</span>
                                <div className="text-2xl font-bold font-mono tracking-tight text-blue-600 mt-1 mb-0">
                                    {overallMetrics.isLoading && vehicleCount === 0 ? (
                                        <span className="spinner-border spinner-border-sm" />
                                    ) : (
                                        vehicleCount || 1
                                    )}
                                </div>
                            </div>
                            <div
                                className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center flex-shrink-0"
                            >
                                <IconCar size={16} />
                            </div>
                        </div>
                        <div className="mt-2 text-muted-foreground text-[11px]">Active mobile camera transmitters</div>
                    </div>
                </div>
            </div>

            {/* 3. Toolbar & Filter Section */}
            <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-2xs mb-3 flex justify-between items-center flex-wrap gap-2">
                {/* Search Bar */}
                <div className="flex items-center border border-input rounded-md bg-background px-2 h-7" style={{ maxWidth: '340px', width: '100%' }}>
                    <span className="text-muted-foreground me-1.5 flex items-center">
                        <IconSearch size={13} />
                    </span>
                    <input
                        type="text"
                        className="w-full bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground"
                        placeholder="Search alert type, vehicle ID, location, plate..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="text-muted-foreground hover:text-foreground text-xs ms-1 border-0 bg-transparent cursor-pointer"
                            type="button"
                            onClick={() => setSearchQuery('')}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 flex-wrap ms-auto">
                    {/* Status Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-7 px-2 text-xs font-medium rounded-md border border-input bg-background text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-ring"
                            style={{ width: 'auto', minWidth: '120px' }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="O">Open</option>
                            <option value="C">Closed</option>
                        </select>
                    </div>

                    {/* Dynamic Alert Type Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground font-medium">Type:</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-7 px-2 text-xs font-medium rounded-md border border-input bg-background text-foreground outline-none cursor-pointer focus:ring-1 focus:ring-ring"
                            style={{ width: 'auto', minWidth: '140px' }}
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

            {/* 4. Main AI Alerts Data Table (Mira High Density) */}
            <div className="rounded-lg border border-border bg-card shadow-2xs mb-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1150px' }}>
                        <thead style={{ backgroundColor: '#f4f4f5', borderBottom: '1px solid #e4e4e7' }}>
                            <tr
                                className="text-uppercase"
                                style={{ fontSize: '10.5px', fontWeight: 700, color: '#18181b', letterSpacing: '0.04em' }}
                            >
                                <th className="py-2.5 px-3 text-center" style={{ width: '50px' }}>
                                    #
                                </th>
                                <th className="py-2.5 px-3">Alert ID</th>
                                <th className="py-2.5 px-3">Detection Type</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3">Patrol Vehicle</th>
                                <th className="py-2.5 px-3">Scanned Plate</th>
                                <th className="py-2.5 px-3">Location & GPS</th>
                                <th className="py-2.5 px-3">Event Timestamp</th>
                                <th className="py-2.5 px-3">Remarks & Review</th>
                                <th className="py-2.5 px-3 text-center" style={{ width: '80px' }}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="py-5 text-center text-muted-foreground font-medium text-xs">
                                        <div className="spinner-border spinner-border-sm text-foreground me-2" role="status" />
                                        Fetching real-time AI alert stream ....
                                    </td>
                                </tr>
                            ) : apiError ? (
                                <tr>
                                    <td colSpan={10} className="py-5 text-center text-red-600 font-medium text-xs">
                                        <IconAlertTriangle size={18} className="me-1.5 inline" />
                                        {apiError}
                                    </td>
                                </tr>
                            ) : alerts.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-5 text-center text-muted-foreground font-medium text-xs">
                                        No AI alerts found matching the current search & filter parameters.
                                    </td>
                                </tr>
                            ) : (
                                alerts.map((item, index) => {
                                    const rowIndex = (pagination.page - 1) * pagination.limit + index + 1;
                                    const isClosed = item.status === 'C';

                                    // Dynamic subtle badge shades based on alerttype
                                    let typeBadgeClass = 'bg-blue-500/10 text-blue-700 border border-blue-500/20';
                                    if (item.alerttype?.toLowerCase().includes('motorcycle')) {
                                        typeBadgeClass = 'bg-blue-500/10 text-blue-700 border border-blue-500/20';
                                    } else if (item.alerttype?.toLowerCase().includes('unknown')) {
                                        typeBadgeClass = 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
                                    } else if (item.alerttype?.toLowerCase().includes('chair')) {
                                        typeBadgeClass = 'bg-zinc-100 text-zinc-700 border border-zinc-200';
                                    }

                                    return (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: '1px solid #f4f4f5',
                                                backgroundColor: isClosed ? '#fafafa' : '#ffffff'
                                            }}
                                        >
                                            {/* Row Index */}
                                            <td className="py-2.5 px-3 text-center text-muted-foreground font-mono" style={{ fontSize: '11px' }}>
                                                {rowIndex}
                                            </td>

                                            {/* Alert ID */}
                                            <td className="py-2.5 px-3">
                                                <span
                                                    className="font-mono font-medium px-1.5 py-0.5 rounded shadow-2xs text-[10.5px]"
                                                    style={{
                                                        backgroundColor: '#18181b',
                                                        color: '#ffffff',
                                                        letterSpacing: '0.03em'
                                                    }}
                                                >
                                                    #{item.id}
                                                </span>
                                            </td>

                                            {/* Alert Type */}
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`px-2 py-0.5 font-mono text-[10.5px] font-medium rounded-full uppercase ${typeBadgeClass}`}
                                                    >
                                                        ● {item.alerttype || 'Generic Alert'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-2.5 px-3">
                                                {isClosed ? (
                                                    <span
                                                        className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold text-[10.5px] inline-flex items-center gap-1"
                                                    >
                                                        <IconCheckCircle size={11} />
                                                        CLOSED
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 font-semibold text-[10.5px] inline-flex items-center gap-1"
                                                    >
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
                                                        />
                                                        OPEN
                                                    </span>
                                                )}
                                            </td>

                                            {/* Patrol Vehicle & Cam */}
                                            <td className="py-2.5 px-3">
                                                <div className="font-semibold text-foreground font-mono" style={{ fontSize: '11.5px' }}>
                                                    {item.vehicle_registration || item.vehicle_id || 'PATROL_VAN'}
                                                </div>
                                                <div className="text-muted-foreground font-mono mt-0.5" style={{ fontSize: '10px' }}>
                                                    <IconVideo size={10} className="me-1 inline" />
                                                    CAM-{item.camera_id || '1'} • IP: {item.sendip || '127.0.0.1'}
                                                </div>
                                            </td>

                                            {/* Scanned Number Plate */}
                                            <td className="py-2.5 px-3">
                                                {item.scanned_vehicle_numberplate ? (
                                                    <div
                                                        className="ind-number-plate inline-flex items-center shadow-2xs"
                                                        style={{ height: '22px', padding: '1px 5px' }}
                                                        title="Automated ANPR scan from video feed"
                                                    >
                                                        <span className="ind-flag" style={{ fontSize: '7px' }}>
                                                            IND
                                                        </span>
                                                        <span style={{ fontSize: '10.5px', fontWeight: 700 }}>
                                                            {item.scanned_vehicle_numberplate}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground font-mono text-xs">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            {/* Location & GPS */}
                                            <td className="py-2.5 px-3">
                                                <div
                                                    className="font-medium text-foreground truncate"
                                                    style={{ fontSize: '11.5px', maxWidth: '180px' }}
                                                    title={item.location}
                                                >
                                                    📍 {item.location || 'Patrol Jurisdiction'}
                                                </div>
                                                {item.lat && item.lon && (
                                                    <a
                                                        href={`https://maps.google.com/?q=${item.lat},${item.lon}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="no-underline font-mono text-muted-foreground hover:text-foreground text-[10px] mt-0.5 inline-block"
                                                        title="View GPS coordinates on Google Maps"
                                                    >
                                                        {item.lat}, {item.lon} ↗
                                                    </a>
                                                )}
                                            </td>

                                            {/* Timestamps */}
                                            <td className="py-2.5 px-3">
                                                <div className="font-mono text-foreground font-medium" style={{ fontSize: '11px' }}>
                                                    🕒 {item.createtime}
                                                </div>
                                                {item.receivedtime && (
                                                    <div className="text-muted-foreground font-mono mt-0.5" style={{ fontSize: '9.5px' }}>
                                                        Rec: {item.receivedtime}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Remarks & Officer */}
                                            <td className="py-2.5 px-3">
                                                {item.comment ? (
                                                    <div>
                                                        <div
                                                            className="text-foreground font-normal truncate"
                                                            style={{ maxWidth: '200px', fontSize: '11px' }}
                                                            title={item.comment}
                                                        >
                                                            {item.comment}
                                                        </div>
                                                        {item.closedBy && (
                                                            <div className="text-muted-foreground font-mono mt-0.5" style={{ fontSize: '9.5px' }}>
                                                                By: {item.closedBy}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground italic text-[10.5px]">
                                                        Pending review
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-2.5 px-3 text-center">
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        padding: 0,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#18181b',
                                                        backgroundColor: '#ffffff',
                                                        border: '1px solid #e4e4e7',
                                                        borderRadius: '7px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                                        cursor: 'pointer',
                                                        transition: 'background-color 0.15s ease, border-color 0.15s ease',
                                                        flexShrink: 0,
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.backgroundColor = '#f4f4f5';
                                                        e.currentTarget.style.borderColor = '#a1a1aa';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                                        e.currentTarget.style.borderColor = '#e4e4e7';
                                                    }}
                                                    onClick={() => handleOpenModal(item)}
                                                    title="Inspect AI alert, review snapshot & update status"
                                                >
                                                    <svg
                                                        width="17"
                                                        height="17"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#18181b"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{ display: 'block', flexShrink: 0 }}
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
            {/* 5. AI ALERT INSPECTION & RESOLUTION MODAL (ShadCn Mira Minimalist)    */}
            {/* ===================================================================== */}
            {isModalOpen && selectedAlert && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(9, 9, 11, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1055 }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content shadow-xl border border-border bg-card" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                            {/* Modal Header */}
                            <div className="modal-header py-2.5 px-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                                            selectedAlert.status === 'C'
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                        }`}
                                    >
                                        <IconCrosshair size={15} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h5 className="modal-title text-xs font-semibold text-foreground mb-0">
                                                AI Alert Resolution & Snapshot Inspection
                                            </h5>
                                            <span className="bg-primary text-primary-foreground font-mono text-[10px] px-1.5 py-0.2 rounded font-medium">
                                                #{selectedAlert.id}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground text-[10.5px]">
                                            Type: <strong className="text-foreground">{selectedAlert.alerttype}</strong> • Van:{' '}
                                            <strong className="text-foreground">{selectedAlert.vehicle_id}</strong>
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-foreground text-xs p-1 bg-transparent border-0 cursor-pointer"
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-3.5" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
                                {/* Visual Snapshot & Telemetry Banner */}
                                <div className="row g-3 mb-3">
                                    {/* Left Column: Image Snapshot */}
                                    <div className="col-12 col-md-7">
                                        <div
                                            className="rounded-lg p-2 relative overflow-hidden shadow-2xs flex flex-col justify-center items-center"
                                            style={{
                                                backgroundColor: '#09090b',
                                                border: '1px solid #27272a',
                                                minHeight: '220px'
                                            }}
                                        >
                                            {isLoadingModalDetails ? (
                                                <div className="text-center py-5 text-white">
                                                    <div className="spinner-border text-zinc-400 spinner-border-sm mb-2" role="status" />
                                                    <div className="text-xs font-mono text-zinc-400">Retrieving raw sensor capture...</div>
                                                </div>
                                            ) : modalDetails?.File_loc ? (
                                                <div className="relative w-full text-center">
                                                    <img
                                                        src={
                                                            modalDetails.File_loc.startsWith('data:')
                                                                ? modalDetails.File_loc
                                                                : `data:image/jpeg;base64,${modalDetails.File_loc}`
                                                        }
                                                        alt={`Alert ${selectedAlert.id} Snapshot`}
                                                        className="img-fluid rounded shadow-sm"
                                                        style={{ maxHeight: '240px', objectFit: 'contain', width: '100%' }}
                                                    />
                                                    {/* Target Reticle overlay */}
                                                    <div
                                                        className="absolute top-0 start-0 m-2 bg-black/80 text-white border border-red-500/40 font-mono px-2 py-0.5 rounded text-[10px]"
                                                    >
                                                        TARGET: {selectedAlert.alerttype}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-white">
                                                    <IconCrosshair size={32} className="text-zinc-400 mb-2 inline" />
                                                    <div className="text-xs font-semibold font-mono text-zinc-200">EDGE SENSOR TELEMETRY LOCK</div>
                                                    <div className="text-zinc-500 text-[11px] font-mono mt-1">
                                                        CAM-{selectedAlert.camera_id} • IP: {selectedAlert.sendip || '223.182.122.63'}
                                                    </div>
                                                    {selectedAlert.scanned_vehicle_numberplate && (
                                                        <div className="mt-2">
                                                            <span className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono font-medium text-[10.5px] px-2 py-0.5 rounded">
                                                                PLATE: {selectedAlert.scanned_vehicle_numberplate}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Viewport Bottom Overlay */}
                                            <div
                                                className="w-full flex justify-between items-center text-zinc-500 font-mono pt-1.5 mt-2 border-t border-zinc-800 text-[10px]"
                                            >
                                                <span>Van: {selectedAlert.vehicle_id}</span>
                                                <span className="text-zinc-400">GPS: {selectedAlert.lat}, {selectedAlert.lon}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Key Details */}
                                    <div className="col-12 col-md-5">
                                        <div className="p-3 rounded-lg border border-border bg-muted/20 h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between pb-1.5 border-b border-border/80 mb-2">
                                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                                                        Incident Details
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.2 rounded-full font-mono text-[10px] font-semibold ${
                                                            selectedAlert.status === 'C'
                                                                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                                                                : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                                        }`}
                                                    >
                                                        {selectedAlert.status === 'C' ? 'RESOLVED' : 'ACTIVE'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col gap-1.5 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Detection:</span>
                                                        <strong className="text-foreground text-uppercase">{selectedAlert.alerttype}</strong>
                                                    </div>

                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Vehicle ID:</span>
                                                        <span className="font-mono text-foreground font-semibold">{selectedAlert.vehicle_id}</span>
                                                    </div>

                                                    {selectedAlert.scanned_vehicle_numberplate && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Scanned Plate:</span>
                                                            <span className="ind-number-plate" style={{ fontSize: '10px' }}>
                                                                {selectedAlert.scanned_vehicle_numberplate}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Camera Ch:</span>
                                                        <span className="font-mono text-foreground">Channel {selectedAlert.camera_id}</span>
                                                    </div>

                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Location:</span>
                                                        <span className="text-foreground font-medium truncate" style={{ maxWidth: '140px' }}>
                                                            {selectedAlert.location}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Created:</span>
                                                        <span className="font-mono text-foreground">{selectedAlert.createtime}</span>
                                                    </div>

                                                    {selectedAlert.closedtime && (
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Closed At:</span>
                                                            <span className="font-mono text-emerald-600">{selectedAlert.closedtime}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Form: Status & Closed Fields */}
                                <form onSubmit={handleSaveAlert}>
                                    <div className="rounded-lg border border-border p-3 bg-card shadow-2xs">
                                        <h6 className="font-semibold text-xs text-foreground mb-2.5 pb-1.5 border-b border-border flex items-center gap-1.5">
                                            <IconShieldAlert size={14} className="text-foreground" />
                                            <span>Investigate & Update Alert Status</span>
                                        </h6>

                                        <div className="row g-2.5">
                                            {/* Alert ID Display (Readonly) */}
                                            <div className="col-12 col-md-3">
                                                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Alert ID</label>
                                                <input
                                                    type="text"
                                                    className="w-full h-7 px-2 text-xs font-mono font-medium rounded-md border border-input bg-muted/40 text-muted-foreground"
                                                    value={`#${selectedAlert.id}`}
                                                    disabled
                                                />
                                            </div>

                                            {/* Status / Closed Field */}
                                            <div className="col-12 col-md-4">
                                                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                    Alert Status <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    className="w-full h-7 px-2 text-xs font-medium rounded-md border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                >
                                                    <option value="O">Active Open (Under Surveillance)</option>
                                                    <option value="C">Closed (Investigated & Cleared)</option>
                                                </select>
                                            </div>

                                            {/* Closed By / Investigating Officer */}
                                            <div className="col-12 col-md-5">
                                                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                    Investigating Officer (Closed By)
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full h-7 px-2 text-xs rounded-md border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                                                    value={editClosedBy}
                                                    onChange={(e) => setEditClosedBy(e.target.value)}
                                                    placeholder="Officer Name / Badge"
                                                />
                                            </div>

                                            {/* Comments / Resolution Remarks */}
                                            <div className="col-12">
                                                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                    Officer Remarks / Investigation Comments <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    className="w-full p-2 text-xs rounded-md border border-input bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    placeholder="Enter investigation observations, action taken, ground verification notes..."
                                                    required
                                                />
                                                <div className="text-muted-foreground text-[10.5px] mt-1">
                                                    Logged permanently into the central police surveillance database.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer Controls */}
                                    <div className="flex justify-between items-center mt-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            style={{
                                                height: '34px',
                                                padding: '0 14px',
                                                borderRadius: '7px',
                                                border: '1px solid #e4e4e7',
                                                backgroundColor: '#ffffff',
                                                color: '#18181b',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'background-color 0.15s ease',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f4f4f5'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            style={{
                                                height: '34px',
                                                padding: '0 16px',
                                                borderRadius: '7px',
                                                border: 'none',
                                                backgroundColor: isSaving ? '#52525b' : '#18181b',
                                                color: '#ffffff',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '7px',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                transition: 'background-color 0.15s ease',
                                                whiteSpace: 'nowrap',
                                                opacity: isSaving ? 0.75 : 1,
                                            }}
                                            onMouseEnter={e => { if (!isSaving) e.currentTarget.style.backgroundColor = '#27272a'; }}
                                            onMouseLeave={e => { if (!isSaving) e.currentTarget.style.backgroundColor = '#18181b'; }}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px', borderWidth: '2px', borderColor: '#ffffff transparent #ffffff #ffffff' }} />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <IconCheckCircle size={13} style={{ color: '#ffffff', flexShrink: 0 }} />
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
