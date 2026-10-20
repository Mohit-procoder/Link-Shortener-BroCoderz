'use client';

import { useMemo } from 'react';
import { store } from '@/lib/store';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Smartphone,
  ShieldCheck,
  Globe,
  Bot,
  Zap,
  Clock,
  Eye,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export function AnalyticsView() {
  const state = store.getState();
  const events = state.clickEvents;
  const links = state.links;

  // Calculate live statistics
  const stats = useMemo(() => {
    let totalClicks = 0;
    let totalPreviews = 0;
    let totalBots = 0;
    let mobileCount = 0;
    let desktopCount = 0;

    links.forEach(l => {
      totalClicks += l.currentClicks;
      totalPreviews += l.previewCount;
      totalBots += l.botCount;
    });

    // Device counts from logged events
    events.forEach(ev => {
      if (ev.device === 'mobile') mobileCount++;
      else if (ev.device === 'desktop') desktopCount++;
    });

    const totalAudited = totalClicks + totalPreviews + totalBots;
    const mobileRatio = (mobileCount + desktopCount) > 0 ? Math.round((mobileCount / (mobileCount + desktopCount)) * 100) : 71;
    const botRatio = totalAudited > 0 ? Math.round(((totalBots + totalPreviews) / totalAudited) * 100) : 9;

    return {
      totalClicks,
      totalPreviews,
      totalBots,
      totalAudited,
      mobileRatio,
      botRatio,
      hotPathAvgMs: 8,
    };
  }, [links, events]);

  // Traffic time series data (synthesize last 7 intervals)
  const chartData = useMemo(() => {
    return [
      { time: 'Mon', humanClicks: 1420, botScrapes: 180 },
      { time: 'Tue', humanClicks: 1850, botScrapes: 210 },
      { time: 'Wed', humanClicks: 2100, botScrapes: 290 },
      { time: 'Thu', humanClicks: 2600, botScrapes: 320 },
      { time: 'Fri', humanClicks: 3400, botScrapes: 410 },
      { time: 'Sat', humanClicks: 4200, botScrapes: 520 },
      { time: 'Today', humanClicks: 5120 + stats.totalClicks, botScrapes: 640 + stats.totalBots },
    ];
  }, [stats.totalClicks, stats.totalBots]);

  // Device split
  const deviceData = useMemo(() => {
    return [
      { name: 'Mobile (iOS/Android)', value: stats.mobileRatio, color: '#6366f1' },
      { name: 'Desktop Web', value: 100 - stats.mobileRatio, color: '#38bdf8' },
    ];
  }, [stats.mobileRatio]);

  // Referrer breakdown
  const referrers = [
    { name: 'Instagram Stories & Reels', percent: '68%', count: '8,486', color: 'bg-pink-500' },
    { name: 'Direct / SMS / Messengers', percent: '18%', count: '2,246', color: 'bg-indigo-500' },
    { name: 'WhatsApp Social Shares', percent: '9%', count: '1,123', color: 'bg-emerald-500' },
    { name: 'X / Twitter & Reddit', percent: '5%', count: '625', color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Slide 1 Live Pulse Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Real Clicks */}
        <div className="p-5 bg-[#0c101d] border border-indigo-500/30 rounded-3xl relative overflow-hidden group shadow-lg shadow-indigo-950/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Live Pulse · 7 Days
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> ▲ 38%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {(12480 + stats.totalClicks).toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 font-sans">verified clicks</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp previews excluded from count
          </p>
        </div>

        {/* Card 2: Mobile Share */}
        <div className="p-5 bg-[#0c101d] border border-gray-800 rounded-3xl relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Device Targeting
            </span>
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-400 font-mono tracking-tight">
              {stats.mobileRatio}%
            </span>
            <span className="text-xs text-gray-400 font-sans">Mobile Traffic</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 font-mono">
            Step 7 alternate mobile URL router active
          </p>
        </div>

        {/* Card 3: Bots & Previews Filtered */}
        <div className="p-5 bg-[#0c101d] border border-gray-800 rounded-3xl relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Bot &amp; Preview Filter
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {stats.botRatio}%
            </span>
            <span className="text-xs text-gray-400 font-sans">Scrapers Isolated</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 font-mono">
            {stats.totalPreviews} previews + {stats.totalBots} bots filtered
          </p>
        </div>

        {/* Card 4: Hot-Path Performance */}
        <div className="p-5 bg-[#0c101d] border border-gray-800 rounded-3xl relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Hot-Path Speed
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              &lt; 20ms
            </span>
            <span className="text-xs text-gray-400 font-sans">avg redirect</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2 font-mono">
            Served from in-memory Redis layer
          </p>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Real Human Clicks vs Bot Previews Filtered */}
        <div className="lg:col-span-2 p-6 bg-[#0c101d] border border-gray-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Verified Clicks vs Isolated Scrapers</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Slide 2 &amp; 3 Bot Filter
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Visualizing how LinkPulse protects analytical integrity from WhatsApp &amp; Slack card scrapers
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                Human Clicks
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                Preview Scrapers
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="humanColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="botColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#4b5563" fontSize={11} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#07090e', borderColor: '#374151', borderRadius: '1rem', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="humanClicks"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#humanColor)"
                  name="Verified Human Clicks"
                />
                <Area
                  type="monotone"
                  dataKey="botScrapes"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#botColor)"
                  name="Filtered Previews & Bots"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Top Referrers & Channel Split */}
        <div className="p-6 bg-[#0c101d] border border-gray-800 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Top Channels &amp; Referrers</h3>
              <span className="text-[10px] font-mono text-pink-400 bg-pink-950/40 border border-pink-800/40 px-2 py-0.5 rounded-full">
                Top: Instagram
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Traffic origin classification with UTM attribution
            </p>

            <div className="space-y-3.5">
              {referrers.map((ref) => (
                <div key={ref.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-medium truncate">{ref.name}</span>
                    <span className="font-mono text-gray-400 font-semibold">{ref.percent}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ref.color}`}
                      style={{ width: ref.percent }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/80 text-[11px] text-gray-400 flex items-center justify-between font-mono">
            <span>Primary Campaign:</span>
            <span className="text-indigo-400 font-bold">Festive Sale 2026</span>
          </div>
        </div>

      </div>

      {/* Live Ingestion Event Stream Table */}
      <div className="p-6 bg-[#0c101d] border border-gray-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Live Ingestion Event Stream</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Cold-path async worker ingesting clicks with explainable &quot;why&quot; decision trace
            </p>
          </div>

          <span className="text-xs font-mono text-gray-500">
            {events.length} events buffered
          </span>
        </div>

        <div className="border border-gray-800 rounded-2xl overflow-hidden bg-black/40 max-h-64 overflow-y-auto text-xs font-mono">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-900/80 text-gray-400 text-[10px] sticky top-0 border-b border-gray-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Target Shortcode</th>
                <th className="py-2.5 px-3">Visitor Device / UA</th>
                <th className="py-2.5 px-3">Geo Location</th>
                <th className="py-2.5 px-3">Referrer</th>
                <th className="py-2.5 px-3">Decision Trace (&quot;Why&quot;)</th>
                <th className="py-2.5 px-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-sans">
              {events.slice(0, 20).map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="py-2 px-3 text-gray-400 font-mono text-[11px]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-indigo-300">
                    lnkp.ls/{ev.linkCode}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      ev.isPreview
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        : ev.isBot
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800'
                    }`}>
                      {ev.isPreview ? 'PREVIEW BOT' : ev.device.toUpperCase()}
                    </span>
                    <span className="ml-2 text-gray-300 text-xs truncate max-w-[140px] inline-block align-bottom">
                      {ev.browser}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-300 text-xs font-mono">
                    {ev.geo.city}, {ev.geo.countryCode}
                  </td>
                  <td className="py-2 px-3 text-gray-400 text-xs truncate max-w-[130px]">
                    {ev.referrer}
                  </td>
                  <td className="py-2 px-3 font-mono text-xs">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      ev.ruleTrace.startsWith('SUCCESS')
                        ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                        : 'text-rose-400 bg-rose-950/40 border border-rose-500/30'
                    }`}>
                      {ev.ruleTrace}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-400 font-mono text-[11px]">
                    {ev.latencyMs}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
