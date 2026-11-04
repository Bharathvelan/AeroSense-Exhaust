export type OperatingMode = 'SIMULATION' | 'HARDWARE';

export type FanState = 'OFF' | 'ON' | 'LOW' | 'MEDIUM' | 'HIGH' | 'AUTO';

export type SensorStatus = 'valid' | 'warning' | 'critical' | 'disconnected' | 'not_calibrated' | 'fault';

export type OccupancySensorType = 'PIR' | 'mmWave' | 'both' | 'not_configured';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface TelemetryData {
  timestamp: string;
  device_id: string;
  temperature: {
    value: number;
    unit: string;
    status: SensorStatus;
    min: number;
    max: number;
    trend: 'rising' | 'falling' | 'stable';
  };
  humidity: {
    value: number;
    unit: string;
    status: SensorStatus;
    trend: 'rising' | 'falling' | 'stable';
  };
  occupancy: {
    detected: boolean;
    sensor_type: OccupancySensorType;
    pir_detected: boolean;
    mmwave_detected: boolean;
    last_detection: string;
    status: SensorStatus;
  };
  power: {
    current: number; // in Amperes
    voltage: number | null; // in Volts (only if sensor supported)
    power: number | null; // in Watts
    energy: number | null; // in kWh
    daily_kwh: number;
    weekly_kwh: number;
    monthly_kwh: number;
    status: SensorStatus;
    is_simulated: boolean;
    is_calibrated: boolean;
  };
  fan: {
    state: FanState;
    mode: 'AUTO' | 'MANUAL';
    speed: number; // 0 - 100%
    actuator_connected: boolean;
    command_status: 'IDLE' | 'EXECUTING' | 'SUCCESS' | 'FAILED' | 'EMERGENCY_STOPPED';
    last_command_time: string;
    emergency_stopped: boolean;
    speed_control_supported: boolean;
  };
  system: {
    esp32_connected: boolean;
    ip_address: string | null;
    wifi_rssi: number | null;
    last_heartbeat: string;
    firmware_version: string;
    uptime_seconds: number;
    health_score: number; // 0 - 100
  };
}

export interface HistoricalDataPoint {
  timestamp: string;
  timeLabel: string;
  temperature: number;
  humidity: number;
  current: number;
  power: number;
  occupied: boolean;
  fanSpeed: number;
  fanState: string;
  source: 'simulated' | 'hardware';
}

export interface Alert {
  id: string;
  title: string;
  category: 
    | 'High Temperature'
    | 'High Humidity'
    | 'Occupancy Detected'
    | 'Occupancy Sensor Fault'
    | 'ESP32 Disconnected'
    | 'Temperature Sensor Fault'
    | 'Humidity Sensor Fault'
    | 'Abnormal Current'
    | 'Fan Driver Fault'
    | 'Communication Failure';
  severity: AlertSeverity;
  timestamp: string;
  description: string;
  sensor: string;
  value?: string | number;
  recommended_action: string;
  acknowledged: boolean;
  read: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  code: string;
  description: string;
  enabled: boolean;
  condition_type: 'humidity' | 'occupancy' | 'unoccupied' | 'sensor_fault' | 'power_limit';
  threshold_value: number;
  duration_seconds: number;
  hysteresis: number;
  action_description: string;
  last_triggered?: string;
  trigger_count: number;
  status: 'active' | 'triggered' | 'disabled';
}

export interface SystemSettings {
  temp_warning_threshold: number;
  temp_critical_threshold: number;
  humidity_warning_threshold: number;
  humidity_critical_threshold: number;
  current_warning_limit: number;
  occupancy_sensor_type: OccupancySensorType;
  occupancy_timeout_seconds: number;
  occupancy_confirm_duration_seconds: number;
  electricity_tariff_per_kwh: number;
  currency_symbol: string;
  min_fan_runtime_seconds: number;
  min_off_duration_seconds: number;
  safe_fallback_behavior: 'fan_off' | 'fan_low' | 'keep_last';
  device_id: string;
  api_endpoint: string;
  websocket_endpoint: string;
  mqtt_broker: string;
  mqtt_topic: string;
  operating_mode: OperatingMode;
  speed_control_enabled: boolean;
  fan_actuator_available: boolean;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  connection_status: 'connected' | 'disconnected' | 'fault';
  ip_address: string | null;
  mac_address: string | null;
  rssi: number | null;
  firmware: string;
  uptime: string;
  last_heartbeat: string;
}

export interface SensorDevice {
  id: string;
  name: string;
  type: string;
  category: 'environmental' | 'presence' | 'electrical' | 'actuator';
  connection_status: 'connected' | 'disconnected' | 'fault' | 'not_configured';
  reading: string | number;
  unit: string;
  last_update: string;
  calibration_status: 'calibrated' | 'uncalibrated' | 'factory_default' | 'n/a';
  error_status: string | null;
  accuracy: string;
  model: string;
}

