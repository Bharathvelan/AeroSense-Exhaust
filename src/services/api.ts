import { TelemetryData, Alert, AutomationRule, SystemSettings } from '../types';

export const API_BASE = 'http://localhost:8000/api/v1';

export async function fetchSystemStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchLatestTelemetry(): Promise<TelemetryData> {
  const res = await fetch(`${API_BASE}/sensors/latest`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchSensorHistory(timeframe: string = '24h'): Promise<any[]> {
  const res = await fetch(`${API_BASE}/sensors/history?timeframe=${timeframe}`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function postFanControl(command: {
  state: string;
  speed: number;
  mode: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/fan/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function acknowledgeAlertApi(alertId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchAutomationRules(): Promise<AutomationRule[]> {
  const res = await fetch(`${API_BASE}/automation/rules`);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function postAutomationRule(rule: Partial<AutomationRule>): Promise<AutomationRule> {
  const res = await fetch(`${API_BASE}/automation/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

