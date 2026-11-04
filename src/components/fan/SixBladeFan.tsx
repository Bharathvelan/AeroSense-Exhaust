import React from 'react';
import { cn } from '../../utils/cn';

interface SixBladeFanProps {
  speedPercentage: number;
  state: 'OFF' | 'ON' | 'LOW' | 'MEDIUM' | 'HIGH' | 'AUTO';
  isEmergencyStopped?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SixBladeFan: React.FC<SixBladeFanProps> = ({
  speedPercentage,
  state,
  isEmergencyStopped = false,
  size = 'lg',
}) => {
  const isRunning = state !== 'OFF' && speedPercentage > 0 && !isEmergencyStopped;

  // Calculate rotation speed in seconds per turn:
  // 100% -> 0.4s per turn
  // 70% -> 0.7s per turn
  // 35% -> 1.4s per turn
  // 10% -> 3.0s per turn
  const animationDuration = isRunning 
    ? `${Math.max(0.35, 3.5 - (speedPercentage / 100) * 3.1)}s` 
    : '0s';

  const sizeDimensions = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80',
  }[size];

  return (
    <div className={cn("relative flex items-center justify-center select-none", sizeDimensions)}>
      {/* Outer Glow Ring */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          isRunning 
            ? "bg-cyan-500/10 shadow-[0_0_35px_rgba(6,182,212,0.25)] border border-cyan-500/40" 
            : isEmergencyStopped 
            ? "bg-red-500/10 shadow-[0_0_35px_rgba(239,68,68,0.3)] border border-red-500/40"
            : "bg-slate-900/40 border border-slate-800"
        )}
      />

      {/* Industrial Circular Guard Ring */}
      <div className="absolute inset-2 rounded-full border-2 border-slate-700/60 flex items-center justify-center">
        {/* Guard spokes */}
        <div className="absolute w-full h-[1px] bg-slate-800/80" />
        <div className="absolute h-full w-[1px] bg-slate-800/80" />
        <div className="absolute w-full h-[1px] bg-slate-800/80 rotate-45" />
        <div className="absolute w-full h-[1px] bg-slate-800/80 -rotate-45" />
      </div>

      {/* Airflow speed particle indicator rings */}
      {isRunning && (
        <div 
          className="absolute inset-4 rounded-full border border-dashed border-cyan-400/30 animate-spin"
          style={{ animationDuration: `${parseFloat(animationDuration) * 2}s` }}
        />
      )}

      {/* Rotating 6-Blade Fan Assembly */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          animation: isRunning ? `spin ${animationDuration} linear infinite` : 'none',
        }}
      >
        <svg
          viewBox="-120 -120 240 240"
          className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        >
          <defs>
            <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isRunning ? "#22d3ee" : "#475569"} />
              <stop offset="50%" stopColor={isRunning ? "#0891b2" : "#334155"} />
              <stop offset="100%" stopColor={isRunning ? "#0f172a" : "#1e293b"} />
            </linearGradient>
            <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>

          {/* 6 Aerodynamic Blades distributed at 60 degree increments */}
          {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
            <g key={idx} transform={`rotate(${angle})`}>
              {/* Blade shape */}
              <path
                d="M 0 0 C 12 -28 42 -75 28 -102 C 14 -115 -14 -108 -18 -82 C -22 -55 -10 -25 0 0 Z"
                fill="url(#bladeGrad)"
                stroke={isRunning ? "rgba(34, 211, 238, 0.4)" : "rgba(100, 116, 139, 0.3)"}
                strokeWidth="1.2"
              />
              {/* Blade aerodynamic rib line */}
              <path
                d="M 0 -5 C 6 -35 15 -70 8 -96"
                stroke={isRunning ? "rgba(255, 255, 255, 0.5)" : "rgba(148, 163, 184, 0.2)"}
                strokeWidth="1.2"
                fill="none"
              />
            </g>
          ))}

          {/* Central Motor Hub */}
          <circle cx="0" cy="0" r="30" fill="url(#hubGrad)" stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="18" fill="#0f172a" stroke={isRunning ? "#06b6d4" : "#475569"} strokeWidth="1.5" />
          
          {/* AeroSense Center Emblem */}
          <circle cx="0" cy="0" r="6" fill={isRunning ? "#22d3ee" : "#64748b"} />
        </svg>
      </div>

      {/* Speed badge in center when paused or running */}
      <div className="absolute pointer-events-none flex flex-col items-center justify-center">
        {isEmergencyStopped ? (
          <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/90 px-2 py-0.5 rounded border border-red-700">
            E-STOP
          </span>
        ) : isRunning ? (
          <div className="text-center">
            <span className="text-xs font-mono font-extrabold text-cyan-300 drop-shadow">
              {Math.round(speedPercentage)}%
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
            STOPPED
          </span>
        )}
      </div>
    </div>
  );
};

