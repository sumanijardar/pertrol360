import React, { useState } from 'react';
import { lookupOfficerPlateApi, API_BASE_URL } from '../../services/api';
import { IconSearch, IconAlertTriangle, IconCar } from '../../components/common/Icons';

export default function PlateLookup() {
  const [plateQuery, setPlateQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedPlate, setSearchedPlate] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    const clean = plateQuery.trim().toUpperCase();
    if (!clean) return;

    setIsLoading(true);
    setSearchedPlate(clean);
    setResult(null);

    try {
      const res = await lookupOfficerPlateApi(clean);
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      setResult({ error: err.message || 'Lookup failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col flex-1 w-full min-h-screen text-slate-800 font-sans"
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
        {/* Header Title (Clean White Card) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-lg shadow-2xs flex-shrink-0">
              🔍
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">License Plate Intelligence Dossier</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time CCTNS stolen vehicles hotlist check and AI camera sighting history
              </p>
            </div>
          </div>
          <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-md font-bold font-mono">
            ANPR SIGHTINGS DB
          </span>
        </div>

        {/* Search Box (Clean White Card) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
            <input
              type="text"
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
              placeholder="Enter Registration Number (e.g. GJ01AB1234, MH12DE1432)..."
              maxLength={15}
              style={{
                flex: 1,
                height: '42px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 14px',
                fontSize: '13px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                height: '42px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 22px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{isLoading ? 'Searching...' : 'Lookup Plate'}</span>
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap">
            <span className="font-medium">Try sample hotlist plates:</span>
            <button
              type="button"
              onClick={() => {
                setPlateQuery('GJ01AB1234');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#1d4ed8',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              GJ01AB1234 (Stolen SUV)
            </button>
            <button
              type="button"
              onClick={() => {
                setPlateQuery('MH12DE1432');
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#1d4ed8',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              MH12DE1432 (Watchlist)
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-700 font-medium shadow-xs">
                {result.error}
              </div>
            ) : (
              <>
                {/* Watchlist Status Card */}
                <div
                  className={`border rounded-xl p-5 shadow-xs ${
                    result.is_stolen_watchlist
                      ? 'bg-red-50/70 border-red-300'
                      : 'bg-emerald-50/70 border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {result.is_stolen_watchlist ? '🚨' : '✓'}
                      </span>
                      <strong
                        className={`text-sm ${
                          result.is_stolen_watchlist ? 'text-red-900 font-extrabold' : 'text-emerald-900 font-extrabold'
                        }`}
                      >
                        {result.is_stolen_watchlist
                          ? 'WATCHLIST ALERT: STOLEN VEHICLE DETECTED IN POLICE FIR DATABASE'
                          : 'CLEAN REGISTRATION RECORD: No active theft reports found on watchlist'}
                      </strong>
                    </div>
                    {/* Authentic License Plate Badge */}
                    <span className="font-mono text-sm font-black bg-amber-100 text-slate-950 border border-amber-300 px-3 py-1 rounded shadow-2xs">
                      {result.queried_plate}
                    </span>
                  </div>

                  {result.stolen_details && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-white/80 border border-red-200 p-3 rounded-lg text-slate-700 mb-3">
                      <div>
                        <span className="text-slate-500 font-medium">FIR Number:</span>
                        <strong className="text-slate-900 block font-mono mt-0.5">{result.stolen_details.fir_number}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Police Station:</span>
                        <strong className="text-slate-900 block mt-0.5">{result.stolen_details.police_station}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Theft Date:</span>
                        <strong className="text-slate-900 block font-mono mt-0.5">{result.stolen_details.theft_date}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Registered Owner:</span>
                        <strong className="text-slate-900 block mt-0.5">{result.stolen_details.owner_name}</strong>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-5 text-xs text-slate-600 font-medium">
                    <div>
                      Total Sightings Logged: <strong className="text-slate-900">{result.total_sightings || 0}</strong>
                    </div>
                    {result.first_seen && (
                      <div>
                        First Seen: <strong className="text-slate-900 font-mono">{result.first_seen}</strong>
                      </div>
                    )}
                    {result.last_seen && (
                      <div>
                        Last Seen: <strong className="text-slate-900 font-mono">{result.last_seen}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sighting Timeline (Clean White Card) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Historical AI Camera Sightings Timeline ({result.sightings_history?.length || 0})
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">Across Ahmedabad Patrol Grid</span>
                  </div>

                  {result.sightings_history?.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No camera sighting events logged for this plate yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {result.sightings_history?.map((s) => (
                        <div
                          key={s.id}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-blue-700 font-bold font-mono bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                              #{s.id}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900">{s.location || 'Patrol Route'}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                {s.createtime} • Patrol Van: <strong className="text-slate-800">{s.vehicle_id}</strong> • Cam: {s.camera_id}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                s.status === 'O'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}
                            >
                              {s.status === 'O' ? 'Open' : 'Resolved'}
                            </span>
                            {s.maps_url && (
                              <a
                                href={s.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold border border-slate-200 shadow-2xs"
                              >
                                📍 Map Pin
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
