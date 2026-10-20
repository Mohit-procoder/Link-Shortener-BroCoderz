'use client';

import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { LinkItem } from '@/types';
import { PulseScoreRing } from './PulseScoreRing';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Calendar,
  Lock,
  Smartphone,
  Download,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity
} from 'lucide-react';

interface LinkDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkId: string | null;
  onOpenSimulator?: (link: LinkItem) => void;
}

export function LinkDetailsModal({
  isOpen,
  onClose,
  linkId,
  onOpenSimulator,
}: LinkDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const state = store.getState();
  const link = linkId ? state.links.find(l => l.id === linkId) : undefined;
  const clickEvents = linkId ? state.clickEvents.filter(ev => ev.linkId === linkId) : [];
  const fullShortUrl = link ? `https://lnkp.ls/${link.code}` : '';

  // Generate high-res QR code unconditionally to strictly follow React Rules of Hooks
  useEffect(() => {
    if (!isOpen || !link || !fullShortUrl) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(fullShortUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: link.qrCodeConfig?.fgColor || '#4f46e5',
        light: link.qrCodeConfig?.bgColor || '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [isOpen, link?.id, fullShortUrl, link?.qrCodeConfig]);

  if (!isOpen || !linkId || !link) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleKillSwitch = () => {
    store.toggleKillSwitch(link.id, 'Admin manual override from details view');
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `linkpulse-${link.code}-qr.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#0c101d] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden font-sans max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <PulseScoreRing score={link.pulseScore} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white truncate max-w-md">{link.title}</h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                  link.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : link.status === 'blocked'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {link.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {link.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Second Kill Switch Button */}
            <button
              onClick={handleToggleKillSwitch}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border shadow-lg ${
                link.isTakedown
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900 shadow-emerald-900/30'
                  : 'bg-rose-950/80 border-rose-500 text-rose-300 hover:bg-rose-900 shadow-rose-900/30 animate-pulse'
              }`}
              title="1-Second Kill-Switch (<1s takedown)"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{link.isTakedown ? 'Revoke Takedown (Restore)' : '⚡ 1-Sec Kill-Switch'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto grow">
          {/* Takedown Banner if active */}
          {link.isTakedown && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-300">Quarantine Active · Redirect Terminated</h4>
                  <p className="text-rose-200/80 mt-0.5">{link.takedownReason || 'Terminated by Admin governance'}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Redis in-memory cache evicted. Visitors receive HTTP 410 Blocked immediately. Historical click analytics remain preserved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Short URL Bar & QR Code Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Details & Rules */}
            <div className="md:col-span-2 space-y-4">
              
              {/* Short Link Box */}
              <div className="p-4 bg-black/50 border border-gray-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400 uppercase">Short URL</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={`/r/${link.code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Open Hop</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="font-mono text-base font-bold text-white flex items-center gap-2">
                  <span className="text-indigo-400">lnkp.ls/</span>
                  <span className="text-white bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-700/50">
                    {link.code}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono">Default Target:</span>
                    <a
                      href={link.destinationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-200 hover:text-indigo-400 font-mono truncate block"
                    >
                      {link.destinationUrl}
                    </a>
                  </div>

                  {link.mobileDestinationUrl && (
                    <div>
                      <span className="text-indigo-400 block text-[10px] uppercase font-mono flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> Step 7 Mobile Target URL:
                      </span>
                      <span className="text-gray-200 font-mono truncate block">{link.mobileDestinationUrl}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 7-Step Rule Config Summary */}
              <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-2xl">
                <h4 className="text-xs font-bold text-gray-300 uppercase font-mono mb-3">
                  Explainable 7-Step Rule Matrix
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-black/40 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Step 2: Safety</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> 5-Hop Clean
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Step 4: Expiry</span>
                    <span className="font-semibold text-gray-200 mt-0.5 block truncate">
                      {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : 'Permanent'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Step 5: Click Cap</span>
                    <span className="font-semibold text-amber-400 mt-0.5 block font-mono">
                      {link.clickCap ? `${link.currentClicks}/${link.clickCap}` : 'Unlimited'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Step 6: Password</span>
                    <span className="font-semibold text-gray-200 mt-0.5 block">
                      {link.password ? 'Protected' : 'Public'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pulse Score 4-Pillar Breakdown */}
              <div className="p-4 bg-gray-950/60 border border-gray-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase font-mono">
                    Pulse Health Score Breakdown (0 - 100)
                  </h4>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {link.pulseScore} / 100
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-black/30 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Safety</span>
                    <span className="font-bold text-emerald-400">{link.pulseScoreBreakdown.safety}/30</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Cap Headroom</span>
                    <span className="font-bold text-amber-400">{link.pulseScoreBreakdown.capHeadroom}/25</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Expiry Runway</span>
                    <span className="font-bold text-blue-400">{link.pulseScoreBreakdown.expiryRunway}/25</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-gray-800">
                    <span className="text-[10px] text-gray-400 block font-mono">Traffic Health</span>
                    <span className="font-bold text-violet-400">{link.pulseScoreBreakdown.trafficHealth}/20</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: QR Studio & Quick Simulator Trigger */}
            <div className="space-y-4">
              <div className="p-5 bg-black/50 border border-gray-800 rounded-2xl flex flex-col items-center text-center">
                <span className="text-xs font-semibold text-gray-300 mb-3">Live QR Code</span>
                {qrDataUrl && (
                  <div className="p-3 bg-white rounded-2xl shadow-xl shadow-indigo-950/30 mb-3">
                    <img src={qrDataUrl} alt="QR Code" className="w-36 h-36" />
                  </div>
                )}
                <button
                  onClick={handleDownloadQr}
                  className="w-full py-2 px-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download QR PNG</span>
                </button>
              </div>

              {onOpenSimulator && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSimulator(link);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-violet-900/60 border border-indigo-700/50 hover:border-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Test in 7-Step Simulator</span>
                </button>
              )}
            </div>

          </div>

          {/* Recent Click Events for this link */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-300 uppercase font-mono">
                Recent Cold-Path Ingestion Stream ({clickEvents.length} visits logged)
              </h4>
              <span className="text-[10px] text-gray-500 font-mono">Bots &amp; Previews distinctively tagged</span>
            </div>

            <div className="border border-gray-800 rounded-2xl overflow-hidden bg-black/40 max-h-48 overflow-y-auto text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-900/80 text-gray-400 text-[10px] sticky top-0 border-b border-gray-800">
                  <tr>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Visitor / UA</th>
                    <th className="py-2 px-3">Referrer</th>
                    <th className="py-2 px-3">Rule Trace</th>
                    <th className="py-2 px-3">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {clickEvents.slice(0, 15).map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-900/30">
                      <td className="py-2 px-3 text-gray-400">{new Date(ev.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ev.isPreview
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : ev.isBot
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                            : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800'
                        }`}>
                          {ev.isPreview ? 'PREVIEW BOT' : ev.device.toUpperCase()}
                        </span>
                        <span className="ml-1.5 text-gray-300 text-[11px] truncate max-w-[120px] inline-block align-bottom font-sans">
                          {ev.browser}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-400 truncate max-w-[120px] font-sans">{ev.referrer}</td>
                      <td className="py-2 px-3">
                        <span className="text-emerald-400 font-semibold">{ev.ruleTrace}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-400">{ev.latencyMs}ms</td>
                    </tr>
                  ))}
                  {clickEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500 font-sans">
                        No click events logged yet. Open the link or use the Simulator to generate visits.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
