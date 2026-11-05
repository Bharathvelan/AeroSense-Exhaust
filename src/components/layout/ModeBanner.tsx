import React from 'react';
import { Sparkles, Radio, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ModeBanner: React.FC = () => {
  const { operatingMode, setOperatingMode, hardwareConnected } = useApp();

  if (operatingMode === 'SIMULATION') {
    return (
      <div className="bg-gradient-to-r from-cyan-950/70 via-[#0e1c33]/80 to-cyan-950/70 border-b border-cyan-500/30 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-cyan-200 print:hidden">
        <div className="flex items-center gap-2.5 font-medium">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-400/40">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-bold tracking-wider uppercase font-mono text-cyan-300">
            SIMULATION MODE – DEMONSTRATION DATA
          </span>
          <span className="hidden md:inline text-cyan-400/70">
            • Synthesizing live temperature, humidity, occupancy radar, and fan motor telemetry.
          </span>
        </div>

        <button
          onClick={() => setOperatingMode('HARDWARE')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-semibold transition-all hover:border-cyan-400"
        >
          <span>Switch to Hardware Mode</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // HARDWARE MODE
  if (!hardwareConnected) {
    return (
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-amber-200 print:hidden">
        <div className="flex items-center gap-2.5 font-medium">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
          </div>
          <span className="font-bold tracking-wider uppercase font-mono text-amber-300">
            WAITING FOR ESP32 CONNECTION
          </span>
          <span className="hidden md:inline text-amber-300/80">
            • Real hardware mode active. Listening for telemetry on WebSocket/MQTT broker. No fake data shown.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOperatingMode('SIMULATION')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-[11px] font-medium transition-colors"
          >
            <span>Return to Demo Simulation</span>
          </button>
        </div>
      </div>
    );
  }

  // Hardware mode connected
  return (
    <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-b border-emerald-500/30 px-6 py-2 flex flex-wrap items-center justify-between text-xs text-emerald-200 print:hidden">
      <div className="flex items-center gap-2.5 font-medium">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold tracking-wider uppercase font-mono text-emerald-300">
          HARDWARE CONNECTED – ESP32 LIVE TELEMETRY STREAM
        </span>
        <span className="hidden md:inline text-emerald-400/80">
          • Receiving verified real measurements from physical sensors.
        </span>
      </div>
    </div>
  );
};

