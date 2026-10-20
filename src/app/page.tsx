'use client';

import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { LinkItem } from '@/types';
import { Navbar } from '@/components/Navbar';
import { ScenarioBar } from '@/components/ScenarioBar';
import { AnalyticsView } from '@/components/AnalyticsView';
import { LinksTableView } from '@/components/LinksTableView';
import { AuditLogView } from '@/components/AuditLogView';
import { CampaignsView } from '@/components/CampaignsView';
import { CreateLinkModal } from '@/components/CreateLinkModal';
import { BulkImportModal } from '@/components/BulkImportModal';
import { RedirectSimulatorModal } from '@/components/RedirectSimulatorModal';
import { LinkDetailsModal } from '@/components/LinkDetailsModal';
import { AlertsDrawer } from '@/components/AlertsDrawer';
import {
  Activity,
  Layers,
  FileCode2,
  FolderPlus,
  PlayCircle,
  Plus,
  Upload,
  Zap,
  Shield,
  HelpCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const [, setTick] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    return store.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  const state = store.getState();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'audit' | 'campaigns'>('overview');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialParams, setCreateInitialParams] = useState<any>(undefined);

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkPreloadedCsv, setBulkPreloadedCsv] = useState<string | undefined>(undefined);

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorLink, setSimulatorLink] = useState<LinkItem | null>(null);

  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [showScenarios, setShowScenarios] = useState(true);

  const unreadAlerts = state.alerts.filter(a => !a.read).length;

  const handleOpenSimulator = (link: LinkItem) => {
    setSimulatorLink(link);
    setIsSimulatorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-indigo-900/15 via-violet-900/5 to-transparent blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <Navbar
        onOpenCreate={() => {
          setCreateInitialParams(undefined);
          setIsCreateOpen(true);
        }}
        onOpenBulk={() => {
          setBulkPreloadedCsv(undefined);
          setIsBulkOpen(true);
        }}
        onOpenSimulator={() => {
          setSimulatorLink(null);
          setIsSimulatorOpen(true);
        }}
        onToggleScenarios={() => setShowScenarios(!showScenarios)}
        showScenarios={showScenarios}
        unreadAlertsCount={unreadAlerts}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Interactive Scenario Walkthrough Bar */}
      {showScenarios && (
        <ScenarioBar
          onOpenCreateWithParams={(params) => {
            setCreateInitialParams(params);
            setIsCreateOpen(true);
          }}
          onOpenBulkWithData={(csv) => {
            setBulkPreloadedCsv(csv);
            setIsBulkOpen(true);
          }}
          onOpenLinkDetails={(linkId) => setSelectedLinkId(linkId)}
        />
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-1.5 bg-[#0c101d] p-1.5 border border-gray-800 rounded-2xl overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live Pulse Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'links'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Links &amp; Governance ({state.links.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>7-Step Rule Audit ({state.clickEvents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'campaigns'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Campaign Hubs ({state.campaigns.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSimulatorLink(null);
                setIsSimulatorOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/40 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Hot-Path</span>
            </button>

            <button
              onClick={() => {
                setCreateInitialParams(undefined);
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Link</span>
            </button>
          </div>
        </div>

        {/* Tab View Render */}
        {activeTab === 'overview' && <AnalyticsView />}

        {activeTab === 'links' && (
          <LinksTableView
            onSelectLink={(id) => setSelectedLinkId(id)}
            onOpenCreate={() => {
              setCreateInitialParams(undefined);
              setIsCreateOpen(true);
            }}
            onOpenSimulator={handleOpenSimulator}
          />
        )}

        {activeTab === 'audit' && <AuditLogView />}

        {activeTab === 'campaigns' && (
          <CampaignsView
            onOpenCreateWithCampaign={(campId) => {
              setCreateInitialParams({ campaignId: campId });
              setIsCreateOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer with Team Brocoderz Tribute */}
      <footer className="border-t border-gray-800/80 bg-[#07090e]/95 py-8 mt-12 text-xs font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-white text-sm">LinkPulse · every link, a living signal</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800 text-[10px] font-mono">
                GEHU Haldwani
              </span>
            </div>
            <p className="text-gray-500 text-xs">
              Built by <span className="text-gray-300 font-semibold">Team Brocoderz</span>: Mohit Dubey, Raj Rai, Vageesh Raj, Shivanshu Mishra, Sanchay Naresh Gupta
            </p>
          </div>

          <div className="flex items-center gap-4 text-gray-500 font-mono text-[11px]">
            <span>Next.js 14 · Fastify · Redis</span>
            <span>·</span>
            <span>&lt; 20ms Hot-Path</span>
            <span>·</span>
            <span>7-Step Explainable Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CreateLinkModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialParams={createInitialParams}
        onLinkCreated={(id) => setSelectedLinkId(id)}
      />

      <BulkImportModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        preloadedCsv={bulkPreloadedCsv}
        onImportComplete={(count) => {
          setActiveTab('links');
        }}
      />

      <RedirectSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        selectedLink={simulatorLink}
      />

      <LinkDetailsModal
        isOpen={Boolean(selectedLinkId)}
        onClose={() => setSelectedLinkId(null)}
        linkId={selectedLinkId}
        onOpenSimulator={handleOpenSimulator}
      />

      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onSelectLink={(id) => setSelectedLinkId(id)}
      />
    </div>
  );
}
