'use client';

import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { DryRunResult, DryRunRow } from '@/types';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  FileText,
  Filter
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  preloadedCsv?: string;
  onImportComplete?: (count: number) => void;
}

export function BulkImportModal({
  isOpen,
  onClose,
  preloadedCsv,
  onImportComplete,
}: BulkImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [dryRunResult, setDryRunResult] = useState<DryRunResult | null>(null);
  const [filter, setFilter] = useState<'all' | 'valid' | 'issues'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (preloadedCsv) {
      setCsvText(preloadedCsv);
      const res = store.parseCsvDryRun(preloadedCsv);
      setDryRunResult(res);
    }
  }, [preloadedCsv, isOpen]);

  if (!isOpen) return null;

  const handleRunDryRun = () => {
    if (!csvText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const res = store.parseCsvDryRun(csvText);
      setDryRunResult(res);
      setIsProcessing(false);
    }, 200);
  };

  const handleLoadSample50Row = () => {
    const lines = ['title,url,alias,campaign'];
    lines.push('Festive Sale Clone A,https://deals.example.com/festive,festive26,Festive 2026'); // Duplicate!
    lines.push('VIP Pass Clone B,https://deals.example.com/vip,vip-launch,Beta passes'); // Duplicate!
    lines.push('Brocoderz Vault Dup,https://vault.example.com/roster,brocoderz-vault,Internal'); // Duplicate!
    lines.push('Phishing Paypa1 Attack,https://paypa1.com/secure-login,paypa1-phish,Phish'); // Lookalike threat!
    lines.push('Syntax Defect Link,htt://malformed-url-syntax-test,broken-link,Defect'); // Malformed!

    for (let i = 1; i <= 45; i++) {
      lines.push(`Catalog Product #${i},https://shop.example.com/items/sku-${1000 + i}?ref=bulk,item-sku-${1000 + i},Winter Catalog`);
    }

    const sample = lines.join('\n');
    setCsvText(sample);
    const res = store.parseCsvDryRun(sample);
    setDryRunResult(res);
  };

  const handleCommitImport = () => {
    if (!dryRunResult || dryRunResult.validCount === 0) return;
    const count = store.commitBulkImport(dryRunResult.validRows);
    if (onImportComplete) onImportComplete(count);
    onClose();
  };

  const allRows = dryRunResult
    ? [...dryRunResult.invalidRows, ...dryRunResult.validRows]
    : [];

  const filteredRows = allRows.filter((r) => {
    if (filter === 'valid') return r.status === 'valid';
    if (filter === 'issues') return r.status !== 'valid';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#0c101d] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>CSV Bulk Import &amp; Dry-Run Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Two-Phase Safe Commit
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Parse up to 10,000 links with automated lookalike detection, syntax validation, and alias conflict checking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto grow">
          {/* Controls: textarea & quick actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300">
                Paste CSV Data (Columns: title, url, alias, campaign)
              </label>
              <button
                type="button"
                onClick={handleLoadSample50Row}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Slide 8 Sample 50-Row CSV</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="title,url,alias,campaign&#10;Product 1,https://deals.example.com/p1,deal-1,Sale"
              className="w-full px-4 py-2.5 bg-black/60 border border-gray-700 focus:border-blue-500 rounded-xl text-white placeholder-gray-500 text-xs font-mono outline-none"
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Dry-run inspects each row before writing anything to database.
              </span>
              <button
                type="button"
                onClick={handleRunDryRun}
                disabled={!csvText.trim() || isProcessing}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Analyzing...' : 'Run Dry-Run Inspection'}
              </button>
            </div>
          </div>

          {/* Dry Run Inspection Table */}
          {dryRunResult && (
            <div className="space-y-4 pt-2 border-t border-gray-800">
              {/* Summary Badges */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Total Inspected</span>
                  <span className="text-lg font-bold text-white font-mono">{dryRunResult.totalRows}</span>
                </div>

                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 block">Valid &amp; Approved</span>
                  <span className="text-lg font-bold text-emerald-300 font-mono">{dryRunResult.validCount}</span>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono text-amber-400 block">Duplicate Aliases</span>
                  <span className="text-lg font-bold text-amber-300 font-mono">{dryRunResult.duplicateCount}</span>
                </div>

                <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono text-rose-400 block">Invalid / Phishing</span>
                  <span className="text-lg font-bold text-rose-300 font-mono">{dryRunResult.invalidUrlCount}</span>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 bg-black/40 p-1 border border-gray-800 rounded-xl">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      filter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    All Rows ({allRows.length})
                  </button>
                  <button
                    onClick={() => setFilter('valid')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      filter === 'valid' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Valid Only ({dryRunResult.validCount})
                  </button>
                  <button
                    onClick={() => setFilter('issues')}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      filter === 'issues' ? 'bg-rose-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Flagged Issues ({dryRunResult.duplicateCount + dryRunResult.invalidUrlCount})
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-800 rounded-2xl overflow-hidden bg-black/40 max-h-56 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-900/90 text-gray-400 font-mono text-[11px] sticky top-0 border-b border-gray-800">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Title / Destination</th>
                      <th className="py-2.5 px-3">Alias</th>
                      <th className="py-2.5 px-3">Dry-Run Inspection Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-sans">
                    {filteredRows.map((r, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-gray-900/40 transition-colors ${
                          r.status !== 'valid' ? 'bg-rose-950/15' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-mono text-gray-500">{r.index}</td>
                        <td className="py-2 px-3 max-w-xs truncate">
                          <span className="font-semibold text-gray-200 block truncate">{r.title}</span>
                          <span className="text-[11px] text-gray-400 font-mono block truncate">{r.url}</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-indigo-300">{r.alias}</td>
                        <td className="py-2 px-3">
                          {r.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : r.status === 'duplicate_alias' ? (
                            <div className="text-[11px] text-amber-400">
                              <span className="inline-flex items-center gap-1 font-semibold bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Duplicate Alias
                              </span>
                              {r.suggestedAlias && (
                                <span className="block text-[10px] text-gray-400 mt-0.5">
                                  Auto-fallback: {r.suggestedAlias}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-[11px] text-rose-400">
                              <span className="inline-flex items-center gap-1 font-semibold bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded-full">
                                <ShieldAlert className="w-3 h-3" /> {r.status === 'unsafe_url' ? 'Lookalike Phishing' : 'Invalid URL'}
                              </span>
                              <span className="block text-[10px] text-rose-300/80 mt-0.5">{r.issueMessage}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/80 bg-gray-950/60 shrink-0">
          <span className="text-xs text-gray-400">
            {dryRunResult ? `${dryRunResult.validCount} valid links eligible for import` : 'Paste CSV and inspect'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCommitImport}
              disabled={!dryRunResult || dryRunResult.validCount === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import {dryRunResult?.validCount || 0} Valid Links</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
