import React, { useState } from 'react';
import { LabNetProvider, useLabNet } from './context/LabNetContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DemoModeBanner } from './components/layout/DemoModeBanner';
import { MeteredNetworkBar } from './components/common/MeteredNetworkBar';
import { ToastContainer } from './components/common/ToastContainer';
import { ComputerDetailModal } from './components/common/ComputerDetailModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { ComputersView } from './components/computers/ComputersView';
import { DiscoveryView } from './components/discovery/DiscoveryView';
import { SoftwareView } from './components/software/SoftwareView';
import { HistoryView } from './components/history/HistoryView';
import { DeploymentView } from './components/deployment/DeploymentView';
import { SchedulesView } from './components/schedules/SchedulesView';
import { LabsView } from './components/labs/LabsView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { Menu } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { selectedComputer, setSelectedComputer } = useLabNet();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cross-view navigation parameters
  const [deployInitialSoftwareId, setDeployInitialSoftwareId] = useState<string | undefined>(undefined);
  const [deployInitialTargetIds, setDeployInitialTargetIds] = useState<string[] | undefined>(undefined);

  const handleOpenDeployModalWithSoftware = (softwareId: string) => {
    setDeployInitialSoftwareId(softwareId);
    setDeployInitialTargetIds(undefined);
    setCurrentTab('deployment');
  };

  const handleOpenDeployWithTargets = (computerIds: string[]) => {
    setDeployInitialSoftwareId(undefined);
    setDeployInitialTargetIds(computerIds);
    setCurrentTab('deployment');
  };

  const handleSelectLabComputers = (labId: string) => {
    setCurrentTab('computers');
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col font-sans">
      {/* Simulation Notice Banner */}
      <DemoModeBanner />

      {/* Main Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Wired Metered & Offline Network Status Bar */}
      <MeteredNetworkBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpenMobile={isMobileMenuOpen}
          setIsOpenMobile={setIsMobileMenuOpen}
        />

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Mobile menu trigger button */}
            <div className="md:hidden flex items-center justify-between pb-2 border-b border-slate-800">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <Menu className="w-4 h-4 text-cyan-400" />
                <span>Console Menu</span>
              </button>
              <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">
                {currentTab}
              </span>
            </div>

            {/* Routed View Components */}
            {currentTab === 'dashboard' && <DashboardView setCurrentTab={setCurrentTab} />}
            {currentTab === 'computers' && (
              <ComputersView onOpenDeployWithTargets={handleOpenDeployWithTargets} />
            )}
            {currentTab === 'discovery' && <DiscoveryView />}
            {currentTab === 'software' && (
              <SoftwareView onOpenDeployModal={handleOpenDeployModalWithSoftware} />
            )}
            {currentTab === 'history' && <HistoryView />}
            {currentTab === 'deployment' && (
              <DeploymentView
                initialSoftwareId={deployInitialSoftwareId}
                initialTargetIds={deployInitialTargetIds}
              />
            )}
            {currentTab === 'schedules' && <SchedulesView />}
            {currentTab === 'labs' && (
              <LabsView
                onSelectLabComputers={handleSelectLabComputers}
                onOpenDeployForLab={(labId) => {
                  setCurrentTab('deployment');
                }}
              />
            )}
            {currentTab === 'alerts' && <AlertsView />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'users' && <UsersView />}
            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Deep Computer Details Modal */}
      {selectedComputer && (
        <ComputerDetailModal
          computer={selectedComputer}
          onClose={() => setSelectedComputer(null)}
        />
      )}

      {/* Toast Feedback Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LabNetProvider>
      <MainAppContent />
    </LabNetProvider>
  );
}
