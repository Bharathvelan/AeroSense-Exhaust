import React, { useState } from 'react';
import { 
  Fan, 
  Power, 
  Sliders, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  AlertTriangle,
  Zap,
  Cpu,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SixBladeFan } from '../components/fan/SixBladeFan';
import { formatDateTime } from '../utils/formatters';
import { FanState } from '../types';
import { cn } from '../../src/utils/cn';

export const FanControlPage: React.FC = () => {
  const { 
    telemetry, 
    setFanControl, 
    setFanMode, 
    triggerEmergencyStop, 
    operatingMode, 
    hardwareConnected, 
    settings 
  } = useApp();

  const fan = telemetry.fan;
  const [sliderVal, setSliderVal] = useState<number>(fan.speed || 50);
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderVal(val);
    let state: FanState = 'ON';
    if (val === 0) state = 'OFF';
    else if (val <= 40) state = 'LOW';
    else if (val <= 75) state = 'MEDIUM';
    else state = 'HIGH';

    setFanControl(state, val);
  };

  const handleStateClick = (state: FanState) => {
    let speed = 0;
    if (state === 'LOW') speed = 35;
    else if (state === 'MEDIUM') speed = 70;
    else if (state === 'HIGH') speed = 100;
    else if (state === 'ON') speed = 60;
    else if (state === 'AUTO') speed = fan.speed;

    setSliderVal(speed);
    setFanControl(state, speed);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              ACTUATOR COMMAND CONSOLE
            </span>
            <span className="text-xs text-slate-500 font-mono">PWM / Relay Control Interface</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Smart Fan Actuator Control Center
          </h2>
          <p className="text-sm text-slate-400">
            Bidirectional ventilation speed modulation, automated hysteresis cycle, and physical safety interlocks.
          </p>
        </div>

        {/* Safety Interlock Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <ShieldAlert className={cn(
            "w-4 h-4",
            fan.emergency_stopped ? "text-red-400" : "text-emerald-400"
          )} />
          <span className="text-slate-400">Safety Interlock:</span>
          <span className={cn(
            "font-bold uppercase",
            fan.emergency_stopped ? "text-red-400" : "text-emerald-400"
          )}>
            {fan.emergency_stopped ? 'Tripped (E-Stop)' : 'Armed & Verified'}
          </span>
        </div>
      </div>

      {/* Safety Banner */}
      {!settings.fan_actuator_available || operatingMode === 'SIMULATION' ? (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Simulation Control Panel:</strong> Commands simulate motor driver PWM waveforms & RPM response without transmitting physical high-voltage pulses.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-cyan-900/60 font-mono text-[10px] uppercase font-bold text-cyan-300">
            Virtual Motor Driver
          </span>
        </div>
      ) : !hardwareConnected ? (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Hardware Actuator Disconnected:</strong> Physical ESP32 relay/MOSFET driver is unreachable. Manual commands blocked for safety.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-900/60 font-mono text-[10px] uppercase font-bold text-amber-300">
            Commands Blocked
          </span>
        </div>
      ) : null}

      {/* Main Grid: Large 6-Blade Fan Visualizer + Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Visualizer: Large 6-Blade Fan */}
        <div className="lg:col-span-6 p-8 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
          {/* Subtle background radar circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-96 h-96 rounded-full border border-cyan-500/20" />
            <div className="w-72 h-72 rounded-full border border-cyan-500/20" />
            <div className="w-48 h-48 rounded-full border border-cyan-500/20" />
          </div>

          <SixBladeFan 
            speedPercentage={fan.speed} 
            state={fan.state} 
            isEmergencyStopped={fan.emergency_stopped}
            size="xl" 
          />

          <div className="mt-6 text-center z-10">
            <div className="text-2xl font-black font-mono text-white tracking-wider flex items-center justify-center gap-2">
              <span className={cn(
                "w-3 h-3 rounded-full",
                fan.state === 'OFF' ? "bg-slate-600" : "bg-cyan-400 shadow-glow-cyan"
              )} />
              EXHAUST FAN: {fan.state}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Commanded Speed: <strong className="text-cyan-400">{fan.speed}%</strong> • Mode: <strong className="text-white uppercase">{fan.mode}</strong>
            </p>
          </div>
        </div>

        {/* Right Console: Mode Selection & Fine Sliders */}
        <div className="lg:col-span-6 space-y-6">
          {/* Fan Operating Modes */}
          <div className="p-6 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="font-bold text-white text-base">Actuation Mode & Presets</h3>
                <p className="text-xs text-slate-400 font-mono">Select autonomous algorithm or manual override</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFanMode('AUTO')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all",
                    fan.mode === 'AUTO'
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  AUTO
                </button>
                <button
                  onClick={() => setFanMode('MANUAL')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all",
                    fan.mode === 'MANUAL'
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  MANUAL
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {(['OFF', 'LOW', 'MEDIUM', 'HIGH', 'AUTO'] as FanState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStateClick(st)}
                  className={cn(
                    "py-3 px-2 rounded-xl text-xs font-mono font-bold transition-all border flex flex-col items-center justify-center gap-1",
                    fan.state === st
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-glow-cyan-sm"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800"
                  )}
                >
                  <span className="text-sm">{st}</span>
                  <span className="text-[10px] text-slate-500">
                    {st === 'OFF' ? '0%' : st === 'LOW' ? '35%' : st === 'MEDIUM' ? '70%' : st === 'HIGH' ? '100%' : 'Smart'}
                  </span>
                </button>
              ))}

              {/* Power Toggle Button */}
              <button
                onClick={() => handleStateClick(fan.state === 'OFF' ? 'MEDIUM' : 'OFF')}
                className={cn(
                  "py-3 px-2 rounded-xl text-xs font-mono font-bold transition-all border flex flex-col items-center justify-center gap-1",
                  fan.state === 'OFF'
                    ? "bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                )}
              >
                <Power className="w-4 h-4" />
                <span className="text-[10px]">{fan.state === 'OFF' ? 'START' : 'STOP'}</span>
              </button>
            </div>

            {/* Speed modulation slider (0 - 100%) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Continuous Speed Modulation (PWM Duty):
                </span>
                <span className="text-cyan-400 font-extrabold text-sm">{sliderVal}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliderVal}
                onChange={handleSliderChange}
                disabled={fan.mode === 'AUTO'}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% (Standby)</span>
                <span>25%</span>
                <span>50% (Eco)</span>
                <span>75%</span>
                <span>100% (Purge Turbo)</span>
              </div>
            </div>

            {/* Emergency Stop Cutoff */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-red-300 font-mono uppercase flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  Hard Emergency Stop Interlock
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Immediately kill motor driver signal & trip electrical relay.
                </p>
              </div>

              <button
                onClick={triggerEmergencyStop}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs tracking-wider uppercase shadow-glow-red transition-all shrink-0 active:scale-95"
              >
                EMERGENCY STOP
              </button>
            </div>
          </div>

          {/* Actuator Telemetry Strip */}
          <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Command Status</span>
              <span className="text-emerald-400 font-bold text-sm">{fan.command_status}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Last Timestamp</span>
              <span className="text-slate-300 font-medium">{formatDateTime(fan.last_command_time)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Driver Protocol</span>
              <span className="text-cyan-400 font-medium">PWM 25kHz / Relay</span>
            </div>
            <div>
              <span className="text-slate-500 block">Thermal Limit</span>
              <span className="text-slate-300 font-medium">&lt; 65°C Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

