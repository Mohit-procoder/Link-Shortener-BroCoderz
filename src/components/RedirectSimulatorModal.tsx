'use client';

import { useState } from 'react';
import { store } from '@/lib/store';
import { LinkItem, DecisionTrace } from '@/types';
import { PipelineExecutionResult } from '@/lib/redirectEngine';
import {
  X,
  Zap,
  Play,
  Monitor,
  Smartphone,
  Bot,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Calendar,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface RedirectSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLink?: LinkItem | null;
}

const PRESET_PROFILES = [
  {
    id: 'desktop',
    name: 'Desktop Chrome User',
    device: 'desktop',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    icon: Monitor,
    badge: 'Human Visitor',
    badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
  },
  {
    id: 'mobile',
    name: 'iPhone Mobile Visitor',
    device: 'mobile',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    icon: Smartphone,
    badge: 'Mobile Routing Test',
    badgeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Link Preview Bot',
    device: 'bot',
    ua: 'WhatsApp/2.23.20.76 i',
    icon: Bot,
    badge: 'Social Preview Filter (≠ Click)',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  },
  {
    id: 'slack',
    name: 'Slackbot Link-Expanding Crawler',
    device: 'bot',
    ua: 'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
    icon: Bot,
    badge: 'Crawler Filter (≠ Click)',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  },
  {
    id: 'headless',
    name: 'Headless Scraper / Bot',
    device: 'bot',
    ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
    icon: Bot,
    badge: 'Suspicious Automation',
    badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
  },
];

export function RedirectSimulatorModal({
  isOpen,
  onClose,
  selectedLink,
}: RedirectSimulatorModalProps) {
  const links = store.getState().links;
  const [activeCode, setActiveCode] = useState<string>(
    selectedLink ? selectedLink.code : links[0]?.code || 'festive26'
  );
  const [selectedProfileId, setSelectedProfileId] = useState('desktop');
  const [customPassword, setCustomPassword] = useState('');
  const [simulationResult, setSimulationResult] = useState<PipelineExecutionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const activeLink = links.find(l => l.code === activeCode) || links[0];
  const profile = PRESET_PROFILES.find(p => p.id === selectedProfileId) || PRESET_PROFILES[0];

  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const res = store.handleRedirect(activeCode, {
        userAgent: profile.ua,
        ip: '103.21.58.77',
        referrer: 'Simulator Studio',
        providedPassword: customPassword.trim() || undefined,
      });
      setSimulationResult(res);
      setIsSimulating(false);
    }, 180);
  };

  const stepsList = [
    { num: '1', name: 'Resolve', label: 'Code → Link in Cache/DB' },
    { num: '2', name: 'Safety Shield', label: '5-Hop & Lookalike Check' },
    { num: '3', name: 'Status', label: 'Active vs Paused Link' },
    { num: '4', name: 'Expiry', label: 'Time Window Validation' },
    { num: '5', name: 'Click Cap', label: 'Atomic Redis INCR Check' },
    { num: '6', name: 'Password', label: 'Argon2 Passcode Verification' },
    { num: '7', name: 'Device Route', label: 'Mobile vs Desktop Destination' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#0c101d] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden font-sans max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>7-Step Redirect Engine Simulator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Benchmarking &lt; 20ms
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Test any short-link under various devices, preview scrapers, or malicious bot conditions
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto grow">
          {/* Link Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Select Link to Test:
            </label>
            <select
              value={activeCode}
              onChange={(e) => {
                setActiveCode(e.target.value);
                setSimulationResult(null);
              }}
              className="w-full px-3.5 py-2.5 bg-black/60 border border-gray-700 focus:border-amber-500 rounded-xl text-white text-xs font-mono outline-none"
            >
              {links.map((l) => (
                <option key={l.id} value={l.code}>
                  lnkp.ls/{l.code} — {l.title} ({l.status})
                </option>
              ))}
            </select>
          </div>

          {/* Visitor Profiles */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Choose Test Visitor Profile (UA &amp; Device):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {PRESET_PROFILES.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProfileId(p.id);
                      setSimulationResult(null);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-black/40 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`} />
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${p.badgeColor}`}>
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-white block">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Passcode Input if link is protected */}
          {activeLink?.password && (
            <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl flex items-center gap-3">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="grow">
                <label className="block text-[11px] font-semibold text-indigo-300">
                  Passcode Required for this Link (Set passcode or leave empty to test 403 Gate):
                </label>
                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder={`Hint: ${activeLink.password}`}
                  className="mt-1 w-full px-3 py-1 bg-black/60 border border-indigo-700/60 rounded-lg text-white text-xs font-mono outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? 'Processing Hot-Path...' : 'Run 7-Step Pipeline Simulation'}</span>
            </button>
          </div>

          {/* Visual Execution Output */}
          {simulationResult && (
            <div className="space-y-4 pt-2 border-t border-gray-800 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase font-mono tracking-wider">
                  7-Step Execution Trace
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {simulationResult.latencyMs} ms (Hot-path target &lt; 20ms)
                </span>
              </div>

              {/* Steps Progress Visualizer */}
              <div className="grid grid-cols-7 gap-1.5">
                {stepsList.map((st, i) => {
                  let stepState: 'passed' | 'failed' | 'skipped' = 'passed';
                  
                  if (simulationResult.failedStep) {
                    const failedNum = parseInt(simulationResult.failedStep.split('_')[0]);
                    const currentNum = parseInt(st.num);
                    if (currentNum === failedNum) stepState = 'failed';
                    else if (currentNum > failedNum) stepState = 'skipped';
                    else stepState = 'passed';
                  }

                  return (
                    <div
                      key={st.num}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        stepState === 'failed'
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                          : stepState === 'passed'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                          : 'bg-gray-900/40 border-gray-800 text-gray-600'
                      }`}
                    >
                      <span className="text-[10px] font-mono block opacity-75">#{st.num}</span>
                      <span className="text-[11px] font-bold block truncate">{st.name}</span>
                      <div className="mt-1 flex justify-center">
                        {stepState === 'passed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : stepState === 'failed' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-700 inline-block"></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Result Summary Box */}
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                simulationResult.allowed
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold flex items-center gap-1.5">
                    Status: <span className={simulationResult.allowed ? 'text-emerald-400' : 'text-rose-400'}>
                      HTTP {simulationResult.httpStatus}
                    </span>
                  </span>
                  <span className="text-[11px] bg-black/40 px-2 py-0.5 rounded text-gray-300">
                    Decision: {simulationResult.decisionTrace}
                  </span>
                </div>

                <p className="text-gray-300">{simulationResult.reason}</p>

                {simulationResult.destinationUrl && (
                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between font-mono text-[11px] text-gray-400">
                    <span className="truncate">Routed to: {simulationResult.destinationUrl}</span>
                    <a
                      href={`/r/${activeCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>Open Live Hop</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
