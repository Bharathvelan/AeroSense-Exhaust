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
import { formatDateTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const RecentAlertsStream: React.FC = () => {
  const { alerts, acknowledgeAlert, setActiveNav } = useApp();

  const recentAlerts = alerts.slice(0, 4);

  return (
    <div className="p-5 rounded-2xl bg-surface-card border border-slate-800 shadow-card-dark flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Recent Alerts & Events
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live automated rule triggers & system warnings
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveNav('alerts')}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>View All ({alerts.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
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
                "p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5",
                alert.severity === 'critical'
                  ? "bg-red-950/20 border-red-500/30 hover:border-red-500/50"
                  : alert.severity === 'warning'
                  ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {alert.severity === 'critical' ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-200 truncate">{alert.title}</span>
                </div>

                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {formatDateTime(alert.timestamp)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-1">{alert.description}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                <span className="text-slate-500 truncate">{alert.sensor}</span>
                {!alert.acknowledged ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold uppercase transition-colors"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
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

