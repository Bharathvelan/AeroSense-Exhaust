import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Search, 
  Filter, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Cpu, 
  AlertOctagon 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Alert, AlertSeverity } from '../types';
import { formatDateTime } from '../utils/formatters';
import { cn } from '../utils/cn';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, markAlertRead, clearAlerts } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.sensor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const acknowledgeAll = () => {
    alerts.forEach(a => {
      if (!a.acknowledged) acknowledgeAlert(a.id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30">
              AUDIT & SAFETY LOG
            </span>
            <span className="text-xs text-slate-500 font-mono">Real-Time Event Dispatcher</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Alerts & Safety Notifications
          </h2>
          <p className="text-sm text-slate-400">
            Prioritized operational alarms, trip logging, and remediation workflows.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={acknowledgeAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Acknowledge All</span>
          </button>
          
          <button
            onClick={clearAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800 text-xs font-mono transition-all"
            title="Clear Log History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts, sensors, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          {(['ALL', 'critical', 'warning', 'info'] as Array<'ALL' | AlertSeverity>).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex-1 sm:flex-initial",
                severityFilter === sev
                  ? sev === 'critical'
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : sev === 'warning'
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Table / Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-card border border-slate-800 text-slate-500 font-mono text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
            <p className="text-slate-300 font-bold">No active alarms matching criteria.</p>
            <p className="mt-1">All telemetry is within safe threshold envelopes.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4",
                alert.severity === 'critical'
                  ? "bg-red-950/20 border-red-500/30 hover:border-red-500/60"
                  : alert.severity === 'warning'
                  ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60"
                  : "bg-surface-card border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-start gap-3.5">
                <div className={cn(
                  "p-2.5 rounded-xl border shrink-0 mt-0.5",
                  alert.severity === 'critical'
                    ? "bg-red-500/20 border-red-500/30 text-red-400"
                    : alert.severity === 'warning'
                    ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                    : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                )}>
                  {alert.severity === 'critical' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                      alert.severity === 'critical'
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : alert.severity === 'warning'
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    )}>
                      {alert.severity}
                    </span>

                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {alert.category}
                    </span>

                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {alert.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 flex-wrap">
                    <span>Source: <strong className="text-slate-300">{alert.sensor}</strong></span>
                    {alert.value && (
                      <span>Reading: <strong className="text-cyan-400">{alert.value}</strong></span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(alert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex items-center gap-2.5 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                <button
                  onClick={() => setSelectedAlert(alert)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-colors"
                >
                  Details
                </button>

                {!alert.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold uppercase transition-all shadow-glow-cyan-sm"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acknowledged
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface border border-slate-700 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Alert Details: {selectedAlert.category}</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Title</span>
                <span className="text-white font-bold text-sm">{selectedAlert.title}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Description</span>
                <p className="text-slate-300 font-sans mt-0.5 leading-relaxed">{selectedAlert.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
                <span className="text-cyan-400 font-bold block uppercase text-[10px]">Recommended Industrial Action</span>
                <p className="text-cyan-200 font-sans leading-relaxed">{selectedAlert.recommended_action}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-slate-500 block">Sensor Node</span>
                  <span className="text-slate-300">{selectedAlert.sensor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timestamp</span>
                  <span className="text-slate-300">{formatDateTime(selectedAlert.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              {!selectedAlert.acknowledged && (
                <button
                  onClick={() => {
                    acknowledgeAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase"
                >
                  Acknowledge Alert
                </button>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs font-mono"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

