import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import {
  Send,
  Package,
  Monitor,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCw,
  XCircle,
  FileText,
  Sliders,
  Play,
  HardDrive,
  WifiOff,
  Gauge,
  Server
} from 'lucide-react';

interface DeploymentViewProps {
  initialSoftwareId?: string;
  initialTargetIds?: string[];
}

export const DeploymentView: React.FC<DeploymentViewProps> = ({
  initialSoftwareId,
  initialTargetIds
}) => {
  const {
    softwarePackages,
    computers,
    laboratories,
    activeDeployment,
    startBulkDeployment,
    cancelActiveDeployment,
    showToast
  } = useLabNet();

  const { isMetered, isAirGapped, meteredState, recordBandwidthUsage } = useNetworkStatus();

  // Wizard Steps: 1: Package, 2: Targets, 3: Options, 4: Review/Launch
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string>(
    initialSoftwareId || softwarePackages[0]?.id || ''
  );
  const [targetVersion, setTargetVersion] = useState<string>('');
  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [selectedComputerIds, setSelectedComputerIds] = useState<string[]>(
    initialTargetIds || []
  );

  // Deployment configuration options
  const [silentMode, setSilentMode] = useState(true);
  const [preDiskCheck, setPreDiskCheck] = useState(true);
  const [rebootPolicy, setRebootPolicy] = useState<'never' | 'if_needed' | 'force'>('if_needed');
  const [batchSize, setBatchSize] = useState<number>(4);

  const selectedSoftware = softwarePackages.find(s => s.id === selectedSoftwareId) || softwarePackages[0];

  // Set default target version if not set
  React.useEffect(() => {
    if (selectedSoftware && !targetVersion) {
      setTargetVersion(selectedSoftware.approvedVersion);
    }
  }, [selectedSoftware, targetVersion]);

  // Handle Lab Selection shortcut
  const handleSelectLabMachines = (labId: string) => {
    if (labId === 'all') {
      setSelectedComputerIds(computers.map(c => c.id));
    } else {
      const labComputers = computers.filter(c => c.labId === labId).map(c => c.id);
      setSelectedComputerIds(labComputers);
    }
  };

  const handleToggleComputer = (compId: string) => {
    setSelectedComputerIds(prev =>
      prev.includes(compId) ? prev.filter(id => id !== compId) : [...prev, compId]
    );
  };

  const handleLaunch = () => {
    if (selectedComputerIds.length === 0) {
      showToast('Please select at least one workstation', 'warning');
      return;
    }
    const totalPayloadMb = selectedSoftware.packageSizeMb * selectedComputerIds.length;
    if (meteredState.localCacheActive) {
      recordBandwidthUsage(totalPayloadMb, true);
      showToast(`Served ${(totalPayloadMb / 1024).toFixed(2)} GB via Local LAN Staging Cache (0 WAN bytes used)`, 'success');
    } else {
      recordBandwidthUsage(totalPayloadMb, false);
    }
    startBulkDeployment(selectedSoftware.id, targetVersion || selectedSoftware.approvedVersion, selectedComputerIds);
  };

  // If there is an active deployment currently executing or just finished, show the Live Monitor
  if (activeDeployment) {
    const tasks = Object.values(activeDeployment.tasks);
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const failedCount = tasks.filter(t => t.status === 'failed').length;
    const inProgressCount = tasks.filter(t => t.status === 'downloading' || t.status === 'installing').length;

    return (
      <div className="space-y-6">
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Live Deployment Monitor: {activeDeployment.softwareName}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  v{activeDeployment.targetVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Started at {activeDeployment.startTime} across {tasks.length} targeted workstations
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!activeDeployment.isCompleted && !activeDeployment.isCancelled && (
                <button
                  onClick={cancelActiveDeployment}
                  className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Abort Deployment
                </button>
              )}
              {activeDeployment.isCompleted && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Start New Rollout
                </button>
              )}
            </div>
          </div>

          {/* Overall Progress Meter */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">
                {activeDeployment.isCompleted
                  ? 'All target installations finalized'
                  : 'Distributing packages to local agent queues...'}
              </span>
              <span className="text-cyan-400 font-bold">{activeDeployment.overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${activeDeployment.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Status tally counters */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-xs font-mono">
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">In Progress</span>
              <span className="text-cyan-400 font-bold text-base">{inProgressCount}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Verified Completed</span>
              <span className="text-emerald-400 font-bold text-base">{completedCount}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Failed / Offline</span>
              <span className="text-rose-400 font-bold text-base">{failedCount}</span>
            </div>
          </div>
        </div>

        {/* Individual Computer Tasks Table */}
        <div className="bg-[#0B111E] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 text-xs font-semibold text-slate-300">
            Target System Progress Breakdown ({tasks.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono">
                  <th className="py-2.5 px-4 font-semibold text-slate-300">Target Hostname</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-300">Laboratory</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-300">Phase & Log</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-300">Progress</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-300 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {tasks.map(task => {
                  return (
                    <tr key={task.computerId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-100">{task.hostname}</td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{task.labName}</td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          {task.status === 'downloading' || task.status === 'installing' ? (
                            <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                          ) : task.status === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : task.status === 'failed' ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-[11px] truncate max-w-sm">{task.currentStepMessage}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 w-40">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              task.status === 'completed'
                                ? 'bg-emerald-500'
                                : task.status === 'failed'
                                ? 'bg-rose-500'
                                : 'bg-cyan-500'
                            }`}
                            style={{ width: `${task.progressPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            task.status === 'completed'
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : task.status === 'failed'
                              ? 'text-rose-400 bg-rose-950/60'
                              : 'text-cyan-300 bg-cyan-950/60'
                          }`}
                        >
                          {task.status}
                        </span>
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
  }

  // Otherwise, render the 4-step deployment wizard
  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-400" />
          Bulk Software Deployment Pipeline
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Stage, test, and distribute verified software packages silently to targeted college workstations
        </p>

        {/* Wizard Step Indicator */}
        <div className="grid grid-cols-4 gap-2 mt-5 text-xs font-medium">
          {[
            { num: 1, label: 'Select Package' },
            { num: 2, label: 'Target Systems' },
            { num: 3, label: 'Rollout Options' },
            { num: 4, label: 'Review & Launch' }
          ].map(st => (
            <div
              key={st.num}
              onClick={() => st.num < currentStep && setCurrentStep(st.num)}
              className={`p-2 rounded-lg border flex items-center gap-2 transition-colors ${
                currentStep === st.num
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                  : currentStep > st.num
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                currentStep === st.num
                  ? 'bg-cyan-500 text-slate-950'
                  : currentStep > st.num
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {currentStep > st.num ? '✓' : st.num}
              </span>
              <span className="truncate hidden sm:inline">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Package Selection */}
      {currentStep === 1 && (
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Select Approved Software Package</h3>
            <span className="text-xs text-slate-400">Step 1 of 4</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
            {softwarePackages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => {
                  setSelectedSoftwareId(pkg.id);
                  setTargetVersion(pkg.approvedVersion);
                }}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedSoftwareId === pkg.id
                    ? 'border-cyan-500 bg-cyan-950/30 shadow-md'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-100 text-xs">{pkg.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    v{pkg.approvedVersion}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pkg.description}</p>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>Size: {pkg.packageSizeMb} MB</span>
                  <span>{pkg.licenseType}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
            >
              <span>Next: Choose Target Workstations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Target Selection */}
      {currentStep === 2 && (
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Select Target Systems</h3>
              <p className="text-xs text-slate-400">
                Deploying <strong className="text-cyan-300">{selectedSoftware.name} v{targetVersion}</strong>
              </p>
            </div>
            <span className="text-xs text-slate-400">Step 2 of 4</span>
          </div>

          {/* Quick select lab buttons */}
          <div className="flex gap-2 flex-wrap text-xs">
            <button
              onClick={() => handleSelectLabMachines('all')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium"
            >
              Select All Labs ({computers.length})
            </button>
            {laboratories.map(lab => (
              <button
                key={lab.id}
                onClick={() => handleSelectLabMachines(lab.id)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded"
              >
                {lab.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedComputerIds([])}
              className="px-3 py-1.5 bg-transparent text-slate-400 hover:text-slate-200 text-xs"
            >
              Clear Selection
            </button>
          </div>

          {/* Workstations Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1 font-mono text-xs">
            {computers.map(comp => {
              const isSelected = selectedComputerIds.includes(comp.id);
              const isOffline = comp.status === 'offline';

              return (
                <div
                  key={comp.id}
                  onClick={() => handleToggleComputer(comp.id)}
                  className={`p-2.5 rounded border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{comp.hostname}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${comp.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                    {comp.labName.replace(' Laboratory', '').replace(' Lab', '')}
                  </div>
                  {isOffline && (
                    <div className="text-[9px] text-rose-400 font-sans mt-1">Host Offline</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
            >
              Back
            </button>
            <div className="text-slate-400">
              <strong className="text-white font-mono">{selectedComputerIds.length}</strong> computers selected
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={selectedComputerIds.length === 0}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <span>Next: Execution Options</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Deployment Options */}
      {currentStep === 3 && (
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Configure Rollout Policies</h3>
            <span className="text-xs text-slate-400">Step 3 of 4</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Silent Mode */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={silentMode}
                onChange={e => setSilentMode(e.target.checked)}
                className="mt-0.5 rounded text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Silent Background Execution</span>
                <span className="text-slate-400 text-[11px]">
                  Execute installer with quiet unattended switches (no user prompts or desktop popups)
                </span>
              </div>
            </label>

            {/* Pre-installation Disk Check */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={preDiskCheck}
                onChange={e => setPreDiskCheck(e.target.checked)}
                className="mt-0.5 rounded text-cyan-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Pre-Installation Storage Validation</span>
                <span className="text-slate-400 text-[11px]">
                  Verify target NVMe has at least {selectedSoftware.packageSizeMb * 3} MB free prior to extracting payload
                </span>
              </div>
            </label>

            {/* Reboot Policy */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-200 block">Post-Deployment Reboot Policy</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'never', label: 'Do Not Reboot' },
                  { id: 'if_needed', label: 'Reboot If Required' },
                  { id: 'force', label: 'Force Clean Restart' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setRebootPolicy(opt.id as any)}
                    className={`py-2 px-3 rounded text-center border transition-colors ${
                      rebootPolicy === opt.id
                        ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-semibold'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Concurrency */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Rollout Batch Size (Concurrency)</span>
                <span className="text-slate-400 text-[11px]">Prevent network saturation on local access switch</span>
              </div>
              <select
                value={batchSize}
                onChange={e => setBatchSize(Number(e.target.value))}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded font-mono text-cyan-300"
              >
                <option value={2}>2 PCs per wave</option>
                <option value={4}>4 PCs per wave</option>
                <option value={8}>8 PCs per wave</option>
                <option value={16}>16 PCs per wave</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <span>Next: Review Deployment Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review and Deploy */}
      {currentStep === 4 && (
        <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Review & Execute Deployment Plan</h3>
            <span className="text-xs text-slate-400">Step 4 of 4</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-y-2 font-mono">
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Software:</span>
                <span className="text-white font-bold">{selectedSoftware.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Target Version:</span>
                <span className="text-cyan-400 font-bold">v{targetVersion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Target Computers:</span>
                <span className="text-white">{selectedComputerIds.length} Workstations</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Execution Mode:</span>
                <span className="text-slate-200">{silentMode ? 'Silent Unattended' : 'Interactive'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Generated execution CLI payload:
              <div className="bg-black/80 p-2 rounded mt-1 font-mono text-emerald-400">
                {selectedSoftware.silentInstallCommand}
              </div>
            </div>

            {/* Metered / Air-Gapped Network Policy Box */}
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              isAirGapped
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                : isMetered
                ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              {isAirGapped ? (
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : isMetered ? (
                <HardDrive className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              ) : (
                <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-semibold block text-slate-100">
                  {isAirGapped
                    ? 'Air-Gapped Offline Network Deployment'
                    : isMetered
                    ? 'Wired Metered Network Protection Active'
                    : 'Campus Unmetered High-Speed Fiber'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {isAirGapped
                    ? 'Workstations will pull package payloads strictly over the local laboratory Gigabit switch. External WAN access is disabled.'
                    : isMetered && meteredState.localCacheActive
                    ? `Payloads will be fetched via Local On-Premises Cache Appliance (${meteredState.localCacheServerUrl}). Zero external WAN egress will be charged against your ${meteredState.monthlyCapGb} GB monthly cap.`
                    : 'Packages will be fetched from primary software vendor distribution CDNs.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleLaunch}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Bulk Deployment Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
