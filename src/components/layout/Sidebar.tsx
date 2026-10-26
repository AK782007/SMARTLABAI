import React from 'react';
import { useLabNet } from '../../context/LabNetContext';
import {
  LayoutDashboard,
  Monitor,
  Radio,
  Package,
  History,
  Send,
  CalendarClock,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Settings,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { computers, softwarePackages, alerts, scheduledUpdates, isScanningNetwork } = useLabNet();

  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const pendingUpdatesCount = computers.reduce((acc, c) => {
    return acc + c.installedSoftware.filter(s => s.needsUpdate).length;
  }, 0);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'computers',
      label: 'Computers',
      icon: Monitor,
      badge: `${computers.length}`,
      badgeColor: 'text-slate-400 bg-slate-800'
    },
    {
      id: 'discovery',
      label: 'Network Discovery',
      icon: Radio,
      badge: isScanningNetwork ? 'Scanning' : 'Active',
      badgeColor: isScanningNetwork ? 'text-cyan-400 bg-cyan-950/80 animate-pulse' : 'text-slate-400 bg-slate-800'
    },
    {
      id: 'software',
      label: 'Software Catalog',
      icon: Package,
      badge: pendingUpdatesCount > 0 ? `${pendingUpdatesCount} updates` : `${softwarePackages.length}`,
      badgeColor: pendingUpdatesCount > 0 ? 'text-amber-400 bg-amber-950/60' : 'text-slate-400 bg-slate-800'
    },
    {
      id: 'history',
      label: 'Installation Audit',
      icon: History,
      badge: null
    },
    {
      id: 'deployment',
      label: 'Bulk Deployment',
      icon: Send,
      badge: null
    },
    {
      id: 'schedules',
      label: 'Scheduled Updates',
      icon: CalendarClock,
      badge: scheduledUpdates.filter(s => s.status === 'scheduled').length ? `${scheduledUpdates.filter(s => s.status === 'scheduled').length}` : null,
      badgeColor: 'text-cyan-400 bg-cyan-950/80'
    },
    {
      id: 'labs',
      label: 'Laboratories',
      icon: Building2,
      badge: '4 Labs',
      badgeColor: 'text-slate-400 bg-slate-800'
    },
    {
      id: 'alerts',
      label: 'Alerts & Events',
      icon: AlertTriangle,
      badge: unreadAlerts > 0 ? `${unreadAlerts}` : null,
      badgeColor: criticalAlerts > 0 ? 'text-rose-400 bg-rose-950/80 font-bold' : 'text-amber-400 bg-amber-950/80'
    },
    {
      id: 'reports',
      label: 'Reports & Exports',
      icon: FileSpreadsheet,
      badge: 'CSV',
      badgeColor: 'text-emerald-400 bg-emerald-950/60'
    },
    {
      id: 'users',
      label: 'User Roles & RBAC',
      icon: Users,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null
    }
  ];

  const handleSelect = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#090E1A] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Navigation Console
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shrink-0 ${
                      item.badgeColor || 'text-slate-400 bg-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom facility info badge */}
        <div className="p-3 border-t border-slate-800/70 bg-[#070A12] text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
            <span className="truncate">Metro State Campus</span>
            <span className="text-[10px] font-mono text-cyan-400">VLAN 101-104</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            4 Labs · 28 Managed Workstations · Agent v2.4.1
          </p>
        </div>
      </aside>
    </>
  );
};
