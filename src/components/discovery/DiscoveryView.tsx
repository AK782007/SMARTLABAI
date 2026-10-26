import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { DiscoveredDevice } from '../../types';
import {
  Radio,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Server,
  Wifi,
  Plus,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Network,
  Cpu,
  ArrowRight
} from 'lucide-react';

export const DiscoveryView: React.FC = () => {
  const {
    discoveredDevices,
    isScanningNetwork,
    scanProgress,
    scanStage,
    runNetworkDiscovery,
    authorizeDevice,
    importDeviceToInventory,
    laboratories,
    settings,
    updateSettings,
    showToast
  } = useLabNet();

  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null);
  const [targetLabId, setTargetLabId] = useState<string>(laboratories[0]?.id || 'lab-cs');
  const [subnetInput, setSubnetInput] = useState<string>('10.10.5.0/24');
  const [pingTargetIp, setPingTargetIp] = useState<string>('10.10.1.101');
  const [diagLog, setDiagLog] = useState<string[]>([
    'Layer 2 ARP broadcast gateway: 10.10.1.1 (Cisco Catalyst 3850)',
    'Subnet mask 255.255.255.0 verified with 0 collisions.',
    'Ready for live probe sequence.'
  ]);
  const [runningDiag, setRunningDiag] = useState(false);

  const registeredCount = discoveredDevices.filter(d => d.status === 'registered').length;
  const authorizedCount = discoveredDevices.filter(d => d.status === 'authorized_unregistered').length;
  const rogueCount = discoveredDevices.filter(d => d.status === 'rogue_unknown').length;

  const handleRunDiagnostics = () => {
    setRunningDiag(true);
    setDiagLog(prev => [...prev, `Starting packet analysis against ${pingTargetIp}...`]);

    setTimeout(() => {
      setDiagLog(prev => [...prev, `[ICMP] Echo reply from ${pingTargetIp}: seq=1 bytes=64 ttl=64 time=0.42ms`]);
    }, 400);

    setTimeout(() => {
      setDiagLog(prev => [...prev, `[TCP-SYN] Port 22 (SSH) OPEN · Port 8443 (Agent) OPEN · Port 80 CLOSED`]);
    }, 900);

    setTimeout(() => {
      setDiagLog(prev => [
        ...prev,
        `[SUMMARY] Jitter: 0.08ms · Packet Loss: 0.0% · MTU: 1500 bytes · Bandwidth: ~940 Mbps negotiated`
      ]);
      setRunningDiag(false);
      showToast(`Diagnostics finished for ${pingTargetIp}`, 'success');
    }, 1400);
  };

  const handleAddSubnet = () => {
    if (!subnetInput.trim()) return;
    if (settings.discoverySubnets.includes(subnetInput.trim())) {
      showToast('Subnet already configured', 'warning');
      return;
    }
    updateSettings({ discoverySubnets: [...settings.discoverySubnets, subnetInput.trim()] });
    showToast(`Added subnet ${subnetInput.trim()} to discovery pool`, 'success');
    setSubnetInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Disclaimer */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400" />
              Network Discovery & Host Probing
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active Layer 2 ARP sweeps and Layer 3 ICMP discovery across authorized engineering and computer science subnets
            </p>
          </div>

          <button
            onClick={runNetworkDiscovery}
            disabled={isScanningNetwork}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isScanningNetwork ? 'animate-spin' : ''}`} />
            <span>{isScanningNetwork ? 'Running Discovery Sweep...' : 'Trigger Full Subnet Scan'}</span>
          </button>
        </div>

        {/* Scan Progress Bar */}
        {isScanningNetwork && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                {scanStage}
              </span>
              <span className="text-slate-300 font-bold">{scanProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Transparent Demo Disclaimer */}
        <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Demonstration Mode Protocol:</strong> Network discovery operates with simulated ARP tables and fictional telemetry. No raw socket packets are broadcast to physical university backbones without local agent deployment.
          </p>
        </div>
      </div>

      {/* Discovery Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Total Probed Hosts</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {discoveredDevices.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across configured subnets</div>
        </div>

        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Registered Workstations</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {registeredCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active agent daemon linked</div>
        </div>

        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Authorized Non-Agent Nodes</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {authorizedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">IoT sensors, switches & printers</div>
        </div>

        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Rogue / Unidentified MACs</div>
          <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${rogueCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {rogueCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires admin authorization</div>
        </div>
      </div>

      {/* Subnet Configuration & Diagnostics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subnet Scopes & Scan Settings */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              Configured Subnet Scopes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Subnets scanned during periodic discovery</p>
          </div>

          <div className="space-y-2">
            {settings.discoverySubnets.map((sub, idx) => (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded p-2 text-xs flex items-center justify-between font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-200">{sub}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">VLAN {101 + idx}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="text-[11px] text-slate-400 block">Add New Authorized CIDR Subnet</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="10.10.x.0/24"
                value={subnetInput}
                onChange={e => setSubnetInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAddSubnet}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors"
              >
                Add Scope
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Diagnostics Console */}
        <div className="lg:col-span-2 bg-[#0B111E] border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Network Layer Connection Diagnostics
                </h3>
                <p className="text-xs text-slate-400">Low-latency TCP/ICMP packet latency tester</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pingTargetIp}
                  onChange={e => setPingTargetIp(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 w-32 focus:outline-none focus:border-cyan-500"
                  placeholder="Target IP"
                />
                <button
                  onClick={handleRunDiagnostics}
                  disabled={runningDiag}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Activity className={`w-3.5 h-3.5 text-cyan-400 ${runningDiag ? 'animate-spin' : ''}`} />
                  <span>Test Route</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Log Window */}
            <div className="bg-black/85 rounded-lg p-3 font-mono text-xs text-cyan-300 space-y-1 h-36 overflow-y-auto border border-slate-800/80">
              {diagLog.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-slate-400 mr-2">{`>`}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
            <span>Diagnostic Gateway: <span className="font-mono text-slate-300">10.10.1.1</span></span>
            <span className="text-emerald-400">Full-Duplex Wire Verified</span>
          </div>
        </div>
      </div>

      {/* Discovered Device Inventory Table */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Discovered Devices & Endpoints ({discoveredDevices.length})
            </h3>
            <p className="text-xs text-slate-400">
              Physical endpoints detected through active ARP cache and port scans
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Registered
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Authorized
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Rogue
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono">
                <th className="py-2.5 px-4 font-semibold text-slate-300">IP Address</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">MAC / OUI Vendor</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">Hostname / Label</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">Link Type</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">Detected OS / Firmware</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">Open Ports</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">RTT</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300">Status</th>
                <th className="py-2.5 px-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {discoveredDevices.map((dev, idx) => {
                const isRogue = dev.status === 'rogue_unknown';
                const isAuthorized = dev.status === 'authorized_unregistered';
                const isRegistered = dev.status === 'registered';

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {/* IP */}
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{dev.ip}</td>

                    {/* MAC & Vendor */}
                    <td className="py-3 px-4 text-slate-300">
                      <div>{dev.mac}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{dev.vendor}</div>
                    </td>

                    {/* Hostname */}
                    <td className="py-3 px-4 font-semibold text-slate-100">{dev.hostname}</td>

                    {/* Link */}
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <span className="flex items-center gap-1.5">
                        {dev.connectionType === 'Ethernet' ? (
                          <Server className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        <span>{dev.connectionType}</span>
                        {dev.signalDbm && (
                          <span className="text-[10px] font-mono text-slate-400">({dev.signalDbm}dBm)</span>
                        )}
                      </span>
                    </td>

                    {/* OS */}
                    <td className="py-3 px-4 font-sans text-slate-300">{dev.detectedOs}</td>

                    {/* Open Ports */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex gap-1 flex-wrap">
                        {dev.openPorts.map(p => (
                          <span key={p} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-300">
                            :{p}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Response Time */}
                    <td className="py-3 px-4 text-slate-300 tabular-nums">{dev.responseTimeMs} ms</td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isRegistered
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/20'
                            : isAuthorized
                            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/20'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isRegistered ? 'Registered' : isAuthorized ? 'Authorized' : 'Rogue Alert'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        {isRogue && (
                          <button
                            onClick={() => authorizeDevice(dev.mac)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] font-medium border border-slate-700 transition-colors"
                          >
                            Authorize
                          </button>
                        )}

                        {!isRegistered && (
                          <button
                            onClick={() => importDeviceToInventory(dev, targetLabId)}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Lab</span>
                          </button>
                        )}

                        {isRegistered && (
                          <span className="text-[11px] text-slate-400">In Fleet</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
