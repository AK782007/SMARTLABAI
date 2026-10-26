import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, suppress button
  if (isInstalled) {
    return null;
  }

  // Desktop / Android / Chromium install prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg shadow-sm transition-all whitespace-nowrap"
        title="Install LabNet Pro locally for offline desktop / mobile access"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span>Install PWA App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#0B111E] border border-slate-700 p-5 shadow-2xl text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white text-sm">Install LabNet Pro on iOS</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> icon in the Safari navigation bar.<br />
                2. Scroll down and choose <strong className="text-cyan-400">Add to Home Screen</strong>.<br />
                3. The console will now launch in standalone offline mode.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
