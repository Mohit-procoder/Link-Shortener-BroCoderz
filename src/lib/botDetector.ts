// LinkPulse Bot & Preview Scraper Engine

export interface BotDetectionResult {
  isBot: boolean;
  isPreview: boolean;
  botName?: string;
  category: 'human' | 'preview_bot' | 'crawler_bot' | 'headless';
  confidence: number;
}

const PREVIEW_BOT_PATTERNS = [
  { name: 'WhatsApp Preview Bot', regex: /WhatsApp\/[0-9]/i },
  { name: 'Slackbot Preview Bot', regex: /Slackbot-LinkExpanding|Slack-ImgProxy/i },
  { name: 'Twitter/X Card Bot', regex: /Twitterbot|Twitter-Cards/i },
  { name: 'Telegram Bot Preview', regex: /TelegramBot \(like TwitterBot\)/i },
  { name: 'Discord Bot Embed', regex: /Discordbot\/[0-9]/i },
  { name: 'Facebook External Hit', regex: /facebookexternalhit|Facebot/i },
  { name: 'LinkedIn Bot', regex: /LinkedInBot/i },
  { name: 'iMessage Link Preview', regex: /Applebot/i },
];

const SEARCH_AND_CRAWLER_BOTS = [
  { name: 'Googlebot', regex: /Googlebot|Google-InspectionTool|Mediapartners-Google/i },
  { name: 'Bingbot', regex: /bingbot|BingPreview/i },
  { name: 'YandexBot', regex: /YandexBot/i },
  { name: 'DuckDuckGo Bot', regex: /DuckDuckBot/i },
  { name: 'Baiduspider', regex: /Baiduspider/i },
  { name: 'AhrefsBot', regex: /AhrefsBot/i },
  { name: 'SemrushBot', regex: /SemrushBot/i },
  { name: 'DotBot', regex: /DotBot/i },
];

const HEADLESS_AND_SCRAPERS = [
  { name: 'Headless Chrome / Puppeteer', regex: /HeadlessChrome|puppeteer/i },
  { name: 'Playwright', regex: /Playwright/i },
  { name: 'Selenium / WebDriver', regex: /Selenium|WebDriver/i },
  { name: 'Python Requests / Urllib', regex: /python-requests|aiohttp|urllib/i },
  { name: 'cURL / Wget', regex: /curl\/|Wget\//i },
  { name: 'Go-http-client', regex: /Go-http-client/i },
];

export function detectBot(userAgent: string): BotDetectionResult {
  if (!userAgent || userAgent.trim() === '') {
    return {
      isBot: true,
      isPreview: false,
      botName: 'Empty User-Agent (Suspicious)',
      category: 'headless',
      confidence: 95,
    };
  }

  // Check 1: Preview bots (Social share cards: WhatsApp, Slack, Twitter, Telegram)
  for (const bot of PREVIEW_BOT_PATTERNS) {
    if (bot.regex.test(userAgent)) {
      return {
        isBot: true,
        isPreview: true,
        botName: bot.name,
        category: 'preview_bot',
        confidence: 99,
      };
    }
  }

  // Check 2: Search engines & web crawlers
  for (const bot of SEARCH_AND_CRAWLER_BOTS) {
    if (bot.regex.test(userAgent)) {
      return {
        isBot: true,
        isPreview: false,
        botName: bot.name,
        category: 'crawler_bot',
        confidence: 98,
      };
    }
  }

  // Check 3: Headless browsers & automated scraping libraries
  for (const bot of HEADLESS_AND_SCRAPERS) {
    if (bot.regex.test(userAgent)) {
      return {
        isBot: true,
        isPreview: false,
        botName: bot.name,
        category: 'headless',
        confidence: 99,
      };
    }
  }

  // Default: Human Visitor
  return {
    isBot: false,
    isPreview: false,
    category: 'human',
    confidence: 95,
  };
}

export function parseDevice(userAgent: string): {
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
} {
  const ua = userAgent || '';

  // Device determination
  let device: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(ua)) {
    device = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    device = 'mobile';
  }

  // Browser determination
  let browser = 'Chrome';
  if (/Firefox\/[0-9.]+/i.test(ua)) browser = 'Firefox';
  else if (/Edg\/[0-9.]+/i.test(ua)) browser = 'Edge';
  else if (/Safari\/[0-9.]+/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/OPR\/[0-9.]+/i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
  else if (/WhatsApp/i.test(ua)) browser = 'WhatsApp In-App';
  else if (/Slackbot/i.test(ua)) browser = 'Slackbot Preview';

  // OS determination
  let os = 'Windows';
  if (/Windows NT/i.test(ua)) os = 'Windows 11';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android 14';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}
