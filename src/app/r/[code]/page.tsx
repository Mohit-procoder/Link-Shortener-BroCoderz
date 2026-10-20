'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { store } from '@/lib/store';
import { PipelineExecutionResult } from '@/lib/redirectEngine';
import {
  ShieldAlert,
  Clock,
  Lock,
  Flame,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Zap
} from 'lucide-react';

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || '';

  const [result, setResult] = useState<PipelineExecutionResult | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [benchmarking, setBenchmarking] = useState(true);

  const evaluatePipeline = (passcode?: string) => {
    const res = store.handleRedirect(code, {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Chrome/124.0',
      ip: '103.21.58.192',
      referrer: typeof document !== 'undefined' ? document.referrer || 'Direct Link' : 'Direct Link',
      providedPassword: passcode,
    });
    setResult(res);
    setBenchmarking(false);

    if (res.allowed && res.destinationUrl) {
      // Auto redirect after a brief visual confirmation of the <20ms hot-path
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && res.destinationUrl) {
          window.location.href = res.destinationUrl;
        }
      }, 1400);
      return () => clearTimeout(timer);
    }
  };

  useEffect(() => {
    if (code) {
      evaluatePipeline();
    }
  }, [code]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    const res = store.handleRedirect(code, {
      userAgent: navigator.userAgent,
      ip: '103.21.58.192',
      referrer: document.referrer || 'Password Gate Screen',
      providedPassword: passwordInput.trim(),
    });

    if (res.allowed && res.destinationUrl) {
      setPasswordError(false);
      setResult(res);
      setTimeout(() => {
        if (res.destinationUrl) window.location.href = res.destinationUrl;
      }, 800);
    } else {
      setPasswordError(true);
    }
  };

  if (benchmarking || !result) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#07090e] to-[#07090e]"></div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mb-6 animate-pulse">
            <Zap className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">LinkPulse Hot-Path Engine</h2>
          <p className="text-sm text-gray-400 mt-2">Evaluating 7-step explainable rule pipeline in Redis in-memory cache...</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Latency target: &lt; 20 ms
          </div>
        </div>
      </div>
    );
  }

  // 1. Success Redirect State (302)
  if (result.allowed && result.destinationUrl) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#07090e] to-[#07090e]"></div>

        <div className="relative z-10 w-full max-w-lg bg-[#0d131f]/90 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-emerald-950/50 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            7-Step Pipeline Verified in {result.latencyMs}ms
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Redirecting to Destination</h1>
          <p className="text-sm text-gray-400 mb-6">
            Decision: <span className="text-emerald-400 font-mono font-medium">{result.decisionTrace}</span>
          </p>

          <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 text-left mb-6 font-mono text-xs text-gray-300 break-all flex items-center justify-between gap-3">
            <span className="truncate">{result.destinationUrl}</span>
            <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>Taking you there automatically</span>
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
            <span>Brocoderz · LinkPulse</span>
            <button
              onClick={() => router.push('/')}
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Password Gate (Step 6)
  if (result.failedStep === '6_password' || result.requiresPassword) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/25 via-[#07090e] to-[#07090e]"></div>

        <div className="relative z-10 w-full max-w-md bg-[#0d131f]/95 border border-indigo-500/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5 text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            Pipeline Step 6 · Password Gate
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Protected Link</h1>
          <p className="text-sm text-gray-400 mb-6">
            The link creator has secured <code className="text-indigo-300 font-mono">lnkp.ls/{code}</code> with a passcode.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter passcode (hint: pulse)"
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-gray-500 text-center font-mono outline-none transition-all"
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Invalid passcode. Try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Unlock &amp; Redirect</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-500 flex items-center justify-between">
            <span>Secured by Argon2 / LinkPulse</span>
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. 1-Second Kill Switch / Safety Shield (Step 2)
  if (result.failedStep === '2_safety') {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/25 via-[#07090e] to-[#07090e]"></div>

        <div className="relative z-10 w-full max-w-lg bg-[#0d131f]/95 border border-rose-500/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-rose-950/40 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-3">
            HTTP 410 Gone · Safety Shield Takedown
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Access Quarantined</h1>
          <p className="text-sm text-gray-300 mb-6">
            This link was terminated instantly by LinkPulse Governance (<span className="text-rose-400 font-mono">&lt; 1s Kill-Switch</span>).
          </p>

          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-left mb-6 text-xs space-y-2">
            <div className="flex items-center justify-between text-rose-300 font-semibold">
              <span>Takedown Reason:</span>
              <span className="font-mono text-[11px] bg-rose-900/60 px-2 py-0.5 rounded">STEP 2 REJECTED</span>
            </div>
            <p className="text-rose-200">{result.reason}</p>
            <div className="pt-2 text-[11px] text-gray-400 border-t border-rose-900/30 flex items-center justify-between">
              <span>Redis Cache Purged: Instantly</span>
              <span>Analytics Retained: 100%</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-all"
          >
            Return to LinkPulse Console
          </button>
        </div>
      </div>
    );
  }

  // 4. Click Cap Exhausted (Step 5)
  if (result.failedStep === '5_click_cap') {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/25 via-[#07090e] to-[#07090e]"></div>

        <div className="relative z-10 w-full max-w-md bg-[#0d131f]/95 border border-amber-500/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400">
            <Flame className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            Pipeline Step 5 · Click Cap Reached
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Campaign Quota Full</h1>
          <p className="text-sm text-gray-300 mb-6">
            This link was strictly limited to a maximum number of human clicks and has reached capacity.
          </p>

          <div className="p-4 rounded-2xl bg-black/40 border border-amber-900/40 text-left mb-6 text-xs text-gray-400">
            <p className="font-mono text-amber-300 font-semibold mb-1">Atomic Redis INCR: Lua Check</p>
            <p>Subsequent clicks (such as #{101} on a 100-cap link) are rejected at the edge to protect campaign limits.</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 5. Expired Link (Step 4)
  if (result.failedStep === '4_expiry') {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/25 via-[#07090e] to-[#07090e]"></div>

        <div className="relative z-10 w-full max-w-md bg-[#0d131f]/95 border border-blue-500/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-5 text-blue-400">
            <Clock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
            Pipeline Step 4 · Expiry Window Closed
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
          <p className="text-sm text-gray-300 mb-6">{result.reason}</p>

          <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 text-left mb-6 text-xs text-gray-400">
            <p className="font-semibold text-gray-200 mb-1">Audit Record Preserved</p>
            <p>Expired links remain accessible in analytical reports and history is never deleted.</p>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-all"
          >
            Go to LinkPulse Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 6. Generic or Not Found (Step 1)
  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="relative z-10 w-full max-w-md bg-[#0d131f]/95 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-800/60 border border-gray-700 flex items-center justify-center mx-auto mb-5 text-gray-400">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold mb-3">
          HTTP 404 · Unresolved Shortcode
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Shortcode Not Found</h1>
        <p className="text-sm text-gray-400 mb-6">
          No active routing record found for <code className="text-indigo-400 font-mono">lnkp.ls/{code}</code>.
        </p>

        <button
          onClick={() => router.push('/')}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-sm transition-all"
        >
          Create This Shortlink on LinkPulse
        </button>
      </div>
    </div>
  );
}
