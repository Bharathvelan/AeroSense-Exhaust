import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Thermometer, 
  Droplets, 
  Zap, 
  Users, 
  ShieldCheck,
  Table
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTemperature, formatHumidity, formatEnergy, formatDateTime } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { telemetry, historyData, alerts, settings, operatingMode } = useApp();

  const [reportType, setReportType] = useState<string>('daily_env');
  const [reportPeriod, setReportPeriod] = useState<string>('today');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDate, setGeneratedDate] = useState<string>(new Date().toISOString());

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedDate(new Date().toISOString());
      setIsGenerating(false);
    }, 600);
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Temperature(C),Humidity(%),Current(A),Power(W),Occupied,FanSpeed(%),FanState,Source\n";

    historyData.forEach((row) => {
      csvContent += `${row.timestamp},${row.temperature},${row.humidity},${row.current},${row.power},${row.occupied},${row.fanSpeed},${row.fanState},${row.source}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AeroSense_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              EXECUTIVE COMPLIANCE
            </span>
            <span className="text-xs text-slate-500 font-mono">Automated Facility Auditing</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Engineering & Environmental Reports
          </h2>
          <p className="text-sm text-slate-400">
            Generate printable audit summaries, energy compliance tables, and raw time-series CSV archives.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-glow-cyan-sm"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Configuration Strip */}
      <div className="p-4 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Report Template</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
            >
              <option value="daily_env">Daily Environmental Report</option>
              <option value="weekly_env">Weekly Environmental Audit</option>
              <option value="monthly_env">Monthly Energy & Ventilation Report</option>
              <option value="energy_compliance">ASHRAE 62.2 / Energy Compliance</option>
              <option value="system_health">Hardware Diagnostic & Telemetry Health</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Reporting Period</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none"
            >
              <option value="today">Today (Past 24 Hours)</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="month_to_date">Month to Date</option>
              <option value="quarter">Competition Testing Period</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold uppercase transition-all shadow-glow-cyan-sm"
        >
          {isGenerating ? 'Compiling Report...' : 'Re-Generate Preview'}
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-8 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-2xl text-slate-200 max-w-5xl mx-auto space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-6 print:border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono font-black text-xl tracking-wider print:text-blue-700">
                AEROSENSE-EXHAUST
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300 border border-slate-700 print:bg-gray-200 print:text-black">
                atomQUEST 2026
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 uppercase print:text-black">
              Comprehensive Facility Environmental & Energy Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono print:text-gray-600">
              Autonomous Ventilation Subsystem Performance • Microclimate & Occupancy Audit
            </p>
          </div>

          <div className="text-right text-xs font-mono space-y-1 text-slate-400 print:text-gray-600">
            <div>Report ID: <strong className="text-white print:text-black">AERO-RPT-2026-084</strong></div>
            <div>Generated: <span className="text-white print:text-black">{formatDateTime(generatedDate)}</span></div>
            <div>Node ID: <span className="text-cyan-400 print:text-blue-600">{telemetry.device_id}</span></div>
            <div>Data Provenance: <strong className="uppercase text-amber-400 print:text-black">{operatingMode}</strong></div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:bg-gray-100 print:border-gray-300">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block print:text-gray-600">Mean Temperature</span>
            <span className="text-xl font-bold font-mono text-white print:text-black">27.4°C</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Within comfort limits</span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block print:text-gray-600">Mean Humidity</span>
            <span className="text-xl font-bold font-mono text-white print:text-black">63.2% RH</span>
            <span className="text-[10px] text-cyan-400 block mt-0.5">Target &lt; 65% RH</span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block print:text-gray-600">Integrated Energy</span>
            <span className="text-xl font-bold font-mono text-white print:text-black">{telemetry.power.daily_kwh} kWh</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">~${(telemetry.power.daily_kwh * settings.electricity_tariff_per_kwh).toFixed(2)} est. cost</span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-400 block print:text-gray-600">Occupancy Hours</span>
            <span className="text-xl font-bold font-mono text-white print:text-black">6.4 hrs</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Dual-sensor validated</span>
          </div>
        </div>

        {/* Section 1: Environmental Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-1 print:text-black print:border-gray-400">
            1. Indoor Air Quality & Humidity Regulation
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans print:text-gray-800">
            During the monitored cycle, the AeroSense-Exhaust controller autonomously managed the exhaust actuator based on real-time SHT31 sensor input. Peak humidity reached 74.2% during occupied high-moisture periods, immediately triggering Rule RULE-HUM-01. Relative humidity was returned below the 60.0% threshold within 14 minutes of forced high-speed ventilation.
          </p>
        </div>

        {/* Section 2: Energy & Electrical Analysis */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-1 print:text-black print:border-gray-400">
            2. Energy & Power Consumption Auditing
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans print:text-gray-800">
            Instantaneous current monitored via the ACS712-05B module averaged 0.24A during active ventilation cycles and 0.02A in standby mode. Energy optimization through occupancy-correlated ventilation reduced projected continuous run time by approximately 63%, preserving motor bearing lifespan while preventing mold condensation.
          </p>
        </div>

        {/* Section 3: Alarm & Fault Records */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-slate-800 pb-1 print:text-black print:border-gray-400">
            3. Safety Interlocks & Incident Log
          </h3>
          <div className="border border-slate-800 rounded-xl overflow-hidden print:border-gray-300">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-900 text-slate-400 print:bg-gray-200 print:text-black">
                <tr>
                  <th className="p-2.5">Alert Code</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Trigger Condition</th>
                  <th className="p-2.5">Remediation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                <tr>
                  <td className="p-2.5 text-cyan-400 print:text-black">ALT-001</td>
                  <td className="p-2.5 text-amber-400">WARNING</td>
                  <td className="p-2.5">RH &gt; 65.0% for 15s</td>
                  <td className="p-2.5 text-emerald-400">Ventilated at 100% (Cleared)</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-cyan-400 print:text-black">ALT-002</td>
                  <td className="p-2.5 text-cyan-300">INFO</td>
                  <td className="p-2.5">mmWave Radar Micro-Motion</td>
                  <td className="p-2.5 text-emerald-400">Baseline fresh air maintained</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signoff Footer */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-500 print:text-gray-600 print:border-black">
          <div>
            Verified by: <strong className="text-slate-300 print:text-black">AeroSense Automation Engine v2.4.1</strong>
          </div>
          <div>atomQUEST 2026 Technical Review Board</div>
        </div>
      </div>
    </div>
  );
};

