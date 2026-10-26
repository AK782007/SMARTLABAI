import React, { useState, useMemo } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { AlertItem, AlertSeverity } from '../../types';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  Check,
  ShieldAlert,
  Bell
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, acknowledgeAlert, dismissAlert, clearResolvedAlerts, exportToCsv, setSelectedComputer, computers } = useLabNet();

  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterState, setFilterState] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSeverity = selectedSeverity === 'all' || a.severity === selectedSeverity;
      const matchState =
        filterState === 'all' ||
        (filterState === 'unacknowledged' && !a.acknowledged) ||
        (filterState === 'acknowledged' && a.acknowledged);

      const matchSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sourceName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSeverity && matchState && matchSearch;
    });
  }, [alerts, selectedSeverity, filterState, searchQuery]);

  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;
  const infoCount = alerts.filter(a => a.severity === 'info' && !a.acknowledged).length;

  const handleExportAlerts = () => {
    const headers = ['Alert ID', 'Severity', 'Title', 'Message', 'Source Endpoint', 'Timestamp', 'Acknowledged'];
    const rows = filteredAlerts.map(a => [
      a.id,
      a.severity.toUpperCase(),
      a.title,
      a.message,
      a.sourceName,
      a.timestamp,
      a.acknowledged ? 'YES' : 'NO'
    ]);
    exportToCsv('labnet_security_system_alerts', headers, rows);
  };

  const handleInspectMachine = (compId?: string) => {
    if (!compId) return;
    const comp = computers.find(c => c.id === compId);
    if (comp) setSelectedComputer(comp);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Alerts & System Incident Notifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry threshold anomalies, offline states, and software deployment failures
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearResolvedAlerts}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Resolved</span>
          </button>
          <button
            onClick={handleExportAlerts}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Export Log
          </button>
        </div>
      </div>

      {/* Severity Tally Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedSeverity === 'critical'
              ? 'border-rose-500 bg-rose-950/40 shadow-sm'
              : 'border-slate-800 bg-[#0B111E] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" /> Critical Severity
            </span>
            <span className="font-mono text-sm">{criticalCount} Active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Disk storage &lt; 5%, deployment crashes, rogue wireless nodes
          </p>
        </div>

        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'warning' ? 'all' : 'warning')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedSeverity === 'warning'
              ? 'border-amber-500 bg-amber-950/40 shadow-sm'
              : 'border-slate-800 bg-[#0B111E] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Warning Severity
            </span>
            <span className="font-mono text-sm">{warningCount} Active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            High RAM utilization, heartbeat timeouts, outdated package versions
          </p>
        </div>

        <div
          onClick={() => setSelectedSeverity(selectedSeverity === 'info' ? 'all' : 'info')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedSeverity === 'info'
              ? 'border-cyan-500 bg-cyan-950/40 shadow-sm'
              : 'border-slate-800 bg-[#0B111E] hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" /> Information & Scheduled
            </span>
            <span className="font-mono text-sm">{infoCount} Active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Maintenance windows, scan completions, agent registrations
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert title, endpoint..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Information Only</option>
          </select>

          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Alert States</option>
            <option value="unacknowledged">Unacknowledged Only</option>
            <option value="acknowledged">Acknowledged Only</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-12 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No active alerts matching your criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.acknowledged
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : isCrit
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : isWarn
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-cyan-950/20 border-cyan-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          isCrit
                            ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            : isWarn
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                      {alert.acknowledged && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 font-mono flex-wrap">
                      <span>Source: <strong className="text-slate-200">{alert.sourceName}</strong></span>
                      {alert.labName && <span>Facility: {alert.labName}</span>}
                      <span>Logged: {alert.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs">
                    {alert.computerId && (
                      <button
                        onClick={() => handleInspectMachine(alert.computerId)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 font-medium"
                      >
                        Inspect PC
                      </button>
                    )}

                    {!alert.acknowledged ? (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded"
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
