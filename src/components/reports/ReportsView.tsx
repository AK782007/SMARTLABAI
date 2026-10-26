import React, { useState } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Package,
  History,
  Building2,
  Radio,
  FileText
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { computers, softwarePackages, historyEvents, laboratories, discoveredDevices, exportToCsv, showToast } = useLabNet();
  const [selectedReport, setSelectedReport] = useState<string>('computer_inventory');

  // Report 1: Computer Inventory
  const generateComputerInventory = () => {
    const headers = ['Hostname', 'IP Address', 'MAC', 'Laboratory', 'Seat Number', 'Operating System', 'Link Type', 'Status', 'CPU %', 'RAM %', 'Disk %', 'Uptime Hours', 'Agent Version'];
    const rows = computers.map(c => [
      c.hostname,
      c.ip,
      c.mac,
      c.labName,
      c.seatNumber,
      c.os,
      c.connectionType,
      c.status,
      c.cpuUsage,
      c.ramUsagePercent,
      c.diskUsagePercent,
      c.uptimeHours,
      c.agentVersion
    ]);
    exportToCsv('labnet_complete_computer_inventory', headers, rows);
  };

  // Report 2: Software Inventory & License
  const generateSoftwareInventory = () => {
    const headers = ['Software Title', 'Publisher', 'Category', 'Approved Version', 'Latest Version', 'License Type', 'Size (MB)', 'Silent Directive'];
    const rows = softwarePackages.map(p => [
      p.name,
      p.publisher,
      p.category,
      p.approvedVersion,
      p.latestVersion,
      p.licenseType,
      p.packageSizeMb,
      p.silentInstallCommand
    ]);
    exportToCsv('labnet_software_license_compliance', headers, rows);
  };

  // Report 3: Installation History
  const generateHistoryReport = () => {
    const headers = ['Event ID', 'Computer', 'Facility', 'Software', 'Action', 'From Version', 'To Version', 'Timestamp', 'Admin', 'Role', 'Result'];
    const rows = historyEvents.map(h => [
      h.id,
      h.computerHostname,
      h.labName,
      h.softwareName,
      h.eventType,
      h.previousVersion,
      h.newVersion,
      h.timestamp,
      h.adminUser,
      h.adminRole,
      h.result
    ]);
    exportToCsv('labnet_installation_audit_trail', headers, rows);
  };

  // Report 4: Update Compliance
  const generateComplianceReport = () => {
    const headers = ['Computer', 'Lab', 'Total Installed Apps', 'Pending Updates Count', 'Compliance Rate', 'Needs Updates List'];
    const rows = computers.map(c => {
      const pending = c.installedSoftware.filter(s => s.needsUpdate);
      const rate = Math.round(((c.installedSoftware.length - pending.length) / (c.installedSoftware.length || 1)) * 100);
      return [
        c.hostname,
        c.labName,
        c.installedSoftware.length,
        pending.length,
        `${rate}%`,
        pending.map(p => `${p.name} (v${p.installedVersion} -> v${p.latestVersion})`).join('; ')
      ];
    });
    exportToCsv('labnet_update_compliance_summary', headers, rows);
  };

  // Report 5: Network Availability & Uptime
  const generateNetworkReport = () => {
    const headers = ['IP Address', 'MAC', 'Hostname', 'Link', 'Status', 'Signal / Link Speed', 'Uptime Hours', 'Last Seen'];
    const rows = computers.map(c => [
      c.ip,
      c.mac,
      c.hostname,
      c.connectionType,
      c.status,
      c.connectionSpeed,
      c.uptimeHours,
      c.lastSeen
    ]);
    exportToCsv('labnet_network_availability_uptime', headers, rows);
  };

  // Report 6: Laboratory Utilization
  const generateLabReport = () => {
    const headers = ['Laboratory Name', 'Code', 'Building & Room', 'Capacity', 'Allocated Workstations', 'Online Count', 'Subnet CIDR', 'Gateway', 'VLAN'];
    const rows = laboratories.map(l => {
      const comps = computers.filter(c => c.labId === l.id);
      const online = comps.filter(c => c.status === 'online').length;
      return [
        l.name,
        l.code,
        `${l.building}, ${l.room}`,
        l.capacity,
        comps.length,
        online,
        l.subnetRange,
        l.gateway,
        l.vlanId
      ];
    });
    exportToCsv('labnet_laboratory_utilization', headers, rows);
  };

  const reportsList = [
    {
      id: 'computer_inventory',
      title: 'Complete Computer Inventory Report',
      description: 'Full hardware specifications, operating systems, assigned seats, and network addresses for 28 managed systems.',
      icon: Monitor,
      rowCount: computers.length,
      exportFn: generateComputerInventory
    },
    {
      id: 'software_inventory',
      title: 'Software Catalog & License Report',
      description: 'Campus software baseline, approved versions, upstream releases, and license compliance categories.',
      icon: Package,
      rowCount: softwarePackages.length,
      exportFn: generateSoftwareInventory
    },
    {
      id: 'history_report',
      title: 'Software Installation Audit Trail',
      description: 'Chronological timeline of installations, package upgrades, and administrator credentials with raw exit codes.',
      icon: History,
      rowCount: historyEvents.length,
      exportFn: generateHistoryReport
    },
    {
      id: 'compliance_report',
      title: 'Fleet Update Compliance Audit',
      description: 'Compliance ratios per workstation and detailed list of overdue security patches and outdated runtimes.',
      icon: CheckCircle2,
      rowCount: computers.length,
      exportFn: generateComplianceReport
    },
    {
      id: 'network_report',
      title: 'Network Availability & Uptime',
      description: 'Ethernet gigabit vs Wi-Fi signal diagnostics, round-trip times, and continuous workstation uptime logs.',
      icon: Radio,
      rowCount: computers.length,
      exportFn: generateNetworkReport
    },
    {
      id: 'lab_report',
      title: 'Laboratory Facility Utilization',
      description: 'Seat occupancy, subnet ranges, VLAN identifiers, and faculty in charge across all 4 departments.',
      icon: Building2,
      rowCount: laboratories.length,
      exportFn: generateLabReport
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          Institutional Compliance Reports & CSV Exports
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Generate, preview, and download audit-ready CSV spreadsheets for university accreditation and departmental oversight
        </p>
      </div>

      {/* Reports Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportsList.map(rep => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;

          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-lg'
                  : 'border-slate-800 bg-[#0B111E] hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {rep.rowCount} Rows Available
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{rep.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {rep.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Format: RFC 4180 CSV</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    rep.exportFn();
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Report Live Preview Container */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Data Preview: {reportsList.find(r => r.id === selectedReport)?.title}
            </h3>
            <p className="text-xs text-slate-400">
              Live sample rendered directly from current local demonstration dataset
            </p>
          </div>

          <button
            onClick={() => reportsList.find(r => r.id === selectedReport)?.exportFn()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download Full File</span>
          </button>
        </div>

        {/* Dynamic preview table based on selected report */}
        <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-800/80 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 sticky top-0 border-b border-slate-800 text-slate-300">
              <tr>
                <th className="py-2.5 px-3">Hostname / ID</th>
                <th className="py-2.5 px-3">Subnet / Facility</th>
                <th className="py-2.5 px-3">Primary Attributes</th>
                <th className="py-2.5 px-3">Compliance & Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {computers.slice(0, 8).map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono font-semibold text-cyan-300">
                    {c.hostname}
                    <div className="text-[10px] text-slate-400 font-mono">{c.ip} · {c.mac}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {c.labName}
                    <div className="text-[10px] text-slate-400 font-mono">{c.seatNumber}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {c.os} ({c.osArchitecture})
                    <div className="text-[10px] text-slate-400 font-mono">{c.connectionSpeed}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.status === 'online' ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400 bg-slate-800'
                    }`}>
                      {c.status}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-2">CPU {c.cpuUsage}% · RAM {c.ramUsagePercent}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
