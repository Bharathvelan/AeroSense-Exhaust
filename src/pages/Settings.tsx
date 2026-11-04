import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  ShieldAlert, 
  Radio, 
  Sparkles, 
  Wifi, 
  Zap, 
  Thermometer, 
  Users, 
  Cpu, 
  Server,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SystemSettings, OccupancySensorType } from '../types';
import { DEFAULT_SETTINGS } from '../services/simulation';
import { cn } from '../utils/cn';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, operatingMode, setOperatingMode, addToastNotification } = useApp();

  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [activeTab, setActiveTab] = useState<'env' | 'occ' | 'energy' | 'auto' | 'system'>('env');

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    addToastNotification('Settings successfully saved to local system storage', 'success');
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_SETTINGS);
    updateSettings(DEFAULT_SETTINGS);
    addToastNotification('Reset all settings to industrial factory defaults', 'warning');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              NODE CONFIGURATION
            </span>
            <span className="text-xs text-slate-500 font-mono">SCADA Parameter Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            System & Parameter Settings
          </h2>
          <p className="text-sm text-slate-400">
            Calibrate environmental setpoints, occupancy deadbands, tariff rates, and telemetry endpoints.
          </p>
        </div>

        {/* Save / Reset Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-mono transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-glow-cyan-sm"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('env')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all",
            activeTab === 'env' 
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          <Thermometer className="w-4 h-4 text-cyan-400" />
          <span>Environmental Setpoints</span>
        </button>

        <button
          onClick={() => setActiveTab('occ')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all",
            activeTab === 'occ' 
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Occupancy & Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('energy')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all",
            activeTab === 'energy' 
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Tariff & Electrical</span>
        </button>

        <button
          onClick={() => setActiveTab('auto')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all",
            activeTab === 'auto' 
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Automation & Fallback</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all",
            activeTab === 'system' 
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan-sm" 
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          )}
        >
          <Server className="w-4 h-4 text-cyan-400" />
          <span>ESP32 & Endpoints</span>
        </button>
      </div>

      {/* Main Settings Form Panels */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: ENVIRONMENTAL SETPOINTS */}
        {activeTab === 'env' && (
          <div className="p-6 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Environmental Alarm & Automation Thresholds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Temperature Warning Setpoint (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.temp_warning_threshold}
                  onChange={(e) => handleInputChange('temp_warning_threshold', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500 block">Triggers caution status and baseline air renewal.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Temperature Critical Setpoint (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.temp_critical_threshold}
                  onChange={(e) => handleInputChange('temp_critical_threshold', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-red-400 font-bold focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-slate-500 block">Forces maximum ventilation purge and issues critical notification.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Relative Humidity Warning Setpoint (% RH)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.humidity_warning_threshold}
                  onChange={(e) => handleInputChange('humidity_warning_threshold', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[11px] text-slate-500 block">Primary exhaust fan start threshold to suppress dampness.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Relative Humidity Critical Setpoint (% RH)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.humidity_critical_threshold}
                  onChange={(e) => handleInputChange('humidity_critical_threshold', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-red-400 font-bold focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-slate-500 block">Immediate 100% turbo boost exhaust activation.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OCCUPANCY & RADAR */}
        {activeTab === 'occ' && (
          <div className="p-6 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Occupancy Sensing & Radar Filtering
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Installed Presence Technology Configuration
                </label>
                <select
                  value={formData.occupancy_sensor_type}
                  onChange={(e) => handleInputChange('occupancy_sensor_type', e.target.value as OccupancySensorType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-cyan-400 font-bold focus:outline-none"
                >
                  <option value="both">Both (PIR Motion + mmWave Radar Fusion)</option>
                  <option value="PIR">PIR Motion Detector Only</option>
                  <option value="mmWave">mmWave FMCW Radar Only</option>
                  <option value="not_configured">Not Configured / Disabled</option>
                </select>
                <span className="text-[11px] text-slate-500 block">Select active hardware sensors physically wired to ESP32.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Occupancy Confirmation Duration (seconds)
                </label>
                <input
                  type="number"
                  value={formData.occupancy_confirm_duration_seconds}
                  onChange={(e) => handleInputChange('occupancy_confirm_duration_seconds', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">Debounce delay to ignore transient motion like door breezes.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Unoccupied Absence Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={formData.occupancy_timeout_seconds}
                  onChange={(e) => handleInputChange('occupancy_timeout_seconds', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">Delay before evaluating unoccupied fan spin-down.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TARIFF & ELECTRICAL */}
        {activeTab === 'energy' && (
          <div className="p-6 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Electrical Parameters & Utility Cost Model
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Electricity Tariff Rate ($ / kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.electricity_tariff_per_kwh}
                  onChange={(e) => handleInputChange('electricity_tariff_per_kwh', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">Commercial utility billing unit rate.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Current Safety Warning Limit (Amperes)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.current_warning_limit}
                  onChange={(e) => handleInputChange('current_warning_limit', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-amber-400 font-bold focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">Trip protection threshold for abnormal motor stall or short-circuit.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTOMATION & FALLBACK */}
        {activeTab === 'auto' && (
          <div className="p-6 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              Automation Hysteresis & Mechanical Protection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Minimum Fan Continuous Runtime (seconds)
                </label>
                <input
                  type="number"
                  value={formData.min_fan_runtime_seconds}
                  onChange={(e) => handleInputChange('min_fan_runtime_seconds', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">Prevents mechanical short-cycling of the exhaust fan motor.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Minimum OFF Duration (seconds)
                </label>
                <input
                  type="number"
                  value={formData.min_off_duration_seconds}
                  onChange={(e) => handleInputChange('min_off_duration_seconds', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 block">Cool-down pause required before motor restart.</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Sensor Failure Safe Fallback
                </label>
                <select
                  value={formData.safe_fallback_behavior}
                  onChange={(e: any) => handleInputChange('safe_fallback_behavior', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-cyan-400 font-bold focus:outline-none"
                >
                  <option value="fan_low">Run Fan at Safe Low Speed (35%)</option>
                  <option value="fan_off">Stop Fan (Power OFF)</option>
                  <option value="keep_last">Preserve Previous Actuator State</option>
                </select>
                <span className="text-[11px] text-slate-500 block">Default fail-safe behavior if primary sensors disconnect.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM & ENDPOINTS */}
        {activeTab === 'system' && (
          <div className="p-6 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              ESP32 Network, MQTT & Backend Endpoints
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Target ESP32 Device Identifier
                </label>
                <input
                  type="text"
                  value={formData.device_id}
                  onChange={(e) => handleInputChange('device_id', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  Live WebSocket Stream URI
                </label>
                <input
                  type="text"
                  value={formData.websocket_endpoint}
                  onChange={(e) => handleInputChange('websocket_endpoint', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-cyan-400 font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  FastAPI REST Base URL
                </label>
                <input
                  type="text"
                  value={formData.api_endpoint}
                  onChange={(e) => handleInputChange('api_endpoint', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 block font-semibold">
                  MQTT Ingestion Broker URI
                </label>
                <input
                  type="text"
                  value={formData.mqtt_broker}
                  onChange={(e) => handleInputChange('mqtt_broker', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-slate-300 block font-semibold">
                  MQTT Device Telemetry Topic
                </label>
                <input
                  type="text"
                  value={formData.mqtt_topic}
                  onChange={(e) => handleInputChange('mqtt_topic', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

