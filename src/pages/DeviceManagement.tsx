import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Wifi, 
  Radio, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Settings2, 
  Terminal, 
  ShieldCheck,
  Zap,
  Thermometer,
  Users,
  Wind,
  Fan
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SensorDevice } from '../types';
import { formatUptime, formatDateTime } from '../utils/formatters';
import { cn } from '../utils/cn';

export const DeviceManagementPage: React.FC = () => {
  const { telemetry, operatingMode, hardwareConnected, settings } = useApp();

  const isSim = operatingMode === 'SIMULATION';
  const isOnline = isSim || hardwareConnected;

  const sensorsList: SensorDevice[] = [
    {
      id: 'sens-01',
      name: 'Environmental Humidity & Temp',
      type: 'SHT31 / DHT22 Dual Element',
      category: 'environmental',
      connection_status: isOnline ? 'connected' : 'disconnected',
      reading: isOnline ? `${telemetry.temperature.value}°C / ${telemetry.humidity.value}%` : '--',
      unit: '°C / % RH',
      last_update: isOnline ? telemetry.timestamp : '--',
      calibration_status: 'calibrated',
      error_status: null,
      accuracy: '±0.3°C / ±2% RH',
      model: 'Sensirion SHT31-DIS-B',
    },
    {
      id: 'sens-02',
      name: 'Dual Presence Radar & PIR',
      type: 'LD2410 24GHz FMCW + HC-SR501',
      category: 'presence',
      connection_status: isOnline ? (settings.occupancy_sensor_type === 'not_configured' ? 'not_configured' : 'connected') : 'disconnected',
      reading: isOnline ? (telemetry.occupancy.detected ? 'Occupied' : 'Vacant') : '--',
      unit: 'State',
      last_update: isOnline ? telemetry.occupancy.last_detection : '--',
      calibration_status: 'calibrated',
      error_status: null,
      accuracy: 'Gate: 0.75m - 6.00m',
      model: 'Hi-Link LD2410 + Pyroelectric PIR',
    },
    {
      id: 'sens-03',
      name: 'Current Sensing Module',
      type: 'ACS712 Linear Hall-Effect',
      category: 'electrical',
      connection_status: isOnline ? 'connected' : 'disconnected',
      reading: isOnline ? `${telemetry.power.current.toFixed(2)} A` : '--',
      unit: 'Amperes',
      last_update: isOnline ? telemetry.timestamp : '--',
      calibration_status: isSim ? 'factory_default' : (telemetry.power.is_calibrated ? 'calibrated' : 'uncalibrated'),
      error_status: null,
      accuracy: '66 mV/A Sensitivity',
      model: 'Allegro ACS712ELCTR-05B-T',
    },
    {
      id: 'sens-04',
      name: 'Total VOC & Air Quality (Optional)',
      type: 'MOX Gas Sensor',
      category: 'environmental',
      connection_status: 'not_configured',
      reading: 'Unpopulated',
      unit: 'ppm',
      last_update: '--',
      calibration_status: 'n/a',
      error_status: 'Header J5 open-circuit (Designated expansion header for Round 3)',
      accuracy: 'N/A',
      model: 'Sensirion SGP30 / MQ-135 Header',
    },
    {
      id: 'sens-05',
      name: 'Ventilation Motor Actuator Driver',
      type: 'Optocoupled MOSFET / Relay',
      category: 'actuator',
      connection_status: settings.fan_actuator_available ? (isOnline ? 'connected' : 'disconnected') : 'not_configured',
      reading: isOnline ? `${telemetry.fan.speed}% (${telemetry.fan.state})` : '--',
      unit: 'PWM Duty',
      last_update: isOnline ? telemetry.fan.last_command_time : '--',
      calibration_status: 'factory_default',
      error_status: null,
      accuracy: '25 kHz PWM Smooth Modulation',
      model: 'IRF520N Power MOSFET Stage',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              HARDWARE TOPOLOGY
            </span>
            <span className="text-xs text-slate-500 font-mono">Microcontroller & Peripheral Bus Management</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Device & Sensor Diagnostics
          </h2>
          <p className="text-sm text-slate-400">
            Node status, bus ping health, calibrated tolerances, and raw telemetry inspection.
          </p>
        </div>
      </div>

      {/* Main ESP32 Device Hub Card */}
      <div className="p-6 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glow-cyan-sm shrink-0">
              <Server className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white font-mono">
                  ESP32 – AeroSense Controller
                </h3>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase",
                  isOnline 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                    : "bg-red-500/20 text-red-300 border border-red-500/40"
                )}>
                  {isSim ? 'Virtual Node' : (hardwareConnected ? 'Online' : 'Disconnected')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Primary dual-core Xtensa LX6 @ 240MHz • FreeRTOS Real-Time Kernel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Health Score</span>
              <span className="text-emerald-400 font-bold text-sm">98.4%</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Active Mode</span>
              <span className="text-cyan-400 font-bold text-sm uppercase">{operatingMode}</span>
            </div>
          </div>
        </div>

        {/* ESP32 Specifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">Device ID</span>
            <span className="text-white font-bold">{telemetry.device_id}</span>
          </div>

          <div>
            <span className="text-slate-500 block">IP Address</span>
            <span className="text-cyan-400 font-medium">
              {isOnline ? telemetry.system.ip_address : '--'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Wi-Fi Signal (RSSI)</span>
            <span className="text-slate-200 font-medium flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              {isOnline ? `${telemetry.system.wifi_rssi} dBm (Good)` : '--'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Firmware Version</span>
            <span className="text-white font-bold">{telemetry.system.firmware_version}</span>
          </div>

          <div>
            <span className="text-slate-500 block">System Uptime</span>
            <span className="text-emerald-400 font-bold">
              {isOnline ? formatUptime(telemetry.system.uptime_seconds) : '--'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Last Heartbeat</span>
            <span className="text-slate-300 font-medium">
              {isOnline ? formatDateTime(telemetry.system.last_heartbeat) : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Sensor Node Inventory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            Connected Sensor Instrumentation
            <span className="text-xs font-normal text-slate-400">({sensorsList.length} Defined Ports)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sensorsList.map((sensor) => {
            const isConn = sensor.connection_status === 'connected';
            const isNotConfig = sensor.connection_status === 'not_configured';

            return (
              <div
                key={sensor.id}
                className={cn(
                  "p-5 rounded-2xl bg-surface-card border transition-all duration-200 shadow-card-dark flex flex-col justify-between",
                  isNotConfig 
                    ? "border-slate-800/40 opacity-70 bg-slate-950/40" 
                    : isConn 
                    ? "border-slate-800 hover:border-cyan-500/40" 
                    : "border-red-500/30 bg-red-950/10"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                        {sensor.model}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {sensor.name}
                      </h4>
                    </div>

                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                      isConn 
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                        : isNotConfig 
                        ? "bg-slate-800 text-slate-400 border border-slate-700" 
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    )}>
                      {sensor.connection_status}
                    </span>
                  </div>

                  {/* Reading Display */}
                  <div className="my-3.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Reading:</span>
                      <span className={cn(
                        "font-bold text-sm",
                        isConn ? "text-cyan-400" : "text-slate-500"
                      )}>
                        {sensor.reading}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Calibration:</span>
                      <span className="text-slate-300 capitalize">{sensor.calibration_status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Design Accuracy:</span>
                      <span className="text-slate-400">{sensor.accuracy}</span>
                    </div>
                  </div>

                  {sensor.error_status && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
                      {sensor.error_status}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Last: {formatDateTime(sensor.last_update)}</span>
                  <span className="text-slate-400 uppercase">{sensor.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

