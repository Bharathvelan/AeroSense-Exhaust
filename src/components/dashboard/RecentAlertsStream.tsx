import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/cn';

export const RecentAlertsStream: React.FC = () => {
  const { alerts, acknowledgeAlert, setActiveNav } = useApp();

  const recentAlerts = alerts.slice(0, 4);

  const formatTimeBadge = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white tracking-wide truncate">
              Recent Alerts & Events
            </h3>
            <p className="text-xs text-slate-400 font-mono truncate">
              Live automated rule triggers & system warnings
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveNav('alerts')}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors shrink-0 whitespace-nowrap ml-2 px-2 py-1 rounded-lg hover:bg-slate-800/60"
        >
          <span>View All ({alerts.length})</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-2.5 flex-1 overflow-y-auto overflow-x-hidden pr-0.5">
        {recentAlerts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
            <span>No active alerts. System operating normally.</span>
          </div>
        ) : (
          recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 overflow-hidden",
                alert.severity === 'critical'
                  ? "bg-red-950/20 border-red-500/30 hover:border-red-500/50"
                  : alert.severity === 'warning'
                  ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {alert.severity === 'critical' ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-200 truncate block text-xs">
                    {alert.title}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800/80">
                  {formatTimeBadge(alert.timestamp)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {alert.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono gap-2 min-w-0">
                <span className="text-slate-500 truncate flex-1 min-w-0">
                  {alert.sensor}
                </span>
                {!alert.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold uppercase transition-colors shrink-0 whitespace-nowrap"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> Acked
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
