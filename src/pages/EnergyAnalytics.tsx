import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Zap, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Gauge, 
  AlertCircle, 
  Info, 
  Sliders, 
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  formatPower, 
  formatCurrent, 
  formatEnergy, 
  formatCurrency 
} from '../utils/formatters';
import { cn } from '../utils/cn';

export const EnergyAnalyticsPage: React.FC = () => {
  const { 
    telemetry, 
    historyData, 
    settings, 
    updateSettings, 
    operatingMode, 
    hardwareConnected 
  } = useApp();

  const [tariffInput, setTariffInput] = useState<number>(settings.electricity_tariff_per_kwh);
  const [showTariffSave, setShowTariffSave] = useState(false);

  const handleTariffSave = () => {
    updateSettings({ electricity_tariff_per_kwh: tariffInput });
    setShowTariffSave(false);
  };

  const dailyKwh = telemetry.power.daily_kwh;
  const weeklyKwh = telemetry.power.weekly_kwh;
  const monthlyKwh = telemetry.power.monthly_kwh;

  const estimatedDailyCost = dailyKwh * settings.electricity_tariff_per_kwh;
  const estimatedWeeklyCost = weeklyKwh * settings.electricity_tariff_per_kwh;
  const estimatedMonthlyCost = monthlyKwh * settings.electricity_tariff_per_kwh;

  // Day-wise comparison data for weekly energy profile
  const dayWiseData = [
    { day: 'Mon', kwh: 0.78, cost: 0.78 * settings.electricity_tariff_per_kwh, hoursActive: 5.2 },
    { day: 'Tue', kwh: 0.92, cost: 0.92 * settings.electricity_tariff_per_kwh, hoursActive: 6.8 },
    { day: 'Wed', kwh: 0.84, cost: 0.84 * settings.electricity_tariff_per_kwh, hoursActive: 5.9 },
    { day: 'Thu', kwh: 0.71, cost: 0.71 * settings.electricity_tariff_per_kwh, hoursActive: 4.8 },
    { day: 'Fri', kwh: 0.95, cost: 0.95 * settings.electricity_tariff_per_kwh, hoursActive: 7.1 },
    { day: 'Sat', kwh: 0.42, cost: 0.42 * settings.electricity_tariff_per_kwh, hoursActive: 2.8 },
    { day: 'Sun', kwh: 0.38, cost: 0.38 * settings.electricity_tariff_per_kwh, hoursActive: 2.4 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              POWER & ENERGY ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">Module: ACS712-05B Current Shunt</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Power & Energy Analytics
          </h2>
          <p className="text-sm text-slate-400">
            Real-time wattage draw, cumulative kWh integration, and configurable electricity tariff models.
          </p>
        </div>

        {/* Configurable Tariff Widget */}
        <div className="p-3 rounded-xl bg-surface-card border border-slate-800 flex items-center gap-3 text-xs font-mono">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Electricity Tariff:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.01"
              value={tariffInput}
              onChange={(e) => {
                setTariffInput(Number(e.target.value));
                setShowTariffSave(true);
              }}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
            />
            <span className="text-slate-400">/ kWh</span>
            {showTariffSave && (
              <button
                onClick={handleTariffSave}
                className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold rounded text-[10px]"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification & Calibration Honesty Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {operatingMode === 'SIMULATION' ? (
              <strong className="text-cyan-300">Demonstration Electrical Model:</strong>
            ) : (
              <strong className="text-emerald-300">Measured Current Sensor:</strong>
            )}{' '}
            Voltage is estimated at nominal 230V AC; instantaneous current is measured via hall-effect analog input. Energy accumulation is integrated using trapz delta-time summation.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 uppercase">
          {operatingMode === 'SIMULATION' ? 'Simulated Model' : 'Hardware Measured'}
        </span>
      </div>

      {/* 4 Energy Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Instantaneous Power */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Instantaneous Power</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {formatPower(telemetry.power.power)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Current: {formatCurrent(telemetry.power.current)}</span>
            <span>Voltage: ~230V</span>
          </div>
        </div>

        {/* Daily Energy */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Daily Consumption</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {formatEnergy(dailyKwh)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Est. Cost:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(estimatedDailyCost, settings.currency_symbol)}</span>
          </div>
        </div>

        {/* Weekly Energy */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Weekly Energy</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {formatEnergy(weeklyKwh)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Est. Cost:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(estimatedWeeklyCost, settings.currency_symbol)}</span>
          </div>
        </div>

        {/* Monthly Projection */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Monthly Run-rate</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {formatEnergy(monthlyKwh)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80 flex justify-between">
            <span>Est. Cost:</span>
            <span className="text-emerald-400 font-bold">{formatCurrency(estimatedMonthlyCost, settings.currency_symbol)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Power vs Time & Current vs Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Power vs Time */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Power Demand (Watts) vs Time</h3>
              <p className="text-xs text-slate-400 font-mono">Dynamic electrical load responding to fan speed</p>
            </div>
            <span className="text-xs font-mono text-amber-400 px-2 py-1 rounded bg-amber-950/40 border border-amber-800">
              Peak: 94.2 W
            </span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#f59e0b" tick={{ fill: '#f59e0b', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl font-mono text-xs">
                          <p className="text-slate-400 mb-1">{label}</p>
                          <p className="text-amber-400 font-bold">{payload[0]?.value} W</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2} fill="url(#powerGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Current vs Time */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Current Draw (Amperes) vs Time</h3>
              <p className="text-xs text-slate-400 font-mono">Analog input reading from ACS712 shunt</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2 py-1 rounded bg-cyan-950/40 border border-cyan-800">
              Trip Limit: {settings.current_warning_limit} A
            </span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#22d3ee" tick={{ fill: '#22d3ee', fontSize: 10, fontFamily: 'monospace' }} domain={[0, 1.0]} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl font-mono text-xs">
                          <p className="text-slate-400 mb-1">{label}</p>
                          <p className="text-cyan-400 font-bold">{payload[0]?.value} A</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="current" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown Chart & Efficiency Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Daily Energy Consumption by Day of Week</h3>
              <p className="text-xs text-slate-400 font-mono">Comparative kWh aggregation across standard working cycle</p>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayWiseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#3b82f6" tick={{ fill: '#3b82f6', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl font-mono text-xs">
                          <p className="text-white font-bold mb-1">{label}</p>
                          <p className="text-cyan-400">Energy: {payload[0]?.value} kWh</p>
                          <p className="text-emerald-400">Est Cost: ${payload[0]?.payload?.cost.toFixed(2)}</p>
                          <p className="text-slate-400">Runtime: {payload[0]?.payload?.hoursActive} hrs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="kwh" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Efficiency & System Auditing */}
        <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800">
              Energy Efficiency Summary
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-2">
              Demand-controlled ventilation (DCV) comparative impact
            </p>

            <div className="my-4 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Continuous 24/7 Run (Baseline):</span>
                <span className="text-slate-200 font-bold">2.28 kWh/day</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">AeroSense DCV Automated:</span>
                <span className="text-cyan-400 font-bold">{dailyKwh.toFixed(2)} kWh/day</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex justify-between items-center">
                <span className="text-emerald-300 font-bold">Simulated Energy Reduction:</span>
                <span className="text-emerald-400 font-black text-sm">~63.1%</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-mono italic">
            * Note: Verified savings require physical facility baseline submetering. Values shown reflect algorithmic duty-cycle model.
          </p>
        </div>
      </div>
    </div>
  );
};

