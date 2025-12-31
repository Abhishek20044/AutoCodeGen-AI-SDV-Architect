
import React, { useEffect, useState } from 'react';

interface SimulationViewProps {
  status: 'idle' | 'running' | 'completed';
  metrics: { name: string; value: number }[];
}

export const SimulationView: React.FC<SimulationViewProps> = ({ status, metrics }) => {
  const [carPos, setCarPos] = useState(0);

  useEffect(() => {
    if (status === 'running') {
      const interval = setInterval(() => {
        setCarPos((prev) => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Simulation Header */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-green-400">
        <span className={`w-2 h-2 rounded-full ${status === 'running' ? 'animate-pulse bg-green-500' : 'bg-slate-500'}`} />
        CARLA SIMULATOR V0.9.15
      </div>

      {/* 3D Road Perspective Mockup */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full bg-[radial-gradient(circle_at_50%_120%,#334155_0%,#0f172a_70%)]" />
        
        {/* Road */}
        <div className="absolute w-[300%] h-32 bottom-0 bg-slate-800 rotate-x-60 transform -skew-x-12 flex flex-col justify-center">
          <div className="w-full h-1 bg-slate-700 my-4 border-t border-dashed border-slate-500" />
        </div>

        {/* Car Mock */}
        {status !== 'idle' && (
          <div 
            className="absolute bottom-8 transition-all duration-75 ease-linear"
            style={{ left: `${20 + (carPos * 0.5)}%` }}
          >
            <div className="relative w-24 h-12 bg-blue-600 rounded-lg shadow-2xl shadow-blue-500/20">
              <div className="absolute top-1 left-2 w-8 h-4 bg-blue-200/30 rounded-sm" />
              <div className="absolute top-1 right-2 w-8 h-4 bg-blue-200/30 rounded-sm" />
              <div className="absolute -bottom-1 left-2 w-4 h-4 bg-slate-900 rounded-full" />
              <div className="absolute -bottom-1 right-2 w-4 h-4 bg-slate-900 rounded-full" />
              {/* Brake Lights */}
              <div className="absolute left-0 top-2 bottom-2 w-1 bg-red-500 shadow-[0_0_10px_red]" />
            </div>
          </div>
        )}

        {/* HUD Overlay */}
        <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono text-right">
          <div>FPS: 60.2</div>
          <div>LAT: 37.7749</div>
          <div>LON: -122.4194</div>
        </div>
      </div>

      {/* Metrics Sidebar */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex gap-6 overflow-x-auto">
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col min-w-[100px]">
            <span className="text-[10px] text-slate-500 uppercase">{m.name}</span>
            <span className="text-sm font-bold text-slate-200">{m.value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {status === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <p className="text-slate-400 font-medium">Awaiting Simulation Start...</p>
        </div>
      )}
    </div>
  );
};
