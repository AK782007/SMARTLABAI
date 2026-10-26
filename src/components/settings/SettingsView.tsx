import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import {
  Settings,
  Building2,
  Network,
  Cpu,
  ShieldCheck,
  Save,
  RotateCcw,
  Sliders,
  HardDrive,
  Bell,
  Gauge,
  Server,
  WifiOff
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllDemoData, showToast } = useLabNet();

  const [form, setForm] = useState({ ...settings });

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          System Settings & Campus Policies
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure institutional parameters, daemon polling cadences, subnet discovery rules, and data retention windows
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Institutional Information */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Institution & Department Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Institution / University Name</label>
              <input
                type="text"
                value={form.institutionName}
                onChange={e => handleChange('institutionName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Department / Academic School</label>
              <input
                type="text"
                value={form.departmentName}
                onChange={e => handleChange('departmentName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Active Academic Term</label>
              <input
                type="text"
                value={form.academicTerm}
                onChange={e => handleChange('academicTerm', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Agent Daemon Telemetry & Security */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Agent Daemon Registration & Security</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Heartbeat Interval (Seconds)</label>
              <input
                type="number"
                value={form.agentHeartbeatSeconds}
                onChange={e => handleChange('agentHeartbeatSeconds', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400">Heartbeat poll interval for online/offline detection</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Bandwidth Throttling Limit (Mbps)</label>
              <input
                type="number"
                value={form.bandwidthThrottlingMbps}
                onChange={e => handleChange('bandwidthThrottlingMbps', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400">Maximum concurrent payload download pipe</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Default Maintenance Window</label>
              <input
                type="text"
                value={form.defaultMaintenanceWindow}
                onChange={e => handleChange('defaultMaintenanceWindow', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400">Permitted off-hours automated reboot slot</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoApproveRegisteredMacs}
                onChange={e => handleChange('autoApproveRegisteredMacs', e.target.checked)}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span>Automatically approve detected MAC addresses if matching campus inventory database</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailAlertsEnabled}
                onChange={e => handleChange('emailAlertsEnabled', e.target.checked)}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span>Dispatch immediate email alerts to system administrators on Critical events</span>
            </label>
          </div>
        </div>

        {/* Section: Wired Metered Network & Local Staging Appliance */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span>Wired Metered Network & Offline Staging Cache</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium font-sans">Operating Uplink Profile</label>
              <select
                value={form.meteredNetwork?.mode || 'wired_metered'}
                onChange={e => handleChange('meteredNetwork', { ...form.meteredNetwork, mode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-cyan-300 font-sans focus:outline-none focus:border-cyan-500"
              >
                <option value="wired_metered">Wired Metered Ethernet (Bandwidth Capped)</option>
                <option value="offline_airgapped">Air-Gapped / Offline Local LAN</option>
                <option value="unmetered_fiber">Unmetered Campus Fiber</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium font-sans">Monthly Metered Data Budget (GB)</label>
              <input
                type="number"
                value={form.meteredNetwork?.monthlyCapGb || 50}
                onChange={e => handleChange('meteredNetwork', { ...form.meteredNetwork, monthlyCapGb: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 font-sans">Threshold quota before throttling WAN packages</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium font-sans">Block WAN Downloads Above (MB)</label>
              <input
                type="number"
                value={form.meteredNetwork?.blockWanPackagesAboveMb || 250}
                onChange={e => handleChange('meteredNetwork', { ...form.meteredNetwork, blockWanPackagesAboveMb: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 font-sans">Requires local cache for packages larger than this</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="space-y-1 font-mono">
              <label className="text-slate-300 font-medium font-sans">Local On-Premises Cache Appliance URL</label>
              <input
                type="text"
                value={form.meteredNetwork?.localCacheServerUrl || 'http://10.10.1.5:8080/repo/packages'}
                onChange={e => handleChange('meteredNetwork', { ...form.meteredNetwork, localCacheServerUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 font-sans">Workstations pull software packages over 1 Gbps wired LAN from this appliance</span>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.meteredNetwork?.localCacheActive ?? true}
                onChange={e => handleChange('meteredNetwork', { ...form.meteredNetwork, localCacheActive: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span>Route all bulk software distributions through local on-premises staging appliance (0 external bytes)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.meteredNetwork?.throttleTelemetryOnMetered ?? true}
                onChange={e => handleChange('meteredNetwork', { ...form.meteredNetwork, throttleTelemetryOnMetered: e.target.checked })}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span>Reduce agent telemetry polling frequency from 15s to 60s when metered connection is active</span>
            </label>
          </div>
        </div>

        {/* Section 4: Data Retention & Audit Logs */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Audit Trail & Data Retention</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Audit Log Retention (Days)</label>
              <input
                type="number"
                value={form.dataRetentionDays}
                onChange={e => handleChange('dataRetentionDays', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400">Events older than this will be automatically archived to cold storage</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-slate-200 block mb-1">Local Browser Storage Persistence</strong>
              All demonstration changes are stored locally in the browser's persistent storage engine, ensuring changes survive page refreshes.
            </div>
          </div>
        </div>

        {/* Save and Reset Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={resetAllDemoData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors self-start"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data to Initial State</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-md self-end"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
