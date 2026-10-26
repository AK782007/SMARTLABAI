import React, { useState } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import {
  WifiOff,
  Server,
  HardDrive,
  Gauge,
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { NetworkMode } from '../../types';

export const MeteredNetworkBar: React.FC = () => {
  const {
    isBrowserOnline,
    isMetered,
    isAirGapped,
    meteredState,
    setNetworkMode,
    updateMeteredSettings
  } = useNetworkStatus();

  const [modalOpen, setModalOpen] = useState(false);
  const [cacheTestStatus, setCacheTestStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  const percentUsed = Math.round((meteredState.usedBandwidthGb / (meteredState.monthlyCapGb || 1)) * 100);

  const handleTestCacheServer = () => {
    setCacheTestStatus('testing');
    setTimeout(() => {
      setCacheTestStatus('success');
      setTimeout(() => setCacheTestStatus('idle'), 3000);
    }, 900);
  };

  return (
    <>
      {/* Strip bar indicating metered / offline status */}
      <div className={`px-4 py-2 border-b text-xs transition-colors ${
        !isBrowserOnline || isAirGapped
          ? 'bg-[#181109] border-amber-500/30 text-amber-200'
          : isMetered
          ? 'bg-[#0A1624] border-cyan-500/30 text-cyan-200'
          : 'bg-[#0B111E] border-slate-800 text-slate-300'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Left: Current Network Mode & Cap Meter */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                !isBrowserOnline || isAirGapped
                  ? 'bg-amber-400 animate-pulse'
                  : isMetered
                  ? 'bg-cyan-400'
                  : 'bg-emerald-400'
              }`} />
              <span className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono">
                {!isBrowserOnline
                  ? 'OFFLINE (Local Browser Cache)'
                  : isAirGapped
                  ? 'AIR-GAPPED / OFFLINE LAN'
                  : isMetered
                  ? 'WIRED METERED NETWORK'
                  : 'CAMPUS UNMETERED FIBER'}
              </span>
            </div>

            {isMetered && isBrowserOnline && (
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono pl-3 border-l border-slate-700/80">
                <span>Bandwidth Budget:</span>
                <span className={`font-bold ${percentUsed > 80 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {meteredState.usedBandwidthGb} GB / {meteredState.monthlyCapGb} GB ({percentUsed}%)
                </span>
                {/* Mini progress bar */}
                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden inline-block">
                  <div
                    className={`h-full ${percentUsed > 80 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Local cache savings indicator */}
            {meteredState.localCacheActive && (
              <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono pl-3 border-l border-slate-700/80">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local LAN Cache: <strong>{meteredState.bandwidthSavedByCacheGb} GB</strong> WAN saved</span>
              </span>
            )}
          </div>

          {/* Right: Mode Switcher Quick Dropdown & Settings modal button */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            {/* Quick Segmented Mode Buttons */}
            <div className="flex bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setNetworkMode('wired_metered')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  meteredState.mode === 'wired_metered' && isBrowserOnline
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Metered
              </button>
              <button
                onClick={() => setNetworkMode('offline_airgapped')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  meteredState.mode === 'offline_airgapped' || !isBrowserOnline
                    ? 'bg-amber-500/20 text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Air-Gapped / Offline
              </button>
              <button
                onClick={() => setNetworkMode('unmetered_fiber')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  meteredState.mode === 'unmetered_fiber' && isBrowserOnline
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unmetered
              </button>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              <span>Policies</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metered Network & Offline Policies Configuration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#0B111E] border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Metered Network & Offline Configuration</h3>
                  <p className="text-xs text-slate-400">Campus bandwidth budgeting and air-gapped laboratory staging</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-200">Active Uplink Operating Profile</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'wired_metered' as NetworkMode,
                    title: 'Wired Metered',
                    desc: 'Capped WAN bandwidth, enforces local LAN package cache.'
                  },
                  {
                    id: 'offline_airgapped' as NetworkMode,
                    title: 'Air-Gapped / Offline',
                    desc: 'Zero external WAN egress. Local subnet management only.'
                  },
                  {
                    id: 'unmetered_fiber' as NetworkMode,
                    title: 'Unmetered Fiber',
                    desc: 'Standard gigabit fiber with no throttling or download limits.'
                  }
                ].map(prof => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => setNetworkMode(prof.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      meteredState.mode === prof.id
                        ? 'border-cyan-500 bg-cyan-950/40 text-slate-100 font-semibold shadow-xs'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs text-cyan-400 mb-1">{prof.title}</div>
                    <div className="text-[10px] text-slate-400 font-sans leading-relaxed">{prof.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Metered Quotas & Caching Options */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/60 p-4 rounded-lg border border-slate-800 font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 font-sans block text-[11px]">Monthly Metered Cap (GB)</label>
                <input
                  type="number"
                  value={meteredState.monthlyCapGb}
                  onChange={e => updateMeteredSettings({ monthlyCapGb: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-sans block text-[11px]">Recorded WAN Consumption</label>
                <div className="text-sm font-bold text-slate-200 py-1.5">
                  {meteredState.usedBandwidthGb} GB used
                </div>
              </div>
            </div>

            {/* Local Staging Cache Appliance */}
            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-400" />
                    On-Premises Local Staging Server (LAN Cache)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Caches software installers locally on campus switch so workstations download over wired LAN at 0 WAN cost
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={meteredState.localCacheActive}
                  onChange={e => updateMeteredSettings({ localCacheActive: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
              </div>

              <div className="space-y-1 font-mono">
                <label className="text-slate-400 font-sans block text-[11px]">Local Cache Appliance Endpoint</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={meteredState.localCacheServerUrl}
                    onChange={e => updateMeteredSettings({ localCacheServerUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleTestCacheServer}
                    disabled={cacheTestStatus === 'testing'}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors shrink-0"
                  >
                    {cacheTestStatus === 'testing' ? 'Probing...' : cacheTestStatus === 'success' ? 'Verified 200 OK' : 'Ping Appliance'}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-mono flex items-center justify-between">
                <span>Estimated Bandwidth Savings:</span>
                <span className="font-bold">{meteredState.bandwidthSavedByCacheGb} GB (100% LAN-served)</span>
              </div>
            </div>

            {/* Telemetry Throttling Checkbox */}
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meteredState.throttleTelemetryOnMetered}
                  onChange={e => updateMeteredSettings({ throttleTelemetryOnMetered: e.target.checked })}
                  className="mt-0.5 rounded text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Throttle Agent Heartbeat Telemetry on Metered Connections
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Reduces agent polling cadence from 15s to 60s and compresses metric payloads to preserve metered cap.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                {isBrowserOnline ? 'Physical Link: Up' : 'Physical Link: Disconnected'}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
