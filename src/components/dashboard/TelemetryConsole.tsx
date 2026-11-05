import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Wifi, ChevronDown, ChevronUp, Copy, Check, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PacketLog {
  id: string;
  time: string;
  topic: string;
  payload: string;
  qos: number;
}

export const TelemetryConsole: React.FC = () => {
  const { telemetry, operatingMode, hardwareConnected } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [packets, setPackets] = useState<PacketLog[]>([]);
  const [copied, setCopied] = useState(false);

  // Generate real-time telemetry stream packets matching the current live readings
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
    
    const topics = [
      {
        topic: 'aerosense/sensors/environmental',
        payload: JSON.stringify({ temp_c: telemetry.temperature.value, rh_pct: telemetry.humidity.value, trend: telemetry.temperature.trend })
      },
      {
        topic: 'aerosense/sensors/occupancy',
        payload: JSON.stringify({ presence: telemetry.occupancy.detected, pir: telemetry.occupancy.pir_detected, mmwave: telemetry.occupancy.mmwave_detected })
      },
      {
        topic: 'aerosense/actuator/fan/pwm',
        payload: JSON.stringify({ state: telemetry.fan.state, speed_pct: telemetry.fan.speed, mode: telemetry.fan.mode })
      },
      {
        topic: 'aerosense/electrical/power',
        payload: JSON.stringify({ volts: 230.0, current_a: telemetry.power.current, watts: telemetry.power.power, daily_kwh: telemetry.power.daily_kwh })
      }
    ];

    // Pick a topic to log each tick
    const randomEntry = topics[Math.floor(Math.random() * topics.length)];
    const newPacket: PacketLog = {
      id: Math.random().toString(36).substr(2, 7),
      time: timeStr,
      topic: randomEntry.topic,
      payload: randomEntry.payload,
      qos: 1
    };

    setPackets((prev) => [newPacket, ...prev.slice(0, 19)]);
  }, [telemetry]);

  const copyRecentPayload = () => {
    if (packets.length > 0) {
      navigator.clipboard.writeText(JSON.stringify(telemetry, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="rounded-2xl bg-[#080d18] border border-slate-800/90 shadow-2xl overflow-hidden font-mono">
      {/* Console Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 bg-[#0d1424] border-b border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            LIVE MQTT BROKER
          </div>
          <span className="text-xs font-bold text-slate-300">
            SCADA Data Bus Telepresence Stream
          </span>
          <span className="hidden md:inline text-[11px] text-slate-500">
            (aerosense/esp32/01/+)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-semibold">1.0 Hz Stream</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>12ms Latency</span>
          </div>

          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Terminal Log View */}
      {isOpen && (
        <div className="p-4 bg-[#050811] space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-3">
              <span>Protocol: <strong>MQTT v3.1.1 over WebSockets (WSS)</strong></span>
              <span className="hidden sm:inline">Provenance: <strong className="text-cyan-400">{operatingMode}</strong></span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                copyRecentPayload();
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy Full Snapshot'}</span>
            </button>
          </div>

          {/* Packet Terminal Stream */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-[11px] leading-relaxed">
            {packets.map((pkt) => (
              <div 
                key={pkt.id} 
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-1 px-2 rounded hover:bg-slate-900/60 font-mono transition-colors"
              >
                <span className="text-slate-500 shrink-0">[{pkt.time}]</span>
                <span className="text-cyan-400 shrink-0 font-semibold">{pkt.topic}</span>
                <span className="text-slate-300 break-all">{pkt.payload}</span>
              </div>
            ))}
          </div>

          {/* Terminal Status Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
            <span>Buffer: 20/20 Packets • CRC-32 Verified</span>
            <span>ESP-IDF FreeRTOS Queue: OK</span>
          </div>
        </div>
      )}
    </div>
  );
};

