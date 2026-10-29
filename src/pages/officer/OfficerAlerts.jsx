import React, { useState, useEffect } from 'react';
import { toast } from '../../components/common/Toast';
import {
  getOfficerAlertsApi,
  acknowledgeOfficerAlertApi,
  resolveOfficerAlertApi,
  addOfficerNoteApi,
  API_BASE_URL
} from '../../services/api';
import { IconAlertTriangle, IconRefresh, IconSearch, IconCheck } from '../../components/common/Icons';

export default function OfficerAlerts() {
  const [scope, setScope] = useState('my');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [resolveModalAlert, setResolveModalAlert] = useState(null);
  const [resolveAction, setResolveAction] = useState('INTERCEPTED');
  const [resolveComment, setResolveComment] = useState('');

  const [noteModalAlert, setNoteModalAlert] = useState(null);
  const [noteText, setNoteText] = useState('');

  const loadAlerts = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await getOfficerAlertsApi({
        scope: scope,
        status: status !== 'all' ? status : undefined,
        search: search.trim() || undefined,
        page: page,
        limit: 24
      });

      if (res.success && res.data) {
        setAlerts(res.data);
        setTotalCount(res.pagination?.total || res.data.length);
      }
    } catch (err) {
      console.error('Failed to load officer alerts:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts(true);
  }, [scope, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAlerts(true);
  };

  // 1-Click Acknowledge Alert
  const handleAcknowledge = async (alertId) => {
    try {
      const res = await acknowledgeOfficerAlertApi(alertId, 'Patrol unit acknowledged. En route.');
      if (res.success) {
        toast.success(`Alert #${alertId} Acknowledged`, 'Unit Dispatched');
        loadAlerts(false);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to acknowledge alert.', 'Action Failed');
    }
  };

  // Submit Resolution
  const handleSubmitResolve = async () => {
    if (!resolveModalAlert) return;
    try {
      const res = await resolveOfficerAlertApi(resolveModalAlert.id, {
        action_taken: resolveAction,
        comment: resolveComment.trim() || 'Action completed on field.'
      });

      if (res.success) {
        toast.success(`Alert #${resolveModalAlert.id} marked resolved with action: ${resolveAction}`, 'Alert Closed');
        setResolveModalAlert(null);
        setResolveComment('');
        loadAlerts(false);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to resolve alert.', 'Resolution Failed');
    }
  };

  // Submit Field Note
  const handleSubmitNote = async () => {
    if (!noteModalAlert || !noteText.trim()) return;
    try {
      const res = await addOfficerNoteApi(noteModalAlert.id, noteText.trim());
      if (res.success) {
        toast.success('Field note added to incident record.', 'Note Saved');
        setNoteModalAlert(null);
        setNoteText('');
        loadAlerts(false);
      }
    } catch (err) {
      toast.error(err.message || 'Error updating alert notes.', 'Failed to Save Note');
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
        {/* Header Controls (Clean White Card) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">AI Vision Edge Alerts Feed</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time automated incident detection across vehicle ANPR and threat sensors
              </p>
            </div>
          </div>

          {/* Scope Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-1 gap-1">
            <button
              onClick={() => {
                setScope('my');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                scope === 'my'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👤 My Unit & Actions Only
            </button>

            <button
              onClick={() => {
                setScope('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                scope === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 Entire Fleet Grid
            </button>
          </div>
        </div>

        {/* Filter Bar & Search (Clean White Card) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-1 flex-wrap">
            <button
              onClick={() => {
                setStatus('all');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                status === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => {
                setStatus('O');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                status === 'O' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Open (Response Needed)
            </button>
            <button
              onClick={() => {
                setStatus('A');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                status === 'A' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Acknowledged
            </button>
            <button
              onClick={() => {
                setStatus('C');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                status === 'C' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter plate, comment, location..."
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 outline-none w-56 focus:w-64 focus:bg-white focus:border-blue-600 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={() => loadAlerts(true)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
              title="Refresh Stream"
            >
              <IconRefresh size={15} />
            </button>
          </form>
        </div>

        {/* Alerts Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-400 bg-white border border-slate-200 rounded-xl shadow-xs">
            Loading AI Vision threat alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col items-center gap-2">
            <span className="text-3xl">🛡️</span>
            <span className="font-semibold text-sm text-slate-700">No alerts found for current criteria.</span>
            <span className="text-xs text-slate-500">All sector patrol sectors are reporting nominal conditions.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
            {alerts.map((a) => {
              const isCritical = a.is_stolen_hit == 1 || a.alerttype?.includes('STOLEN');
              const imgUrl = `${API_BASE_URL}/api/officer/alerts/${a.id}/image`;

              return (
                <div
                  key={a.id}
                  className={`bg-white border rounded-xl overflow-hidden flex flex-col transition-all shadow-xs hover:shadow-md ${
                    isCritical
                      ? 'border-red-400 ring-1 ring-red-400/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Snapshot Image with Direct Binary Stream */}
                  <div className="h-48 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={`Alert #${a.id}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://placehold.co/600x340/0f172a/38bdf8?text=PATROL360+AI+FRAME';
                      }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs ${
                          a.status === 'O'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : a.status === 'A'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {a.status_label || (a.status === 'O' ? 'Open' : a.status === 'A' ? 'Acknowledged' : 'Closed')}
                      </span>

                      {isCritical && (
                        <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded animate-pulse shadow-xs">
                          🚨 STOLEN HIT
                        </span>
                      )}

                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {a.alerttype || 'ALERT'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
                      ID #{a.id}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1 gap-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="bg-amber-100 text-slate-950 font-black font-mono px-2.5 py-0.5 rounded border border-amber-300 text-sm tracking-wide">
                        {a.scanned_vehicle_numberplate || 'PLATE UNKNOWN'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{a.createtime}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        Patrol Unit: <strong className="text-slate-900">{a.vehicle_id}</strong>
                      </div>
                      <div>
                        Camera: <strong className="text-slate-900">{a.camera_id}</strong>
                      </div>
                      <div className="col-span-2 truncate">
                        Location: <strong className="text-slate-900">{a.location || 'Patrol Grid'}</strong>
                      </div>
                    </div>

                    {a.comment && (
                      <div className="bg-blue-50/60 border-s-2 border-blue-500 px-2.5 py-1.5 rounded text-[11px] text-slate-700 line-clamp-2">
                        {a.comment}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                      {a.status === 'O' && (
                        <button
                          onClick={() => handleAcknowledge(a.id)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          ✋ Acknowledge
                        </button>
                      )}

                      {a.status !== 'C' ? (
                        <button
                          onClick={() => {
                            setResolveModalAlert(a);
                            setResolveComment('');
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          ✅ Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold py-1">
                          Resolved: {a.action_taken || 'Completed'}
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setNoteModalAlert(a);
                          setNoteText('');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
                        title="Add field note"
                      >
                        📝 Note
                      </button>

                      {a.lat && a.lon && (
                        <a
                          href={`https://www.google.com/maps?q=${a.lat},${a.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-slate-200"
                          title="Open Map Location"
                        >
                          📍
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalCount > 24 && (
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs">
            <span className="text-slate-500">
              Showing Page <strong className="text-slate-900">{page}</strong> of{' '}
              <strong className="text-slate-900">{Math.ceil(totalCount / 24)}</strong> ({totalCount} total alerts)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= Math.ceil(totalCount / 24)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RESOLVE ALERT MODAL (Clean Professional White) */}
      {resolveModalAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold text-lg">✅</span>
                <h3 className="font-bold text-sm text-slate-900">Resolve Field Incident #{resolveModalAlert.id}</h3>
              </div>
              <button
                onClick={() => setResolveModalAlert(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 mb-3">
              Target Vehicle: <strong className="font-mono text-slate-900">{resolveModalAlert.scanned_vehicle_numberplate}</strong>
              <br />
              Alert Type: <strong className="text-slate-900">{resolveModalAlert.alerttype}</strong>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Interception / Outcome Action:</label>
                <select
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="INTERCEPTED">INTERCEPTED • Vehicle Stopped & Detained</option>
                  <option value="VERIFIED_CLEAR">VERIFIED_CLEAR • Checked, Suspect Cleared</option>
                  <option value="FALSE_POSITIVE">FALSE_POSITIVE • Plate Read Mistake / OCR Mismatch</option>
                  <option value="ESCAPED_FORWARDED">ESCAPED_FORWARDED • Fled, Forwarded to Next Sector</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Officer On-Scene Remarks:</label>
                <textarea
                  rows={3}
                  value={resolveComment}
                  onChange={(e) => setResolveComment(e.target.value)}
                  placeholder="Detail outcome, officers involved, chassis cross-check..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalAlert(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitResolve}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NOTE MODAL (Clean Professional White) */}
      {noteModalAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-900 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">📝</span>
                <h3 className="font-bold text-sm text-slate-900">Add Field Log Note to #{noteModalAlert.id}</h3>
              </div>
              <button
                onClick={() => setNoteModalAlert(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter tactical observation, vehicle direction of travel, driver description..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalAlert(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitNote}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Append Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
