import React, { useState } from 'react';
import { ShieldAlert, Info, X } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>DEMO MODE ACTIVE</span>
          <span className="text-amber-400/60 hidden sm:inline">· Simulated lab agents & network telemetry</span>
        </span>
        <button
          onClick={() => setDismissed(false)}
          className="text-amber-400 hover:text-amber-200 underline text-[11px]"
        >
          View System Notice
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider text-[10px] border border-amber-500/30">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            Simulation Environment
          </span>
          <p className="text-slate-300 text-xs">
            <strong className="text-white">College Project Demonstration:</strong> LabNet Pro is operating in simulated mode with 28 virtual academic workstations. No physical packets are transmitted over unauthorized networks.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Agent Protocol: <span className="text-slate-300 font-mono">v2.4.1 (Simulated)</span>
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            title="Minimize banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
