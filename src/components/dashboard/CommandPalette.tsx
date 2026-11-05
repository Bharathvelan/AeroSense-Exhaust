import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  LayoutDashboard, 
  Activity, 
  Fan, 
  Cpu, 
  Zap, 
  LineChart, 
  Bell, 
  Server, 
  FileText, 
  Settings, 
  AlertOctagon, 
  Wind, 
  RotateCcw, 
  Sparkles, 
  Radio, 
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { 
    setActiveNav, 
    triggerEmergencyStop, 
    setFanControl, 
    setFanMode,
    operatingMode, 
    setOperatingMode, 
    clearAlerts 
  } = useApp();
  
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(); // toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationCommands = [
    { id: 'overview', label: 'Go to Overview Control Center', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'monitoring', label: 'Go to Live Environmental Monitoring', icon: Activity, category: 'Navigation' },
    { id: 'fan-control', label: 'Go to Smart Fan Actuator Controls', icon: Fan, category: 'Navigation' },
    { id: 'automation', label: 'Go to Intelligent Automation Engine', icon: Cpu, category: 'Navigation' },
    { id: 'energy-analytics', label: 'Go to Electrical & Energy Analytics', icon: Zap, category: 'Navigation' },
    { id: 'environmental-analytics', label: 'Go to Environmental Historical Trends', icon: LineChart, category: 'Navigation' },
    { id: 'alerts', label: 'Go to Safety Alarms & Incident Log', icon: Bell, category: 'Navigation' },
    { id: 'devices', label: 'Go to Hardware Nodes & Sensor Diagnostics', icon: Server, category: 'Navigation' },
    { id: 'reports', label: 'Go to Audit & Engineering Compliance Reports', icon: FileText, category: 'Navigation' },
    { id: 'settings', label: 'Go to System & Actuator Parameters', icon: Settings, category: 'Navigation' },
  ];

  const actionCommands = [
    {
      id: 'estop',
      label: 'EMERGENCY SCRAM: Immediate Fan Motor Shutdown',
      icon: AlertOctagon,
      category: 'Actuator Control',
      action: () => {
        triggerEmergencyStop();
        onClose();
      },
      danger: true
    },
    {
      id: 'boost',
      label: 'Activate Forced Moisture Purge (100% Speed)',
      icon: Wind,
      category: 'Actuator Control',
      action: () => {
        setFanControl('HIGH', 100);
        onClose();
      }
    },
    {
      id: 'auto',
      label: 'Set Fan to Autonomous Intelligent Mode',
      icon: Cpu,
      category: 'Actuator Control',
      action: () => {
        setFanControl('AUTO');
        setFanMode('AUTO');
        onClose();
      }
    },
    {
      id: 'toggle-mode',
      label: operatingMode === 'SIMULATION' ? 'Switch to Hardware Connected Mode' : 'Return to Virtual Simulation Mode',
      icon: operatingMode === 'SIMULATION' ? Radio : Sparkles,
      category: 'System State',
      action: () => {
        setOperatingMode(operatingMode === 'SIMULATION' ? 'HARDWARE' : 'SIMULATION');
        onClose();
      }
    },
    {
      id: 'clear-alerts',
      label: 'Acknowledge All Open System Alarms',
      icon: RotateCcw,
      category: 'Safety',
      action: () => {
        clearAlerts();
        onClose();
      }
    }
  ];

  const filteredNav = navigationCommands.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const filteredActions = actionCommands.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-[#0c1220] border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0e1628]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Type a command or jump to page... (ESC to exit)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List Container */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Action Commands */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                SCADA Actuation Commands
              </div>
              <div className="space-y-1 mt-1">
                {filteredActions.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-mono transition-all ${
                        cmd.danger 
                          ? 'hover:bg-red-500/20 text-red-300 border border-transparent hover:border-red-500/40' 
                          : 'hover:bg-cyan-500/15 text-slate-200 hover:text-cyan-200 border border-transparent hover:border-cyan-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${cmd.danger ? 'text-red-400' : 'text-cyan-400'}`} />
                        <span className="font-semibold">{cmd.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        Execute
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Commands */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                System Navigation
              </div>
              <div className="space-y-1 mt-1">
                {filteredNav.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        setActiveNav(cmd.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{cmd.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">Jump</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredNav.length === 0 && (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No matching SCADA commands found for "{search}"
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-[#080d18] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>AeroSense SCADA Dispatcher v2.4</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">ESC</kbd> to dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
};
