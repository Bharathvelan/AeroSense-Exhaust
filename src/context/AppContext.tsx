import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { 
  TelemetryData, 
  HistoricalDataPoint, 
  Alert, 
  AutomationRule, 
  SystemSettings, 
  OperatingMode, 
  FanState 
} from '../types';
import { 
  SimulationEngine, 
  generateHistoricalData, 
  DEFAULT_RULES, 
  DEFAULT_SETTINGS, 
  INITIAL_ALERTS 
} from '../services/simulation';
import { LiveWebSocketClient, WSStatus } from '../services/websocket';

interface AppContextType {
  operatingMode: OperatingMode;
  setOperatingMode: (mode: OperatingMode) => void;
  telemetry: TelemetryData;
  historyData: HistoricalDataPoint[];
  liveBuffer: HistoricalDataPoint[];
  alerts: Alert[];
  unreadAlertCount: number;
  criticalAlertCount: number;
  rules: AutomationRule[];
  settings: SystemSettings;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d';
  setTimeframe: (tf: '1h' | '6h' | '24h' | '7d' | '30d') => void;
  hardwareConnected: boolean;
  wsStatus: WSStatus;
  
  // Actions
  setFanControl: (state: FanState, speed?: number) => void;
  setFanMode: (mode: 'AUTO' | 'MANUAL') => void;
  triggerEmergencyStop: () => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  updateRule: (ruleId: string, updates: Partial<AutomationRule>) => void;
  addRule: (rule: AutomationRule) => void;
  deleteRule: (ruleId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  markAlertRead: (alertId: string) => void;
  clearAlerts: () => void;
  addToastNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  toast: { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage if available
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('aerosense_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [operatingMode, setOperatingModeState] = useState<OperatingMode>(settings.operating_mode || 'SIMULATION');
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [rules, setRules] = useState<AutomationRule[]>(DEFAULT_RULES);
  const [hardwareConnected, setHardwareConnected] = useState<boolean>(false);
  const [wsStatus, setWsStatus] = useState<WSStatus>('disconnected');
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  // Simulation engine instance
  const simEngineRef = useRef<SimulationEngine>(new SimulationEngine());
  const wsClientRef = useRef<LiveWebSocketClient | null>(null);

  // Initial historical data for analytics
  const [historyData, setHistoryData] = useState<HistoricalDataPoint[]>(() => generateHistoricalData('24h'));
  
  // Live sliding buffer for real-time charts (last 30 seconds)
  const [liveBuffer, setLiveBuffer] = useState<HistoricalDataPoint[]>([]);

  // Initial telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => {
    const { telemetry } = simEngineRef.current.step(DEFAULT_SETTINGS, DEFAULT_RULES);
    return telemetry;
  });

  // Re-generate historical data whenever timeframe changes
  useEffect(() => {
    setHistoryData(generateHistoricalData(timeframe));
  }, [timeframe]);

  // Persist settings changes
  useEffect(() => {
    try {
      localStorage.setItem('aerosense_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  const addToastNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const setOperatingMode = (mode: OperatingMode) => {
    setOperatingModeState(mode);
    setSettings(prev => ({ ...prev, operating_mode: mode }));

    if (mode === 'HARDWARE') {
      addToastNotification('Switched to Hardware Connected Mode. Attempting ESP32 link...', 'info');
    } else {
      setHardwareConnected(false);
      addToastNotification('Switched to Simulation Mode – using synthesized industrial profile.', 'info');
    }
  };

  // Main telemetry tick loop
  useEffect(() => {
    if (operatingMode === 'SIMULATION') {
      // Simulation mode tick
      const interval = setInterval(() => {
        const { telemetry: newTel, newAlert } = simEngineRef.current.step(settings, rules);
        setTelemetry(newTel);

        // Append to live buffer
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const newPoint: HistoricalDataPoint = {
          timestamp: newTel.timestamp,
          timeLabel: timeStr,
          temperature: newTel.temperature.value,
          humidity: newTel.humidity.value,
          current: newTel.power.current,
          power: newTel.power.power || 0,
          occupied: newTel.occupancy.detected,
          fanSpeed: newTel.fan.speed,
          fanState: newTel.fan.state,
          source: 'simulated',
        };

        setLiveBuffer(prev => {
          const updated = [...prev, newPoint];
          return updated.length > 40 ? updated.slice(updated.length - 40) : updated;
        });

        // Add new simulated alert if generated
        if (newAlert) {
          setAlerts(prev => [newAlert, ...prev]);
          addToastNotification(newAlert.title, newAlert.severity === 'critical' ? 'error' : 'warning');
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // HARDWARE MODE
      // Connect to WebSocket endpoint
      if (!wsClientRef.current) {
        wsClientRef.current = new LiveWebSocketClient(settings.websocket_endpoint);
      }

      wsClientRef.current.connect(
        (data: TelemetryData) => {
          setHardwareConnected(true);
          setTelemetry(data);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
          const newPoint: HistoricalDataPoint = {
            timestamp: data.timestamp,
            timeLabel: timeStr,
            temperature: data.temperature.value,
            humidity: data.humidity.value,
            current: data.power.current,
            power: data.power.power || 0,
            occupied: data.occupancy.detected,
            fanSpeed: data.fan.speed,
            fanState: data.fan.state,
            source: 'hardware',
          };
          setLiveBuffer(prev => {
            const updated = [...prev, newPoint];
            return updated.length > 40 ? updated.slice(updated.length - 40) : updated;
          });
        },
        (status: WSStatus) => {
          setWsStatus(status);
          if (status === 'connected') {
            setHardwareConnected(true);
            addToastNotification('ESP32 Live Stream Connected via WebSocket', 'success');
          } else {
            setHardwareConnected(false);
          }
        }
      );

      return () => {
        wsClientRef.current?.disconnect();
      };
    }
  }, [operatingMode, settings, rules]);

  // Fan control actions
  const setFanControl = (state: FanState, speed?: number) => {
    const targetSpeed = speed !== undefined ? speed : (state === 'HIGH' ? 100 : state === 'MEDIUM' ? 70 : state === 'LOW' ? 35 : 0);
    
    if (operatingMode === 'SIMULATION') {
      if (state === 'AUTO') {
        simEngineRef.current.setAutoMode();
      } else {
        simEngineRef.current.setManualControl(state, targetSpeed);
      }
      // Immediate optimistic update
      setTelemetry(prev => ({
        ...prev,
        fan: {
          ...prev.fan,
          state,
          mode: state === 'AUTO' ? 'AUTO' : 'MANUAL',
          speed: targetSpeed,
          command_status: 'SUCCESS',
          last_command_time: new Date().toISOString(),
        }
      }));
      addToastNotification(`Fan command set to ${state} (${targetSpeed}%) [SIMULATED]`, 'info');
    } else {
      // In hardware mode
      if (!hardwareConnected) {
        addToastNotification('Cannot send fan command: ESP32 hardware actuator is not connected.', 'error');
        return;
      }
      wsClientRef.current?.send({
        action: 'fan_control',
        state,
        speed: targetSpeed,
        mode: state === 'AUTO' ? 'AUTO' : 'MANUAL'
      });
      addToastNotification(`Dispatched fan command ${state} (${targetSpeed}%) to ESP32 controller`, 'info');
    }
  };

  const setFanMode = (mode: 'AUTO' | 'MANUAL') => {
    if (mode === 'AUTO') {
      setFanControl('AUTO');
    } else {
      setFanControl('LOW', 35);
    }
  };

  const triggerEmergencyStop = () => {
    if (operatingMode === 'SIMULATION') {
      simEngineRef.current.emergencyStop();
      setTelemetry(prev => ({
        ...prev,
        fan: {
          ...prev.fan,
          state: 'OFF',
          speed: 0,
          mode: 'MANUAL',
          emergency_stopped: true,
          command_status: 'EMERGENCY_STOPPED',
          last_command_time: new Date().toISOString(),
        }
      }));
      addToastNotification('EMERGENCY STOP TRIGGERED: Simulated fan driver de-energized immediately.', 'warning');
    } else {
      if (!hardwareConnected) {
        addToastNotification('Emergency Stop unavailable: No active physical hardware actuator connected.', 'error');
        return;
      }
      wsClientRef.current?.send({ action: 'emergency_stop' });
      addToastNotification('EMERGENCY STOP SIGNAL BROADCAST TO HARDWARE RELAY', 'error');
    }
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToastNotification('System configuration updated successfully', 'success');
  };

  const updateRule = (ruleId: string, updates: Partial<AutomationRule>) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, ...updates } : r));
    addToastNotification('Automation rule updated', 'info');
  };

  const addRule = (newRule: AutomationRule) => {
    setRules(prev => [newRule, ...prev]);
    addToastNotification(`Rule "${newRule.name}" created`, 'success');
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
    addToastNotification('Automation rule removed', 'info');
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true, read: true } : a));
    addToastNotification('Alert acknowledged', 'info');
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const clearAlerts = () => {
    setAlerts([]);
    addToastNotification('Alert list cleared', 'info');
  };

  const unreadAlertCount = useMemo(() => alerts.filter(a => !a.read).length, [alerts]);
  const criticalAlertCount = useMemo(() => alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length, [alerts]);

  return (
    <AppContext.Provider value={{
      operatingMode,
      setOperatingMode,
      telemetry,
      historyData,
      liveBuffer,
      alerts,
      unreadAlertCount,
      criticalAlertCount,
      rules,
      settings,
      activeNav,
      setActiveNav,
      timeframe,
      setTimeframe,
      hardwareConnected,
      wsStatus,
      setFanControl,
      setFanMode,
      triggerEmergencyStop,
      updateSettings,
      updateRule,
      addRule,
      deleteRule,
      acknowledgeAlert,
      markAlertRead,
      clearAlerts,
      addToastNotification,
      toast,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

