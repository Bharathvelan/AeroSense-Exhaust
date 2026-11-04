import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { 
  LineChart as LineChartIcon, 
  Calendar, 
  Thermometer, 
  Droplets, 
  Users, 
  AlertTriangle, 
  Clock, 
  Download, 
  CheckCircle2,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export const EnvironmentalAnalyticsPage: React.FC = () => {
  const { historyData, timeframe, setTimeframe, settings } = useApp();

  // Compute metrics from historyData
  const avgTemp = historyData.length > 0
    ? (historyData.reduce((acc, p) => acc + p.temperature, 0) / historyData.length).toFixed(1)
    : '27.2';
  
  const avgHumidity = historyData.length > 0
    ? Math.round(historyData.reduce((acc, p) => acc + p.humidity, 0) / historyData.length)
    : 62;

  const maxHumidity = historyData.length > 0
    ? Math.max(...historyData.map(p => p.humidity)).toFixed(1)
    : '76.4';

  const occupiedPoints = historyData.filter(p => p.occupied).length;
  const occupiedPercentage = historyData.length > 0
    ? Math.round((occupiedPoints / historyData.length) * 100)
    : 42;

  const violationsCount = historyData.filter(p => p.humidity > settings.humidity_warning_threshold).length;

  const timeframes: Array<'1h' | '6h' | '24h' | '7d' | '30d'> = ['1h', '6h', '24h', '7d', '30d'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              HISTORICAL TELEMETRY VAULT
            </span>
            <span className="text-xs text-slate-500 font-mono">Time-Series Aggregation</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Environmental Analytics & Trends
          </h2>
          <p className="text-sm text-slate-400">
            Microclimate historical correlation, threshold excursion records, and occupancy patterns.
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center bg-surface-card p-1 rounded-xl border border-slate-800">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all",
                timeframe === tf
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Analytical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Daily Avg Temp */}
        <div className="p-4 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Avg Temperature</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{avgTemp}°C</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Over selected {timeframe}</div>
        </div>

        {/* Daily Avg Humidity */}
        <div className="p-4 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Avg Humidity</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{avgHumidity}% RH</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Indoor target &lt; 65%</div>
        </div>

        {/* Max Humidity Excursion */}
        <div className="p-4 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Peak Humidity</span>
            <Droplets className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">{maxHumidity}% RH</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Transient spike</div>
        </div>

        {/* Time Spent Occupied */}
        <div className="p-4 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Time Occupied</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{occupiedPercentage}%</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Presence confirmed</div>
        </div>

        {/* Threshold Violations */}
        <div className="p-4 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>RH Limit Excursions</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-2">{violationsCount}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">Ventilation triggered</div>
        </div>
      </div>

      {/* Primary Chart: Temperature & Humidity Synchronized History */}
      <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-white text-base">
              Dual-Axis Temperature & Relative Humidity Evolution
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Synchronous time-series tracking over active timeframe ({timeframe})
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Temp (°C)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Humidity (%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Threshold Line
            </span>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="temp" domain={[18, 40]} stroke="#06b6d4" tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis yAxisId="hum" orientation="right" domain={[30, 95]} stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl font-mono text-xs">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="text-cyan-400 font-bold">Temp: {payload[0]?.value}°C</p>
                        <p className="text-blue-400 font-bold">Humidity: {payload[1]?.value}%</p>
                        <p className="text-slate-400 mt-1">Occupied: {payload[0]?.payload?.occupied ? 'YES' : 'NO'}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine yAxisId="hum" y={settings.humidity_warning_threshold} stroke="#f59e0b" strokeDasharray="3 3" />
              <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#22d3ee" strokeWidth={2.2} dot={false} />
              <Line yAxisId="hum" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Fan Modulation Duty vs Room Occupancy */}
      <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">
              Ventilation Actuator Speed Response to Environmental Load
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Fan speed duty percentage (0-100%) dynamically modulated by the heuristic rule engine
            </p>
          </div>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fanSpeedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis domain={[0, 100]} stroke="#10b981" tick={{ fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl font-mono text-xs">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="text-emerald-400 font-bold">Speed: {payload[0]?.value}%</p>
                        <p className="text-slate-300">State: {payload[0]?.payload?.fanState}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="stepAfter" dataKey="fanSpeed" stroke="#10b981" strokeWidth={2} fill="url(#fanSpeedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

