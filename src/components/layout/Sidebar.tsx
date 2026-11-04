import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Fan, 
  Cpu, 
  Zap, 
  LineChart, 
  Bell, 
  Server, 
  FileText, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { 
    activeNav, 
    setActiveNav, 
    operatingMode, 
    hardwareConnected, 
    criticalAlertCount,
    unreadAlertCount 
  } = useApp();
  
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'fan-control', label: 'Fan Control', icon: Fan },
    { id: 'automation', label: 'Automation', icon: Cpu },
    { id: 'energy-analytics', label: 'Energy Analytics', icon: Zap },
    { id: 'environmental-analytics', label: 'Environmental Analytics', icon: LineChart },
    { 
      id: 'alerts', 
      label: 'Alerts & Notifications', 
      icon: Bell, 
      badge: criticalAlertCount > 0 ? criticalAlertCount : (unreadAlertCount > 0 ? unreadAlertCount : undefined),
      badgeColor: criticalAlertCount > 0 ? 'bg-red-500 text-white' : 'bg-cyan-500/20 text-cyan-300'
    },
    { id: 'devices', label: 'Device Management', icon: Server },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-[#0b101d] border-r border-slate-800/80 transition-all duration-300 z-30 select-none shadow-2xl',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-4 border-b border-slate-800/80 justify-between bg-[#0e1424]/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-glow-cyan-sm text-slate-950 font-black shrink-0">
            <Fan className={cn("w-6 h-6 text-slate-950", operatingMode === 'SIMULATION' ? 'animate-spin-slow' : '')} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#0b101d]" />
          </div>

          {!collapsed && (
            <div className="flex flex-col tracking-wide truncate">
              <span className="font-extrabold text-lg text-white tracking-wider flex items-center gap-1.5 font-mono">
                AeroSense<span className="text-cyan-400">.</span>
              </span>
              <span className="text-[10px] font-semibold text-cyan-400/80 tracking-widest uppercase">
                Smart Ventilation
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                )}
              />

              {!collapsed && (
                <span className="truncate flex-1 text-left tracking-normal font-sans">
                  {item.label}
                </span>
              )}

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-semibold rounded-full font-mono',
                    item.badgeColor || 'bg-cyan-500/20 text-cyan-300',
                    collapsed ? 'absolute top-1.5 right-1.5 px-1 py-0 text-[10px]' : ''
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Active left indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r-full shadow-glow-cyan" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0e1424]/40">
        {!collapsed ? (
          <div className="space-y-2.5">
            {/* ESP32 Status Card */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  ESP32 Controller:
                </span>
                {operatingMode === 'SIMULATION' ? (
                  <span className="text-cyan-400 font-medium">Virtual (Active)</span>
                ) : hardwareConnected ? (
                  <span className="text-emerald-400 font-medium">Linked (Online)</span>
                ) : (
                  <span className="text-amber-400 font-medium">Disconnected</span>
                )}
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Operating Mode:</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase font-mono",
                  operatingMode === 'SIMULATION' 
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-800" 
                    : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                )}>
                  {operatingMode}
                </span>
              </div>
            </div>

            {/* Version & Badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
              <span>AeroSense v2.4.1</span>
              <span className="text-cyan-400/80">atomQUEST 2026</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-1">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                operatingMode === 'SIMULATION'
                  ? 'bg-cyan-400 shadow-glow-cyan'
                  : hardwareConnected
                  ? 'bg-emerald-400 shadow-glow-green'
                  : 'bg-amber-400'
              )}
              title={`Mode: ${operatingMode}`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

