import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { ScheduledUpdate } from '../../types';
import {
  CalendarClock,
  Plus,
  Play,
  Pause,
  Clock,
  Building2,
  Package,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  X,
  Sliders,
  Calendar
} from 'lucide-react';

export const SchedulesView: React.FC = () => {
  const {
    scheduledUpdates,
    softwarePackages,
    laboratories,
    computers,
    createScheduledUpdate,
    cancelSchedule,
    runScheduleNow,
    currentUser,
    showToast
  } = useLabNet();

  const [modalOpen, setModalOpen] = useState(false);

  // New Schedule Form State
  const [title, setTitle] = useState('');
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(softwarePackages[0]?.id || '');
  const [targetVersion, setTargetVersion] = useState(softwarePackages[0]?.approvedVersion || '');
  const [targetLabId, setTargetLabId] = useState(laboratories[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState('2026-10-29');
  const [scheduledTime, setScheduledTime] = useState('02:00 AM');
  const [maintenanceWindow, setMaintenanceWindow] = useState('02:00 AM – 04:30 AM');
  const [pilotCanaryCount, setPilotCanaryCount] = useState(1);
  const [batchSize, setBatchSize] = useState(4);
  const [retryPolicy, setRetryPolicy] = useState('3 retries, exponential backoff (10m)');
  const [rebootRequired, setRebootRequired] = useState(false);

  const handleSoftwareChange = (id: string) => {
    setSelectedSoftwareId(id);
    const sw = softwarePackages.find(s => s.id === id);
    if (sw) setTargetVersion(sw.approvedVersion);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sw = softwarePackages.find(s => s.id === selectedSoftwareId);
    if (!sw) return;

    const targetComputers = computers.filter(c => c.labId === targetLabId).map(c => c.id);

    createScheduledUpdate({
      title: title || `${sw.name} Maintenance Update`,
      softwareId: sw.id,
      softwareName: sw.name,
      targetVersion: targetVersion || sw.approvedVersion,
      targetLabIds: [targetLabId],
      targetComputerIds: targetComputers,
      scheduledDate,
      scheduledTime,
      maintenanceWindow,
      pilotCanaryCount,
      batchSize,
      retryPolicy,
      rebootRequired,
      createdBy: currentUser.name
    });

    setModalOpen(false);
    setTitle('');
  };

  const upcomingSchedules = scheduledUpdates.filter(s => s.status === 'scheduled' || s.status === 'running');
  const completedSchedules = scheduledUpdates.filter(s => s.status === 'completed' || s.status === 'paused' || s.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-cyan-400" />
            Scheduled Maintenance & Software Rollouts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automate off-hours package updates during designated college maintenance windows with canary pilot verification
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Update</span>
        </button>
      </div>

      {/* Upcoming Schedules */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Active & Upcoming Schedules ({upcomingSchedules.length})</span>
        </h3>

        {upcomingSchedules.length === 0 ? (
          <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-8 text-center text-xs text-slate-400">
            No active schedules queued. Click "Schedule New Update" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {upcomingSchedules.map(sched => (
              <div
                key={sched.id}
                className="bg-[#0B111E] border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-100 text-sm">{sched.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                      v{sched.targetVersion}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                      {sched.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1.5 font-mono text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {sched.scheduledDate} at {sched.scheduledTime}
                    </span>
                    <span>Window: <span className="font-mono text-slate-300">{sched.maintenanceWindow}</span></span>
                    <span>Targets: <span className="font-mono text-slate-300">{sched.targetComputerIds.length} PCs</span></span>
                    <span>Pilot Canary: <span className="font-mono text-emerald-400">{sched.pilotCanaryCount} Systems</span></span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Created by {sched.createdBy} · Policy: {sched.retryPolicy} · {sched.rebootRequired ? 'Reboot Required' : 'No Reboot'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => runScheduleNow(sched.id)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Bypass schedule and execute immediately"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run Now</span>
                  </button>
                  <button
                    onClick={() => cancelSchedule(sched.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium border border-slate-700 transition-colors"
                  >
                    Pause
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed & Historical Schedules */}
      <div className="space-y-3 pt-3">
        <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Completed & Archived Maintenance Tasks ({completedSchedules.length})</span>
        </h3>

        <div className="bg-[#0B111E] border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono">
                <th className="py-2.5 px-4">Task Name</th>
                <th className="py-2.5 px-4">Software & Version</th>
                <th className="py-2.5 px-4">Execution Window</th>
                <th className="py-2.5 px-4">Targets</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Initiator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {completedSchedules.map(sched => (
                <tr key={sched.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-200">{sched.title}</td>
                  <td className="py-3 px-4 font-mono text-cyan-300">{sched.softwareName} v{sched.targetVersion}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{sched.scheduledDate} ({sched.maintenanceWindow})</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{sched.targetComputerIds.length} PCs</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 font-mono uppercase">
                      {sched.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{sched.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-xl bg-[#0B111E] border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-cyan-400" />
                Configure Scheduled Software Rollout
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-300 font-medium">Schedule Title</label>
              <input
                type="text"
                placeholder="e.g. AutoCAD 2025.1 Engineering Rollout"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Software Package & Version */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Software Package</label>
                <select
                  value={selectedSoftwareId}
                  onChange={e => handleSoftwareChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {softwarePackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Target Version</label>
                <input
                  type="text"
                  value={targetVersion}
                  onChange={e => setTargetVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Target Lab */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-300 font-medium">Target Laboratory Facility</label>
              <select
                value={targetLabId}
                onChange={e => setTargetLabId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {laboratories.map(lab => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name} ({lab.building}, {lab.room})
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Execution Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Start Time & Window</label>
                <input
                  type="text"
                  value={maintenanceWindow}
                  onChange={e => setMaintenanceWindow(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Pilot Canary & Batch Size */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Pilot Canary Workstations</label>
                <select
                  value={pilotCanaryCount}
                  onChange={e => setPilotCanaryCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200"
                >
                  <option value={1}>1 Canary Machine</option>
                  <option value={2}>2 Canary Machines</option>
                  <option value={0}>No Pilot (Direct Rollout)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Batch Concurrency Size</label>
                <select
                  value={batchSize}
                  onChange={e => setBatchSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded font-mono text-slate-200"
                >
                  <option value={2}>2 PCs per batch</option>
                  <option value={4}>4 PCs per batch</option>
                  <option value={8}>8 PCs per batch</option>
                </select>
              </div>
            </div>

            {/* Reboot Policy Checkbox */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={rebootRequired}
                onChange={e => setRebootRequired(e.target.checked)}
                className="rounded text-cyan-500 focus:ring-0"
              />
              <span>Force automatic reboot if installation requires kernel/driver restart</span>
            </label>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold"
              >
                Schedule Deployment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
