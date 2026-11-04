import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  Thermometer, 
  Droplets, 
  Radio, 
  Radar, 
  Users, 
  Sliders, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OccupancySensorType } from '../types';
import { formatTemperature, formatHumidity, formatDateTime } from '../utils/formatters';
import { cn } from '../utils/cn';

export const LiveMonitoringPage: React.FC = () => {
  const { 
    telemetry, 
    liveBuffer, 
    settings, 
    updateSettings, 
    operatingMode, 
    hardwareConnected 
  } = useApp();

  // Local threshold adjustment states for interactive fine-tuning
  const [tempWarn, setTempWarn] = useState(settings.temp_warning_threshold);
  const [tempCrit, setTempCrit] = useState(settings.temp_critical_threshold);
  const [humWarn, setHumWarn] = useState(settings.humidity_warning_threshold);
  const [humCrit, setHumCrit] = useState(settings.humidity_critical_threshold);

  const saveThresholds = () => {
    updateSettings({
      temp_warning_threshold: tempWarn,
      temp_critical_threshold: tempCrit,
      humidity_warning_threshold: humWarn,
      humidity_critical_threshold: humCrit,
    });
  };

  const handleSensorConfigChange = (type: OccupancySensorType) => {
    updateSettings({ occupancy_sensor_type: type });
  };

  const isTempCritical = telemetry.temperature.value >= settings.temp_critical_threshold;
  const isTempWarning = telemetry.temperature.value >= settings.temp_warning_threshold && !isTempCritical;

  const isHumCritical = telemetry.humidity.value >= settings.humidity_critical_threshold;
  const isHumWarning = telemetry.humidity.value >= settings.humidity_warning_threshold && !isHumCritical;

  const sensorConnected = operatingMode === 'SIMULATION' ? true : hardwareConnected;

  return (
    <div className="space-y-6">
      {/* Page Title & Sensor Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              INSTRUMENTATION SUITE
            </span>
            <span className="text-xs text-slate-500 font-mono">Calibrated High-Precision Node</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Live Environmental & Presence Monitoring
          </h2>
          <p className="text-sm text-slate-400">
            Micro-climate tracking, dual-technology presence validation, and threshold analytics.
          </p>
        </div>

        {/* Occupancy Sensor Technology Selector */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-card border border-slate-800 text-xs font-mono">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Radar className="w-3.5 h-3.5 text-cyan-400" />
            Installed Presence Sensing Configuration:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['PIR', 'mmWave', 'both', 'not_configured'] as OccupancySensorType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleSensorConfigChange(type)}
                className={cn(
                  "px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all",
                  settings.occupancy_sensor_type === type
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {type === 'both' ? 'Both (Dual)' : type === 'not_configured' ? 'Not Config' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Monitoring Cards: Temperature, Humidity, Occupancy Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL 1: TEMPERATURE INSTRUMENT */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Air Temperature</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Sensor: DHT22 / SHT31</p>
                </div>
              </div>

              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border",
                !sensorConnected
                  ? "bg-slate-800 text-slate-500 border-slate-700"
                  : isTempCritical
                  ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                  : isTempWarning
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              )}>
                {!sensorConnected ? 'Disconnected' : isTempCritical ? 'Critical Limit' : isTempWarning ? 'Warning' : 'Nominal'}
              </span>
            </div>

            {/* Reading Display */}
            <div className="my-5 flex items-baseline justify-between">
              <div>
                <span className="text-4xl lg:text-5xl font-black text-white font-mono tracking-tight">
                  {sensorConnected ? formatTemperature(telemetry.temperature.value) : '--.-°C'}
                </span>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Trend: <span className="text-cyan-400 font-semibold">{telemetry.temperature.trend.toUpperCase()}</span>
                </p>
              </div>

              <div className="text-right text-xs font-mono space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400">Recorded Range</div>
                <div className="text-white font-bold">Min: {telemetry.temperature.min}°C</div>
                <div className="text-white font-bold">Max: {telemetry.temperature.max}°C</div>
              </div>
            </div>
          </div>

          {/* Interactive Threshold Slider Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Warning / Critical Limit:</span>
              <span className="text-cyan-400 font-bold">{settings.temp_warning_threshold}°C / {settings.temp_critical_threshold}°C</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={tempWarn}
                onChange={(e) => setTempWarn(Number(e.target.value))}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white"
                placeholder="Warn °C"
              />
              <input
                type="number"
                value={tempCrit}
                onChange={(e) => setTempCrit(Number(e.target.value))}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white"
                placeholder="Crit °C"
              />
              <button
                onClick={saveThresholds}
                className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-mono font-bold"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 2: HUMIDITY CIRCULAR GAUGE INSTRUMENT */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Relative Humidity</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Primary Exhaust Actuation Driver</p>
                </div>
              </div>

              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border",
                !sensorConnected
                  ? "bg-slate-800 text-slate-500 border-slate-700"
                  : isHumCritical
                  ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                  : isHumWarning
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              )}>
                {!sensorConnected ? 'Disconnected' : isHumCritical ? 'Purge Needed' : isHumWarning ? 'Elevated' : 'Optimal'}
              </span>
            </div>

            {/* Radial Gauge Representation */}
            <div className="my-3 flex items-center justify-around">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className={cn(
                      "transition-all duration-700 ease-out",
                      isHumCritical ? "text-red-500" : isHumWarning ? "text-amber-500" : "text-cyan-400"
                    )}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={
                      sensorConnected 
                        ? (2 * Math.PI * 40) - ((Math.min(100, telemetry.humidity.value) / 100) * (2 * Math.PI * 40))
                        : 2 * Math.PI * 40
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span className="text-2xl font-black text-white">
                    {sensorConnected ? `${Math.round(telemetry.humidity.value)}%` : '--'}
                  </span>
                  <span className="text-[10px] text-slate-400">RH Level</span>
                </div>
              </div>

              <div className="text-xs font-mono space-y-1.5">
                <div className="text-slate-400">Trigger Thresholds:</div>
                <div className="text-amber-400">Warning: {settings.humidity_warning_threshold}%</div>
                <div className="text-red-400">Critical: {settings.humidity_critical_threshold}%</div>
                <div className="text-cyan-400">Hysteresis: ±5%</div>
              </div>
            </div>
          </div>

          {/* Interactive Threshold Slider Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Configure Fan Trigger RH:</span>
              <span className="text-cyan-400 font-bold">{humWarn}% / {humCrit}%</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={humWarn}
                onChange={(e) => setHumWarn(Number(e.target.value))}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white"
                placeholder="Warn %"
              />
              <input
                type="number"
                value={humCrit}
                onChange={(e) => setHumCrit(Number(e.target.value))}
                className="w-1/2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white"
                placeholder="Crit %"
              />
              <button
                onClick={saveThresholds}
                className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-mono font-bold"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        {/* PANEL 3: OCCUPANCY RADAR & PRESENCE ANALYZER */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Presence & Radar</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Dual-Sensing Sensor Fusion</p>
                </div>
              </div>

              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border",
                telemetry.occupancy.detected
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              )}>
                {telemetry.occupancy.detected ? 'OCCUPIED' : 'VACANT'}
              </span>
            </div>

            {/* Radar Visual Feed */}
            <div className="my-4 space-y-3">
              {/* PIR Sensor subcard */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    telemetry.occupancy.pir_detected ? "bg-cyan-400 shadow-glow-cyan animate-ping" : "bg-slate-700"
                  )} />
                  <div>
                    <div className="text-xs font-bold text-white font-mono">PIR Motion Detector</div>
                    <div className="text-[10px] text-slate-400">Thermal IR macro movement</div>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-mono font-bold uppercase",
                  telemetry.occupancy.pir_detected ? "text-cyan-400" : "text-slate-500"
                )}>
                  {telemetry.occupancy.pir_detected ? 'Motion Pulse' : 'Clear'}
                </span>
              </div>

              {/* mmWave Radar subcard */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    telemetry.occupancy.mmwave_detected ? "bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-pulse" : "bg-slate-700"
                  )} />
                  <div>
                    <div className="text-xs font-bold text-white font-mono">mmWave 24GHz Radar (LD2410)</div>
                    <div className="text-[10px] text-slate-400">Subtle breathing & micro-motion</div>
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-mono font-bold uppercase",
                  telemetry.occupancy.mmwave_detected ? "text-blue-400" : "text-slate-500"
                )}>
                  {telemetry.occupancy.mmwave_detected ? 'Presence Active' : 'Stationary Empty'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Last Valid Detection:
            </span>
            <span className="text-slate-200 font-bold">
              {formatDateTime(telemetry.occupancy.last_detection)}
            </span>
          </div>
        </div>
      </div>

      {/* Live Stream Line Chart */}
      <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Continuous Multi-Sensor Telemetry Feed
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live buffered sensor samples at 1.0s interval with configured safety limits
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Humidity (%)
            </span>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={liveBuffer} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" domain={[15, 45]} stroke="#06b6d4" tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="right" orientation="right" domain={[20, 100]} stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl shadow-xl font-mono text-xs">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="text-cyan-400">Temp: {payload[0]?.value}°C</p>
                        <p className="text-blue-400">Humidity: {payload[1]?.value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine yAxisId="right" y={settings.humidity_warning_threshold} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine yAxisId="left" y={settings.temp_warning_threshold} stroke="#ef4444" strokeDasharray="3 3" />
              <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#22d3ee" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

