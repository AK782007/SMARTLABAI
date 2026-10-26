import React, { useState, useMemo } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { HistoryEventType, HistoryResult, InstallationHistoryEvent } from '../../types';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Monitor,
  Package,
  Terminal,
  X
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { historyEvents, exportToCsv } = useLabNet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [selectedEventDetails, setSelectedEventDetails] = useState<InstallationHistoryEvent | null>(null);

  // Filter history events
  const filteredEvents = useMemo(() => {
    return historyEvents.filter(ev => {
      const matchSearch =
        ev.computerHostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.softwareName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.adminUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.labName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = selectedEventType === 'all' || ev.eventType === selectedEventType;
      const matchResult = selectedResult === 'all' || ev.result === selectedResult;

      return matchSearch && matchType && matchResult;
    });
  }, [historyEvents, searchQuery, selectedEventType, selectedResult]);

  const handleExportHistoryCsv = () => {
    const headers = ['Event ID', 'Computer Hostname', 'Laboratory', 'Software Package', 'Action', 'Previous Version', 'New Version', 'Timestamp', 'Initiating Admin', 'Admin Role', 'Result', 'Execution Log'];
    const rows = filteredEvents.map(e => [
      e.id,
      e.computerHostname,
      e.labName,
      e.softwareName,
      e.eventType,
      e.previousVersion,
      e.newVersion,
      e.timestamp,
      e.adminUser,
      e.adminRole,
      e.result,
      e.logDetails
    ]);
    exportToCsv('labnet_software_installation_audit', headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B111E] border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Software Installation Audit History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically timestamped audit log of software installs, updates, and uninstalls across all computers
          </p>
        </div>

        <button
          onClick={handleExportHistoryCsv}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Audit History CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by computer, software, admin..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={e => setSelectedEventType(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Action Types (Install / Update / Uninstall)</option>
            <option value="Installed">Installed Only</option>
            <option value="Updated">Updated Only</option>
            <option value="Uninstalled">Uninstalled Only</option>
          </select>

          {/* Result Filter */}
          <select
            value={selectedResult}
            onChange={e => setSelectedResult(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Execution Results</option>
            <option value="Success">Success (Exit 0)</option>
            <option value="Failed">Failed / Aborted</option>
            <option value="Pending">Pending Verification</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span>
            Displaying <strong className="text-slate-200 font-mono">{filteredEvents.length}</strong> recorded audit events
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Immutable audit storage retention: 90 days
          </span>
        </div>
      </div>

      {/* History Audit Table */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono select-none">
                <th className="py-3 px-4 font-semibold text-slate-300">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Target Computer</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Software Application</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Action Type</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Version Transition</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Initiating Administrator</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Execution Result</th>
                <th className="py-3 px-4 font-semibold text-slate-300 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => {
                  const isSuccess = event.result === 'Success';
                  const isFailed = event.result === 'Failed';

                  return (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEventDetails(event)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap text-[11px]">
                        {event.timestamp}
                      </td>

                      {/* Computer Hostname */}
                      <td className="py-3 px-4 font-semibold text-slate-100 whitespace-nowrap">
                        <div>{event.computerHostname}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{event.labName}</div>
                      </td>

                      {/* Software Application */}
                      <td className="py-3 px-4 font-sans text-cyan-300 whitespace-nowrap font-medium">
                        {event.softwareName}
                      </td>

                      {/* Action Type */}
                      <td className="py-3 px-4 font-sans whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          event.eventType === 'Updated'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-500/20'
                            : event.eventType === 'Installed'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-500/20'
                        }`}>
                          {event.eventType}
                        </span>
                      </td>

                      {/* Version Transition */}
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        <span className="text-slate-400">{event.previousVersion}</span>
                        <span className="mx-1 text-slate-500">→</span>
                        <span className="text-cyan-400 font-semibold">{event.newVersion}</span>
                      </td>

                      {/* Admin User */}
                      <td className="py-3 px-4 font-sans text-slate-300 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{event.adminUser}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{event.adminRole}</div>
                      </td>

                      {/* Result */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isSuccess
                            ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/20'
                            : isFailed
                            ? 'text-rose-400 bg-rose-950/60 border border-rose-500/20'
                            : 'text-amber-400 bg-amber-950/60'
                        }`}>
                          {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          <span>{event.result}</span>
                        </span>
                      </td>

                      {/* Inspect details */}
                      <td className="py-3 px-4 text-right font-sans whitespace-nowrap">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedEventDetails(event);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 underline text-xs font-medium"
                        >
                          View Log
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0B111E] border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Audit Event Log #{selectedEventDetails.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged on {selectedEventDetails.timestamp}
                </p>
              </div>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-900/60 p-3 rounded border border-slate-800">
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Workstation:</span>
                <span className="text-slate-200 font-bold">{selectedEventDetails.computerHostname}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Facility:</span>
                <span className="text-slate-200">{selectedEventDetails.labName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Application:</span>
                <span className="text-cyan-300">{selectedEventDetails.softwareName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Transition:</span>
                <span className="text-slate-200">{selectedEventDetails.previousVersion} → {selectedEventDetails.newVersion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Admin:</span>
                <span className="text-slate-200">{selectedEventDetails.adminUser}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[10px]">Result:</span>
                <span className={selectedEventDetails.result === 'Success' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {selectedEventDetails.result}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-semibold text-slate-300">Agent Raw Output & Exit Code:</span>
              <div className="bg-black/90 p-3 rounded font-mono text-xs text-emerald-400 border border-slate-800 leading-relaxed overflow-x-auto">
                {selectedEventDetails.logDetails}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
