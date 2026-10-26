import React, { useState, useMemo } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { Computer } from '../../types';
import {
  Monitor,
  Search,
  Filter,
  Server,
  Wifi,
  Power,
  RotateCw,
  Zap,
  MoreVertical,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  Package,
  HardDrive,
  Cpu,
  Layers,
  ArrowUpDown,
  Building2
} from 'lucide-react';

interface ComputersViewProps {
  onOpenDeployWithTargets?: (computerIds: string[]) => void;
}

export const ComputersView: React.FC<ComputersViewProps> = ({ onOpenDeployWithTargets }) => {
  const { computers, laboratories, setSelectedComputer, powerAction, exportToCsv, showToast } = useLabNet();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabFilter, setSelectedLabFilter] = useState<string>('all');
  const [selectedOsFilter, setSelectedOsFilter] = useState<string>('all');
  const [selectedConnectionFilter, setSelectedConnectionFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtered and sorted computers
  const filteredComputers = useMemo(() => {
    return computers.filter(comp => {
      const matchSearch =
        comp.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.ip.includes(searchQuery) ||
        comp.mac.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLab = selectedLabFilter === 'all' || comp.labId === selectedLabFilter;
      const matchOs = selectedOsFilter === 'all' || comp.os.includes(selectedOsFilter);
      const matchConn = selectedConnectionFilter === 'all' || comp.connectionType === selectedConnectionFilter;
      const matchStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'online' && comp.status === 'online') ||
        (selectedStatusFilter === 'offline' && comp.status === 'offline') ||
        (selectedStatusFilter === 'needs_update' && comp.installedSoftware.some(s => s.needsUpdate));

      return matchSearch && matchLab && matchOs && matchConn && matchStatus;
    });
  }, [computers, searchQuery, selectedLabFilter, selectedOsFilter, selectedConnectionFilter, selectedStatusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredComputers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredComputers.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleExportSelected = () => {
    const list = selectedIds.length > 0 ? computers.filter(c => selectedIds.includes(c.id)) : filteredComputers;
    const headers = ['Hostname', 'IP Address', 'MAC', 'Operating System', 'Lab', 'Connection', 'Status', 'CPU %', 'RAM %', 'Disk %', 'Last Seen'];
    const rows = list.map(c => [
      c.hostname,
      c.ip,
      c.mac,
      c.os,
      c.labName,
      c.connectionType,
      c.status,
      c.cpuUsage,
      c.ramUsagePercent,
      c.diskUsagePercent,
      c.lastSeen
    ]);
    exportToCsv('labnet_computers_inventory', headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B111E] border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            Computer Inventory Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor, inspect, and execute remote directives across all registered college laboratory workstations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs text-cyan-300">
              <span className="font-mono font-semibold">{selectedIds.length}</span> selected
              {onOpenDeployWithTargets && (
                <button
                  onClick={() => onOpenDeployWithTargets(selectedIds)}
                  className="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium ml-1"
                >
                  Deploy Package
                </button>
              )}
            </div>
          )}

          {/* Table / Grid view switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Workstation Grid layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportSelected}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative lg:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hostname, IP, MAC..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          {/* Lab Filter */}
          <select
            value={selectedLabFilter}
            onChange={e => setSelectedLabFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Laboratories (4)</option>
            {laboratories.map(lab => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>

          {/* OS Filter */}
          <select
            value={selectedOsFilter}
            onChange={e => setSelectedOsFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Operating Systems</option>
            <option value="Ubuntu">Ubuntu Linux</option>
            <option value="Windows">Windows 11 Enterprise</option>
            <option value="Fedora">Fedora Linux</option>
            <option value="macOS">macOS</option>
          </select>

          {/* Connection Filter */}
          <select
            value={selectedConnectionFilter}
            onChange={e => setSelectedConnectionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Connections</option>
            <option value="Ethernet">Wired Ethernet</option>
            <option value="Wi-Fi">Wireless Wi-Fi</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All States</option>
            <option value="online">Online Only</option>
            <option value="offline">Offline Only</option>
            <option value="needs_update">Requires Update</option>
          </select>
        </div>

        {/* Count summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-200 font-mono">{filteredComputers.length}</strong> of{' '}
              <span className="font-mono">{computers.length}</span> computers
            </span>
            {filteredComputers.length !== computers.length && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLabFilter('all');
                  setSelectedOsFilter('all');
                  setSelectedConnectionFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                Reset filters
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Click any computer row to inspect hardware & software details
          </span>
        </div>
      </div>

      {/* Main View: Table Mode */}
      {viewMode === 'table' ? (
        <div className="bg-[#0B111E] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 select-none">
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {selectedIds.length === filteredComputers.length && filteredComputers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 font-semibold text-slate-300">Hostname</th>
                  <th className="py-3 px-3 font-semibold text-slate-300">IP / MAC Address</th>
                  <th className="py-3 px-3 font-semibold text-slate-300">Laboratory Facility</th>
                  <th className="py-3 px-3 font-semibold text-slate-300">Operating System</th>
                  <th className="py-3 px-3 font-semibold text-slate-300">Link</th>
                  <th className="py-3 px-3 font-semibold text-slate-300">Status</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-right">CPU / RAM Load</th>
                  <th className="py-3 px-3 font-semibold text-slate-300">Last Seen</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredComputers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-sans">
                      No computers found matching current filter query.
                    </td>
                  </tr>
                ) : (
                  filteredComputers.map(comp => {
                    const isSelected = selectedIds.includes(comp.id);
                    const needsUpdate = comp.installedSoftware.some(s => s.needsUpdate);

                    return (
                      <tr
                        key={comp.id}
                        onClick={() => setSelectedComputer(comp)}
                        className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/25' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-2.5 px-3 text-center"
                          onClick={e => toggleSelectOne(comp.id, e)}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400 inline" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 inline hover:text-slate-300" />
                          )}
                        </td>

                        {/* Hostname */}
                        <td className="py-2.5 px-3 font-semibold text-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span>{comp.hostname}</span>
                            {needsUpdate && (
                              <span
                                className="w-2 h-2 rounded-full bg-amber-400"
                                title="Pending updates available"
                              />
                            )}
                          </div>
                        </td>

                        {/* IP & MAC */}
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                          <div className="text-cyan-400">{comp.ip}</div>
                          <div className="text-[10px] text-slate-400">{comp.mac}</div>
                        </td>

                        {/* Laboratory */}
                        <td className="py-2.5 px-3 font-sans text-slate-300 whitespace-nowrap">
                          <div>{comp.labName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{comp.seatNumber}</div>
                        </td>

                        {/* OS */}
                        <td className="py-2.5 px-3 font-sans text-slate-300 whitespace-nowrap">
                          <div>{comp.os}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{comp.osArchitecture}</div>
                        </td>

                        {/* Link */}
                        <td className="py-2.5 px-3 font-sans whitespace-nowrap">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            {comp.connectionType === 'Ethernet' ? (
                              <Server className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span className="text-xs">{comp.connectionType}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 font-sans whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                              comp.status === 'online'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                comp.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'
                              }`}
                            />
                            {comp.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </td>

                        {/* CPU / RAM */}
                        <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                          <div className="text-slate-200">
                            CPU: <span className={comp.cpuUsage > 80 ? 'text-rose-400 font-bold' : 'text-cyan-400'}>{comp.cpuUsage}%</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            RAM: {comp.ramUsagePercent}% ({comp.ramUsedGb}GB)
                          </div>
                        </td>

                        {/* Last Seen */}
                        <td className="py-2.5 px-3 font-sans text-slate-400 whitespace-nowrap text-[11px]">
                          {comp.lastSeen}
                        </td>

                        {/* Quick Directives */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-sans">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => powerAction(comp.id, 'reboot')}
                              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                              title="Reboot workstation"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => powerAction(comp.id, 'toggle_power')}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Toggle power state"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Workstation Physical Seating Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredComputers.map(comp => {
            const isSelected = selectedIds.includes(comp.id);
            const needsUpdate = comp.installedSoftware.some(s => s.needsUpdate);

            return (
              <div
                key={comp.id}
                onClick={() => setSelectedComputer(comp)}
                className={`bg-[#0B111E] border rounded-lg p-3.5 cursor-pointer transition-all hover:border-slate-700 ${
                  isSelected ? 'border-cyan-500 bg-cyan-950/20 shadow-md' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-slate-100 truncate text-xs flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${comp.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      {comp.hostname}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                      {comp.labName} · {comp.seatNumber}
                    </div>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                    comp.status === 'online' ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400 bg-slate-800'
                  }`}>
                    {comp.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] font-mono text-slate-300 py-2 border-y border-slate-800/70">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">IP Address:</span>
                    <span className="text-cyan-400">{comp.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">OS:</span>
                    <span className="truncate max-w-[120px]">{comp.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Link:</span>
                    <span className="flex items-center gap-1">
                      {comp.connectionType === 'Ethernet' ? <Server className="w-3 h-3 text-emerald-400" /> : <Wifi className="w-3 h-3 text-cyan-400" />}
                      {comp.connectionType}
                    </span>
                  </div>
                </div>

                {/* Progress Mini Gauges */}
                <div className="pt-2.5 space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                      <span>CPU Load</span>
                      <span className={comp.cpuUsage > 80 ? 'text-rose-400' : 'text-slate-300'}>{comp.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full" style={{ width: `${comp.cpuUsage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                      <span>RAM Memory</span>
                      <span className="text-slate-300">{comp.ramUsagePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${comp.ramUsagePercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{comp.installedSoftware.length} Software Installed</span>
                  {needsUpdate && <span className="text-amber-400 font-semibold">Updates Due</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
