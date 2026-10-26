import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Computer,
  Laboratory,
  SoftwarePackage,
  InstallationHistoryEvent,
  DiscoveredDevice,
  ScheduledUpdate,
  AlertItem,
  UserAccount,
  SystemSettings,
  ActiveDeploymentJob,
  DeploymentTaskProgress
} from '../types';
import {
  INITIAL_COMPUTERS,
  INITIAL_LABORATORIES,
  INITIAL_SOFTWARE_PACKAGES,
  INITIAL_HISTORY_EVENTS,
  INITIAL_DISCOVERED_DEVICES,
  INITIAL_SCHEDULED_UPDATES,
  INITIAL_ALERTS,
  INITIAL_USER_ACCOUNTS,
  INITIAL_SYSTEM_SETTINGS
} from '../data/mockData';

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface LabNetContextType {
  computers: Computer[];
  laboratories: Laboratory[];
  softwarePackages: SoftwarePackage[];
  historyEvents: InstallationHistoryEvent[];
  discoveredDevices: DiscoveredDevice[];
  scheduledUpdates: ScheduledUpdate[];
  alerts: AlertItem[];
  currentUser: UserAccount;
  userAccounts: UserAccount[];
  settings: SystemSettings;
  selectedComputer: Computer | null;
  setSelectedComputer: (c: Computer | null) => void;
  selectedLabId: string | null;
  setSelectedLabId: (id: string | null) => void;
  isScanningNetwork: boolean;
  scanProgress: number;
  scanStage: string;
  runNetworkDiscovery: () => void;
  authorizeDevice: (mac: string) => void;
  importDeviceToInventory: (device: DiscoveredDevice, targetLabId: string) => void;
  activeDeployment: ActiveDeploymentJob | null;
  startBulkDeployment: (softwareId: string, targetVersion: string, targetComputerIds: string[]) => void;
  cancelActiveDeployment: () => void;
  createScheduledUpdate: (newSchedule: Omit<ScheduledUpdate, 'id' | 'status' | 'progressPercent' | 'createdTimestamp'>) => void;
  cancelSchedule: (id: string) => void;
  runScheduleNow: (id: string) => void;
  powerAction: (computerId: string, action: 'reboot' | 'toggle_power' | 'wake_on_lan') => void;
  updateSoftwareOnComputer: (computerId: string, softwareId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  clearResolvedAlerts: () => void;
  switchUser: (userId: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllDemoData: () => void;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  exportToCsv: (filename: string, headers: string[], rows: (string | number)[][]) => void;
}

const LabNetContext = createContext<LabNetContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPUTERS: 'labnet_computers_v1',
  SOFTWARE: 'labnet_software_v1',
  HISTORY: 'labnet_history_v1',
  DEVICES: 'labnet_devices_v1',
  SCHEDULES: 'labnet_schedules_v1',
  ALERTS: 'labnet_alerts_v1',
  USER_ID: 'labnet_user_id_v1',
  SETTINGS: 'labnet_settings_v1',
};

export const LabNetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [computers, setComputers] = useState<Computer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPUTERS);
      return saved ? JSON.parse(saved) : INITIAL_COMPUTERS;
    } catch {
      return INITIAL_COMPUTERS;
    }
  });

  const [laboratories] = useState<Laboratory[]>(INITIAL_LABORATORIES);

  const [softwarePackages, setSoftwarePackages] = useState<SoftwarePackage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOFTWARE);
      return saved ? JSON.parse(saved) : INITIAL_SOFTWARE_PACKAGES;
    } catch {
      return INITIAL_SOFTWARE_PACKAGES;
    }
  });

  const [historyEvents, setHistoryEvents] = useState<InstallationHistoryEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORY_EVENTS;
    } catch {
      return INITIAL_HISTORY_EVENTS;
    }
  });

  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
      return saved ? JSON.parse(saved) : INITIAL_DISCOVERED_DEVICES;
    } catch {
      return INITIAL_DISCOVERED_DEVICES;
    }
  });

  const [scheduledUpdates, setScheduledUpdates] = useState<ScheduledUpdate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return saved ? JSON.parse(saved) : INITIAL_SCHEDULED_UPDATES;
    } catch {
      return INITIAL_SCHEDULED_UPDATES;
    }
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [userAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_ID) || INITIAL_USER_ACCOUNTS[0].id;
    } catch {
      return INITIAL_USER_ACCOUNTS[0].id;
    }
  });

  const currentUser = userAccounts.find(u => u.id === currentUserId) || userAccounts[0];

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
    } catch {
      return INITIAL_SYSTEM_SETTINGS;
    }
  });

  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const [isScanningNetwork, setIsScanningNetwork] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');

  const [activeDeployment, setActiveDeployment] = useState<ActiveDeploymentJob | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPUTERS, JSON.stringify(computers));
    } catch {}
  }, [computers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOFTWARE, JSON.stringify(softwarePackages));
    } catch {}
  }, [softwarePackages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyEvents));
    } catch {}
  }, [historyEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(discoveredDevices));
    } catch {}
  }, [discoveredDevices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(scheduledUpdates));
    } catch {}
  }, [scheduledUpdates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_ID, currentUserId);
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    if (selectedComputer) {
      const fresh = computers.find(c => c.id === selectedComputer.id);
      if (fresh) setSelectedComputer(fresh);
    }
  }, [computers, selectedComputer]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const exportToCsv = useCallback((filename: string, headers: string[], rows: (string | number)[][]) => {
    const sanitize = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(sanitize).join(','),
      ...rows.map(row => row.map(sanitize).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename.replace(/[^a-z0-9_-]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}.csv`, 'success');
  }, [showToast]);

  const runNetworkDiscovery = useCallback(() => {
    if (isScanningNetwork) return;
    setIsScanningNetwork(true);
    setScanProgress(0);
    setScanStage('Initializing subnet ARP ping sweeps...');

    const stages = [
      { progress: 20, msg: 'Broadcasting ARP queries across 10.10.1.0/24 & 10.10.2.0/24...' },
      { progress: 50, msg: 'Probing 10.10.3.0/24 & 10.10.4.0/24 for active ICMP echo responses...' },
      { progress: 75, msg: 'Analyzing Wi-Fi 6 AP clients & scanning open TCP ports (22, 135, 3389, 8443)...' },
      { progress: 100, msg: 'Network discovery complete. 26 devices categorized.' }
    ];

    stages.forEach((st, idx) => {
      setTimeout(() => {
        setScanProgress(st.progress);
        setScanStage(st.msg);
        if (idx === stages.length - 1) {
          setIsScanningNetwork(false);
          showToast('Network discovery scan completed. Subnets synchronized.', 'success');
        }
      }, (idx + 1) * 700);
    });
  }, [isScanningNetwork, showToast]);

  const authorizeDevice = useCallback((mac: string) => {
    setDiscoveredDevices(prev => prev.map(dev => dev.mac === mac ? { ...dev, status: 'authorized_unregistered' } : dev));
    showToast(`Device with MAC ${mac} marked as Authorized`, 'success');
  }, [showToast]);

  const importDeviceToInventory = useCallback((device: DiscoveredDevice, targetLabId: string) => {
    const targetLab = laboratories.find(l => l.id === targetLabId) || laboratories[0];
    const newComp: Computer = {
      id: `pc-${Date.now().toString(36)}`,
      hostname: device.hostname.startsWith('UNKNOWN') ? `IMPORTED-WS-${Math.floor(Math.random() * 900 + 100)}` : device.hostname,
      ip: device.ip,
      mac: device.mac,
      os: device.detectedOs.includes('Linux') ? 'Ubuntu 24.04 LTS' : 'Windows 11 Enterprise',
      osArchitecture: 'x86_64',
      connectionType: device.connectionType,
      connectionSpeed: device.connectionType === 'Ethernet' ? '1.0 Gbps Full-Duplex' : 'Wi-Fi 6 (650 Mbps)',
      status: 'online',
      labId: targetLab.id,
      labName: targetLab.name,
      seatNumber: 'Auxiliary Station',
      cpuModel: 'Intel Core i5-13500 (14-Core)',
      cpuCores: 14,
      cpuUsage: 12,
      ramTotalGb: 16,
      ramUsedGb: 6.4,
      ramUsagePercent: 40,
      diskTotalGb: 512,
      diskUsedGb: 180,
      diskUsagePercent: 35,
      uptimeHours: 4,
      lastSeen: 'Just now',
      agentVersion: 'v2.4.1',
      installedSoftware: [
        { softwareId: 'pkg-vscode', name: 'Visual Studio Code', installedVersion: '1.94.2', latestVersion: '1.94.2', needsUpdate: false, installDate: new Date().toISOString().split('T')[0] },
        { softwareId: 'pkg-git', name: 'Git SCM', installedVersion: '2.47.0', latestVersion: '2.47.0', needsUpdate: false, installDate: new Date().toISOString().split('T')[0] }
      ]
    };

    setComputers(prev => [...prev, newComp]);
    setDiscoveredDevices(prev => prev.map(d => d.mac === device.mac ? { ...d, status: 'registered', matchedComputerId: newComp.id } : d));
    showToast(`Added ${newComp.hostname} (${newComp.ip}) to ${targetLab.name}`, 'success');
  }, [laboratories, showToast]);

  const powerAction = useCallback((computerId: string, action: 'reboot' | 'toggle_power' | 'wake_on_lan') => {
    const comp = computers.find(c => c.id === computerId);
    if (!comp) return;

    if (action === 'reboot') {
      showToast(`Issuing remote reboot to ${comp.hostname}...`, 'info');
      setComputers(prev => prev.map(c => c.id === computerId ? { ...c, status: 'offline', cpuUsage: 0, ramUsagePercent: 0 } : c));
      setTimeout(() => {
        setComputers(prev => prev.map(c => c.id === computerId ? {
          ...c,
          status: 'online',
          uptimeHours: 0.1,
          lastSeen: 'Just now',
          cpuUsage: 18,
          ramUsagePercent: 32
        } : c));
        showToast(`System ${comp.hostname} rebooted and reported back online`, 'success');
      }, 2000);
    } else if (action === 'toggle_power') {
      const willBeOnline = comp.status === 'offline';
      setComputers(prev => prev.map(c => c.id === computerId ? {
        ...c,
        status: willBeOnline ? 'online' : 'offline',
        cpuUsage: willBeOnline ? 18 : 0,
        ramUsagePercent: willBeOnline ? 30 : 0,
        uptimeHours: willBeOnline ? 0.2 : 0,
        lastSeen: willBeOnline ? 'Just now' : 'Power off'
      } : c));
      showToast(`Workstation ${comp.hostname} set to ${willBeOnline ? 'Online' : 'Offline'}`, 'info');
    } else if (action === 'wake_on_lan') {
      showToast(`Sending Wake-on-LAN Magic Packet to ${comp.mac}...`, 'info');
      setTimeout(() => {
        setComputers(prev => prev.map(c => c.id === computerId ? {
          ...c,
          status: 'online',
          uptimeHours: 0.1,
          lastSeen: 'Just now',
          cpuUsage: 14,
          ramUsagePercent: 28
        } : c));
        showToast(`Machine ${comp.hostname} powered on via Wake-on-LAN`, 'success');
      }, 1500);
    }
  }, [computers, showToast]);

  const updateSoftwareOnComputer = useCallback((computerId: string, softwareId: string) => {
    const comp = computers.find(c => c.id === computerId);
    const sw = softwarePackages.find(s => s.id === softwareId);
    if (!comp || !sw) return;

    const existing = comp.installedSoftware.find(s => s.softwareId === softwareId);
    const prevVersion = existing?.installedVersion || 'None';
    const targetVersion = sw.approvedVersion;

    showToast(`Deploying ${sw.name} ${targetVersion} to ${comp.hostname}...`, 'info');

    setTimeout(() => {
      setComputers(prev => prev.map(c => {
        if (c.id !== computerId) return c;
        const exists = c.installedSoftware.some(s => s.softwareId === softwareId);
        const updatedList = exists
          ? c.installedSoftware.map(s => s.softwareId === softwareId ? { ...s, installedVersion: targetVersion, needsUpdate: false } : s)
          : [...c.installedSoftware, { softwareId, name: sw.name, installedVersion: targetVersion, latestVersion: sw.latestVersion, needsUpdate: false, installDate: new Date().toISOString().split('T')[0] }];

        return { ...c, installedSoftware: updatedList };
      }));

      const newEvent: InstallationHistoryEvent = {
        id: `hist-${Date.now().toString(36)}`,
        computerId: comp.id,
        computerHostname: comp.hostname,
        labName: comp.labName,
        softwareId: sw.id,
        softwareName: sw.name,
        eventType: prevVersion === 'None' ? 'Installed' : 'Updated',
        previousVersion: prevVersion,
        newVersion: targetVersion,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        adminUser: currentUser.name,
        adminRole: currentUser.role,
        result: 'Success',
        logDetails: `Direct single-system deployment via dashboard. Exit code: 0.`
      };
      setHistoryEvents(prev => [newEvent, ...prev]);

      showToast(`Installed ${sw.name} ${targetVersion} on ${comp.hostname}`, 'success');
    }, 1200);
  }, [computers, softwarePackages, currentUser, showToast]);

  const startBulkDeployment = useCallback((softwareId: string, targetVersion: string, targetComputerIds: string[]) => {
    const sw = softwarePackages.find(s => s.id === softwareId);
    if (!sw) return;

    const targets = computers.filter(c => targetComputerIds.includes(c.id));
    if (targets.length === 0) return;

    const jobId = `deploy-${Date.now().toString(36)}`;
    const tasks: Record<string, any> = {};

    targets.forEach(c => {
      tasks[c.id] = {
        computerId: c.id,
        hostname: c.hostname,
        labName: c.labName,
        status: 'pending',
        progressPercent: 0,
        currentStepMessage: 'Queued in deployment pipeline'
      };
    });

    const newJob: ActiveDeploymentJob = {
      id: jobId,
      softwareId,
      softwareName: sw.name,
      targetVersion,
      targetComputers: targets,
      startTime: new Date().toLocaleTimeString(),
      tasks,
      isCompleted: false,
      isCancelled: false,
      overallProgress: 5
    };

    setActiveDeployment(newJob);
    showToast(`Bulk deployment initiated for ${targets.length} systems`, 'info');

    targets.forEach((comp, idx) => {
      const delay = idx * 400;

      setTimeout(() => {
        setActiveDeployment(prev => {
          if (!prev || prev.isCancelled) return prev;
          const currentTask = prev.tasks[comp.id];
          if (!currentTask) return prev;
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [comp.id]: {
                ...currentTask,
                status: 'downloading',
                progressPercent: 30,
                currentStepMessage: `Downloading payload (${sw.packageSizeMb} MB)...`
              }
            }
          };
        });
      }, delay + 400);

      setTimeout(() => {
        setActiveDeployment(prev => {
          if (!prev || prev.isCancelled) return prev;
          const currentTask = prev.tasks[comp.id];
          if (!currentTask) return prev;
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [comp.id]: {
                ...currentTask,
                status: 'installing',
                progressPercent: 70,
                currentStepMessage: 'Running installer silently...'
              }
            }
          };
        });
      }, delay + 1200);

      setTimeout(() => {
        const isFail = comp.status === 'offline';

        setActiveDeployment(prev => {
          if (!prev || prev.isCancelled) return prev;
          const currentTask = prev.tasks[comp.id];
          if (!currentTask) return prev;

          const updatedTasks: Record<string, DeploymentTaskProgress> = {
            ...prev.tasks,
            [comp.id]: {
              ...currentTask,
              status: (isFail ? 'failed' : 'completed') as DeploymentTaskProgress['status'],
              progressPercent: 100,
              currentStepMessage: isFail ? 'Failed: host unreachable' : 'Installation verified',
              error: isFail ? 'Host offline' : undefined
            }
          };

          const taskList = Object.values(updatedTasks);
          const finished = taskList.filter(t => t.status === 'completed' || t.status === 'failed').length;
          const overall = Math.round((finished / taskList.length) * 100);
          const allDone = finished === taskList.length;

          return {
            ...prev,
            tasks: updatedTasks,
            overallProgress: overall,
            isCompleted: allDone
          };
        });

        if (!isFail) {
          setComputers(prev => prev.map(c => {
            if (c.id !== comp.id) return c;
            const exists = c.installedSoftware.some(s => s.softwareId === softwareId);
            const updated = exists
              ? c.installedSoftware.map(s => s.softwareId === softwareId ? { ...s, installedVersion: targetVersion, needsUpdate: false } : s)
              : [...c.installedSoftware, { softwareId, name: sw.name, installedVersion: targetVersion, latestVersion: sw.latestVersion, needsUpdate: false, installDate: new Date().toISOString().split('T')[0] }];
            return { ...c, installedSoftware: updated };
          }));

          const newEvent: InstallationHistoryEvent = {
            id: `hist-${Date.now().toString(36)}-${comp.id}`,
            computerId: comp.id,
            computerHostname: comp.hostname,
            labName: comp.labName,
            softwareId: sw.id,
            softwareName: sw.name,
            eventType: 'Updated',
            previousVersion: comp.installedSoftware.find(s => s.softwareId === softwareId)?.installedVersion || 'None',
            newVersion: targetVersion,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            adminUser: currentUser.name,
            adminRole: currentUser.role,
            result: 'Success',
            logDetails: `Bulk deployment task finished cleanly.`
          };
          setHistoryEvents(prev => [newEvent, ...prev]);
        }
      }, delay + 2200);
    });
  }, [computers, softwarePackages, currentUser, showToast]);

  const cancelActiveDeployment = useCallback(() => {
    setActiveDeployment(prev => prev ? { ...prev, isCancelled: true, isCompleted: true } : null);
    showToast('Deployment was cancelled', 'warning');
  }, [showToast]);

  const createScheduledUpdate = useCallback((newSchedule: Omit<ScheduledUpdate, 'id' | 'status' | 'progressPercent' | 'createdTimestamp'>) => {
    const schedule: ScheduledUpdate = {
      ...newSchedule,
      id: `sched-${Date.now().toString(36)}`,
      status: 'scheduled',
      progressPercent: 0,
      createdTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setScheduledUpdates(prev => [schedule, ...prev]);
    showToast(`Schedule '${schedule.title}' registered`, 'success');
  }, [showToast]);

  const cancelSchedule = useCallback((id: string) => {
    setScheduledUpdates(prev => prev.map(s => s.id === id ? { ...s, status: 'paused' } : s));
    showToast('Schedule paused/cancelled', 'info');
  }, [showToast]);

  const runScheduleNow = useCallback((id: string) => {
    const sched = scheduledUpdates.find(s => s.id === id);
    if (!sched) return;
    showToast(`Executing '${sched.title}' immediately...`, 'info');
    startBulkDeployment(sched.softwareId, sched.targetVersion, sched.targetComputerIds);
    setScheduledUpdates(prev => prev.map(s => s.id === id ? { ...s, status: 'running', progressPercent: 25 } : s));
  }, [scheduledUpdates, startBulkDeployment, showToast]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    showToast('Alert acknowledged', 'info');
  }, [showToast]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Alert dismissed', 'info');
  }, [showToast]);

  const clearResolvedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(a => !a.acknowledged));
    showToast('Acknowledged alerts cleared', 'info');
  }, [showToast]);

  const switchUser = useCallback((userId: string) => {
    const user = userAccounts.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(user.id);
      showToast(`Switched active profile to ${user.name} (${user.role})`, 'info');
    }
  }, [userAccounts, showToast]);

  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('System configuration saved', 'success');
  }, [showToast]);

  const resetAllDemoData = useCallback(() => {
    try {
      localStorage.clear();
    } catch {}
    setComputers(INITIAL_COMPUTERS);
    setSoftwarePackages(INITIAL_SOFTWARE_PACKAGES);
    setHistoryEvents(INITIAL_HISTORY_EVENTS);
    setDiscoveredDevices(INITIAL_DISCOVERED_DEVICES);
    setScheduledUpdates(INITIAL_SCHEDULED_UPDATES);
    setAlerts(INITIAL_ALERTS);
    setCurrentUserId(INITIAL_USER_ACCOUNTS[0].id);
    setSettings(INITIAL_SYSTEM_SETTINGS);
    setActiveDeployment(null);
    setSelectedComputer(null);
    setSelectedLabId(null);
    showToast('All demo data reset to default factory state', 'info');
  }, [showToast]);

  return (
    <LabNetContext.Provider
      value={{
        computers,
        laboratories,
        softwarePackages,
        historyEvents,
        discoveredDevices,
        scheduledUpdates,
        alerts,
        currentUser,
        userAccounts,
        settings,
        selectedComputer,
        setSelectedComputer,
        selectedLabId,
        setSelectedLabId,
        isScanningNetwork,
        scanProgress,
        scanStage,
        runNetworkDiscovery,
        authorizeDevice,
        importDeviceToInventory,
        activeDeployment,
        startBulkDeployment,
        cancelActiveDeployment,
        createScheduledUpdate,
        cancelSchedule,
        runScheduleNow,
        powerAction,
        updateSoftwareOnComputer,
        acknowledgeAlert,
        dismissAlert,
        clearResolvedAlerts,
        switchUser,
        updateSettings,
        resetAllDemoData,
        toasts,
        showToast,
        removeToast,
        exportToCsv
      }}
    >
      {children}
    </LabNetContext.Provider>
  );
};

export const useLabNet = (): LabNetContextType => {
  const context = useContext(LabNetContext);
  if (!context) {
    throw new Error('useLabNet must be used within a LabNetProvider');
  }
  return context;
};
