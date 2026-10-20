'use client';

import { LinkItem, ClickEvent, Campaign, PulseAlert, DryRunResult, DryRunRow } from '@/types';
import { calculatePulseScore, detectSpikeAlert } from './pulseScore';
import { checkSafety, validateAlias } from './safety';
import { executeRedirectPipeline, PipelineExecutionResult } from './redirectEngine';
import Papa from 'papaparse';

const STORAGE_KEY = 'linkpulse_state_v1';

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-festive',
    name: 'Festive Sale 2026',
    utmSource: 'insta',
    utmMedium: 'story',
    utmCampaign: 'festive_blowout',
    utmContent: 'hero_banner',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    linkCount: 3,
  },
  {
    id: 'camp-developer',
    name: 'Tech Geeks Campus Tour',
    utmSource: 'gehu',
    utmMedium: 'hackathon',
    utmCampaign: 'linkpulse_launch',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    linkCount: 2,
  },
];

const INITIAL_LINKS: LinkItem[] = [
  {
    id: 'link-festive-26',
    code: 'festive26',
    alias: 'festive26',
    title: 'Festive Sale 2026 Flash Deal',
    destinationUrl: 'https://shop.example.com/sale/festive-2026?utm_source=insta&utm_medium=story&ref=a83kd',
    mobileDestinationUrl: 'https://shop.example.com/app/open-deal?promo=festive26',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    clickCap: 500,
    currentClicks: 342,
    previewCount: 45,
    botCount: 28,
    campaignId: 'camp-festive',
    campaignName: 'Festive Sale 2026',
    tags: ['ecommerce', 'festive', 'instagram', 'deals'],
    pulseScore: 94,
    pulseScoreBreakdown: {
      safety: 30,
      capHeadroom: 25,
      expiryRunway: 25,
      trafficHealth: 14,
    },
    qrCodeConfig: {
      fgColor: '#4f46e5',
      bgColor: '#ffffff',
      includeMargin: true,
    },
    redirectRules: [
      {
        id: 'rule-mobile-1',
        order: 1,
        type: 'device_mobile',
        target: 'https://shop.example.com/app/open-deal?promo=festive26',
        enabled: true,
      },
    ],
    safetyCheck: {
      safe: true,
      hops: 5,
      finalDestination: 'https://shop.example.com/sale/festive-2026?utm_source=insta&utm_medium=story&ref=a83kd',
    },
    isTakedown: false,
  },
  {
    id: 'link-cap-100',
    code: 'vip-launch',
    alias: 'vip-launch',
    title: 'Exclusive VIP Beta Passes (100 Cap)',
    destinationUrl: 'https://linkpulse.dev/vip-signup',
    status: 'limit_reached',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    clickCap: 100,
    currentClicks: 100, // Exact cap reached!
    previewCount: 12,
    botCount: 6,
    campaignId: 'camp-developer',
    campaignName: 'Tech Geeks Campus Tour',
    tags: ['vip', 'limited', 'beta'],
    pulseScore: 68,
    pulseScoreBreakdown: {
      safety: 30,
      capHeadroom: 0,
      expiryRunway: 25,
      trafficHealth: 13,
    },
    redirectRules: [],
    safetyCheck: { safe: true, hops: 4 },
    isTakedown: false,
  },
  {
    id: 'link-expired-deal',
    code: 'midnight-glitch',
    alias: 'midnight-glitch',
    title: 'Midnight 1-Hour Flash Pass (Expired)',
    destinationUrl: 'https://deals.example.com/flash-expired',
    status: 'expired',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
    currentClicks: 89,
    previewCount: 14,
    botCount: 5,
    tags: ['flash', 'expired-test'],
    pulseScore: 45,
    pulseScoreBreakdown: {
      safety: 30,
      capHeadroom: 25,
      expiryRunway: 0,
      trafficHealth: 15,
    },
    redirectRules: [],
    safetyCheck: { safe: true, hops: 5 },
    isTakedown: false,
  },
  {
    id: 'link-secret-gate',
    code: 'brocoderz-vault',
    alias: 'brocoderz-vault',
    title: 'Brocoderz Internal Roster (Password Protected)',
    destinationUrl: 'https://internal.brocoderz.team/secret-briefing',
    status: 'active',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    password: 'pulse',
    currentClicks: 56,
    previewCount: 8,
    botCount: 2,
    tags: ['internal', 'passcode', 'team'],
    pulseScore: 98,
    pulseScoreBreakdown: {
      safety: 30,
      capHeadroom: 25,
      expiryRunway: 25,
      trafficHealth: 18,
    },
    redirectRules: [],
    safetyCheck: { safe: true, hops: 5 },
    isTakedown: false,
  },
  {
    id: 'link-phish-shield',
    code: 'paypa1-verify-bill',
    alias: 'paypa1-verify-bill',
    title: 'Deceptive Lookalike Threat (Blocked by Shield)',
    destinationUrl: 'https://paypa1.com/invoice/confirm-identity',
    status: 'blocked',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    currentClicks: 0,
    previewCount: 0,
    botCount: 31,
    tags: ['security', 'blocked', 'lookalike'],
    pulseScore: 0,
    pulseScoreBreakdown: {
      safety: 0,
      capHeadroom: 0,
      expiryRunway: 0,
      trafficHealth: 0,
    },
    redirectRules: [],
    safetyCheck: {
      safe: false,
      hops: 3,
      flaggedReason: 'Deceptive lookalike URL detected: "paypa1" spoofing PayPal',
    },
    isTakedown: true,
    takedownAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    takedownReason: 'Safety Shield automated quarantine (typosquatting & credential harvesting)',
  },
];

