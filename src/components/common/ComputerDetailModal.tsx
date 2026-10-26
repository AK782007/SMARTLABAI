import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { Computer } from '../../types';
import {
  X,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Power,
  RotateCw,
  Zap,
  Package,
  Activity,
  CheckCircle2,
  AlertTriangle,
  History,
  Terminal,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface ComputerDetailModalProps {
  computer: Computer;
  onClose: () => void;
}

export const ComputerDetailModal: React.FC<ComputerDetailModalProps> = ({ computer, onClose }) => {
  const { powerAction, updateSoftwareOnComputer, historyEvents, softwarePackages, showToast } = useLabNet();
  const [activeTab, setActiveTab] = useState<'overview' | 'software' | 'diagnostics' | 'logs'>('overview');
  const [pingRunning, setPingRunning] = useState(false);
  const [pingResults, setPingResults] = useState<string[] | null>(null);

  const computerHistory = historyEvents.filter(h => h.computerId === computer.id);

  const handleRunPing = () => {
    setPingRunning(true);
    setPingResults(['Initiating ICMP Echo Request to ' + computer.ip + '...']);

    setTimeout(() => {
      setPingResults(prev => [...(prev || []), 'Reply from ' + computer.ip + ': bytes=32 time=0.48ms TTL=64']);
    }, 400);

    setTimeout(() => {
      setPingResults(prev => [...(prev || []), 'Reply from ' + computer.ip + ': bytes=32 time=0.39ms TTL=64']);
    }, 800);

    setTimeout(() => {
      setPingResults(prev => [...(prev || []), 'Reply from ' + computer.ip + ': bytes=32 time=0.52ms TTL=64']);
    }, 1200);

    setTimeout(() => {
      setPingResults(prev => [
        ...(prev || []),
        '--- ' + computer.ip + ' ping statistics ---',
        '3 packets transmitted, 3 received, 0% packet loss, rtt min/avg/max = 0.39/0.46/0.52 ms',
        'Status: Subnet link nominal · Agent latency normal'
      ]);
      setPingRunning(false);
      showToast(`Ping diagnostic completed for ${computer.hostname}`, 'success');
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-[#0B111E] border border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${computer.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono tracking-tight">{computer.hostname}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {computer.ip}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                  computer.status === 'online' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' : 'text-slate-400 bg-slate-800'
                }`}>
                  {computer.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {computer.labName} · {computer.seatNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => powerAction(computer.id, 'reboot')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Remote restart"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reboot</span>
            </button>
            <button
              onClick={() => powerAction(computer.id, 'toggle_power')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Toggle power state"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span>{computer.status === 'online' ? 'Power Off' : 'Power On'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-[#080C15] shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            System Specifications
          </button>
          <button
            onClick={() => setActiveTab('software')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'software'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Installed Packages</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {computer.installedSoftware.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors ${
              activeTab === 'diagnostics'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnostics & Ping
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Audit History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {computerHistory.length}
            </span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Telemetry Gauge Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Utilization
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold">{computer.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        computer.cpuUsage > 80 ? 'bg-rose-500' : computer.cpuUsage > 60 ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${computer.cpuUsage}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5 font-mono truncate">
                    {computer.cpuModel}
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-indigo-400" /> RAM Memory
                    </span>
                    <span className="font-mono text-indigo-400 font-semibold">{computer.ramUsagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${computer.ramUsagePercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    {computer.ramUsedGb} GB / {computer.ramTotalGb} GB Allocated
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> NVMe Storage
                    </span>
                    <span className={`font-mono font-semibold ${computer.diskUsagePercent > 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {computer.diskUsagePercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        computer.diskUsagePercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${computer.diskUsagePercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                    {computer.diskUsedGb} GB / {computer.diskTotalGb} GB Used
                  </div>
                </div>
              </div>

              {/* Hardware & Network Specs Grid */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hardware & Network Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Operating System:</span>
                    <span className="text-slate-200">{computer.os} ({computer.osArchitecture})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Physical MAC Address:</span>
                    <span className="text-cyan-300">{computer.mac}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Connection Link:</span>
                    <span className="text-slate-200 flex items-center gap-1.5">
                      {computer.connectionType === 'Ethernet' ? <Server className="w-3.5 h-3.5 text-emerald-400" /> : <Wifi className="w-3.5 h-3.5 text-cyan-400" />}
                      {computer.connectionSpeed}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Installed Agent Version:</span>
                    <span className="text-slate-200">{computer.agentVersion}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">System Uptime:</span>
                    <span className="text-slate-200">{computer.uptimeHours} Hours Continuous</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Last Heartbeat:</span>
                    <span className="text-slate-200">{computer.lastSeen}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'software' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Showing software managed by LabNet Pro Agent daemon
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {computer.installedSoftware.filter(s => s.needsUpdate).length} updates available
                </span>
              </div>

              <div className="space-y-2">
                {computer.installedSoftware.map(sw => {
                  const masterPkg = softwarePackages.find(p => p.id === sw.softwareId);

                  return (
                    <div
                      key={sw.softwareId}
                      className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Package className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{sw.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Installed: <span className="text-slate-300">{sw.installedVersion}</span> · Latest Approved: <span className="text-cyan-300">{sw.latestVersion}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Publisher: {masterPkg?.publisher || 'System'} · Added: {sw.installDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {sw.needsUpdate ? (
                          <button
                            onClick={() => updateSoftwareOnComputer(computer.id, sw.softwareId)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded text-xs transition-colors shadow-xs"
                          >
                            Update to {sw.latestVersion}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Up to date
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">ICMP Subnet Connectivity Diagnostic</h4>
                    <p className="text-xs text-slate-400">Send simulated ping test to verify network interface health</p>
                  </div>
                  <button
                    onClick={handleRunPing}
                    disabled={pingRunning}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Radio className={`w-3.5 h-3.5 ${pingRunning ? 'animate-spin' : ''}`} />
                    <span>{pingRunning ? 'Pinging...' : 'Start Ping Test'}</span>
                  </button>
                </div>

                {pingResults && (
                  <div className="bg-black/80 rounded-lg p-3 font-mono text-xs text-emerald-400 space-y-1 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Diagnostics Console Output (Simulated)</span>
                    </div>
                    {pingResults.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">{line}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Power / WoL options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <h5 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Wake-on-LAN Broadcast
                  </h5>
                  <p className="text-slate-400 mb-3 text-[11px]">
                    Transmit Layer 2 Ethernet magic packet directly to physical MAC {computer.mac}.
                  </p>
                  <button
                    onClick={() => powerAction(computer.id, 'wake_on_lan')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700 font-medium"
                  >
                    Send Magic Packet
                  </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                  <h5 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> Clean Operating System Reboot
                  </h5>
                  <p className="text-slate-400 mb-3 text-[11px]">
                    Instructs the agent daemon to execute graceful shutdown and reboot sequence.
                  </p>
                  <button
                    onClick={() => powerAction(computer.id, 'reboot')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700 font-medium"
                  >
                    Trigger System Reboot
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Installation and maintenance events logged for {computer.hostname}:
              </div>

              {computerHistory.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 text-center text-xs text-slate-400">
                  No previous audit events recorded for this machine.
                </div>
              ) : (
                <div className="space-y-2">
                  {computerHistory.map(hist => (
                    <div
                      key={hist.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs space-y-1 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 font-sans">
                          {hist.softwareName} · {hist.eventType}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                          hist.result === 'Success' ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                        }`}>
                          {hist.result}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {hist.previousVersion} → {hist.newVersion} · Admin: {hist.adminUser} ({hist.adminRole})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {hist.timestamp} · {hist.logDetails}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Agent ID: <span className="font-mono text-slate-300">{computer.id}</span></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
