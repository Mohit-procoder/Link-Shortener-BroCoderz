'use client';

import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { checkSafety, validateAlias } from '@/lib/safety';
import QRCode from 'qrcode';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Calendar,
  Flame,
  Smartphone,
  QrCode as QrIcon,
  Download,
  Copy,
  Check,
  Tag,
  FolderPlus
} from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams?: {
    title?: string;
    destinationUrl?: string;
    customAlias?: string;
    tags?: string[];
  };
  onLinkCreated?: (linkId: string) => void;
}

export function CreateLinkModal({
  isOpen,
  onClose,
  initialParams,
  onLinkCreated,
}: CreateLinkModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Form fields
  const [destinationUrl, setDestinationUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['marketing']);

  // Step 2 Rules
  const [mobileDestinationUrl, setMobileDestinationUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [clickCap, setClickCap] = useState<string>('');
  const [password, setPassword] = useState('');

  // Live checks
  const [aliasStatus, setAliasStatus] = useState<{
    valid: boolean;
    reason?: string;
    suggestions?: string[];
  }>({ valid: true });

  const [urlSafety, setUrlSafety] = useState<{
    safe: boolean;
    reason?: string;
  }>({ safe: true });

  // QR preview
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialParams) {
      if (initialParams.title) setTitle(initialParams.title);
      if (initialParams.destinationUrl) setDestinationUrl(initialParams.destinationUrl);
      if (initialParams.customAlias) setCustomAlias(initialParams.customAlias);
      if (initialParams.tags) setTags(initialParams.tags);
    }
  }, [initialParams]);

  // Live URL validation
  useEffect(() => {
    if (destinationUrl.trim()) {
      const res = checkSafety(destinationUrl);
      setUrlSafety({ safe: res.safe, reason: res.flaggedReason });
    } else {
      setUrlSafety({ safe: true });
    }
  }, [destinationUrl]);

  // Live Alias validation
  useEffect(() => {
    if (customAlias.trim()) {
      const existing = store.getState().links.map(l => l.alias);
      const res = validateAlias(customAlias, existing);
      setAliasStatus(res);
    } else {
      setAliasStatus({ valid: true });
    }
  }, [customAlias]);

  // Generate QR code preview
  useEffect(() => {
    const code = customAlias.trim() || 'preview-short';
    const fakeUrl = `https://lnkp.ls/${code}`;
    QRCode.toDataURL(fakeUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#4f46e5',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [customAlias]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter(tag => tag !== t));
  };

  const handleNext = () => {
    if (!destinationUrl.trim()) return;
    if (!urlSafety.safe) return;
    if (!aliasStatus.valid) return;
    setStep(2);
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    let parsedExpiry: string | undefined = undefined;
    if (expiresAt) {
      const d = new Date(expiresAt);
      if (!isNaN(d.getTime())) {
        parsedExpiry = d.toISOString();
      }
    }

    try {
      const res = store.createLink({
        title: title || 'Untitled Campaign Link',
        destinationUrl,
        customAlias: customAlias.trim() || undefined,
        mobileDestinationUrl: mobileDestinationUrl.trim() || undefined,
        expiresAt: parsedExpiry,
        clickCap: clickCap && !isNaN(parseInt(clickCap)) ? parseInt(clickCap) : undefined,
        password: password.trim() || undefined,
        campaignId: campaignId || undefined,
        tags,
      });

      if (res.success && res.link) {
        const newId = res.link.id;
        setStep(1);
        setDestinationUrl('');
        setTitle('');
        setCustomAlias('');
        setMobileDestinationUrl('');
        setExpiresAt('');
        setClickCap('');
        setPassword('');
        setSubmitError(null);
        onClose();
        if (onLinkCreated) onLinkCreated(newId);
      } else {
        setSubmitError(res.error || 'Failed to deploy link. Please check parameters.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred while deploying the link.');
    }
  };

  const campaigns = store.getState().campaigns;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c101d] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden font-sans">
        
        {/* Header with Step Indicator */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-950/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold text-sm">
              {step}/2
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {step === 1 ? 'Step 1: Link & Core Details' : 'Step 2: 7-Step Rules & QR Studio'}
              </h2>
              <p className="text-xs text-gray-400">
                {step === 1 ? 'Set destination, title, custom alias, and UTM attribution' : 'Configure expiry, click cap limits, password gate, and mobile route'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 1 ? (
            <>
              {/* Destination URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Destination URL <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://shop.example.com/sale/festive-2026?utm_source=insta..."
                    className="w-full px-4 py-2.5 bg-black/60 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all"
                  />
                  {destinationUrl && (
                    <div className="absolute right-3 top-2.5">
                      {urlSafety.safe ? (
                        <span title="Safety Shield: 5-hop scan clean">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </span>
                      ) : (
                        <span title="Safety Shield: Flagged threat">
                          <ShieldAlert className="w-5 h-5 text-rose-500 animate-bounce" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {!urlSafety.safe && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" /> {urlSafety.reason}
                  </p>
                )}
              </div>

              {/* Title & Custom Alias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Link Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Festive Sale 2026 Deal"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white placeholder-gray-500 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex justify-between">
                    <span>Custom Alias (lnkp.ls/)</span>
                    <span className="text-[10px] text-gray-400 font-mono">Case-insensitive</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      placeholder="e.g. festive26"
                      className={`w-full px-3.5 py-2.5 bg-black/60 border rounded-xl text-white placeholder-gray-500 text-sm outline-none font-mono ${
                        !aliasStatus.valid ? 'border-rose-500 focus:border-rose-500' : 'border-gray-700 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {!aliasStatus.valid && (
                    <div className="mt-1.5 space-y-1">
                      <p className="text-xs text-rose-400">{aliasStatus.reason}</p>
                      {aliasStatus.suggestions && aliasStatus.suggestions.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[11px] text-gray-400">Suggestions:</span>
                          {aliasStatus.suggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => setCustomAlias(sug)}
                              className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700 text-indigo-300 hover:bg-indigo-900 transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Campaign Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Assign to Campaign
                  </label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-gray-700 focus:border-indigo-500 rounded-xl text-white text-sm outline-none"
                  >
                    <option value="">No Campaign (Standalone)</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Tags (Press Enter to add)
                  </label>
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700"
                      >
                        <Tag className="w-2.5 h-2.5 text-indigo-400" />
                        {t}
                        <button type="button" onClick={() => removeTag(t)} className="hover:text-rose-400">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag and hit Enter..."
                    className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 focus:border-indigo-500 rounded-xl text-white placeholder-gray-500 text-xs outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Advanced 7-Step Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Rule inputs */}
                <div className="space-y-4">
                  {/* Rule 7: Mobile Routing */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Step 7 · Mobile Alternate URL</span>
                    </label>
                    <input
                      type="url"
                      value={mobileDestinationUrl}
                      onChange={(e) => setMobileDestinationUrl(e.target.value)}
                      placeholder="e.g. https://shop.example.com/app/open-deal"
                      className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 focus:border-indigo-500 rounded-xl text-white text-xs outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Visitors on iOS/Android will route here instead of default URL.
                    </p>
                  </div>

                  {/* Rule 5: Click Cap */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Step 5 · Atomic Click Cap</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={clickCap}
                      onChange={(e) => setClickCap(e.target.value)}
                      placeholder="e.g. 500 (Leave empty for unlimited)"
                      className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 focus:border-indigo-500 rounded-xl text-white text-xs outline-none font-mono"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Atomic Redis INCR: click #501 will be safely rejected at edge.
                    </p>
                  </div>

                  {/* Rule 4: Expiration */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Step 4 · Expiry Date &amp; Time</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 focus:border-indigo-500 rounded-xl text-white text-xs outline-none"
                    />
                  </div>

                  {/* Rule 6: Password Protection */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Step 6 · Password Gate (Argon2)</span>
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. brocoderz2026 (Optional)"
                      className="w-full px-3.5 py-2 bg-black/60 border border-gray-700 focus:border-indigo-500 rounded-xl text-white text-xs outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Right Column: Live QR Code Studio */}
                <div className="bg-black/40 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-3">
                    <QrIcon className="w-4 h-4 text-indigo-400" />
                    <span>Live QR Code Preview</span>
                  </div>

                  {qrDataUrl ? (
                    <div className="p-3 bg-white rounded-2xl shadow-xl shadow-indigo-950/40 mb-3">
                      <img src={qrDataUrl} alt="QR Code" className="w-36 h-36" />
                    </div>
                  ) : (
                    <div className="w-36 h-36 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-3">
                      <span className="text-xs text-gray-500">Generating...</span>
                    </div>
                  )}

                  <span className="text-xs font-mono text-indigo-300 mb-2">
                    lnkp.ls/{customAlias.trim() || 'auto-code'}
                  </span>

                  <p className="text-[11px] text-gray-400 max-w-xs">
                    Optimized for mobile camera scans. PNG &amp; vector SVG ready.
                  </p>
                </div>

              </div>
            </>
          )}

          {submitError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>{submitError}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800/80">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-medium text-gray-300 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 1</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!destinationUrl.trim() || !urlSafety.safe || !aliasStatus.valid}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:opacity-90 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Deploy Link &amp; Activate Signal</span>
                </button>
              )}
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
