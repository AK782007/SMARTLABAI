import React, { useState, useMemo } from 'react';
import { useLabNet } from '../../context/LabNetContext';
import { SoftwarePackage, SoftwareCategory } from '../../types';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Send,
  Building2,
  Info,
  Calendar,
  Layers,
  FileCode,
  HardDrive
} from 'lucide-react';

interface SoftwareViewProps {
  onOpenDeployModal?: (softwareId: string) => void;
}

export const SoftwareView: React.FC<SoftwareViewProps> = ({ onOpenDeployModal }) => {
  const { softwarePackages, computers, exportToCsv, showToast } = useLabNet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'needs_update' | 'up_to_date'>('all');
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<SoftwarePackage | null>(null);

  // Compute live statistics for each package across the 28 workstations
  const packageStats = useMemo(() => {
    const stats: Record<string, { totalInstalled: number; needsUpdate: number; installedMachines: string[] }> = {};

    softwarePackages.forEach(pkg => {
      let total = 0;
      let updates = 0;
      const machines: string[] = [];

      computers.forEach(comp => {
        const found = comp.installedSoftware.find(s => s.softwareId === pkg.id);
        if (found) {
          total++;
          machines.push(comp.hostname);
          if (found.needsUpdate) {
            updates++;
          }
        }
      });

      stats[pkg.id] = { totalInstalled: total, needsUpdate: updates, installedMachines: machines };
    });

    return stats;
  }, [softwarePackages, computers]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return softwarePackages.filter(pkg => {
      const matchSearch =
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || pkg.category === selectedCategory;

      const pStat = packageStats[pkg.id];
      const hasUpdate = pStat && pStat.needsUpdate > 0;
      const matchStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'needs_update' && hasUpdate) ||
        (selectedStatusFilter === 'up_to_date' && !hasUpdate);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [softwarePackages, searchQuery, selectedCategory, selectedStatusFilter, packageStats]);

  const handleExportSoftwareCsv = () => {
    const headers = ['Package Name', 'Publisher', 'Category', 'Approved Version', 'Latest Release', 'Installed PCs', 'Pending Updates', 'Package Size (MB)', 'License'];
    const rows = filteredPackages.map(pkg => [
      pkg.name,
      pkg.publisher,
      pkg.category,
      pkg.approvedVersion,
      pkg.latestVersion,
      packageStats[pkg.id]?.totalInstalled || 0,
      packageStats[pkg.id]?.needsUpdate || 0,
      pkg.packageSizeMb,
      pkg.licenseType
    ]);
    exportToCsv('labnet_software_catalog', headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0B111E] border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            Software Inventory & Catalog Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain authorized course software baselines, track compliance across labs, and initiate targeted package rollouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSoftwareCsv}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Export Software CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-lg p-3 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search software by name, publisher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Software Categories</option>
            <option value="Development">Development & IDEs</option>
            <option value="Engineering">Engineering & CAD / MATLAB</option>
            <option value="Networking">Networking & Protocol Decoders</option>
            <option value="Data Science">Data Science & 3D Modeling</option>
            <option value="System Tool">System Tools & SCM</option>
          </select>

          {/* Update Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Update Statuses</option>
            <option value="needs_update">Updates Available on Fleet</option>
            <option value="up_to_date">Fully Up-to-Date</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <span>
            Tracking <strong className="text-slate-200 font-mono">{filteredPackages.length}</strong> software packages
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            Total active instances: {Object.values(packageStats).reduce((a, b) => a + b.totalInstalled, 0)}
          </span>
        </div>
      </div>

      {/* Software Packages Table */}
      <div className="bg-[#0B111E] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 select-none">
                <th className="py-3 px-4 font-semibold text-slate-300">Software Application</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Publisher</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Category</th>
                <th className="py-3 px-4 font-semibold text-slate-300 font-mono">Approved Version</th>
                <th className="py-3 px-4 font-semibold text-slate-300 font-mono">Latest Upstream</th>
                <th className="py-3 px-4 font-semibold text-slate-300 text-center">Managed Fleet Count</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Compliance Status</th>
                <th className="py-3 px-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPackages.map(pkg => {
                const stat = packageStats[pkg.id] || { totalInstalled: 0, needsUpdate: 0, installedMachines: [] };
                const hasPendingUpdates = stat.needsUpdate > 0;
                const percentCompliance =
                  stat.totalInstalled > 0
                    ? Math.round(((stat.totalInstalled - stat.needsUpdate) / stat.totalInstalled) * 100)
                    : 100;

                return (
                  <tr
                    key={pkg.id}
                    onClick={() => setSelectedPackageDetails(pkg)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* Name & Desc */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{pkg.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {pkg.description}
                      </div>
                    </td>

                    {/* Publisher */}
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {pkg.publisher}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-medium">
                        {pkg.category}
                      </span>
                    </td>

                    {/* Approved Version */}
                    <td className="py-3 px-4 font-mono text-cyan-300 whitespace-nowrap">
                      v{pkg.approvedVersion}
                    </td>

                    {/* Latest Version */}
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      v{pkg.latestVersion}
                    </td>

                    {/* Managed Count */}
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono">
                      <span className="text-slate-200 font-semibold">{stat.totalInstalled}</span>
                      <span className="text-slate-400 text-[10px]"> / {computers.length} PCs</span>
                    </td>

                    {/* Compliance */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      {hasPendingUpdates ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{stat.needsUpdate} Outdated ({percentCompliance}%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% Compliant</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {onOpenDeployModal && (
                          <button
                            onClick={() => onOpenDeployModal(pkg.id)}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Deploy</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Details Modal */}
      {selectedPackageDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#0B111E] border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Package className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPackageDetails.name}</h3>
                  <p className="text-xs text-slate-400">
                    Publisher: {selectedPackageDetails.publisher} · License: {selectedPackageDetails.licenseType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPackageDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-900/60 p-4 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Approved Deployment Baseline:</span>
                <span className="text-cyan-300 font-bold text-sm">v{selectedPackageDetails.approvedVersion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Upstream Vendor Release:</span>
                <span className="text-slate-200 font-bold text-sm">v{selectedPackageDetails.latestVersion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Payload Installer Size:</span>
                <span className="text-slate-200">{selectedPackageDetails.packageSizeMb} MB</span>
              </div>
              <div>
                <span className="text-slate-400 font-sans block text-[11px]">Minimum Operating System:</span>
                <span className="text-slate-200">{selectedPackageDetails.minOsRequirement}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-300">Silent Installation Directive (CLI Agent):</span>
              <div className="bg-black/80 p-2.5 rounded font-mono text-[11px] text-emerald-400 border border-slate-800 select-all">
                {selectedPackageDetails.silentInstallCommand}
              </div>
            </div>

            {/* List of machines where this software is installed */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Deployed Workstations ({packageStats[selectedPackageDetails.id]?.totalInstalled || 0})</span>
                <span className="text-amber-400 font-mono text-[11px]">
                  {packageStats[selectedPackageDetails.id]?.needsUpdate || 0} machines require update
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-lg p-2 bg-slate-900/40 flex flex-wrap gap-1.5">
                {packageStats[selectedPackageDetails.id]?.installedMachines.map(host => (
                  <span
                    key={host}
                    className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-200"
                  >
                    {host}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                onClick={() => setSelectedPackageDetails(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Close
              </button>

              {onOpenDeployModal && (
                <button
                  onClick={() => {
                    const id = selectedPackageDetails.id;
                    setSelectedPackageDetails(null);
                    onOpenDeployModal(id);
                  }}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Launch Deployment Wizard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
