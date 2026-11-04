import { 
  TelemetryData, 
  HistoricalDataPoint, 
  Alert, 
  AutomationRule, 
  SystemSettings 
} from '../types';

export class SimulationEngine {
  private temp = 27.8;
  private humidity = 64.5;
  private occupied = true;
  private pirDetected = true;
  private mmwaveDetected = true;
  private lastDetectionTime = new Date().toISOString();
  private occupancyTimer = 0;
  private fanState: 'OFF' | 'ON' | 'LOW' | 'MEDIUM' | 'HIGH' | 'AUTO' = 'AUTO';
  private fanMode: 'AUTO' | 'MANUAL' = 'AUTO';
  private fanSpeed = 65;
  private manualSpeed = 50;
  private uptime = 48290;
  private alertCounter = 100;
  private dailyKwh = 0.842;

  // Track min/max for session
  private tempMin = 23.4;
  private tempMax = 31.8;

  constructor() {
    this.lastDetectionTime = new Date(Date.now() - 45000).toISOString();
  }

  public step(settings: SystemSettings, rules: AutomationRule[]): {
    telemetry: TelemetryData;
    newAlert?: Alert;
  } {
    this.uptime += 1;
    this.occupancyTimer += 1;

    // Occupancy state machine simulation
    // Occupied for ~40-60s, then unoccupied for ~20-30s
    if (this.occupied && this.occupancyTimer > 45) {
      this.occupied = false;
      this.pirDetected = false;
      this.mmwaveDetected = false;
      this.occupancyTimer = 0;
    } else if (!this.occupied && this.occupancyTimer > 25) {
      this.occupied = true;
      this.pirDetected = true;
      this.mmwaveDetected = true;
      this.lastDetectionTime = new Date().toISOString();
      this.occupancyTimer = 0;
    }

    // Occasional mmwave sensitivity (breathing without macro PIR motion)
    if (this.occupied && this.occupancyTimer > 20 && this.occupancyTimer < 35) {
      this.pirDetected = false;
      this.mmwaveDetected = true;
    }

    // Environmental drift
    // Humidity rises when occupied, falls when fan is on
    const fanEffect = (this.fanState === 'OFF') ? 0.08 : -(this.fanSpeed / 100) * 0.18;
    const occupancyEffect = this.occupied ? 0.12 : -0.04;
    const noise = (Math.random() - 0.49) * 0.15;
    this.humidity = Math.min(92, Math.max(38, this.humidity + fanEffect + occupancyEffect + noise));

    // Temperature subtle drift
    const tempFanEffect = (this.fanState === 'OFF') ? 0.01 : -(this.fanSpeed / 100) * 0.03;
    const tempNoise = (Math.random() - 0.49) * 0.08;
    this.temp = Math.min(38, Math.max(18, this.temp + tempFanEffect + tempNoise));

    if (this.temp < this.tempMin) this.tempMin = parseFloat(this.temp.toFixed(1));
    if (this.temp > this.tempMax) this.tempMax = parseFloat(this.temp.toFixed(1));

    // Fan auto logic if in AUTO mode
    if (this.fanMode === 'AUTO') {
      const highHumRule = rules.find(r => r.condition_type === 'humidity' && r.enabled);
      const humThreshold = highHumRule ? highHumRule.threshold_value : settings.humidity_warning_threshold;

      if (this.humidity >= settings.humidity_critical_threshold) {
        this.fanState = 'HIGH';
        this.fanSpeed = 100;
      } else if (this.humidity >= humThreshold) {
        this.fanState = 'MEDIUM';
        this.fanSpeed = 70;
      } else if (this.occupied) {
        this.fanState = 'LOW';
        this.fanSpeed = 35;
      } else {
        this.fanState = 'OFF';
        this.fanSpeed = 0;
      }
    } else {
      // Manual mode
      if (this.fanState === 'OFF') {
        this.fanSpeed = 0;
      } else {
        this.fanSpeed = this.manualSpeed;
      }
    }

    // Electrical simulation
    // Standby: 0.02A, Fan running: scales with speed up to 0.45A at 230V
    let current = 0.03;
    let power = 0.5;
    if (this.fanSpeed > 0) {
      current = 0.05 + (this.fanSpeed / 100) * 0.38 + (Math.random() - 0.5) * 0.01;
      power = current * 228 + (Math.random() - 0.5) * 1.5; // ~230V simulated
    }
    this.dailyKwh += (power / 1000) * (1 / 3600); // 1-second energy accumulation

    // Alert generation check
    let newAlert: Alert | undefined;
    if (this.humidity > settings.humidity_critical_threshold && Math.random() < 0.05) {
      newAlert = {
        id: `alert-${Date.now()}-${this.alertCounter++}`,
        title: 'Critical Humidity Level Detected',
        category: 'High Humidity',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        description: `Relative humidity reached ${this.humidity.toFixed(1)}%, exceeding the critical threshold of ${settings.humidity_critical_threshold}%. Ventilation forced to HIGH.`,
        sensor: 'DHT22 / SHT31 Environmental Sensor',
        value: `${this.humidity.toFixed(1)}%`,
        recommended_action: 'Exhaust fan activated at max speed. Inspect facility vents and external moisture ingress.',
        acknowledged: false,
        read: false,
      };
    }

    const telemetry: TelemetryData = {
      timestamp: new Date().toISOString(),
      device_id: settings.device_id,
      temperature: {
        value: parseFloat(this.temp.toFixed(1)),
        unit: '°C',
        status: this.temp > settings.temp_critical_threshold ? 'critical' : this.temp > settings.temp_warning_threshold ? 'warning' : 'valid',
        min: this.tempMin,
        max: this.tempMax,
        trend: tempNoise > 0 ? 'rising' : 'falling',
      },
      humidity: {
        value: parseFloat(this.humidity.toFixed(1)),
        unit: '%',
        status: this.humidity > settings.humidity_critical_threshold ? 'critical' : this.humidity > settings.humidity_warning_threshold ? 'warning' : 'valid',
        trend: fanEffect + occupancyEffect > 0 ? 'rising' : 'falling',
      },
      occupancy: {
        detected: this.occupied,
        sensor_type: settings.occupancy_sensor_type,
        pir_detected: this.pirDetected,
        mmwave_detected: this.mmwaveDetected,
        last_detection: this.lastDetectionTime,
        status: 'valid',
      },
      power: {
        current: parseFloat(current.toFixed(2)),
        voltage: 230.4,
        power: parseFloat(power.toFixed(1)),
        energy: parseFloat(this.dailyKwh.toFixed(3)),
        daily_kwh: parseFloat(this.dailyKwh.toFixed(3)),
        weekly_kwh: parseFloat((this.dailyKwh * 5.8).toFixed(2)),
        monthly_kwh: parseFloat((this.dailyKwh * 24.3).toFixed(1)),
        status: 'valid',
        is_simulated: true,
        is_calibrated: true,
      },
      fan: {
        state: this.fanState,
        mode: this.fanMode,
        speed: Math.round(this.fanSpeed),
        actuator_connected: settings.fan_actuator_available,
        command_status: 'SUCCESS',
        last_command_time: new Date().toISOString(),
        emergency_stopped: false,
        speed_control_supported: settings.speed_control_enabled,
      },
      system: {
        esp32_connected: true, // in simulation mode, device is virtualized
        ip_address: '192.168.1.142 (Simulated)',
        wifi_rssi: -62,
        last_heartbeat: new Date().toISOString(),
        firmware_version: 'v2.4.1-atomQUEST',
        uptime_seconds: this.uptime,
        health_score: 98,
      },
    };

    return { telemetry, newAlert };
  }

