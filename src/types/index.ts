export type ConnectionType = 'Ethernet' | 'Wi-Fi';
export type MachineStatus = 'online' | 'offline';
export type OperatingSystem = 'Ubuntu 24.04 LTS' | 'Windows 11 Enterprise' | 'Fedora 40 Workstation' | 'macOS Sequoia';
export type UserRole = 'Super Administrator' | 'Lab Administrator' | 'Lab Technician' | 'Read-only Viewer';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type HistoryEventType = 'Installed' | 'Updated' | 'Uninstalled';
export type HistoryResult = 'Success' | 'Failed' | 'Pending';
export type SoftwareCategory = 'Development' | 'Data Science' | 'Networking' | 'Engineering' | 'System Tool';

export interface InstalledSoftwareInfo {
  softwareId: string;
  name: string;
  installedVersion: string;
  latestVersion: string;
  needsUpdate: boolean;
  installDate: string;
}

export interface Computer {
  id: string;
  hostname: string;
  ip: string;
  mac: string;
  os: OperatingSystem;
  osArchitecture: 'x86_64' | 'ARM64';
  connectionType: ConnectionType;
  connectionSpeed: string; // e.g. "1 Gbps Full-Duplex" or "Wi-Fi 6 (866 Mbps)"
  status: MachineStatus;
  labId: string;
  labName: string;
  seatNumber: string; // e.g. "Row 2 - Seat 04"
  cpuModel: string;
  cpuCores: number;
  cpuUsage: number; // percentage
  ramTotalGb: number;
  ramUsedGb: number;
  ramUsagePercent: number;
  diskTotalGb: number;
  diskUsedGb: number;
  diskUsagePercent: number;
  uptimeHours: number;
  lastSeen: string;
  agentVersion: string;
  installedSoftware: InstalledSoftwareInfo[];
}

export interface Laboratory {
  id: string;
  name: string;
  code: string;
  building: string;
  room: string;
  department: string;
  capacity: number;
  facultyInCharge: string;
  techContact: string;
  subnetRange: string;
  gateway: string;
  vlanId: number;
  operatingHours: string;
  notes: string;
}

export interface SoftwarePackage {
  id: string;
  name: string;
  publisher: string;
  category: SoftwareCategory;
  latestVersion: string;
  approvedVersion: string;
  minOsRequirement: string;
  licenseType: 'Open Source' | 'Academic Campus License' | 'Freeware' | 'Commercial';
  packageSizeMb: number;
  silentInstallCommand: string;
  releaseDate: string;
  description: string;
}

export interface InstallationHistoryEvent {
  id: string;
  computerId: string;
  computerHostname: string;
  labName: string;
  softwareId: string;
  softwareName: string;
  eventType: HistoryEventType;
  previousVersion: string;
  newVersion: string;
  timestamp: string;
  adminUser: string;
  adminRole: UserRole;
  result: HistoryResult;
  logDetails: string;
}

export interface DiscoveredDevice {
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  connectionType: ConnectionType;
  signalDbm?: number;
  detectedOs: string;
  openPorts: number[];
  responseTimeMs: number;
  status: 'registered' | 'authorized_unregistered' | 'rogue_unknown';
  matchedComputerId?: string;
}

export interface ScheduledUpdate {
  id: string;
  title: string;
  softwareId: string;
  softwareName: string;
  targetVersion: string;
  targetLabIds: string[];
  targetComputerIds: string[];
  scheduledDate: string;
  scheduledTime: string;
  maintenanceWindow: string; // e.g. "02:00 - 04:00 AM"
  pilotCanaryCount: number; // e.g. 2 canary PCs first
  batchSize: number;
  retryPolicy: string; // e.g. "3 retries, exponential backoff"
  rebootRequired: boolean;
  status: 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';
  progressPercent: number;
  createdBy: string;
  createdTimestamp: string;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  source: 'computer' | 'software' | 'network' | 'deployment';
  sourceName: string;
  timestamp: string;
  acknowledged: boolean;
  labName?: string;
  computerId?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  assignedLabs: string[]; // Lab IDs
  avatarInitials: string;
  lastLogin: string;
}

export interface DeploymentTaskProgress {
  computerId: string;
  hostname: string;
  labName: string;
  status: 'pending' | 'downloading' | 'installing' | 'verifying' | 'completed' | 'failed';
  progressPercent: number;
  currentStepMessage: string;
  error?: string;
}

export interface ActiveDeploymentJob {
  id: string;
  softwareId: string;
  softwareName: string;
  targetVersion: string;
  targetComputers: Computer[];
  startTime: string;
  tasks: Record<string, DeploymentTaskProgress>;
  isCompleted: boolean;
  isCancelled: boolean;
  overallProgress: number;
}

export type NetworkMode = 'unmetered_fiber' | 'wired_metered' | 'offline_airgapped';

export interface MeteredNetworkState {
  mode: NetworkMode;
  isPhysicalOffline: boolean;
  monthlyCapGb: number;
  usedBandwidthGb: number;
  bandwidthSavedByCacheGb: number;
  localCacheServerUrl: string;
  localCacheActive: boolean;
  throttleTelemetryOnMetered: boolean;
  blockWanPackagesAboveMb: number;
  lastSyncTimestamp: string;
}

export interface SystemSettings {
  institutionName: string;
  departmentName: string;
  academicTerm: string;
  agentHeartbeatSeconds: number;
  discoverySubnets: string[];
  autoApproveRegisteredMacs: boolean;
  defaultMaintenanceWindow: string;
  dataRetentionDays: number;
  emailAlertsEnabled: boolean;
  bandwidthThrottlingMbps: number;
  enableTelemetryLiveFeed: boolean;
  meteredNetwork: MeteredNetworkState;
}
