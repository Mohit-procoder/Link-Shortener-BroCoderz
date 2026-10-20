'use client';

import { useState } from 'react';
import { store } from '@/lib/store';
import {
  FolderPlus,
  Plus,
  Tag,
  Link2,
  Calendar,
  ExternalLink,
  Sparkles,
  BarChart2
} from 'lucide-react';

interface CampaignsViewProps {
  onOpenCreateWithCampaign?: (campaignId: string) => void;
}

export function CampaignsView({ onOpenCreateWithCampaign }: CampaignsViewProps) {
  const state = store.getState();
  const campaigns = state.campaigns;
  const links = state.links;

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('social');
  const [utmCampaign, setUtmCampaign] = useState('festive_2026');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    store.createCampaign(name, {
      source: utmSource.trim() || undefined,
      medium: utmMedium.trim() || undefined,
      campaign: utmCampaign.trim() || undefined,
    });

    setName('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Campaign Attribution &amp; Hubs</h2>
          <p className="text-xs text-gray-400">
            Group links into marketing campaigns with automated UTM parameter injection
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-5 bg-[#0c101d] border border-indigo-500/40 rounded-3xl shadow-xl space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span>Create New Campaign Hub</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">Campaign Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Diwali Cyber Blowout 2026"
                className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">UTM Source</label>
              <input
                type="text"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="e.g. instagram"
                className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 rounded-xl text-white text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">UTM Medium</label>
              <input
                type="text"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="e.g. story"
                className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 rounded-xl text-white text-xs font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
            >
              Save Campaign
            </button>
          </div>
        </form>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((camp) => {
          const campLinks = links.filter(l => l.campaignId === camp.id);
          const totalClicks = campLinks.reduce((sum, l) => sum + l.currentClicks, 0);

          return (
            <div
              key={camp.id}
              className="p-5 bg-[#0c101d] border border-gray-800 rounded-3xl space-y-4 hover:border-gray-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                      <FolderPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{camp.name}</h3>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Created {new Date(camp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UTM details */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-gray-800/80 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>utm_source:</span>
                    <span className="text-indigo-300 font-semibold">{camp.utmSource || 'none'}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>utm_medium:</span>
                    <span className="text-indigo-300 font-semibold">{camp.utmMedium || 'none'}</span>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Active Links</span>
                  <span className="font-bold text-white font-mono">{campLinks.length}</span>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Verified Hits</span>
                  <span className="font-bold text-emerald-400 font-mono">{totalClicks.toLocaleString()}</span>
                </div>

                {onOpenCreateWithCampaign && (
                  <button
                    onClick={() => onOpenCreateWithCampaign(camp.id)}
                    className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 hover:border-indigo-500/40 text-gray-300 text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3 text-indigo-400" />
                    <span>Add Link</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
