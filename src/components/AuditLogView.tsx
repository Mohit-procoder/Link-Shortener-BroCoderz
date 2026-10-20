'use client';

import { useState } from 'react';
import { store } from '@/lib/store';
import { DecisionTrace } from '@/types';
import {
  FileCode2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Download
} from 'lucide-react';

export function AuditLogView() {
  const events = store.getState().clickEvents;
  const [filterTrace, setFilterTrace] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter((ev) => {
    if (filterTrace !== 'ALL' && ev.ruleTrace !== filterTrace) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        ev.linkCode.toLowerCase().includes(q) ||
        ev.ip.toLowerCase().includes(q) ||
        ev.browser.toLowerCase().includes(q) ||
        ev.referrer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportAuditCsv = () => {
    const lines = ['id,timestamp,shortcode,rule_trace,step_failed,device,browser,ip,latency_ms,is_bot,is_preview'];
    filteredEvents.forEach(e => {
      lines.push(`${e.id},${e.timestamp},${e.linkCode},${e.ruleTrace},${e.stepFailed || 'NONE'},${e.device},"${e.browser}",${e.ip},${e.latencyMs},${e.isBot},${e.isPreview}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkpulse-audit-trail-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Controls & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by IP, shortcode, referrer..."
              className="w-full pl-9 pr-4 py-2 bg-[#0c101d] border border-gray-800 focus:border-indigo-500 rounded-xl text-white placeholder-gray-500 text-xs outline-none"
            />
          </div>

          <select
            value={filterTrace}
            onChange={(e) => setFilterTrace(e.target.value)}
            className="px-3 py-2 bg-[#0c101d] border border-gray-800 focus:border-indigo-500 rounded-xl text-xs text-white font-mono outline-none"
          >
            <option value="ALL">All Decision Traces</option>
            <option value="SUCCESS_DESKTOP">SUCCESS_DESKTOP</option>
            <option value="SUCCESS_MOBILE">SUCCESS_MOBILE</option>
            <option value="CAP_REACHED">CAP_REACHED (Step 5)</option>
            <option value="EXPIRED">EXPIRED (Step 4)</option>
            <option value="PASSWORD_REQUIRED">PASSWORD_REQUIRED (Step 6)</option>
            <option value="SAFETY_BLOCKED">SAFETY_BLOCKED (Step 2)</option>
            <option value="STATUS_PAUSED">STATUS_PAUSED (Step 3)</option>
            <option value="NOT_FOUND">NOT_FOUND (Step 1)</option>
          </select>
        </div>

        <button
          onClick={exportAuditCsv}
          className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Audit Trail Table */}
      <div className="border border-gray-800 rounded-3xl overflow-hidden bg-[#0c101d] shadow-xl text-xs font-mono">
        <div className="px-6 py-4 border-b border-gray-800/80 bg-gray-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white font-sans text-sm">Explainable 7-Step Rule Decision Ledger</span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {filteredEvents.length} log records
          </span>
        </div>

        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-900/90 text-gray-400 text-[10px] sticky top-0 border-b border-gray-800">
              <tr>
                <th className="py-2.5 px-4">Event ID &amp; Time</th>
                <th className="py-2.5 px-4">Short Code</th>
                <th className="py-2.5 px-4">Audited &quot;Why&quot; Trace</th>
                <th className="py-2.5 px-4">Failed Step</th>
                <th className="py-2.5 px-4">Visitor / Bot Class</th>
                <th className="py-2.5 px-4">Client IP &amp; Geo</th>
                <th className="py-2.5 px-4">Hot-Path Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-sans">
              {filteredEvents.map((ev) => {
                const isSuccess = ev.ruleTrace.startsWith('SUCCESS');
                return (
                  <tr key={ev.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      <span className="text-gray-300 block">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{ev.id}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-300">
                      lnkp.ls/{ev.linkCode}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isSuccess
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                          : 'text-rose-400 bg-rose-950/40 border border-rose-500/30'
                      }`}>
                        {ev.ruleTrace}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-gray-400">
                      {ev.stepFailed ? (
                        <span className="text-rose-400 font-semibold">{ev.stepFailed}</span>
                      ) : (
                        <span className="text-emerald-500">None (Passed 7/7)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        ev.isPreview
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                          : ev.isBot
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                          : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800'
                      }`}>
                        {ev.isPreview ? 'PREVIEW BOT' : ev.device.toUpperCase()}
                      </span>
                      <span className="ml-2 text-gray-400 text-xs truncate max-w-[130px] inline-block align-bottom font-mono">
                        {ev.browser}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-gray-300">
                      <span>{ev.ip}</span>
                      <span className="text-gray-500 text-[10px] block">{ev.geo.city}, {ev.geo.countryCode}</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs">
                      <span className="text-emerald-400 font-semibold">{ev.latencyMs}ms</span>
                    </td>
                  </tr>
                );
              })}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No audit records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
