import React, { useState } from 'react';
import { FilterProvider, useFilter } from './context/FilterContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { NationalPage } from './pages/NationalPage';
import { PlantsPage } from './pages/PlantsPage';
import { MapPage } from './pages/MapPage';
import { StatesPage } from './pages/StatesPage';
import { IntensityPage } from './pages/IntensityPage';
import { TimeseriesPage } from './pages/TimeseriesPage';
import { DecarbonizationPage } from './pages/DecarbonizationPage';
import { EfficiencyPage } from './pages/EfficiencyPage';
import { CoalPage } from './pages/CoalPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { ReportsPage } from './pages/ReportsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab } = useFilter();
  const [collapsed, setCollapsed] = useState(false);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'national':
        return <NationalPage />;
      case 'plants':
        return <PlantsPage />;
      case 'map':
        return <MapPage />;
      case 'states':
        return <StatesPage />;
      case 'intensity':
        return <IntensityPage />;
      case 'timeseries':
        return <TimeseriesPage />;
      case 'decarbonization':
        return <DecarbonizationPage />;
      case 'efficiency':
        return <EfficiencyPage />;
      case 'coal':
        return <CoalPage />;
      case 'statistics':
        return <StatisticsPage />;
      case 'forecasting':
        return <ForecastingPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'explorer':
        return <ExplorerPage />;
      case 'reports':
        return <ReportsPage />;
      case 'methodology':
        return <MethodologyPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Navbar />
        <main className="flex-1 pb-16">{renderActivePage()}</main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <b>CoalCarbon India</b> • Academic Research & Analytics Platform
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>Problem Statement: Carbon Footprint Analysis of Electricity Generation Sources</span>
            <span>•</span>
            <span>CEA Grid Baseline Harmonized</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FilterProvider>
      <AppContent />
    </FilterProvider>
  );
}
