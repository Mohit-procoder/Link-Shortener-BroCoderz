'use client';

import { store } from '@/lib/store';
import { PulseAlert } from '@/types';
import {
  X,
  Bell,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLink?: (linkId: string) => void;
}

export function AlertsDrawer({ isOpen, onClose, onSelectLink }: AlertsDrawerProps) {
  const alerts = store.getState().alerts;

  if (!isOpen) return null;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.dismissAlert(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0c101d] border-l border-gray-800 h-full shadow-2xl flex flex-col font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Pulse Alerts &amp; Anomalies</h2>
              <p className="text-[11px] text-gray-400 font-mono">Real-time spike &amp; governance feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Alerts */}
        <div className="p-4 space-y-3 overflow-y-auto grow">
          {alerts.map((al) => {
            const isCritical = al.severity === 'critical';
            return (
              <div
                key={al.id}
                onClick={() => {
                  if (onSelectLink) {
                    onSelectLink(al.linkId);
                    onClose();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-800 hover:border-rose-600'
                    : 'bg-black/40 border-gray-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    {al.type === 'spike_traffic' ? (
                      <Zap className="w-4 h-4 text-amber-400" />
                    ) : al.type === 'takedown' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Flame className="w-4 h-4 text-orange-400" />
                    )}
                    <span className="text-white">{al.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDismiss(al.id, e)}
                    className="text-gray-500 hover:text-gray-300 p-1"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-gray-300 text-[11px] leading-relaxed">{al.message}</p>

                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1 border-t border-gray-800/60">
                  <span>lnkp.ls/{al.linkCode}</span>
                  <span>{new Date(al.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto" />
              <p className="text-xs font-semibold text-gray-400">All signals normal</p>
              <p className="text-[11px] text-gray-600">No anomalies or traffic spikes detected.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/40 text-[11px] text-gray-500 flex items-center justify-between">
          <span>7-day moving baseline monitoring</span>
          <span className="text-emerald-400 font-mono">System Active</span>
        </div>

      </div>
    </div>
  );
}
