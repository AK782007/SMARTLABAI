import React from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { TelemetryLineChart } from '../common/TelemetryLineChart';
import {
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Package,
  Activity,
  Send,
  Radio,
  FileSpreadsheet,
  Server,
  Wifi,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HardDrive
} from 'lucide-react';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const {
    computers,
    laboratories,
    softwarePackages,
    historyEvents,
    alerts,
    runNetworkDiscovery,
    isScanningNetwork,
    setSelectedComputer,
    acknowledgeAlert,
    exportToCsv
  } = useLabNet();

  const totalRegistered = computers.length;
  const onlineCount = computers.filter(c => c.status === 'online').length;
  const offlineCount = computers.filter(c => c.status === 'offline').length;

  const computersNeedingUpdates = computers.filter(c =>
    c.installedSoftware.some(s => s.needsUpdate)
  ).length;

  const ethernetCount = computers.filter(c => c.connectionType === 'Ethernet').length;
  const wifiCount = computers.filter(c => c.connectionType === 'Wi-Fi').length;

  const recentHistory = historyEvents.slice(0, 5);
  const activeAlerts = alerts.filter(a => !a.acknowledged).slice(0, 4);

  const handleExportQuickInventory = () => {
    const headers = ['Hostname', 'IP Address', 'MAC Address', 'Lab', 'OS', 'Connection', 'Status', 'CPU %', 'RAM %', 'Disk %', 'Last Seen'];
    const rows = computers.map(c => [
      c.hostname,
      c.ip,
      c.mac,
      c.labName,
      c.os,
      c.connectionType,
      c.status,
      `${c.cpuUsage}%`,
      `${c.ramUsagePercent}%`,
      `${c.diskUsagePercent}%`,
      c.lastSeen
    ]);
    exportToCsv('labnet_computer_inventory', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Smart Laboratory Monitoring Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized IT control for Metro State University College of Engineering and Computer Science
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={runNetworkDiscovery}
            disabled={isScanningNetwork}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Radio className={`w-3.5 h-3.5 text-cyan-400 ${isScanningNetwork ? 'animate-spin' : ''}`} />
            <span>{isScanningNetwork ? 'Scanning...' : 'Run Discovery Scan'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('deployment')}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Deploy Software</span>
          </button>

          <button
            onClick={handleExportQuickInventory}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Registered */}
        <div
          onClick={() => setCurrentTab('computers')}
          className="bg-[#0B111E] border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Registered Machines</span>
            <Monitor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {totalRegistered}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 4 campus labs
          </div>
        </div>

        {/* Online Status */}
        <div
          onClick={() => setCurrentTab('computers')}
          className="bg-[#0B111E] border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Online Workstations</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums tracking-tight">
            {onlineCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {Math.round((onlineCount / totalRegistered) * 100)}% fleet availability
          </div>
        </div>

        {/* Offline Status */}
        <div
          onClick={() => setCurrentTab('computers')}
          className="bg-[#0B111E] border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Offline Workstations</span>
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-400 tabular-nums tracking-tight">
            {offlineCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Powered down or standby
          </div>
        </div>

        {/* Pending Updates */}
        <div
          onClick={() => setCurrentTab('software')}
          className="bg-[#0B111E] border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Requiring Updates</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums tracking-tight">
            {computersNeedingUpdates}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Patches pending rollout
          </div>
        </div>

        {/* Software Catalog */}
        <div
          onClick={() => setCurrentTab('software')}
          className="bg-[#0B111E] border border-slate-800 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
            <span>Managed Packages</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {softwarePackages.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Approved campus catalog
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <TelemetryLineChart />

      {/* Grid: Network Health & Laboratory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Infrastructure Summary */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                Network Connectivity Summary
              </h3>
              <button
                onClick={() => setCurrentTab('discovery')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Subnets</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-3">
                <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                  <span className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    Wired Gigabit Ethernet
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">{ethernetCount} Systems</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500" style={{ width: `${(ethernetCount / totalRegistered) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>1.0 – 10.0 Gbps Links</span>
                  <span>Avg RTT: 0.45ms</span>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-3">
                <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                  <span className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                    Wireless Wi-Fi 6 / 6E
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">{wifiCount} Systems</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-cyan-500" style={{ width: `${(wifiCount / totalRegistered) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                  <span>802.11ax WPA3-Enterprise</span>
                  <span>Avg Signal: -58 dBm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Total Packet Loss</div>
                  <div className="font-mono font-semibold text-emerald-400 text-sm">0.02%</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Active VLANs</div>
                  <div className="font-mono font-semibold text-white text-sm">4 Segmented</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between items-center">
            <span>DHCP Scope: <span className="font-mono text-slate-300">10.10.0.0/16</span></span>
            <span className="text-emerald-400">DNS Root: Operational</span>
          </div>
        </div>

        {/* Recent Installation Activities */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recent Installation Activities
              </h3>
              <button
                onClick={() => setCurrentTab('history')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Audit Log</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentHistory.map(hist => (
                <div
                  key={hist.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5 text-xs flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-200 truncate flex items-center gap-1.5">
                      <span className="text-cyan-300">{hist.softwareName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">v{hist.newVersion}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {hist.computerHostname} · {hist.labName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      By {hist.adminUser} · {hist.timestamp.split(' ')[1]}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap shrink-0 ${
                    hist.result === 'Success'
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/20'
                      : 'text-rose-400 bg-rose-950/60 border border-rose-500/20'
                  }`}>
                    {hist.result}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
            <span>Total Logged Events: <span className="font-mono text-slate-300">{historyEvents.length}</span></span>
            <span className="text-cyan-400">Live Agent Sync</span>
          </div>
        </div>

        {/* Recent Alerts & System Events */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Alerts & Events
              </h3>
              <button
                onClick={() => setCurrentTab('alerts')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                  All lab systems nominal. Zero unacknowledged alerts.
                </div>
              ) : (
                activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-2.5 text-xs space-y-1 ${
                      alert.severity === 'critical'
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                        : alert.severity === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate text-white">{alert.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded font-bold shrink-0">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{alert.sourceName} · {alert.timestamp}</span>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-400">
            <span>Daemon Monitor: <span className="text-emerald-400 font-mono">Running</span></span>
            <span className="text-slate-400">Auto-refresh: 15s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
