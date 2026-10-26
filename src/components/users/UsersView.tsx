import React from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { UserRole } from '../../types';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Key,
  Clock,
  Building2,
  Lock
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { userAccounts, currentUser, switchUser, showToast } = useLabNet();

  const permissionMatrix: { capability: string; superAdmin: boolean; labAdmin: boolean; labTech: boolean; viewer: boolean }[] = [
    { capability: 'View Telemetry, Dashboards & Charts', superAdmin: true, labAdmin: true, labTech: true, viewer: true },
    { capability: 'Export Compliance & Audit CSV Reports', superAdmin: true, labAdmin: true, labTech: true, viewer: true },
    { capability: 'Run ICMP / ARP Network Discovery Scans', superAdmin: true, labAdmin: true, labTech: true, viewer: false },
    { capability: 'Execute Remote Reboot & Wake-on-LAN', superAdmin: true, labAdmin: true, labTech: true, viewer: false },
    { capability: 'Initiate Single Computer Software Deployments', superAdmin: true, labAdmin: true, labTech: true, viewer: false },
    { capability: 'Schedule Off-Hours Maintenance Windows', superAdmin: true, labAdmin: true, labTech: false, viewer: false },
    { capability: 'Execute Bulk Multi-Lab Software Rollouts', superAdmin: true, labAdmin: true, labTech: false, viewer: false },
    { capability: 'Authorize Rogue MACs & Import New Hosts', superAdmin: true, labAdmin: true, labTech: false, viewer: false },
    { capability: 'Modify Subnet Configurations & VLAN IDs', superAdmin: true, labAdmin: false, labTech: false, viewer: false },
    { capability: 'Manage User Accounts & RBAC Roles', superAdmin: true, labAdmin: false, labTech: false, viewer: false },
    { capability: 'Reset System to Factory Demo Data', superAdmin: true, labAdmin: false, labTech: false, viewer: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl p-5">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Role-Based Access Control (RBAC) & Accounts
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Granular permission matrix for departmental professors, system administrators, lab technicians, and academic reviewers
        </p>
      </div>

      {/* Active User Highlight Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-lg">
            {currentUser.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                {currentUser.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {currentUser.email} · {currentUser.department}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Session Authenticated (Demo Mode)
          </span>
        </div>
      </div>

      {/* Quick Role Switcher Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span>Switch Simulated User Identity (Click to test role permissions)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {userAccounts.map(account => {
            const isActive = account.id === currentUser.id;

            return (
              <div
                key={account.id}
                onClick={() => switchUser(account.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-950/30 shadow-md'
                    : 'border-slate-800 bg-[#0B111E] hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-xs">
                      {account.avatarInitials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs">{account.name}</h4>
                      <p className="text-[11px] text-cyan-400/90 font-mono mt-0.5">{account.role}</p>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Active
                    </span>
                  ) : (
                    <button className="text-[11px] text-slate-400 hover:text-white underline">
                      Switch
                    </button>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono space-y-1">
                  <div>{account.email}</div>
                  <div className="text-[10px] text-slate-400 font-sans">{account.department}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Permission Capabilities Matrix */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Institutional Privilege Matrix</h3>
            <p className="text-xs text-slate-400">Enforced by backend API token policies</p>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">RBAC v3.2 Policy</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4 font-semibold text-slate-300">Operational Capability</th>
                <th className="py-3 px-3 font-semibold text-center text-slate-300">Super Admin</th>
                <th className="py-3 px-3 font-semibold text-center text-slate-300">Lab Admin</th>
                <th className="py-3 px-3 font-semibold text-center text-slate-300">Lab Tech</th>
                <th className="py-3 px-3 font-semibold text-center text-slate-300">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {permissionMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-sans text-slate-200">{item.capability}</td>
                  <td className="py-2.5 px-3 text-center">
                    {item.superAdmin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 inline" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.labAdmin ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 inline" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.labTech ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 inline" />
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.viewer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 inline" />
                    )}
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
