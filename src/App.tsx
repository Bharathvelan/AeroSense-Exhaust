import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { ModeBanner } from './components/layout/ModeBanner';
import { Toast } from './components/layout/Toast';

import { OverviewPage } from './pages/Overview';
import { LiveMonitoringPage } from './pages/LiveMonitoring';
import { FanControlPage } from './pages/FanControl';
import { AutomationPage } from './pages/Automation';
import { EnergyAnalyticsPage } from './pages/EnergyAnalytics';
import { EnvironmentalAnalyticsPage } from './pages/EnvironmentalAnalytics';
import { AlertsPage } from './pages/Alerts';
import { DeviceManagementPage } from './pages/DeviceManagement';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';

const MainLayout: React.FC = () => {
  const { activeNav } = useApp();

  const getPageTitle = (nav: string) => {
    switch (nav) {
      case 'overview':
        return 'Overview Dashboard';
      case 'monitoring':
        return 'Live Environmental Monitoring';
      case 'fan-control':
        return 'Smart Fan Actuator Control Center';
      case 'automation':
        return 'Intelligent Automation Engine';
      case 'energy-analytics':
        return 'Electrical & Energy Analytics';
      case 'environmental-analytics':
        return 'Environmental Analytics & Trends';
      case 'alerts':
        return 'Alerts & Safety Notifications';
      case 'devices':
        return 'Device & Sensor Management';
      case 'reports':
        return 'Engineering & Audit Reports';
      case 'settings':
        return 'System & Parameter Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderActivePage = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewPage />;
      case 'monitoring':
        return <LiveMonitoringPage />;
      case 'fan-control':
        return <FanControlPage />;
      case 'automation':
        return <AutomationPage />;
      case 'energy-analytics':
        return <EnergyAnalyticsPage />;
      case 'environmental-analytics':
        return <EnvironmentalAnalyticsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'devices':
        return <DeviceManagementPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100">
      {/* Collapsible Industrial Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Mode Banner (Honest Simulation vs Hardware Connected) */}
        <ModeBanner />

        {/* Top Navbar */}
        <TopNavbar pageTitle={getPageTitle(activeNav)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-[1600px] mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Floating System Toast Alerts */}
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;

