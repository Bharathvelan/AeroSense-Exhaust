import React from 'react';
import { 
  KpiCards 
} from '../components/dashboard/KpiCards';
import { 
  LiveTelemetryChart 
} from '../components/dashboard/LiveTelemetryChart';
import { 
  FanQuickWidget 
} from '../components/dashboard/FanQuickWidget';
import { 
  RecentAlertsStream 
} from '../components/dashboard/RecentAlertsStream';
import { 
  TelemetryConsole 
} from '../components/dashboard/TelemetryConsole';
import { 
  Radio, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Gauge, 
  Waves, 
  Zap, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUptime } from '../utils/formatters';

export const OverviewPage: React.FC = () => {
  const { telemetry, operatingMode, hardwareConnected, rules } = useApp();

  const activeRulesCount = rules.filter(r => r.enabled).length;
  
  // Dynamic Industrial Indoor Air Quality (IAQ) Index
  const iaqScore = Math.max(60, Math.min(100, Math.round(100 - Math.max(0, telemetry.humidity.value - 55) * 1.2 - Math.max(0, telemetry.temperature.value - 26) * 1.8)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              CENTRAL SCADA NODE
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {telemetry.device_id}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            AeroSense Control Center
          </h2>
          <p className="text-sm text-slate-400">
            Intelligent Environmental Monitoring & Automated Ventilation Management.
          </p>
        </div>

        {/* Quick System Badge Bar */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Rules Active:</span>
            <span className="font-bold text-white">{activeRulesCount} / {rules.length}</span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Uptime:</span>
            <span className="font-bold text-emerald-400">{formatUptime(telemetry.system.uptime_seconds)}</span>
          </div>
        </div>
      </div>

      {/* Industrial Facility Health & Microclimate Ribbon */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1628]/95 to-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IAQ INDEX: {iaqScore} / 100</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Status: <strong className="text-white font-medium">{iaqScore >= 90 ? 'Optimal Air Quality' : 'Acceptable Microclimate'}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>Air Delivery: <strong className="text-cyan-300">{telemetry.fan.state === 'OFF' ? 'Standby (0 CFM)' : `${Math.round((telemetry.fan.speed / 100) * 220)} CFM`}</strong></span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>PWM Frequency: <strong className="text-amber-300">25.0 kHz</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protection Circuit: <strong className="text-emerald-300">ARMED</strong></span>
          </div>
        </div>
      </div>

      {/* 6 Core KPI Cards */}
      <KpiCards />

      {/* Central Visual Grid: Live Chart + Fan Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveTelemetryChart />
        </div>
        <div className="lg:col-span-1">
          <FanQuickWidget />
        </div>
      </div>

      {/* Secondary Row: Recent Alerts + Industrial Diagnostic Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RecentAlertsStream />
        </div>

        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Automation & Actuation Subsystem Diagnostics
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  State machine status, sensor buses, and protection circuit health
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Environmental Node */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">DHT22 / SHT31 Bus</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                I2C / 1-Wire
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Sampling: 1.0 Hz</span>
                <span className="text-cyan-400">0 CRC Err</span>
              </div>
            </div>

            {/* Radar Presence Node */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">mmWave / PIR Sensor</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                UART / GPIO 14
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Radar Gate: 4.5m</span>
                <span className="text-cyan-400">Debounce: 3s</span>
              </div>
            </div>

            {/* Power Measurement Module */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">ACS712 Current Sensing</span>
                <span className="text-amber-400 font-bold">MONITORED</span>
              </div>
              <div className="text-lg font-bold text-white font-mono">
                ADC Channel 1
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Sensitivity: 66mV/A</span>
                <span className="text-amber-400">Limit: 1.5A</span>
              </div>
            </div>
          </div>

          {/* Industrial Disclaimer footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Platform optimized for atomQUEST 2026 Smart Building Innovation Category
            </span>
            <span>ESP-IDF / FreeRTOS Ready</span>
          </div>
        </div>
      </div>

      {/* Real-time MQTT / WebSocket Live Bus Console */}
      <TelemetryConsole />
    </div>
  );
};

