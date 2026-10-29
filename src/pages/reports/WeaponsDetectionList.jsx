import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { WEAPON_DETECTION_EVENTS } from '../../data/mockData';
import {
    IconCrosshair,
    IconSearch,
    IconShieldAlert,
    IconAlertTriangle,
    IconCheckCircle,
    IconDownload,
    IconCar,
    IconVideo
} from '../../components/common/Icons';
import Pagination from '../../components/common/Pagination';
import ExportExcelButton from '../../components/common/ExportExcelButton';
import { exportToExcel } from '../../utils/excelExport';

/**
 * =========================================================================
 * DYNAMIC WEAPON DETECTION TABLE COLUMNS CONFIGURATION (API-READY)
 * =========================================================================
 * Used for dynamic table rendering, Excel export, and CSV template mapping.
 */
export const WEAPON_COLUMNS = [
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
        key: 'event_id',
        label: 'Incident ID',
        align: 'left',
        render: (row) => (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle font-mono fw-bold" style={{ fontSize: '11px' }}>
                {row.event_id}
            </span>
        )
    },
    {
        key: 'weapon_type',
        label: 'Weapon Type & Category',
        align: 'left',
        render: (row) => (
            <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-1.5" style={{ fontSize: '12.5px' }}>
                    <span>{row.weapon_type}</span>
                </div>
                <div className="mt-0.5">
                    <span
                        className={`badge font-mono ${row.weapon_category === 'FIREARM'
                            ? 'bg-danger text-white'
                            : row.weapon_category === 'EDGED_BLADE'
                                ? 'bg-warning text-dark'
                                : 'bg-secondary text-white'
                            }`}
                        style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                        {row.weapon_category.replace('_', ' ')}
                    </span>
                </div>
            </div>
        )
    },
    {
        key: 'confidence_score',
        label: 'AI Confidence',
        align: 'left',
        render: (row) => (
            <div className="d-flex align-items-center gap-1.5">
                <span
                    className={`badge font-mono fw-bold ${row.confidence_score >= 95
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                        }`}
                    style={{ fontSize: '11px' }}
                >
                    {row.confidence_score}%
                </span>
                <span className="text-muted small font-mono" style={{ fontSize: '10.5px' }}>YOLOv8</span>
            </div>
        )
    },
    {
        key: 'registration_number',
        label: 'Patrol Vehicle & Cam',
        align: 'left',
        render: (row) => (
            <div>
                <div className="ind-number-plate d-inline-flex align-middle" style={{ height: '26px', padding: '1px 6px' }}>
                    <span className="ind-flag" style={{ fontSize: '7.5px' }}>IND</span>
                    <span style={{ fontSize: '11px' }}>{row.registration_number}</span>
                </div>
                <div className="text-muted font-mono small mt-0.5" style={{ fontSize: '10.5px' }}>
                    {row.camera_channel}
                </div>
            </div>
        )
    },
    {
        key: 'location_name',
        label: 'Detection Location',
        align: 'left',
        render: (row) => (
            <div>
                <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '12px', maxWidth: '200px' }} title={row.location_name}>
                    📍 {row.location_name}
                </div>
                <div className="text-muted small" style={{ fontSize: '11px' }}>
                    {row.police_station}
                </div>
            </div>
        )
    },
    {
        key: 'detected_timestamp',
        label: 'Timestamp',
        align: 'left',
        render: (row) => (
            <span className="font-mono text-secondary small fw-semibold" style={{ fontSize: '11.5px' }}>
                🕒 {row.detected_timestamp}
            </span>
        )
    },
    {
        key: 'threat_level',
        label: 'Threat Level',
        align: 'left',
        render: (row) => {
            let bg = '#fee2e2';
            let color = '#991b1b';
            let border = '#fca5a5';

            if (row.threat_level === 'HIGH') {
                bg = '#ffedd5';
                color = '#9a3412';
                border = '#fed7aa';
            } else if (row.threat_level === 'MODERATE') {
                bg = '#fef9c3';
                color = '#854d0e';
                border = '#fef08a';
            }

            return (
                <span
                    className="badge fw-bold"
                    style={{
                        backgroundColor: bg,
                        color: color,
                        border: `1px solid ${border}`,
                        fontSize: '11px',
                        padding: '4px 8px'
                    }}
                >
                    ● {row.threat_level}
                </span>
            );
        }
    },
    {
        key: 'incident_status',
        label: 'Status',
        width: '130px',
        align: 'center',
        render: (row, _idx, _rowIndex, actions) => (
            <button
                onClick={() => actions.onToggleStatus(row.event_id)}
                className="btn btn-link p-0 text-decoration-none border-0 shadow-none"
                title="Click to advance response status"
                style={{ cursor: 'pointer' }}
            >
                {row.incident_status === 'DISPATCHED' ? (
                    <span
                        className="badge rounded-pill shadow-sm"
                        style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '5px 12px',
                            letterSpacing: '0.02em',
                            display: 'inline-block'
                        }}
                    >
                        ● DISPATCHED
                    </span>
                ) : row.incident_status === 'INVESTIGATING' ? (
                    <span
                        className="badge rounded-pill shadow-sm"
                        style={{
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '5px 12px',
                            letterSpacing: '0.02em',
                            display: 'inline-block'
                        }}
                    >
                        ● INVESTIGATING
                    </span>
                ) : (
                    <span
                        className="badge rounded-pill shadow-sm"
                        style={{
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '5px 12px',
                            letterSpacing: '0.02em',
                            display: 'inline-block'
                        }}
                    >
                        ● NEUTRALIZED
                    </span>
                )}
            </button>
        )
    },
    {
        key: 'actions',
        label: 'Snapshot',
        width: '90px',
        align: 'center',
        render: (row, _idx, _rowIndex, actions) => (
            <div className="d-inline-flex align-items-center justify-content-center">
                {/* View Detection Snapshot Button */}
                <button
                    type="button"
                    className="btn btn-sm p-0 shadow-sm"
                    title="Inspect AI Detection Snapshot & Telemetry"
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
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            </div>
        )
    }
];

