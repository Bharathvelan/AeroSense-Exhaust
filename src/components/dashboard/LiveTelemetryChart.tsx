import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { Activity, Thermometer, Droplets } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LiveTelemetryChart: React.FC = () => {
  const { liveBuffer, settings, operatingMode } = useApp();

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              Live Environmental Telemetry Stream
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Real-time multi-variable feed • Temperature (°C) & Relative Humidity (%)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">Temp (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-blue-300">Humidity (%)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
            {operatingMode === 'SIMULATION' ? 'SIMULATED DATA' : 'HARDWARE SENSOR'}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={liveBuffer} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="timeLabel" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
              tickLine={false}
            />
            <YAxis 
              yAxisId="temp" 
              domain={[15, 45]} 
              stroke="#06b6d4" 
              tick={{ fill: '#06b6d4', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
            />
            <YAxis 
              yAxisId="hum" 
              orientation="right" 
              domain={[20, 100]} 
              stroke="#3b82f6" 
              tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0f172a]/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono text-xs">
                      <p className="text-slate-400 mb-1.5 font-bold border-b border-slate-800 pb-1">{label}</p>
                      <p className="text-cyan-400 flex items-center justify-between gap-4">
                        <span>Temperature:</span>
                        <span className="font-extrabold">{payload[0]?.value}°C</span>
                      </p>
                      <p className="text-blue-400 flex items-center justify-between gap-4 mt-0.5">
                        <span>Humidity:</span>
                        <span className="font-extrabold">{payload[1]?.value}%</span>
                      </p>
                      <p className="text-slate-400 flex items-center justify-between gap-4 mt-0.5 pt-1 border-t border-slate-800/80">
                        <span>Fan State:</span>
                        <span className="text-emerald-400">{payload[0]?.payload?.fanState} ({payload[0]?.payload?.fanSpeed}%)</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Threshold reference lines */}
            <ReferenceLine 
              yAxisId="hum" 
              y={settings.humidity_warning_threshold} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              label={{ value: `Hum Warn (${settings.humidity_warning_threshold}%)`, fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} 
            />

            <Area 
              yAxisId="temp"
              type="monotone" 
              dataKey="temperature" 
              stroke="#22d3ee" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#tempGradient)" 
              isAnimationActive={false}
            />
            <Area 
              yAxisId="hum"
              type="monotone" 
              dataKey="humidity" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#humGradient)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

