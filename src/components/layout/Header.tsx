import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Server,
  UserCheck,
  ChevronDown,
  Bell,
  Search,
  RefreshCw,
  LogOut,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  WifiOff
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenQuickScan?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenQuickScan }) => {
  const { currentUser, userAccounts, switchUser, alerts, computers, runNetworkDiscovery, isScanningNetwork } = useLabNet();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const onlineCount = computers.filter(c => c.status === 'online').length;

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    computers: 'Computer Inventory',
    discovery: 'Network Discovery',
    software: 'Software Management',
    history: 'Installation Audit History',
    deployment: 'Bulk Deployment Wizard',
    schedules: 'Scheduled Updates',
    labs: 'Laboratory Facilities',
    alerts: 'Alerts & System Events',
    reports: 'Compliance Reports',
    users: 'Role-Based Access Control',
    settings: 'System Configuration'
  };

  return (
    <header className="h-16 bg-[#0B111E] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-6 shrink-0 z-30">
      {/* Zone 1: Brand title & Context */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Server className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
            LabNet<span className="text-cyan-400">Pro</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 pl-3 border-l border-slate-800">
          <span>College Systems</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-medium">{tabLabels[currentTab] || 'Console'}</span>
        </div>
      </div>

      {/* Zone 2: Navigation / Telemetry quick indicators (single line) */}
      <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span className="font-mono tabular-nums text-slate-200">{onlineCount}</span>
          <span>/</span>
          <span className="font-mono tabular-nums">{computers.length} Online</span>
        </div>

        <button
          onClick={() => setCurrentTab('alerts')}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
        >
          <Bell className="w-3.5 h-3.5 text-slate-400" />
          <span>Alerts</span>
          {unreadAlertsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={runNetworkDiscovery}
          disabled={isScanningNetwork}
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors disabled:opacity-50"
          title="Run quick subnet scan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanningNetwork ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isScanningNetwork ? 'Scanning...' : 'Sync Subnets'}</span>
        </button>
      </div>

      {/* Zone 3: Primary Action & Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(prev => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-xs text-left"
          >
            <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center justify-center text-[11px]">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-slate-200 font-medium truncate max-w-[110px]">{currentUser.name}</div>
              <div className="text-[10px] text-cyan-400/90 truncate max-w-[110px]">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-[#0F172A] border border-slate-700/80 shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1.5 mb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block">Switch Active Role (Demo)</span>
                Simulate different permission levels
              </div>

              {userAccounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => {
                    switchUser(account.id);
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors ${
                    account.id === currentUser.id
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium truncate">{account.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{account.role}</div>
                  </div>
                  {account.id === currentUser.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between px-2 text-[10px] text-slate-400">
                <span>Academic Fall 2026</span>
                <span className="text-cyan-400">Metro State Univ</span>
              </div>
            </div>
          )}
        </div>

        <PWAInstallButton />

        <button
          onClick={() => setCurrentTab('deployment')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <span>Deploy Software</span>
        </button>
      </div>
    </header>
  );
};
