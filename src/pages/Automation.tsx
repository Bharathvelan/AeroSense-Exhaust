import React, { useState } from 'react';
import { 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Sliders, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Settings2, 
  Edit3, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AutomationRule } from '../types';
import { formatDateTime } from '../utils/formatters';
import { cn } from '../utils/cn';

export const AutomationPage: React.FC = () => {
  const { rules, updateRule, settings, updateSettings, telemetry } = useApp();
  
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const toggleRule = (ruleId: string, currentEnabled: boolean) => {
    updateRule(ruleId, { enabled: !currentEnabled });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      updateRule(editingRule.id, editingRule);
      setEditingRule(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              HEURISTIC ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">Automated HVAC Orchestration</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono uppercase">
            Intelligent Automation Engine
          </h2>
          <p className="text-sm text-slate-400">
            Multi-condition state-machine rules, hysteresis dampening, and safe fallback policies.
          </p>
        </div>

        {/* Global Automation Switch & Runtime Safe Fallback */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-surface-card border border-slate-800 flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Fail-Safe Fallback:</span>
            <select
              value={settings.safe_fallback_behavior}
              onChange={(e: any) => updateSettings({ safe_fallback_behavior: e.target.value })}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-cyan-400 font-bold focus:outline-none"
            >
              <option value="fan_low">Run Low Fan (35%)</option>
              <option value="fan_off">Power Off Fan (0%)</option>
              <option value="keep_last">Preserve Last State</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => {
          const isTriggered = rule.status === 'triggered';
          return (
            <div
              key={rule.id}
              className={cn(
                "p-5 rounded-2xl bg-surface-card border transition-all duration-300 shadow-card-dark flex flex-col justify-between relative group",
                rule.enabled 
                  ? isTriggered 
                    ? "border-amber-500/50 bg-amber-950/15" 
                    : "border-slate-800 hover:border-cyan-500/40" 
                  : "border-slate-800/40 opacity-60 bg-slate-950/40"
              )}
            >
              <div>
                {/* Rule Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "p-2 rounded-xl border",
                      rule.enabled ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-slate-800 border-slate-700 text-slate-500"
                    )}>
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 block tracking-wider">
                        {rule.code}
                      </span>
                      <h3 className="font-bold text-white text-sm leading-tight mt-0.5">
                        {rule.name}
                      </h3>
                    </div>
                  </div>

                  {/* Toggle enable switch */}
                  <button
                    onClick={() => toggleRule(rule.id, rule.enabled)}
                    className="text-slate-400 hover:text-white transition-colors"
                    title={rule.enabled ? "Disable Rule" : "Enable Rule"}
                  >
                    {rule.enabled ? (
                      <ToggleRight className="w-7 h-7 text-cyan-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {rule.description}
                </p>

                {/* Threshold & Parameters box */}
                <div className="my-3.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trigger Threshold:</span>
                    <span className="text-cyan-400 font-bold">
                      {rule.condition_type === 'humidity' ? `${rule.threshold_value}% RH` :
                       rule.condition_type === 'power_limit' ? `${rule.threshold_value} A` :
                       `${rule.threshold_value}s`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Duration Required:</span>
                    <span className="text-white">{rule.duration_seconds}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hysteresis Deadband:</span>
                    <span className="text-slate-300">±{rule.hysteresis} units</span>
                  </div>
                </div>

                {/* Recommended Action vs Actuator Command distinction */}
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] space-y-1">
                  <div className="text-slate-400 font-mono font-semibold uppercase text-[10px]">
                    Prescribed Automated Action:
                  </div>
                  <div className="text-slate-300 font-sans">
                    {rule.action_description}
                  </div>
                </div>
              </div>

              {/* Footer info: Trigger count & edit button */}
              <div className="pt-3.5 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">
                  Triggered: <strong className="text-white">{rule.trigger_count}x</strong>
                </span>

                <button
                  onClick={() => setEditingRule(rule)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[11px] font-bold uppercase transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Rule Editing */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-surface border border-slate-700 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Configure Rule: {editingRule.code}</h3>
              </div>
              <button
                onClick={() => setEditingRule(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Threshold Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingRule.threshold_value}
                    onChange={(e) => setEditingRule({ ...editingRule, threshold_value: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-cyan-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Confirmation Duration (s)</label>
                  <input
                    type="number"
                    value={editingRule.duration_seconds}
                    onChange={(e) => setEditingRule({ ...editingRule, duration_seconds: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Hysteresis Deadband (prevents rapid switching)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editingRule.hysteresis}
                  onChange={(e) => setEditingRule({ ...editingRule, hysteresis: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Prescribed Action Description</label>
                <textarea
                  rows={2}
                  value={editingRule.action_description}
                  onChange={(e) => setEditingRule({ ...editingRule, action_description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

