import React from 'react';
import { useFilter } from '../context/FilterContext';
import {
  LayoutDashboard,
  BarChart3,
  Factory,
  MapPin,
  Map,
  Flame,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Sliders,
  Database,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Gauge,
  Settings
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab } = useFilter();

  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'national', label: 'National Emissions', icon: BarChart3 },
    { id: 'plants', label: 'Plant Explorer', icon: Factory },
    { id: 'map', label: 'India Power Plant Map', icon: MapPin },
    { id: 'states', label: 'State-Wise Analysis', icon: Map },
    { id: 'intensity', label: 'Carbon Intensity', icon: Flame },
    { id: 'timeseries', label: 'Time-Series Analysis', icon: LineChart },
    { id: 'decarbonization', label: 'Decarbonization Roadmap', icon: Sparkles, highlight: true },
    { id: 'efficiency', label: 'Efficiency & Performance', icon: Gauge },
    { id: 'coal', label: 'Coal Statement & Stocks', icon: ShieldCheck },
    { id: 'statistics', label: 'Statistical Analysis', icon: TrendingUp },
    { id: 'forecasting', label: 'AI Forecasting & ML', icon: Cpu },
    { id: 'simulator', label: 'Reduction Simulator', icon: Sliders },
    { id: 'explorer', label: 'Data Explorer & Audit', icon: Database },
    { id: 'reports', label: 'Research Reports', icon: FileText },
    { id: 'methodology', label: 'Methodology & Sources', icon: BookOpen },
    { id: 'settings', label: 'Settings & Data Mgmt', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#042f2e] text-white flex flex-col z-30 transition-all duration-300 border-r border-emerald-950/60 shadow-xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-emerald-800/40 flex items-center justify-between">
        {!collapsed && (
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40">
                <Flame className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  CoalCarbon <span className="text-emerald-400 text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 font-mono">IND</span>
                </h1>
                <p className="text-[10px] text-emerald-300/80 font-medium tracking-wide">
                  Measure. Compare. Decarbonize.
                </p>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40">
            <Flame className="w-6 h-6 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/50 font-semibold'
                  : item.highlight
                  ? 'text-emerald-300 bg-emerald-950/40 hover:bg-emerald-800/40 border border-emerald-500/30'
                  : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-emerald-300/70'}`} />
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.highlight && (
                <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                  Roadmap
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      <div className="p-3 border-t border-emerald-900/40 flex items-center justify-between text-xs text-emerald-300/60">
        {!collapsed && (
          <div className="text-[10px]">
            <span className="font-semibold text-emerald-200">v1.0.0</span> • CEA Verified
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-emerald-900/60 text-emerald-300/80 hover:text-white transition-colors mx-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
