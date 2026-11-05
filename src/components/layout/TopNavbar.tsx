import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  User, 
  ChevronRight,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

interface TopNavbarProps {
  pageTitle: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ pageTitle }) => {
  const { 
    operatingMode, 
    setOperatingMode, 
    hardwareConnected, 
    wsStatus,
    criticalAlertCount,
    unreadAlertCount,
    setActiveNav,
    telemetry
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-[#0e1424]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 print:hidden">
      {/* Left: Breadcrumb & Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span>AeroSense</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-medium capitalize">{pageTitle}</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
          {pageTitle}
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-mono text-xs shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime || 'Synchronizing...'}</span>
        </div>

        {/* Operating Mode Selector Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-sm">
          <button
            onClick={() => setOperatingMode('SIMULATION')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all font-mono',
              operatingMode === 'SIMULATION'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="Switch to Synthetic Demonstration Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulation</span>
          </button>

          <button
            onClick={() => setOperatingMode('HARDWARE')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all font-mono',
              operatingMode === 'HARDWARE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-green'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="Switch to Real ESP32 Physical Device Mode"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hardware</span>
          </button>
        </div>

        {/* Live Hardware Link Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
          {operatingMode === 'SIMULATION' ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span className="text-cyan-300">Virtual ESP32</span>
            </div>
          ) : hardwareConnected ? (
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">ESP32 Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-400">
              <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Waiting for ESP32</span>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setActiveNav('alerts')}
          className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Alerts and Notifications"
        >
          <Bell className="w-4 h-4" />
          {criticalAlertCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-glow-red animate-pulse">
              {criticalAlertCount}
            </span>
          ) : unreadAlertCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950">
              {unreadAlertCount}
            </span>
          ) : null}
        </button>

        {/* User / Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 font-semibold shadow-inner">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-white">Facility Admin</span>
            <span className="text-[10px] text-cyan-400/90 font-mono">atomQUEST 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
};