export default function WeaponsDetectionList() {
    const [incidents, setIncidents] = useState(WEAPON_DETECTION_EVENTS);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [stationFilter, setStationFilter] = useState('ALL');
    const [threatFilter, setThreatFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Modal State for AI Snapshot Dossier
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);

    // Hidden File Input Ref for Excel/CSV Import
    const fileInputRef = useRef(null);

    // -------------------------------------------------------------------------
    // API INTEGRATION HANDLER
    // -------------------------------------------------------------------------
    const fetchWeaponDetectionsApi = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            // Backend API call template:
            // const res = await axios.get('/api/reports/weapons-detection');
            // setIncidents(res.data);
            setIncidents(WEAPON_DETECTION_EVENTS);
        } catch (err) {
            console.error('API Error:', err);
            setApiError('Failed to fetch weapon detection logs from server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWeaponDetectionsApi();
    }, []);

    // Reset to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, stationFilter, threatFilter, statusFilter]);

    // Excel Columns Config - Automatically mapped from WEAPON_COLUMNS
    const weaponExcelColumns = WEAPON_COLUMNS
        .filter(c => c.key !== 'index' && c.key !== 'actions')
        .map(c => ({ key: c.key, label: c.label }));

    // -------------------------------------------------------------------------
    // EXCEL / CSV IMPORT HANDLER
    // -------------------------------------------------------------------------
    const handleImportFile = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    Swal.fire('Import Error', 'The selected file is empty or missing data rows.', 'error');
                    return;
                }

                // Parse rows
                const importedRecords = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
                    if (values.length < 2) continue;

                    const record = {
                        event_id: values[0] || `WPN-2026-${Math.floor(100 + Math.random() * 900)}`,
                        weapon_type: values[1] || 'Tactical Firearm / Weapon',
                        weapon_category: (values[2] || 'FIREARM').toUpperCase(),
                        confidence_score: Number(values[3]) || 95.0,
                        registration_number: values[4] || 'GJ-01-G-9999',
                        camera_channel: values[5] || 'CAM_01_FRONT',
                        location_name: values[6] || 'Command Sector Ahmedabad',
                        police_station: values[7] || 'Navrangpura Police Station',
                        detected_timestamp: values[8] || new Date().toISOString().replace('T', ' ').slice(0, 19),
                        threat_level: (values[9] || 'CRITICAL').toUpperCase(),
                        incident_status: (values[10] || 'DISPATCHED').toUpperCase(),
                        assigned_officer: values[11] || 'Patrol Unit Response',
                        ai_model: 'YOLOv8-Tactical-Weapon-v3'
                    };

                    importedRecords.push(record);
                }

                if (importedRecords.length > 0) {
                    setIncidents(prev => [...importedRecords, ...prev]);
                    Swal.fire({
                        title: 'Import Successful!',
                        text: `Successfully imported ${importedRecords.length} weapon detection logs.`,
                        icon: 'success',
                        confirmButtonColor: '#0d6efd'
                    });
                } else {
                    Swal.fire('No Records Found', 'Could not parse any valid records from the file.', 'warning');
                }
            } catch (err) {
                console.error('File parsing error:', err);
                Swal.fire('Import Error', 'Failed to parse file. Please verify CSV/Excel formatting.', 'error');
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    // Download Sample CSV / Excel Template
    const handleDownloadTemplate = () => {
        const sampleData = [
            {
                event_id: 'WPN-2026-SAMPLE',
                weapon_type: 'Semi-Automatic Pistol (9mm)',
                weapon_category: 'FIREARM',
                confidence_score: 98.5,
                registration_number: 'GJ-01-G-9999',
                camera_channel: 'CAM_01_FRONT',
                location_name: 'Navrangpura Circle',
                police_station: 'Navrangpura Police Station',
                detected_timestamp: '2026-10-27 12:00:00',
                threat_level: 'CRITICAL',
                incident_status: 'DISPATCHED',
                assigned_officer: 'Insp. Vikram Solanki'
            }
        ];
        exportToExcel(sampleData, 'Weapon_Detection_Import_Template', weaponExcelColumns);
    };

    // Filtered Incidents List
    const filteredIncidents = incidents.filter(item => {
        const matchesSearch =
            item.event_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.weapon_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.weapon_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.police_station.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'ALL' || item.weapon_category === categoryFilter;
        const matchesStation = stationFilter === 'ALL' || item.police_station.toLowerCase().includes(stationFilter.toLowerCase());
        const matchesThreat = threatFilter === 'ALL' || item.threat_level === threatFilter;
        const matchesStatus = statusFilter === 'ALL' || item.incident_status === statusFilter;

        return matchesSearch && matchesCategory && matchesStation && matchesThreat && matchesStatus;
    });

    // Paginated Incidents Slice
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedIncidents = filteredIncidents.slice(startIndex, startIndex + pageSize);

    // Toggle Response Status (DISPATCHED -> INVESTIGATING -> NEUTRALIZED -> DISPATCHED)
    const handleToggleStatus = (eventId) => {
        setIncidents(prev =>
            prev.map(item => {
                if (item.event_id === eventId) {
                    let nextStatus = 'INVESTIGATING';
                    if (item.incident_status === 'INVESTIGATING') nextStatus = 'NEUTRALIZED';
                    else if (item.incident_status === 'NEUTRALIZED') nextStatus = 'DISPATCHED';
                    return { ...item, incident_status: nextStatus };
                }
                return item;
            })
        );
    };

    // View AI Snapshot & Incident Dossier
    const handleViewSnapshot = (incident) => {
        setSelectedIncident(incident);
        setIsSnapshotModalOpen(true);
    };

    // KPI Calculations
    const totalDetections = incidents.length;
    const activeDispatches = incidents.filter(i => i.incident_status === 'DISPATCHED').length;
    const firearmAlerts = incidents.filter(i => i.weapon_category === 'FIREARM').length;
    const neutralizedCount = incidents.filter(i => i.incident_status === 'NEUTRALIZED').length;

    // Actions bundle for table rendering
    const tableActions = {
        onView: handleViewSnapshot,
        onToggleStatus: handleToggleStatus
    };

    return (
        <div className="container-fluid px-3 py-3">

            {/* Page Title & Breadcrumb Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-danger d-inline-flex"><IconCrosshair size={22} /></span>
                        <h1 className="h4 fw-bold text-dark mb-0">Weapons & Tactical Threat Detection Reports</h1>
                        <span className="badge bg-danger text-white ms-1 fw-bold">{activeDispatches} ACTIVE DISPATCHES</span>
                    </div>

                </div>
            </div>

            {/* 1. SEPARATE KPI STATS OVERVIEW CARD */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-header bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <span className="spinner-grow spinner-grow-sm text-danger" role="status" style={{ width: '8px', height: '8px' }}></span>
                        <span className="small fw-bold text-dark text-uppercase letter-spacing">Weapon Threat Intelligence Overview</span>
                    </div>
                </div>

                <div className="card-body p-3">
                    <div className="row g-3">
                        {/* Card 1: Total Detections */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-danger shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Total Detections</span>
                                        <div className="kpi-num text-dark mt-1">{totalDetections}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-danger-subtle text-danger">
                                        <IconCrosshair size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">CCTV AI bounding box triggers</div>
                            </div>
                        </div>

                        {/* Card 2: Active Dispatches */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-danger shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Active Dispatches</span>
                                        <div className="kpi-num text-danger mt-1">{activeDispatches}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-danger-subtle text-danger">
                                        <IconAlertTriangle size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Immediate patrol interception</div>
                            </div>
                        </div>

                        {/* Card 3: Firearm Alerts */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-warning shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Firearms / Guns</span>
                                        <div className="kpi-num text-warning mt-1">{firearmAlerts}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-warning-subtle text-warning">
                                        <IconShieldAlert size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Pistols, revolvers & rifles</div>
                            </div>
                        </div>

                        {/* Card 4: Intercepted / Neutralized */}
                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="card h-100 border-0 border-start border-4 border-success shadow-sm p-3 kpi-count-card">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-bold text-uppercase">Neutralized Threats</span>
                                        <div className="kpi-num text-success mt-1">{neutralizedCount}</div>
                                    </div>
                                    <div className="kpi-icon-pill bg-success-subtle text-success">
                                        <IconCheckCircle size={20} />
                                    </div>
                                </div>
                                <div className="mt-2 text-muted small">Suspects secured & cleared</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ACTIONS & TOOLBAR CARD (With Excel Import & Export) */}
            <div className="card shadow-sm border-0 mb-3">
                <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {/* Left Side: Summary Context */}
                    <div className="d-flex align-items-center gap-2">
                        <div className="p-2 bg-danger-subtle text-danger rounded d-flex align-items-center justify-content-center">
                            <IconCrosshair size={18} />
                        </div>
                        <div>
                            <div className="fw-bold text-dark small">AI Computer Vision Weapon Ingestion Log</div>
                        </div>
                    </div>

                    {/* Right Side: Excel Import, Export & Template Buttons */}
                    <div className="d-flex align-items-center gap-2 ms-auto flex-wrap">
                        {/* Excel Export Button */}
                        <ExportExcelButton
                            data={filteredIncidents}
                            fileName="Weapons_Detection_Report"
                            columns={weaponExcelColumns}
                            label="Export Weapons Excel"
                        />
                    </div>
                </div>
            </div>

            {/* 3. MAIN DATA TABLE CARD */}
            <div className="card shadow-sm border-0 mb-4">
                {/* Table Filter Strip */}
                <div className="card-header bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {/* Search Box */}
                    <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
                        <span className="input-group-text bg-white border-end-0 text-muted">
                            <IconSearch size={14} />
                        </span>
                        <input
                            type="text"
                            className="form-control form-control-sm border-start-0"
                            placeholder="Search weapon, vehicle, location..."
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
                        {/* Category Filter */}
                        {/* <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Type:</span>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '130px' }}
                            >
                                <option value="ALL">All Weapons</option>
                                <option value="FIREARM">Firearms</option>
                                <option value="EDGED_BLADE">Edged / Blades</option>
                                <option value="HOLSTER_CONCEALED">Concealed Holster</option>
                            </select>
                        </div> */}

                        {/* Station Filter */}
                        {/* <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Station:</span>
                            <select
                                value={stationFilter}
                                onChange={(e) => setStationFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '130px' }}
                            >
                                <option value="ALL">All Stations</option>
                                <option value="Navrangpura">Navrangpura</option>
                                <option value="SG Highway">SG Highway</option>
                                <option value="Vastrapur">Vastrapur</option>
                                <option value="Satellite">Satellite</option>
                                <option value="Ellis Bridge">Ellis Bridge</option>
                            </select>
                        </div> */}

                        {/* Threat Level Filter */}
                        {/* <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Threat:</span>
                            <select
                                value={threatFilter}
                                onChange={(e) => setThreatFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '110px' }}
                            >
                                <option value="ALL">All Levels</option>
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MODERATE">Moderate</option>
                            </select>
                        </div> */}

                        {/* Status Filter */}
                        <div className="d-flex align-items-center gap-1">
                            <span className="small text-muted fw-semibold">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="form-select form-select-sm fw-semibold text-dark"
                                style={{ width: 'auto', minWidth: '130px' }}
                            >
                                <option value="ALL">All Status</option>
                                <option value="DISPATCHED">Dispatched</option>
                                <option value="INVESTIGATING">Investigating</option>
                                <option value="NEUTRALIZED">Neutralized</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Table Container with Horizontal Scroll */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-nowrap" style={{ minWidth: '1200px' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr className="text-uppercase small" style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                                {WEAPON_COLUMNS.map((col, idx) => (
                                    <th
                                        key={col.key || idx}
                                        scope="col"
                                        className={`py-3 px-3 align-middle ${col.align === 'center' ? 'text-center' : ''}`}
                                        style={{
                                            width: col.width || 'auto',
                                            borderRight: idx < WEAPON_COLUMNS.length - 1 ? '1px solid #e2e8f0' : 'none'
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
                                    <td colSpan={WEAPON_COLUMNS.length} className="py-5 text-center text-muted fw-semibold">
                                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                                        Loading weapon detection feeds from edge Jetson nodes...
                                    </td>
                                </tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan={WEAPON_COLUMNS.length} className="py-5 text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                                        No weapon detection events found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedIncidents.map((item, index) => {
                                    const rowIndex = (currentPage - 1) * pageSize + index + 1;
                                    return (
                                        <tr
                                            key={item.event_id || index}
                                            style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}
                                        >
                                            {WEAPON_COLUMNS.map((col) => (
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
                    totalItems={filteredIncidents.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[5, 10, 20, 50]}
                />
            </div>

            {/* ========================================================== */}
            {/* 4. WEAPON DETECTION SNAPSHOT & DOSSIER MODAL               */}
            {/* ========================================================== */}
            {isSnapshotModalOpen && selectedIncident && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
                    onClick={() => setIsSnapshotModalOpen(false)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content shadow-lg border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>

                            {/* Modal Header */}
                            <div className="modal-header py-3 px-4 border-bottom" style={{ backgroundColor: '#f8fafc' }}>
                                <div className="d-flex align-items-center gap-2.5">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-3 shadow-sm text-white"
                                        style={{ width: '38px', height: '38px', backgroundColor: '#dc3545' }}
                                    >
                                        <IconCrosshair size={20} />
                                    </div>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h5 className="modal-title h6 fw-bold mb-0 text-dark">
                                                AI Weapon Detection Snapshot & Incident Log
                                            </h5>
                                            <span className="badge bg-danger text-white fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                {selectedIncident.event_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close shadow-none"
                                    onClick={() => setIsSnapshotModalOpen(false)}
                                    aria-label="Close"
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body p-4" style={{ maxHeight: '74vh', overflowY: 'auto' }}>

                                {/* Hero Identity Banner */}
                                <div
                                    className="p-3 rounded-3 shadow-sm mb-3 text-white position-relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                                        border: '1px solid #312e81'
                                    }}
                                >
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center bg-danger text-white fw-bold shadow-sm"
                                                style={{ width: '52px', height: '52px' }}
                                            >
                                                <IconCrosshair size={26} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-white fs-5 mb-0.5">{selectedIncident.weapon_type}</div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="badge bg-danger text-white fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                        {selectedIncident.threat_level} SEVERITY
                                                    </span>
                                                    <span className="badge bg-success-subtle text-success fw-bold font-mono" style={{ fontSize: '11px' }}>
                                                        {selectedIncident.confidence_score}% CONFIDENCE
                                                    </span>
                                                </div>
                                                <div className="text-slate-400 small mt-1" style={{ color: '#94a3b8', fontSize: '12px' }}>
                                                    📍 {selectedIncident.location_name} ({selectedIncident.police_station})
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {selectedIncident.incident_status === 'DISPATCHED' ? (
                                                <span
                                                    className="badge rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5"
                                                    style={{
                                                        backgroundColor: '#ef4444',
                                                        color: '#ffffff',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        padding: '6px 14px'
                                                    }}
                                                >
                                                    <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: '6px', height: '6px' }}></span>
                                                    DISPATCH IN PROGRESS
                                                </span>
                                            ) : selectedIncident.incident_status === 'INVESTIGATING' ? (
                                                <span
                                                    className="badge rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5"
                                                    style={{
                                                        backgroundColor: '#f59e0b',
                                                        color: '#ffffff',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        padding: '6px 14px'
                                                    }}
                                                >
                                                    INVESTIGATING
                                                </span>
                                            ) : (
                                                <span
                                                    className="badge rounded-pill shadow-sm"
                                                    style={{
                                                        backgroundColor: '#22c55e',
                                                        color: '#ffffff',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        padding: '6px 14px'
                                                    }}
                                                >
                                                    NEUTRALIZED
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Simulated AI Computer Vision Bounding Box Viewport */}
                                <div
                                    className="rounded-3 mb-3 p-3 position-relative overflow-hidden shadow-sm"
                                    style={{
                                        backgroundColor: '#020617',
                                        border: '1px solid #1e293b',
                                        minHeight: '210px'
                                    }}
                                >
                                    {/* Viewport Top Overlay */}
                                    <div className="d-flex justify-content-between align-items-center text-white font-mono small mb-3">
                                        <span className="d-inline-flex align-items-center gap-1.5 text-danger fw-bold">
                                            <span className="rounded-circle bg-danger" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                                            AI TARGET LOCK: [{selectedIncident.camera_channel}]
                                        </span>
                                        <span className="text-secondary small">
                                            {selectedIncident.detected_timestamp} | LAT: {selectedIncident.latitude}° N, LON: {selectedIncident.longitude}° E
                                        </span>
                                    </div>

                                    {/* Simulated Bounding Box Overlay */}
                                    <div className="d-flex justify-content-center align-items-center py-4 my-1">
                                        <div
                                            className="p-3 rounded-2 text-center position-relative"
                                            style={{
                                                border: '2px solid #ef4444',
                                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                                minWidth: '280px',
                                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.35)'
                                            }}
                                        >
                                            <div className="position-absolute top-0 start-0 translate-middle badge bg-danger text-white font-mono" style={{ fontSize: '10px' }}>
                                                {selectedIncident.weapon_type} [{selectedIncident.confidence_score}%]
                                            </div>
                                            <IconCrosshair size={36} className="text-danger my-2" />
                                            <div className="text-white small fw-bold font-mono">
                                                TACTICAL THREAT RECOGNITION
                                            </div>
                                            <div className="text-warning small font-mono mt-0.5">
                                                Model: {selectedIncident.ai_model}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Viewport Bottom Overlay */}
                                    <div className="d-flex justify-content-between align-items-center text-muted font-mono small pt-2 border-top border-secondary border-opacity-25" style={{ fontSize: '11px' }}>
                                        <span>Patrol Van: {selectedIncident.registration_number} ({selectedIncident.vehicle_id})</span>
                                        <span className="text-success">C4i Command Feed: Verified</span>
                                    </div>
                                </div>

                                {/* Specs 2-Column Grid */}
                                <div className="row g-3 mb-3">
                                    {/* Detecting Unit Info */}
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                                                <IconCar size={16} />
                                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                    Detecting Mobile Patrol Fleet Unit
                                                </span>
                                            </div>
                                            <div className="ind-number-plate d-inline-flex align-middle shadow-sm mb-2" style={{ height: '30px', padding: '1px 8px' }}>
                                                <span className="ind-flag" style={{ fontSize: '8px' }}>IND</span>
                                                <span className="fw-bold" style={{ fontSize: '12px' }}>{selectedIncident.registration_number}</span>
                                            </div>
                                            <div className="text-muted small">
                                                Camera Channel: <strong className="font-mono text-dark">{selectedIncident.camera_channel}</strong>
                                            </div>
                                            <div className="text-muted small mt-1">
                                                First Intercepting Officer: <strong className="text-dark">{selectedIncident.assigned_officer}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Forensic Classification */}
                                    <div className="col-12 col-md-6">
                                        <div className="p-3 rounded-3 border h-100" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                                            <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                                                <IconShieldAlert size={16} />
                                                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                                                    Ballistic / Tactical Classification
                                                </span>
                                            </div>
                                            <div className="fw-bold text-dark fs-6">{selectedIncident.weapon_type}</div>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                <span className="badge bg-white text-dark border font-mono small">
                                                    Category: {selectedIncident.weapon_category}
                                                </span>
                                                <span className="badge bg-danger-subtle text-danger small fw-bold">
                                                    Threat: {selectedIncident.threat_level}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Advisory Notice */}
                                <div className="p-3 rounded-3 border bg-danger-subtle border-danger-subtle text-dark small">
                                    <div className="fw-bold d-flex align-items-center gap-1.5 mb-1 text-danger">
                                        <IconAlertTriangle size={15} />
                                        <span>Tactical Response Protocol</span>
                                    </div>
                                    <span>
                                        Weapon detection event has been broadcast to all field patrol units in sector {selectedIncident.police_station}. Maintain perimeter surveillance and wait for backup before engaging suspect.
                                    </span>
                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer py-2.5 px-4 border-top d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8fafc' }}>
                                <span className="text-muted small" style={{ fontSize: '11.5px' }}>
                                    Real-Time Edge AI Ballistic Ingestion
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm px-4 fw-semibold shadow-none"
                                    onClick={() => setIsSnapshotModalOpen(false)}
                                >
                                    Close Dossier
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
