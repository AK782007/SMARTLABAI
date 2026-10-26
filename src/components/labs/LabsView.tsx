import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { Laboratory } from '../../types';
import {
  Building2,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
  User,
  Clock,
  Network,
  FileSpreadsheet,
  ArrowRight,
  Send
} from 'lucide-react';

interface LabsViewProps {
  onSelectLabComputers: (labId: string) => void;
  onOpenDeployForLab?: (labId: string) => void;
}

export const LabsView: React.FC<LabsViewProps> = ({ onSelectLabComputers, onOpenDeployForLab }) => {
  const { laboratories, computers, setSelectedComputer, exportToCsv } = useLabNet();
  const [activeLabId, setActiveLabId] = useState<string>(laboratories[0]?.id || 'lab-cs');

  const activeLab = laboratories.find(l => l.id === activeLabId) || laboratories[0];
  const labComputers = computers.filter(c => c.labId === activeLabId);

  const onlineCount = labComputers.filter(c => c.status === 'online').length;
  const offlineCount = labComputers.filter(c => c.status === 'offline').length;
  const needingUpdatesCount = labComputers.filter(c => c.installedSoftware.some(s => s.needsUpdate)).length;

  const avgCpu = Math.round(
    labComputers.reduce((acc, c) => acc + c.cpuUsage, 0) / (labComputers.length || 1)
  );
  const avgRam = Math.round(
    labComputers.reduce((acc, c) => acc + c.ramUsagePercent, 0) / (labComputers.length || 1)
  );

  const handleExportLabCsv = (lab: Laboratory) => {
    const comps = computers.filter(c => c.labId === lab.id);
    const headers = ['Hostname', 'IP Address', 'MAC', 'Seat', 'OS', 'Status', 'CPU %', 'RAM %', 'Disk %', 'Uptime (Hours)'];
    const rows = comps.map(c => [
      c.hostname,
      c.ip,
      c.mac,
      c.seatNumber,
      c.os,
      c.status,
      c.cpuUsage,
      c.ramUsagePercent,
      c.diskUsagePercent,
      c.uptimeHours
    ]);
    exportToCsv(`${lab.code}_workstations_audit`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          Laboratory Facilities & Spatial Allocation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor workstation deployments, physical seating, and subnet routing across 4 departmental academic laboratories
        </p>
      </div>

      {/* Lab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {laboratories.map(lab => {
          const comps = computers.filter(c => c.labId === lab.id);
          const online = comps.filter(c => c.status === 'online').length;
          const isSelected = activeLabId === lab.id;

          return (
            <div
              key={lab.id}
              onClick={() => setActiveLabId(lab.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-lg'
                  : 'border-slate-800 bg-[#0B111E] hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                    {lab.code}
                  </span>
                  <h3 className="font-bold text-white text-sm mt-0.5">{lab.name}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  VLAN {lab.vlanId}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mt-2 font-mono">
                {lab.building} · {lab.room}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Active Online</span>
                  <span className="text-emerald-400 font-bold">
                    {online} / {comps.length} PCs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Capacity</span>
                  <span className="text-slate-200 font-bold">{lab.capacity} Seats</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Lab Detail & Seating Layout */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {activeLab.code}
              </span>
              <h3 className="text-lg font-bold text-white">{activeLab.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Faculty in Charge: <strong className="text-slate-300">{activeLab.facultyInCharge}</strong> · {activeLab.operatingHours}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportLabCsv(activeLab)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lab CSV</span>
            </button>

            {onOpenDeployForLab && (
              <button
                onClick={() => onOpenDeployForLab(activeLab.id)}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Deploy to Lab</span>
              </button>
            )}
          </div>
        </div>

        {/* Technical Specification Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] font-sans block">Subnet Scope</span>
            <span className="text-cyan-300 font-bold">{activeLab.subnetRange}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-sans block">Default Gateway</span>
            <span className="text-slate-200">{activeLab.gateway}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-sans block">Fleet CPU Load</span>
            <span className="text-slate-200">{avgCpu}% Average</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-sans block">Fleet RAM Allocation</span>
            <span className="text-slate-200">{avgRam}% Average</span>
          </div>
        </div>

        {/* Visual Seating Workstation Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Assigned Workstations Layout ({labComputers.length} Systems)</span>
            </h4>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online ({onlineCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600" /> Offline ({offlineCount})
              </span>
              {needingUpdatesCount > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Needs Patch ({needingUpdatesCount})
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {labComputers.map(comp => {
              const needsUpdate = comp.installedSoftware.some(s => s.needsUpdate);

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedComputer(comp)}
                  className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-lg p-3 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-100 text-xs truncate">
                      {comp.hostname}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        comp.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    />
                  </div>

                  <div className="text-[11px] font-mono text-slate-400">
                    <div>{comp.ip}</div>
                    <div className="text-[10px] text-slate-400 font-sans truncate">{comp.seatNumber}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">CPU {comp.cpuUsage}%</span>
                    <span className="text-slate-400">RAM {comp.ramUsagePercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