// Generate realistic click events
function generateInitialEvents(): ClickEvent[] {
  const referrers = ['https://instagram.com', 'https://instagram.com/stories', 'https://whatsapp.com', 'Direct / SMS', 'https://t.co', 'https://linkedin.com'];
  const cities = [
    { city: 'Dehradun', country: 'India', code: 'IN' },
    { city: 'New Delhi', country: 'India', code: 'IN' },
    { city: 'Bengaluru', country: 'India', code: 'IN' },
    { city: 'Mumbai', country: 'India', code: 'IN' },
    { city: 'London', country: 'United Kingdom', code: 'GB' },
    { city: 'San Francisco', country: 'United States', code: 'US' },
  ];

  const events: ClickEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < 40; i++) {
    const ageMs = (40 - i) * 60000 * 30; // spaced over last 20 hours
    const geo = cities[Math.floor(Math.random() * cities.length)];
    const isBot = Math.random() < 0.12;
    const isMobile = Math.random() < 0.72;

    events.push({
      id: `seed-ev-${i}`,
      linkId: 'link-festive-26',
      linkCode: 'festive26',
      timestamp: new Date(now - ageMs).toISOString(),
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      userAgent: isBot
        ? 'WhatsApp/2.23.20.76 i'
        : isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      device: isBot ? 'bot' : isMobile ? 'mobile' : 'desktop',
      browser: isBot ? 'WhatsApp Preview Bot' : isMobile ? 'Mobile Safari' : 'Chrome',
      os: isMobile ? 'iOS 17' : 'Windows 11',
      ip: `103.21.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
      geo: {
        country: geo.country,
        countryCode: geo.code,
        city: geo.city,
      },
      isBot,
      isPreview: isBot,
      botName: isBot ? 'WhatsApp Preview Bot' : undefined,
      ruleTrace: isMobile ? 'SUCCESS_MOBILE' : 'SUCCESS_DESKTOP',
      resolvedUrl: isMobile
        ? 'https://shop.example.com/app/open-deal?promo=festive26'
        : 'https://shop.example.com/sale/festive-2026?utm_source=insta&utm_medium=story&ref=a83kd',
      latencyMs: Math.floor(6 + Math.random() * 9),
    });
  }

  return events;
}

const INITIAL_ALERTS: PulseAlert[] = [
  {
    id: 'alert-1',
    linkId: 'link-festive-26',
    linkCode: 'festive26',
    linkTitle: 'Festive Sale 2026 Flash Deal',
    type: 'spike_traffic',
    severity: 'high',
    title: '⚡ Viral Traffic Pulse: Festive Sale 2026',
    message: 'Link surged +38% above 7-day moving average. Instagram Stories is driving 68% of fresh entries.',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    read: false,
  },
  {
    id: 'alert-2',
    linkId: 'link-cap-100',
    linkCode: 'vip-launch',
    linkTitle: 'Exclusive VIP Beta Passes (100 Cap)',
    type: 'cap_warning',
    severity: 'critical',
    title: '🛑 Cap Exhausted: VIP Launch Passes',
    message: '100% of the 100 click quota was consumed. 24 subsequent visitors safely routed to Cap Limit Screen.',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    read: false,
  },
];

export interface AppState {
  links: LinkItem[];
  campaigns: Campaign[];
  clickEvents: ClickEvent[];
  alerts: PulseAlert[];
  currentUser: {
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}

class Store {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      links: INITIAL_LINKS,
      campaigns: INITIAL_CAMPAIGNS,
      clickEvents: generateInitialEvents(),
      alerts: INITIAL_ALERTS,
      currentUser: {
        name: 'Mohit Dubey',
        email: 'mohit@brocoderz.gehu.ac.in',
        role: 'ADMIN',
      },
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.state = {
            ...this.state,
            ...parsed,
          };
        }
      } catch (err) {
        console.warn('Could not read from localStorage', err);
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.warn('Could not persist to localStorage', err);
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  getState(): AppState {
    return this.state;
  }

  setUserRole(role: 'USER' | 'ADMIN') {
    this.state.currentUser.role = role;
    this.persist();
  }

  // --- Link Operations ---

  getLinkByCode(code: string): LinkItem | undefined {
    const clean = code.trim().toLowerCase();
    return this.state.links.find(
      l => l.code.toLowerCase() === clean || l.alias.toLowerCase() === clean
    );
  }

  createLink(payload: {
    title: string;
    destinationUrl: string;
    customAlias?: string;
    mobileDestinationUrl?: string;
    expiresAt?: string;
    clickCap?: number;
    password?: string;
    campaignId?: string;
    tags?: string[];
  }): { success: boolean; link?: LinkItem; error?: string; suggestions?: string[] } {
    // 1. Validate safety
    const safety = checkSafety(payload.destinationUrl);
    if (!safety.safe && safety.score === 0) {
      return { success: false, error: safety.flaggedReason };
    }

    // 2. Determine alias
    const existingAliases = this.state.links.map(l => l.alias);
    let alias = payload.customAlias?.trim() || '';

    if (alias) {
      const aliasCheck = validateAlias(alias, existingAliases);
      if (!aliasCheck.valid) {
        return {
          success: false,
          error: aliasCheck.reason,
          suggestions: aliasCheck.suggestions,
        };
      }
    } else {
      // Auto-generate Feistel / Base62 style 7-character code
      const chars = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
      let gen = '';
      for (let i = 0; i < 7; i++) {
        gen += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      alias = gen;
    }

    const campaign = this.state.campaigns.find(c => c.id === payload.campaignId);

    const newLink: LinkItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: alias,
      alias: alias,
      title: payload.title.trim() || 'Untitled Link',
      destinationUrl: payload.destinationUrl.trim(),
      mobileDestinationUrl: payload.mobileDestinationUrl?.trim() || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: payload.expiresAt || undefined,
      clickCap: payload.clickCap && payload.clickCap > 0 ? Number(payload.clickCap) : undefined,
      currentClicks: 0,
      previewCount: 0,
      botCount: 0,
      password: payload.password?.trim() || undefined,
      campaignId: payload.campaignId,
      campaignName: campaign ? campaign.name : undefined,
      tags: payload.tags || [],
      pulseScore: 96,
      pulseScoreBreakdown: {
        safety: 30,
        capHeadroom: 25,
        expiryRunway: 25,
        trafficHealth: 16,
      },
      qrCodeConfig: {
        fgColor: '#4f46e5',
        bgColor: '#ffffff',
        includeMargin: true,
      },
      redirectRules: payload.mobileDestinationUrl
        ? [
            {
              id: `rule-${Date.now()}`,
              order: 1,
              type: 'device_mobile',
              target: payload.mobileDestinationUrl,
              enabled: true,
            },
          ]
        : [],
      safetyCheck: {
        safe: safety.safe,
        hops: safety.hops,
        flaggedReason: safety.flaggedReason,
        finalDestination: safety.finalDestination,
      },
      isTakedown: false,
    };

    // Calculate score
    const scoreData = calculatePulseScore(newLink);
    newLink.pulseScore = scoreData.total;
    newLink.pulseScoreBreakdown = scoreData.breakdown;

    this.state.links.unshift(newLink);

    // Update campaign link count
    if (campaign) {
      campaign.linkCount += 1;
    }

    this.persist();
    return { success: true, link: newLink };
  }

  // 1-Second Kill Switch (< 1s Takedown)
  toggleKillSwitch(linkId: string, reason?: string) {
    const link = this.state.links.find(l => l.id === linkId);
    if (!link) return false;

    if (link.isTakedown) {
      // Restore
      link.isTakedown = false;
      link.status = 'active';
      link.takedownAt = undefined;
      link.takedownReason = undefined;
    } else {
      // Instant Kill-Switch Triggered!
      link.isTakedown = true;
      link.status = 'blocked';
      link.takedownAt = new Date().toISOString();
      link.takedownReason = reason || 'Admin 1-Second Kill-Switch Activated';

      // Push alert
      this.state.alerts.unshift({
        id: `alert-${Date.now()}`,
        linkId: link.id,
        linkCode: link.code,
        linkTitle: link.title,
        type: 'takedown',
        severity: 'critical',
        title: `🚨 1-Second Kill-Switch Fired: ${link.code}`,
        message: `Admin revoked route for "${link.title}". In-memory Redis cache purged. All hits will receive 410 Blocked immediately. Historical click analytics preserved intact.`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    const scoreData = calculatePulseScore(link);
    link.pulseScore = scoreData.total;
    link.pulseScoreBreakdown = scoreData.breakdown;

    this.persist();
    return true;
  }

  togglePauseLink(linkId: string) {
    const link = this.state.links.find(l => l.id === linkId);
    if (!link) return;
    link.status = link.status === 'paused' ? 'active' : 'paused';
    const scoreData = calculatePulseScore(link);
    link.pulseScore = scoreData.total;
    link.pulseScoreBreakdown = scoreData.breakdown;
    this.persist();
  }

  // --- Redirect Execution & Event Logging ---

  handleRedirect(
    code: string,
    req: {
      userAgent: string;
      ip: string;
      referrer?: string;
      country?: string;
      city?: string;
      providedPassword?: string;
      isAuthorizedSession?: boolean;
    }
  ): PipelineExecutionResult {
    const link = this.getLinkByCode(code);
    const result = executeRedirectPipeline(link, req);

    if (result.clickEvent && link) {
      // Cold-path async queue simulation
      this.state.clickEvents.unshift(result.clickEvent);

      // Keep recent 400 events
      if (this.state.clickEvents.length > 400) {
        this.state.clickEvents = this.state.clickEvents.slice(0, 400);
      }

      if (result.allowed) {
        if (!result.isBot) {
          link.currentClicks += 1;
          // Check if cap reached on this very click
          if (link.clickCap && link.currentClicks >= link.clickCap) {
            link.status = 'limit_reached';
          }
        }
      }

      if (result.isPreview) {
        link.previewCount += 1;
      } else if (result.isBot) {
        link.botCount += 1;
      }

      // Check spike alert
      const recentHits = this.state.clickEvents.filter(
        ev => ev.linkId === link.id && Date.now() - new Date(ev.timestamp).getTime() < 60000
      ).length;

      const alert = detectSpikeAlert(link, recentHits);
      if (alert) {
        const exists = this.state.alerts.some(
          a => a.linkId === link.id && Date.now() - new Date(a.timestamp).getTime() < 120000
        );
        if (!exists) {
          this.state.alerts.unshift(alert);
        }
      }

      // Recalculate score
      const score = calculatePulseScore(link);
      link.pulseScore = score.total;
      link.pulseScoreBreakdown = score.breakdown;

      this.persist();
    }

    return result;
  }

  // --- Campaign Operations ---

  createCampaign(name: string, utm?: { source?: string; medium?: string; campaign?: string }) {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: name.trim(),
      utmSource: utm?.source,
      utmMedium: utm?.medium,
      utmCampaign: utm?.campaign,
      createdAt: new Date().toISOString(),
      linkCount: 0,
    };
    this.state.campaigns.unshift(newCamp);
    this.persist();
    return newCamp;
  }

  // --- Bulk CSV Dry-Run & Import Engine ---

  parseCsvDryRun(csvText: string): DryRunResult {
    const parsed = Papa.parse(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data as Record<string, string>[];
    const existingAliases = new Set(this.state.links.map(l => l.alias.toLowerCase()));
    const seenInBatch = new Set<string>();

    const validRows: DryRunRow[] = [];
    const invalidRows: DryRunRow[] = [];
    let duplicateCount = 0;
    let invalidUrlCount = 0;

    rows.forEach((row, idx) => {
      const url = (row.url || row.destination || row.destinationUrl || '').trim();
      const rawAlias = (row.alias || row.code || '').trim();
      const title = (row.title || `Imported Link #${idx + 1}`).trim();
      const campaign = (row.campaign || '').trim();

      // Check URL validity
      let isUrlValid = false;
      try {
        const u = new URL(url);
        isUrlValid = u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        isUrlValid = false;
      }

      if (!isUrlValid) {
        invalidUrlCount++;
        invalidRows.push({
          index: idx + 1,
          url: url || '(empty)',
          alias: rawAlias || '(auto)',
          title,
          campaign,
          status: 'invalid_url',
          issueMessage: 'Malformed URL: missing http:// or https:// prefix',
        });
        return;
      }

      // Check Lookalike / Unsafe
      const safety = checkSafety(url);
      if (!safety.safe) {
        invalidUrlCount++;
        invalidRows.push({
          index: idx + 1,
          url,
          alias: rawAlias || '(auto)',
          title,
          campaign,
          status: 'unsafe_url',
          issueMessage: safety.flaggedReason || 'Unsafe domain detected by Shield',
        });
        return;
      }

      // Check Alias
      const cleanAlias = rawAlias.toLowerCase();
      if (cleanAlias) {
        if (existingAliases.has(cleanAlias) || seenInBatch.has(cleanAlias)) {
          duplicateCount++;
          const suggested = `${cleanAlias}-${Math.floor(100 + Math.random() * 899)}`;
          invalidRows.push({
            index: idx + 1,
            url,
            alias: rawAlias,
            title,
            campaign,
            status: 'duplicate_alias',
            issueMessage: `Alias "${rawAlias}" already exists in system or batch`,
            suggestedAlias: suggested,
          });
          return;
        }
        seenInBatch.add(cleanAlias);
      }

      validRows.push({
        index: idx + 1,
        url,
        alias: rawAlias || `auto-${Math.random().toString(36).substring(2, 8)}`,
        title,
        campaign,
        status: 'valid',
      });
    });

    return {
      totalRows: rows.length,
      validRows,
      invalidRows,
      duplicateCount,
      invalidUrlCount,
      validCount: validRows.length,
    };
  }

  commitBulkImport(validRows: DryRunRow[]): number {
    let imported = 0;
    validRows.forEach(row => {
      const res = this.createLink({
        title: row.title,
        destinationUrl: row.url,
        customAlias: row.alias.startsWith('auto-') ? undefined : row.alias,
        tags: ['bulk-imported', 'csv-batch'],
      });
      if (res.success) imported++;
    });
    return imported;
  }

  // --- Reset to Demo State ---

  resetDemo() {
    this.state = {
      links: INITIAL_LINKS,
      campaigns: INITIAL_CAMPAIGNS,
      clickEvents: generateInitialEvents(),
      alerts: INITIAL_ALERTS,
      currentUser: {
        name: 'Mohit Dubey',
        email: 'mohit@brocoderz.gehu.ac.in',
        role: 'ADMIN',
      },
    };
    this.persist();
  }

  dismissAlert(id: string) {
    this.state.alerts = this.state.alerts.filter(a => a.id !== id);
    this.persist();
  }
}

// Singleton store
export const store = new Store();
