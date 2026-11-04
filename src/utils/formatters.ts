export function formatTemperature(val: number | null | undefined): string {
  if (val === null || val === undefined) return '--';
  return `${val.toFixed(1)}°C`;
}

export function formatHumidity(val: number | null | undefined): string {
  if (val === null || val === undefined) return '--';
  return `${Math.round(val)}%`;
}

export function formatPower(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-- W';
  return `${val.toFixed(1)} W`;
}

export function formatCurrent(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-- A';
  return `${val.toFixed(2)} A`;
}

export function formatEnergy(val: number | null | undefined): string {
  if (val === null || val === undefined) return '-- kWh';
  return `${val.toFixed(3)} kWh`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function formatCurrency(amount: number, symbol = '$'): string {
  return `${symbol}${amount.toFixed(2)}`;
}

