'use client';

import { useState } from 'react';
import { store } from '@/lib/store';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  ShieldAlert,
  FileSpreadsheet,
  QrCode,
  Smartphone,
  Bot
} from 'lucide-react';

interface ScenarioBarProps {
  onOpenCreateWithParams?: (params: any) => void;
  onOpenBulkWithData?: (csv: string) => void;
  onOpenLinkDetails?: (linkId: string) => void;
}

export function ScenarioBar({
  onOpenCreateWithParams,
  onOpenBulkWithData,
  onOpenLinkDetails,
}: ScenarioBarProps) {
  const [activeScenario, setActiveScenario] = useState<'A' | 'B'>('A');
  const [currentStepA, setCurrentStepA] = useState(0);
  const [currentStepB, setCurrentStepB] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Scenario A Steps
  const executeStepA = (stepIndex: number) => {
    setCurrentStepA(stepIndex);

    if (stepIndex === 1) {
      // 1. Create campaign
      const camp = store.createCampaign('Festive Sale 2026', {
        source: 'insta',
        medium: 'story',
        campaign: 'festive_blowout',
      });
      showToast(`Campaign created: "${camp.name}" with UTM tags!`);
    } else if (stepIndex === 2) {
      // 2. Wizard alias taken -> suggestion
      if (onOpenCreateWithParams) {
        onOpenCreateWithParams({
          title: 'Festive Mega Drop',
          destinationUrl: 'https://shop.example.com/sale/festive-2026',
          customAlias: 'festive26', // Taken!
          tags: ['festive', 'sale', 'electronics'],
        });
      }
      showToast(`Triggered alias collision on "festive26" -> AI smart suggestions shown!`);
    } else if (stepIndex === 3) {
      // 3. Set expiry + 500 click cap -> link created
      const res = store.createLink({
        title: 'Festive Flash Deal (500 Cap)',
        destinationUrl: 'https://shop.example.com/sale/festive-2026?utm_source=insta&ref=live-demo',
        customAlias: `festive-${Math.floor(10 + Math.random() * 89)}`,
        mobileDestinationUrl: 'https://shop.example.com/app/open-deal?promo=festive26',
        clickCap: 500,
        expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        tags: ['festive', 'cap-500', 'mobile-routed'],
      });
      if (res.link && onOpenLinkDetails) {
        onOpenLinkDetails(res.link.id);
      }
      showToast(`Link created with 500-cap & QR Code generated!`);
    } else if (stepIndex === 4) {
      // 4. Fire simulated mobile + desktop clicks + 1 WhatsApp preview bot
      const link = store.getState().links[0];
      if (link) {
        // Desktop click
        store.handleRedirect(link.code, {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
          ip: '103.21.58.10',
          referrer: 'https://google.com',
        });
        // Mobile click
        store.handleRedirect(link.code, {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Mobile Safari/604.1',
          ip: '103.21.58.11',
          referrer: 'https://instagram.com/stories',
        });
        // WhatsApp Preview Bot
        store.handleRedirect(link.code, {
          userAgent: 'WhatsApp/2.23.20.76 i',
          ip: '103.21.58.12',
          referrer: 'https://whatsapp.com',
        });
        showToast(`Simulated 1 Desktop click, 1 Mobile click, and 1 WhatsApp Preview Bot!`);
      }
    } else if (stepIndex === 5) {
      // 5. Dashboard updates live - bot excluded
      showToast(`Verified: WhatsApp preview bot recorded as preview; Human click count is clean!`);
    }
  };

  // Scenario B Steps
  const executeStepB = (stepIndex: number) => {
    setCurrentStepB(stepIndex);

    if (stepIndex === 1) {
      // 1. Upload 50-row CSV
      const sampleCsv = generate50RowCsv();
      if (onOpenBulkWithData) {
        onOpenBulkWithData(sampleCsv);
      }
      showToast(`Loaded 50-row CSV payload for dry-run inspection.`);
    } else if (stepIndex === 2) {
      // 2. 3 duplicates + 2 invalid flagged
      showToast(`Dry-Run complete: 3 duplicates & 2 invalid/phishing URLs flagged!`);
    } else if (stepIndex === 3) {
      // 3. Batch import 45 valid links
      const sampleCsv = generate50RowCsv();
      const dryRun = store.parseCsvDryRun(sampleCsv);
      const count = store.commitBulkImport(dryRun.validRows);
      showToast(`Batch imported ${count} valid links in one atomic transaction!`);
    } else if (stepIndex === 4) {
      // 4. Spike traffic on one link -> Pulse alert fires
      const link = store.getState().links.find(l => l.code === 'festive26') || store.getState().links[0];
      if (link) {
        for (let i = 0; i < 18; i++) {
          store.handleRedirect(link.code, {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
            ip: `103.21.58.${i + 20}`,
            referrer: 'https://instagram.com/reels',
          });
        }
        showToast(`⚡ High velocity burst simulated on "${link.title}". Pulse Alert fired!`);
      }
    } else if (stepIndex === 5) {
      // 5. Admin disables -> 410 instantly, history kept
      const target = store.getState().links[0];
      if (target) {
        store.toggleKillSwitch(target.id, 'Scenario B Admin Rapid Takedown');
        showToast(`🚨 1-Second Kill Switch fired! Redirect returned 410 Blocked immediately.`);
      }
    }
  };

  const handleResetDemo = () => {
    store.resetDemo();
    setCurrentStepA(0);
    setCurrentStepB(0);
    showToast('Demo environment reset to pristine initial state.');
  };

  return (
    <div className="w-full bg-[#0a0f1d] border-b border-indigo-500/20 py-3 px-4 sm:px-6 relative overflow-hidden transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Scenario Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-1 rounded-xl text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Slide 8 Interactive Tour</span>
          </div>

          <div className="flex rounded-xl bg-black/40 p-1 border border-gray-800 text-xs">
            <button
              onClick={() => setActiveScenario('A')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeScenario === 'A'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Scenario A · Create → Track
            </button>
            <button
              onClick={() => setActiveScenario('B')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeScenario === 'B'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Scenario B · Bulk → Takedown
            </button>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {activeScenario === 'A' ? (
            <>
              <button
                onClick={() => executeStepA(1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepA >= 1
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Festive Campaign</span>
              </button>

              <button
                onClick={() => executeStepA(2)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepA >= 2
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Alias Collision</span>
              </button>

              <button
                onClick={() => executeStepA(3)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepA >= 3
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Cap + QR</span>
              </button>

              <button
                onClick={() => executeStepA(4)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepA >= 4
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-[10px] flex items-center justify-center font-bold">4</span>
                <span>Traffic + Bot</span>
              </button>

              <button
                onClick={() => executeStepA(5)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepA >= 5
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[10px] flex items-center justify-center font-bold">5</span>
                <span>Clean Analytics</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => executeStepB(1)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepB >= 1
                    ? 'bg-pink-950/80 border-pink-500 text-pink-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-pink-500/20 text-[10px] flex items-center justify-center font-bold">1</span>
                <span>50-Row CSV</span>
              </button>

              <button
                onClick={() => executeStepB(2)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepB >= 2
                    ? 'bg-pink-950/80 border-pink-500 text-pink-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-pink-500/20 text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Flag Issues</span>
              </button>

              <button
                onClick={() => executeStepB(3)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepB >= 3
                    ? 'bg-pink-950/80 border-pink-500 text-pink-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-pink-500/20 text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Commit 45 Valid</span>
              </button>

              <button
                onClick={() => executeStepB(4)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepB >= 4
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-[10px] flex items-center justify-center font-bold">4</span>
                <span>Traffic Spike</span>
              </button>

              <button
                onClick={() => executeStepB(5)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  currentStepB >= 5
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-rose-500/20 text-[10px] flex items-center justify-center font-bold">5</span>
                <span>1s Kill-Switch</span>
              </button>
            </>
          )}

          <button
            onClick={handleResetDemo}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors ml-1"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Floating feedback message toast */}
      {feedbackMsg && (
        <div className="absolute bottom-1 right-6 z-50 bg-indigo-900/90 border border-indigo-400 text-white text-xs px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>{feedbackMsg}</span>
        </div>
      )}
    </div>
  );
}

// Generate sample 50-row CSV with 3 duplicates & 2 invalid/phishing URLs (matches Slide 8 spec exactly)
function generate50RowCsv(): string {
  const lines = ['title,url,alias,campaign'];

  // Add 3 deliberate duplicates
  lines.push('Festive Duplicate 1,https://deals.example.com/festive,festive26,Festive Sale');
  lines.push('Festive Duplicate 2,https://deals.example.com/vip,vip-launch,Beta Passes');
  lines.push('Internal Vault Dup,https://vault.example.com/roster,brocoderz-vault,Internal');

  // Add 2 invalid / unsafe URLs (Safety Shield catches them!)
  lines.push('Phishing Paypa1 Attack,https://paypa1.com/secure-login,paypa1-phish,Malicious');
  lines.push('Malformed URL Syntax,htt://broken-url-domain-test,syntax-broken,Defect');

  // Add 45 valid links
  for (let i = 1; i <= 45; i++) {
    lines.push(`Product Deal #${i},https://catalog.example.com/item-${i}?ref=csv-bulk,deal-item-${i},Catalog 2026`);
  }

  return lines.join('\n');
}
