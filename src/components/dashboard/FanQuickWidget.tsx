import React from 'react';
import { 
  Fan, 
  Power, 
  Sparkles, 
  AlertOctagon, 
  Sliders, 
  ShieldAlert,
  ArrowUpRight 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SixBladeFan } from '../fan/SixBladeFan';
import { cn } from '../../utils/cn';

export const FanQuickWidget: React.FC = () => {
  const { 
    telemetry, 
    setFanControl, 
    setFanMode, 
    triggerEmergencyStop, 
    operatingMode, 
    hardwareConnected,
    setActiveNav 
  } = useApp();

  const fan = telemetry.fan;

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Fan className={cn("w-4 h-4", fan.state !== 'OFF' ? "animate-spin-slow" : "")} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Smart Fan Actuator
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Operating Mode: <span className="text-cyan-400 font-bold uppercase">{fan.mode}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveNav('fan-control')}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
          title="Open Full Fan Control Center"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Fan Visual Center */}
      <div className="flex flex-col items-center justify-center my-2">
        <SixBladeFan 
          speedPercentage={fan.speed} 
          state={fan.state} 
          isEmergencyStopped={fan.emergency_stopped}
          size="md" 
        />
        
        <div className="mt-3 text-center">
          <div className="text-sm font-mono font-bold text-white">
            State: <span className={cn(
              fan.state === 'OFF' ? "text-slate-400" : "text-emerald-400 text-glow-green"
            )}>{fan.state}</span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-0.5">
            Motor Driver: {operatingMode === 'SIMULATION' ? 'Simulated PWM Driver' : (hardwareConnected ? 'ESP32 MOSFET/Relay Active' : 'Disconnected')}
          </div>
        </div>
      </div>

      {/* Quick Action Presets */}
      <div className="space-y-3 mt-3 pt-3 border-t border-slate-800/80">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setFanControl('OFF', 0)}
            className={cn(
              "py-2 rounded-xl text-xs font-mono font-bold transition-all border",
              fan.state === 'OFF'
                ? "bg-slate-700 text-white border-slate-500 shadow-inner"
                : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800"
            )}
          >
            OFF
          </button>
          
          <button
            onClick={() => setFanControl('LOW', 35)}
            className={cn(
              "py-2 rounded-xl text-xs font-mono font-bold transition-all border",
              fan.state === 'LOW'
                ? "bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-glow-cyan-sm"
                : "bg-slate-900/80 text-slate-400 hover:text-cyan-300 border-slate-800 hover:bg-slate-800"
            )}
          >
            LOW
          </button>

          <button
            onClick={() => setFanControl('MEDIUM', 70)}
            className={cn(
              "py-2 rounded-xl text-xs font-mono font-bold transition-all border",
              fan.state === 'MEDIUM'
                ? "bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-glow-cyan-sm"
                : "bg-slate-900/80 text-slate-400 hover:text-cyan-300 border-slate-800 hover:bg-slate-800"
            )}
          >
            MED
          </button>

          <button
            onClick={() => setFanControl('HIGH', 100)}
            className={cn(
              "py-2 rounded-xl text-xs font-mono font-bold transition-all border",
              fan.state === 'HIGH'
                ? "bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-glow-cyan-sm"
                : "bg-slate-900/80 text-slate-400 hover:text-cyan-300 border-slate-800 hover:bg-slate-800"
            )}
          >
            HIGH
          </button>
        </div>

        {/* Mode selector + Emergency Stop */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFanMode(fan.mode === 'AUTO' ? 'MANUAL' : 'AUTO')}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center gap-1.5",
              fan.mode === 'AUTO'
                ? "bg-blue-950/80 text-blue-300 border-blue-500/40"
                : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800"
            )}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode: {fan.mode}</span>
          </button>

          <button
            onClick={triggerEmergencyStop}
            className="py-2 px-3 rounded-xl text-xs font-mono font-bold bg-red-950/80 hover:bg-red-900/90 text-red-300 border border-red-500/40 hover:border-red-400 transition-all flex items-center gap-1.5 shrink-0"
            title="Immediate Emergency Cutoff"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>E-STOP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

