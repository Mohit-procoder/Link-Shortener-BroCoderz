'use client';

import { useState } from 'react';
import { store } from '@/lib/store';
import { LinkItem, LinkStatus } from '@/types';
import { PulseScoreRing } from './PulseScoreRing';
import {
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  QrCode,
  Flame,
  Clock,
  Lock,
  Pause,
  Play,
  Zap,
  Search,
  Filter,
  Plus
} from 'lucide-react';

interface LinksTableViewProps {
  onSelectLink: (linkId: string) => void;
  onOpenCreate: () => void;
  onOpenSimulator: (link: LinkItem) => void;
}

export function LinksTableView({
  onSelectLink,
  onOpenCreate,
  onOpenSimulator,
}: LinksTableViewProps) {
  const state = store.getState();
  const links = state.links;
  const user = state.currentUser;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LinkStatus>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://lnkp.ls/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleKillSwitch = (linkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.toggleKillSwitch(linkId, 'Admin fast toggle from list');
  };

  const handleTogglePause = (linkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    store.togglePauseLink(linkId);
  };

  const filteredLinks = links.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.code.toLowerCase().includes(q) ||
        l.title.toLowerCase().includes(q) ||
        l.destinationUrl.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by alias, title, or destination..."
            className="w-full pl-9 pr-4 py-2 bg-[#0c101d] border border-gray-800 focus:border-indigo-500 rounded-xl text-white placeholder-gray-500 text-xs outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'active', 'limit_reached', 'expired', 'blocked'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-[#0c101d] border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {st === 'all'
                ? `All (${links.length})`
                : st === 'limit_reached'
                ? 'Cap Reached'
                : st === 'blocked'
                ? 'Quarantined / 410'
                : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Links List Cards */}
      <div className="space-y-3">
        {filteredLinks.map((link) => {
          const capPercent = link.clickCap ? Math.min(100, Math.round((link.currentClicks / link.clickCap) * 100)) : 0;
          return (
            <div
              key={link.id}
              onClick={() => onSelectLink(link.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                link.isTakedown
                  ? 'bg-rose-950/15 border-rose-900/60 hover:border-rose-700'
                  : 'bg-[#0c101d] border-gray-800/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left: Score + Details */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 pt-0.5">
                    <PulseScoreRing score={link.pulseScore} size="md" showLabel={false} />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                        {link.title}
                      </span>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                        link.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : link.status === 'blocked'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {link.status === 'limit_reached' ? 'Cap Exhausted' : link.status}
                      </span>

                      {link.campaignName && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {link.campaignName}
                        </span>
                      )}
                    </div>

                    {/* Short Code & Destination */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-lg border border-gray-800 text-indigo-300 font-bold">
                        <span>lnkp.ls/{link.code}</span>
                        <button
                          onClick={(e) => handleCopy(link.code, e)}
                          className="hover:text-white p-0.5"
                          title="Copy short link"
                        >
                          {copiedCode === link.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <span className="text-gray-600 hidden sm:inline">→</span>

                      <span className="text-gray-400 text-xs truncate max-w-xs font-sans">
                        {link.destinationUrl}
                      </span>
                    </div>

                    {/* Feature rule badges */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-1 flex-wrap">
                      {link.safetyCheck?.safe ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3 h-3" /> 5-Hop Scan Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-semibold">
                          <ShieldAlert className="w-3 h-3" /> {link.safetyCheck?.flaggedReason || 'Lookalike Blocked'}
                        </span>
                      )}

                      {link.mobileDestinationUrl && (
                        <span className="flex items-center gap-1 text-indigo-400">
                          · Mobile Targeted
                        </span>
                      )}

                      {link.password && (
                        <span className="flex items-center gap-1 text-amber-300">
                          <Lock className="w-3 h-3" /> Passcode Gated
                        </span>
                      )}

                      {link.expiresAt && (
                        <span className="flex items-center gap-1 text-blue-300">
                          <Clock className="w-3 h-3" /> {new Date(link.expiresAt) < new Date() ? 'Expired' : 'Expires Soon'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-800">
                  
                  {/* Click Cap Counter */}
                  <div className="text-left lg:text-right">
                    <div className="flex items-baseline gap-1 lg:justify-end">
                      <span className="text-lg font-black text-white font-mono">{link.currentClicks}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        {link.clickCap ? `/ ${link.clickCap}` : 'clicks'}
                      </span>
                    </div>

                    {link.clickCap ? (
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1 lg:ml-auto">
                        <div
                          className={`h-full rounded-full ${
                            capPercent >= 100 ? 'bg-rose-500' : capPercent >= 75 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${capPercent}%` }}
                        ></div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-mono">Unlimited cap</span>
                    )}

                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                      {link.previewCount > 0 && <span className="text-amber-400">{link.previewCount} previews · </span>}
                      {link.botCount > 0 && <span className="text-rose-400">{link.botCount} bots</span>}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Simulator Trigger */}
                    <button
                      onClick={() => onOpenSimulator(link)}
                      className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/40 text-gray-400 hover:text-amber-400 transition-colors"
                      title="Test in 7-Step Simulator"
                    >
                      <Zap className="w-4 h-4" />
                    </button>

                    {/* Pause / Resume */}
                    <button
                      onClick={(e) => handleTogglePause(link.id, e)}
                      className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors"
                      title={link.status === 'paused' ? 'Resume Link' : 'Pause Link'}
                    >
                      {link.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>

                    {/* 1-Second Kill Switch Button */}
                    <button
                      onClick={(e) => handleToggleKillSwitch(link.id, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border flex items-center gap-1.5 ${
                        link.isTakedown
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-800 text-rose-300 hover:border-rose-500 hover:bg-rose-900'
                      }`}
                      title="1-Second Kill-Switch"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {link.isTakedown ? 'Revoke Takedown' : '1s Kill-Switch'}
                      </span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          );
        })}

        {filteredLinks.length === 0 && (
          <div className="p-12 text-center bg-[#0c101d] border border-gray-800 rounded-3xl space-y-3">
            <Filter className="w-8 h-8 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-gray-300">No links matched this filter</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search criteria or create a new campaign link.
            </p>
            <button
              onClick={onOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Link</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