  public setManualControl(state: 'OFF' | 'ON' | 'LOW' | 'MEDIUM' | 'HIGH', speed: number) {
    this.fanMode = 'MANUAL';
    this.fanState = state;
    this.manualSpeed = speed;
    if (state === 'OFF') {
      this.fanSpeed = 0;
    } else {
      this.fanSpeed = speed;
    }
  }

  public setAutoMode() {
    this.fanMode = 'AUTO';
  }

  public emergencyStop() {
    this.fanMode = 'MANUAL';
    this.fanState = 'OFF';
    this.fanSpeed = 0;
  }
}

// Generate realistic historical time-series data for analytics
export function generateHistoricalData(timeframe: '1h' | '6h' | '24h' | '7d' | '30d'): HistoricalDataPoint[] {
  const points: HistoricalDataPoint[] = [];
  const now = Date.now();
  
  let count = 60;
  let intervalMs = 60 * 1000; // 1 min

  if (timeframe === '1h') {
    count = 60;
    intervalMs = 60 * 1000; // 1 min steps
  } else if (timeframe === '6h') {
    count = 72;
    intervalMs = 5 * 60 * 1000; // 5 min steps
  } else if (timeframe === '24h') {
    count = 96;
    intervalMs = 15 * 60 * 1000; // 15 min steps
  } else if (timeframe === '7d') {
    count = 84;
    intervalMs = 2 * 3600 * 1000; // 2 hour steps
  } else if (timeframe === '30d') {
    count = 90;
    intervalMs = 8 * 3600 * 1000; // 8 hour steps
  }

  let temp = 26.5;
  let humidity = 62.0;

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * intervalMs);
    const hour = time.getHours();

    // Diurnal cycle
    const dayCurve = Math.sin(((hour - 6) / 24) * 2 * Math.PI);
    temp = 25.0 + dayCurve * 3.5 + (Math.random() - 0.5) * 0.8;
    humidity = 60.0 - dayCurve * 12.0 + (Math.random() - 0.5) * 2.5;

    // Simulate occupancy mostly in active business/day hours
    const isDayTime = hour >= 8 && hour <= 20;
    const occupied = isDayTime ? Math.random() > 0.35 : Math.random() > 0.85;

    // Fan speed reacts
    let fanSpeed = 0;
    let fanState = 'OFF';
    if (humidity > 68) {
      fanSpeed = 85;
      fanState = 'HIGH';
    } else if (occupied) {
      fanSpeed = 50;
      fanState = 'MEDIUM';
    } else {
      fanSpeed = 0;
      fanState = 'OFF';
    }

    const current = fanSpeed > 0 ? 0.05 + (fanSpeed / 100) * 0.35 : 0.02;
    const power = current * 230;

    const timeLabel = (timeframe === '1h' || timeframe === '6h') 
      ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : (timeframe === '24h')
      ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:00`;

    points.push({
      timestamp: time.toISOString(),
      timeLabel,
      temperature: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      current: parseFloat(current.toFixed(2)),
      power: parseFloat(power.toFixed(1)),
      occupied,
      fanSpeed,
      fanState,
      source: 'simulated',
    });
  }

  return points;
}

// Initial demonstration alerts
export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    title: 'High Humidity Warning Threshold Exceeded',
    category: 'High Humidity',
    severity: 'warning',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    description: 'Relative humidity reached 71.4%, surpassing the configured warning limit of 65.0%. Automated ventilation triggered to MEDIUM.',
    sensor: 'DHT22 / SHT31 Environmental Sensor',
    value: '71.4%',
    recommended_action: 'Verify ventilation airflow rate and check if local water vapor source is active.',
    acknowledged: false,
    read: false,
  },
  {
    id: 'alt-002',
    title: 'Occupancy Detected in Zone 1',
    category: 'Occupancy Detected',
    severity: 'info',
    timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
    description: 'mmWave radar confirmed sustained human micro-motion presence for over 30 seconds.',
    sensor: 'LD2410 mmWave Radar',
    value: 'Stationary target detected',
    recommended_action: 'Automatic baseline fresh air exchange initiated.',
    acknowledged: true,
    read: true,
  },
  {
    id: 'alt-003',
    title: 'PIR Motion Sensor Transient Trigger',
    category: 'Occupancy Detected',
    severity: 'info',
    timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
    description: 'PIR detected entrance transition event.',
    sensor: 'HC-SR501 PIR Sensor',
    value: 'Motion pulse active',
    recommended_action: 'Normal operation. Occupancy timer reset.',
    acknowledged: true,
    read: true,
  },
  {
    id: 'alt-004',
    title: 'Current Sensor Reading Within Nominal Range',
    category: 'Abnormal Current',
    severity: 'info',
    timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
    description: 'ACS712 current measurement module initialized. Operating at 0.38A under medium load.',
    sensor: 'ACS712-05B Current Sensor',
    value: '0.38 A',
    recommended_action: 'None. Current is within rated continuous limit (< 1.5A).',
    acknowledged: true,
    read: true,
  },
];

// Initial default automation rules as per master prompt Section 9
export const DEFAULT_RULES: AutomationRule[] = [
  {
    id: 'rule-1',
    name: 'High Humidity Rapid Exhaust',
    code: 'RULE-HUM-01',
    description: 'If relative humidity exceeds warning threshold for > 15s, automatically activate exhaust fan to purge moisture.',
    enabled: true,
    condition_type: 'humidity',
    threshold_value: 65,
    duration_seconds: 15,
    hysteresis: 5,
    action_description: 'Request ventilation at HIGH (80-100% duty) until humidity drops below threshold minus hysteresis (60%).',
    last_triggered: new Date(Date.now() - 12 * 60000).toISOString(),
    trigger_count: 14,
    status: 'triggered',
  },
  {
    id: 'rule-2',
    name: 'Occupancy-Based Fresh Air Exchange',
    code: 'RULE-OCC-01',
    description: 'When occupancy is detected by PIR or mmWave radar, evaluate environmental conditions and initiate baseline ventilation.',
    enabled: true,
    condition_type: 'occupancy',
    threshold_value: 1,
    duration_seconds: 10,
    hysteresis: 0,
    action_description: 'Switch fan to LOW mode (35%) to maintain continuous air renewal for room occupants.',
    last_triggered: new Date(Date.now() - 45000).toISOString(),
    trigger_count: 52,
    status: 'active',
  },
  {
    id: 'rule-3',
    name: 'Unoccupied Smart Setback',
    code: 'RULE-UNOCC-01',
    description: 'When the room is confirmed unoccupied for 120s, evaluate if humidity purge is required before turning off fan.',
    enabled: true,
    condition_type: 'unoccupied',
    threshold_value: 120,
    duration_seconds: 120,
    hysteresis: 0,
    action_description: 'Safely power OFF fan if humidity is below warning threshold; otherwise keep running purge cycle.',
    last_triggered: new Date(Date.now() - 90 * 60000).toISOString(),
    trigger_count: 38,
    status: 'active',
  },
  {
    id: 'rule-4',
    name: 'Sensor Fault Safe Fallback',
    code: 'RULE-FAULT-01',
    description: 'If environmental sensors fail to communicate for > 30s, record fault and engage configured fail-safe ventilation.',
    enabled: true,
    condition_type: 'sensor_fault',
    threshold_value: 30,
    duration_seconds: 30,
    hysteresis: 0,
    action_description: 'Log fault, display critical UI alert, stop invalid data ingestion, and run safe low ventilation.',
    last_triggered: undefined,
    trigger_count: 0,
    status: 'active',
  },
  {
    id: 'rule-5',
    name: 'Overcurrent Protection Trigger',
    code: 'RULE-ELEC-01',
    description: 'If measured current exceeds 1.50A continuous for > 3s, signal electrical alert and request safety trip.',
    enabled: true,
    condition_type: 'power_limit',
    threshold_value: 1.5,
    duration_seconds: 3,
    hysteresis: 0.2,
    action_description: 'Generate critical electrical warning, trigger actuator cutoff command if hardware protection relay exists.',
    last_triggered: undefined,
    trigger_count: 0,
    status: 'active',
  },
];

export const DEFAULT_SETTINGS: SystemSettings = {
  temp_warning_threshold: 30.0,
  temp_critical_threshold: 35.0,
  humidity_warning_threshold: 65.0,
  humidity_critical_threshold: 75.0,
  current_warning_limit: 1.5,
  occupancy_sensor_type: 'both',
  occupancy_timeout_seconds: 120,
  occupancy_confirm_duration_seconds: 10,
  electricity_tariff_per_kwh: 0.16,
  currency_symbol: '$',
  min_fan_runtime_seconds: 60,
  min_off_duration_seconds: 30,
  safe_fallback_behavior: 'fan_low',
  device_id: 'AEROSENSE_ESP32_01',
  api_endpoint: 'http://localhost:8000/api/v1',
  websocket_endpoint: 'ws://localhost:8000/ws/live',
  mqtt_broker: 'broker.emqx.io:1883',
  mqtt_topic: 'aerosense/device/telemetry',
  operating_mode: 'SIMULATION',
  speed_control_enabled: true,
  fan_actuator_available: true,
};

