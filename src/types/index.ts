export type LinkStatus = 'active' | 'paused' | 'expired' | 'limit_reached' | 'blocked';

export type RuleStep = 
  | '1_resolve'
  | '2_safety'
  | '3_status'
  | '4_expiry'
  | '5_click_cap'
  | '6_password'
  | '7_device';

export type DecisionTrace =
  | 'SUCCESS_DESKTOP'
  | 'SUCCESS_MOBILE'
  | 'NOT_FOUND'
  | 'SAFETY_BLOCKED'
  | 'STATUS_PAUSED'
  | 'EXPIRED'
  | 'CAP_REACHED'
  | 'PASSWORD_REQUIRED';

export interface RedirectRule {
  id: string;
  order: number;
  type: 'device_mobile' | 'geo_country' | 'custom_param';
  target: string;
  enabled: boolean;
}

export interface LinkItem {
  id: string;
  code: string;
  alias: string;
  title: string;
  destinationUrl: string;
  mobileDestinationUrl?: string;
  status: LinkStatus;
  createdAt: string;
  expiresAt?: string;
  clickCap?: number;
  currentClicks: number;
  previewCount: number; // WhatsApp / Slack previews
  botCount: number;
  password?: string; // plain or hashed
  campaignId?: string;
  campaignName?: string;
  tags: string[];
  pulseScore: number; // 0 - 100
  pulseScoreBreakdown: {
    safety: number;
    capHeadroom: number;
    expiryRunway: number;
    trafficHealth: number;
  };
  qrCodeConfig?: {
    fgColor: string;
    bgColor: string;
    includeMargin: boolean;
  };
  redirectRules: RedirectRule[];
  safetyCheck: {
    safe: boolean;
    hops: number;
    flaggedReason?: string;
    finalDestination?: string;
  };
  isTakedown: boolean;
  takedownAt?: string;
  takedownReason?: string;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  linkCode: string;
  timestamp: string;
  referrer: string;
  userAgent: string;
  device: 'mobile' | 'desktop' | 'tablet' | 'bot';
  browser: string;
  os: string;
  ip: string;
  geo: {
    country: string;
    countryCode: string;
    city: string;
  };
  isBot: boolean;
  isPreview: boolean; // Slack, WhatsApp, Twitter preview scraper
  botName?: string;
  ruleTrace: DecisionTrace;
  stepFailed?: RuleStep;
  resolvedUrl?: string;
  latencyMs: number; // < 20 ms hot path
}

export interface Campaign {
  id: string;
  name: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  createdAt: string;
  linkCount: number;
}

export interface PulseAlert {
  id: string;
  linkId: string;
  linkCode: string;
  linkTitle: string;
  type: 'spike_traffic' | 'cap_warning' | 'expiry_soon' | 'safety_flag' | 'takedown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface DryRunRow {
  index: number;
  url: string;
  alias: string;
  title: string;
  campaign?: string;
  status: 'valid' | 'duplicate_alias' | 'invalid_url' | 'unsafe_url';
  issueMessage?: string;
  suggestedAlias?: string;
}

export interface DryRunResult {
  totalRows: number;
  validRows: DryRunRow[];
  invalidRows: DryRunRow[];
  duplicateCount: number;
  invalidUrlCount: number;
  validCount: number;
}

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  actionText: string;
}
