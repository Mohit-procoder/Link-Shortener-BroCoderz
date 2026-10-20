import { LinkItem, PulseAlert } from '@/types';

export function calculatePulseScore(link: Partial<LinkItem>): {
  total: number;
  breakdown: {
    safety: number;
    capHeadroom: number;
    expiryRunway: number;
    trafficHealth: number;
  };
} {
  // If link is taken down / blocked, pulse score drops instantly
  if (link.isTakedown || link.status === 'blocked') {
    return {
      total: 0,
      breakdown: { safety: 0, capHeadroom: 0, expiryRunway: 0, trafficHealth: 0 }
    };
  }

  // 1. Safety Score (Max 30)
  let safety = 30;
  if (link.safetyCheck) {
    if (!link.safetyCheck.safe) {
      safety = 0;
    } else {
      safety = Math.round((link.safetyCheck.hops >= 4 ? 30 : 20));
    }
  }

  // 2. Cap Headroom (Max 25)
  let capHeadroom = 25;
  if (link.clickCap && link.clickCap > 0) {
    const usage = (link.currentClicks || 0) / link.clickCap;
    if (usage >= 1.0) {
      capHeadroom = 0; // Exhausted!
    } else if (usage >= 0.9) {
      capHeadroom = 5;
    } else if (usage >= 0.75) {
      capHeadroom = 12;
    } else {
      capHeadroom = 25;
    }
  }

  // 3. Expiry Runway (Max 25)
  let expiryRunway = 25;
  if (link.expiresAt) {
    const expiryDate = new Date(link.expiresAt).getTime();
    const now = Date.now();
    const msLeft = expiryDate - now;
    if (msLeft <= 0) {
      expiryRunway = 0; // Expired!
    } else {
      const daysLeft = msLeft / (1000 * 60 * 60 * 24);
      if (daysLeft < 1) {
        expiryRunway = 5;
      } else if (daysLeft < 3) {
        expiryRunway = 15;
      } else {
        expiryRunway = 25;
      }
    }
  }

  // 4. Traffic Health & Bot Ratio (Max 20)
  let trafficHealth = 20;
  const totalVisits = (link.currentClicks || 0) + (link.botCount || 0) + (link.previewCount || 0);
  if (totalVisits > 0) {
    const botRatio = (link.botCount || 0) / totalVisits;
    if (botRatio > 0.5) {
      trafficHealth = 6;
    } else if (botRatio > 0.2) {
      trafficHealth = 12;
    } else {
      trafficHealth = 20;
    }
  }

  const total = Math.min(100, Math.max(0, safety + capHeadroom + expiryRunway + trafficHealth));

  return {
    total,
    breakdown: { safety, capHeadroom, expiryRunway, trafficHealth }
  };
}

export function detectSpikeAlert(
  link: LinkItem,
  recentClicksInWindow: number,
  baselineAvgPerWindow: number = 5
): PulseAlert | null {
  if (recentClicksInWindow >= baselineAvgPerWindow * 3) {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      linkId: link.id,
      linkCode: link.code,
      linkTitle: link.title,
      type: 'spike_traffic',
      severity: recentClicksInWindow >= baselineAvgPerWindow * 5 ? 'critical' : 'high',
      title: `⚡ Traffic Spike Detected on "${link.title}"`,
      message: `Link received ${recentClicksInWindow} requests in the last minute (${Math.round((recentClicksInWindow / baselineAvgPerWindow) * 100)}% over 7-day baseline).`,
      timestamp: new Date().toISOString(),
      read: false,
    };
  }
  return null;
}
