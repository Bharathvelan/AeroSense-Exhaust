import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Users, 
  Zap, 
  Fan, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Radio,
  Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  formatTemperature, 
  formatHumidity, 
  formatPower, 
  formatCurrent, 
  formatEnergy,
  formatDateTime 
} from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const KpiCards: React.FC = () => {
  const { telemetry, settings, operatingMode, hardwareConnected, setActiveNav } = useApp();

  const isTempCritical = telemetry.temperature.value >= settings.temp_critical_threshold;
  const isTempWarning = telemetry.temperature.value >= settings.temp_warning_threshold && !isTempCritical;

  const isHumCritical = telemetry.humidity.value >= settings.humidity_critical_threshold;
  const isHumWarning = telemetry.humidity.value >= settings.humidity_warning_threshold && !isHumCritical;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
      {/* CARD 1: TEMPERATURE */}
      <div 
        onClick={() => setActiveNav('monitoring')}
        className={cn(
          "relative p-4 rounded-2xl bg-surface-card border transition-all duration-300 hover:border-cyan-500/50 cursor-pointer group shadow-card-dark flex flex-col justify-between",
          isTempCritical 
            ? "border-red-500/50 bg-red-950/20" 
            : isTempWarning 
            ? "border-amber-500/50 bg-amber-950/20" 
            : "border-slate-800/80"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "p-2 rounded-xl border shrink-0",
              isTempCritical 
                ? "bg-red-500/20 border-red-500/30 text-red-400" 
                : isTempWarning 
                ? "bg-amber-500/20 border-amber-500/30 text-amber-400" 
                : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
            )}>
              <Thermometer className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono truncate">
              Temperature
            </span>
          </div>

          <span className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0",
            isTempCritical 
              ? "bg-red-500/20 text-red-400 border border-red-500/30" 
              : isTempWarning 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          )}>
            {isTempCritical ? 'Critical' : isTempWarning ? 'Warning' : 'Normal'}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-1">
            {formatTemperature(telemetry.temperature.value)}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 capitalize">
              {telemetry.temperature.trend === 'rising' ? (
                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
              ) : telemetry.temperature.trend === 'falling' ? (
                <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              )}
              {telemetry.temperature.trend}
            </span>
            <span className="text-slate-400 font-medium">Span: {telemetry.temperature.min}° - {telemetry.temperature.max}°</span>
          </div>
        </div>
      </div>

      {/* CARD 2: HUMIDITY */}
      <div 
        onClick={() => setActiveNav('monitoring')}
        className={cn(
          "relative p-4 rounded-2xl bg-surface-card border transition-all duration-300 hover:border-cyan-500/50 cursor-pointer group shadow-card-dark flex flex-col justify-between",
          isHumCritical 
            ? "border-red-500/50 bg-red-950/20" 
            : isHumWarning 
            ? "border-amber-500/50 bg-amber-950/20" 
            : "border-slate-800/80"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "p-2 rounded-xl border shrink-0",
              isHumCritical 
                ? "bg-red-500/20 border-red-500/30 text-red-400" 
                : isHumWarning 
                ? "bg-amber-500/20 border-amber-500/30 text-amber-400" 
                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
            )}>
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono truncate">
              Humidity
            </span>
          </div>

          <span className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold shrink-0",
            isHumCritical 
              ? "bg-red-500/20 text-red-400 border border-red-500/30" 
              : isHumWarning 
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          )}>
            {isHumCritical ? 'Purge Req' : isHumWarning ? 'Elevated' : 'Optimal'}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
            {formatHumidity(telemetry.humidity.value)}
            <span className="text-xs font-normal text-slate-400">RH</span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isHumCritical ? "bg-red-500" : isHumWarning ? "bg-amber-500" : "bg-cyan-500"
              )}
              style={{ width: `${Math.min(100, telemetry.humidity.value)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400 font-mono">
            <span>Limit: {settings.humidity_warning_threshold}%</span>
            <span className="text-cyan-400 capitalize">{telemetry.humidity.trend}</span>
          </div>
        </div>
      </div>

      {/* CARD 3: OCCUPANCY */}
      <div 
        onClick={() => setActiveNav('monitoring')}
        className="relative p-4 rounded-2xl bg-surface-card border border-slate-800/80 transition-all duration-300 hover:border-cyan-500/50 cursor-pointer group shadow-card-dark flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "p-2 rounded-xl border shrink-0",
              telemetry.occupancy.detected 
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" 
                : "bg-slate-800 border-slate-700 text-slate-400"
            )}>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono truncate">
              Occupancy
            </span>
          </div>

          <span className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0",
            telemetry.occupancy.detected 
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse" 
              : "bg-slate-800 text-slate-400 border border-slate-700"
          )}>
            {telemetry.occupancy.detected ? 'DETECTED' : 'VACANT'}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-xl lg:text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <span className={cn(
              "w-3 h-3 rounded-full shrink-0",
              telemetry.occupancy.detected ? "bg-cyan-400 shadow-glow-cyan" : "bg-slate-600"
            )} />
            <span>{telemetry.occupancy.detected ? 'Occupied' : 'Unoccupied'}</span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <span className="truncate">Radar: {telemetry.occupancy.sensor_type.toUpperCase()}</span>
            <span className="text-cyan-400 font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* CARD 4: POWER CONSUMPTION */}
      <div 
        onClick={() => setActiveNav('energy-analytics')}
        className="relative p-4 rounded-2xl bg-surface-card border border-slate-800/80 transition-all duration-300 hover:border-cyan-500/50 cursor-pointer group shadow-card-dark flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono truncate">
              Electrical
            </span>
          </div>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-400/90 border border-amber-500/20 font-bold uppercase shrink-0">
            {operatingMode === 'SIMULATION' ? 'Simulated' : 'Measured'}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-1">
            {formatPower(telemetry.power.power)}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <span>{formatCurrent(telemetry.power.current)}</span>
            <span className="text-slate-300 font-medium">Day: {telemetry.power.daily_kwh.toFixed(2)} kWh</span>
          </div>
        </div>
      </div>

      {/* CARD 5: FAN STATUS */}
      <div 
        onClick={() => setActiveNav('fan-control')}
        className="relative p-4 rounded-2xl bg-surface-card border border-slate-800/80 transition-all duration-300 hover:border-cyan-500/50 cursor-pointer group shadow-card-dark flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "p-2 rounded-xl border shrink-0",
              telemetry.fan.state !== 'OFF' 
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300" 
                : "bg-slate-800 border-slate-700 text-slate-400"
            )}>
              <Fan className={cn("w-4 h-4", telemetry.fan.state !== 'OFF' ? "animate-spin-medium" : "")} />
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono truncate">
              Exhaust Fan
            </span>
          </div>

          <span className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0",
            telemetry.fan.state !== 'OFF' 
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
              : "bg-slate-800 text-slate-400 border border-slate-700"
          )}>
            {telemetry.fan.state}
          </span>
        </div>

        <div className="mt-3">
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
            {telemetry.fan.speed}%
            <span className="text-xs font-medium text-slate-400 uppercase">
              {telemetry.fan.mode}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <span className="truncate">Driver: {telemetry.fan.actuator_connected ? 'Active' : 'Sim'}</span>
            <span className="text-emerald-400 font-semibold">{telemetry.fan.command_status}</span>
          </div>
        </div>
      </div>

      {/* CARD 6: SYSTEM HEALTH */}
      <div 
        onClick={() => setActiveNav('devices')}
        className="relative p-4 rounded-2xl bg-surface-card border border-slate-800/80 transition-all duration-300 hover:border-cyan-500/50 cursor-pointer group shadow-card-dark flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono truncate">
              System Health
            </span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
            {telemetry.system.health_score}%
          </span>
        </div>

        <div className="mt-3">
          <div className="text-xl lg:text-2xl font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Optimal</span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 font-mono">
            <span className="truncate">ESP32: {operatingMode === 'SIMULATION' ? 'Active' : (hardwareConnected ? 'Online' : 'Offline')}</span>
            <span className="text-cyan-400">5/5 Nodes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

