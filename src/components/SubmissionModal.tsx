'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

type Tier = 'standard' | 'featured' | 'premium';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTier?: Tier;
}

const TIER_PRICES: Record<Tier, string> = {
  standard: '9.99',
  featured: '49.00',
  premium: '199.00',
};

const TIER_LABELS: Record<Tier, string> = {
  standard: 'Standard Listing',
  featured: 'Featured Placement',
  premium: 'Premium Launch',
};

const TIER_DESCRIPTIONS: Record<Tier, string> = {
  standard: 'Permanent directory listing.',
  featured: 'Pinned to top for 30 days.',
  premium: 'Newsletter + Social + 1-Month Featured.',
};

export default function SubmissionModal({ isOpen, onClose, onSuccess, defaultTier }: SubmissionModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Visual & Design');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tier, setTier] = useState<Tier>('standard');

  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const isPaypalEnabled = process.env.NEXT_PUBLIC_PAYPAL_ENABLED === 'true';

  // Sync defaultTier when modal opens
  useEffect(() => {
    if (isOpen && defaultTier) {
      setTier(defaultTier);
    } else if (isOpen) {
      setTier('standard');
    }
  }, [isOpen, defaultTier]);

  if (!isOpen) return null;

  // Cloudinary Direct Unsigned Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploading(true);
    setError(null);

    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';

    if (isBypass) {
      setTimeout(() => {
        const mockUrls = [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80'
        ];
        const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
        setImageUrl(randomUrl);
        setUploading(false);
      }, 800);
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ditb2aeea';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to upload image to Cloudinary.');
      }

      setImageUrl(data.secure_url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Image upload failed. Check Cloudinary settings.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const isFormValid = title && url && description && category && email && imageUrl;

  // Free-mode bypass submit (no PayPal)
  const handleBypassSubmit = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, description, category, email, image_url: imageUrl, tier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit.');

      setSubmitSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setCategory('Visual & Design');
    setEmail('');
    setImageUrl('');
    setError(null);
    setSubmitSuccess(false);
    setTier('standard');
  };

  // Whether user selected a paid tier in paid mode
  const isPaidTier = isPaypalEnabled && tier !== 'standard';
  const isStandardFreeMode = !isPaypalEnabled && tier === 'standard';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-md">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (!submitting) {
            onClose();
            resetForm();
          }
        }}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-surface-container-lowest w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 z-10 max-h-[90vh] flex flex-col">
        <div className="p-md md:p-lg flex justify-between items-center border-b border-outline-variant shrink-0">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Submit Your Tool</h2>
          <button
            className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            onClick={() => {
              onClose();
              resetForm();
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-md md:p-lg overflow-y-auto custom-scrollbar flex-1">
          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-xl text-center space-y-md">
              <span className="material-symbols-outlined text-[64px] text-green-500 animate-bounce">check_circle</span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                {isPaypalEnabled ? 'Payment Successful!' : 'Submission Received!'}
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Thank you! Your tool <strong>{title}</strong> has been submitted and is now{' '}
                <strong>pending approval</strong>.
              </p>
              <p className="font-body-sm text-body-sm text-primary">Redirecting back to homepage...</p>
            </div>
          ) : (
            <form className="space-y-md" onSubmit={(e) => e.preventDefault()}>
              {error && (
                <div className="bg-error-container text-on-error-container p-sm rounded-lg font-body-sm flex items-center gap-xs">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Tool Name</label>
                  <input
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="e.g. ShopGen AI"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Website URL</label>
                  <input
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="https://example.com"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">One-line Pitch</label>
                <input
                  className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Explain your tool in 10 words or less"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Category</label>
                  <select
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Visual &amp; Design</option>
                    <option>Copywriting &amp; Marketing</option>
                    <option>Store Optimization</option>
                    <option>Automation</option>
                  </select>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Creator Email</label>
                  <input
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Media Upload Area */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">
                  Thumbnail Image (16:9 Recommended)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />

                {imageUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low group">
                    <img src={imageUrl} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="bg-error text-white px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-lg"
                      >
                        <span className="material-symbols-outlined">delete</span>
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-lg flex flex-col items-center justify-center bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all group select-none ${
                      isDragOver ? 'border-primary bg-surface-container-high' : 'border-outline-variant'
                    }`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-xs py-sm">
                        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p className="font-label-sm text-label-sm text-primary animate-pulse">Uploading to Cloudinary...</p>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[36px] text-outline group-hover:text-primary transition-colors mb-xs">
                          cloud_upload
                        </span>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          Drag and drop or <span className="text-primary font-semibold">click to upload</span>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ── Plan Selection ── */}
              <div className="pt-md border-t border-outline-variant mt-lg space-y-sm">
                <p className="font-headline-md text-headline-md text-on-surface">Select Plan</p>

                <div className="flex flex-col gap-sm">
                  {/* ── Standard ── */}
                  {isPaypalEnabled ? (
                    /* PAID MODE — Standard $9.99 */
                    <div
                      id="plan-standard"
                      onClick={() => setTier('standard')}
                      className={`relative flex items-center justify-between p-md border rounded-xl cursor-pointer transition-all ${
                        tier === 'standard'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center gap-sm">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            tier === 'standard' ? 'border-primary' : 'border-outline-variant'
                          }`}
                        >
                          {tier === 'standard' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface text-[15px]">{TIER_LABELS.standard}</p>
                          <p className="font-body-sm text-on-surface-variant">{TIER_DESCRIPTIONS.standard}</p>
                        </div>
                      </div>
                      <span className="font-label-lg text-primary text-[16px]">${TIER_PRICES.standard}</span>
                    </div>
                  ) : (
                    /* FREE MODE — Standard is Free */
                    <div
                      id="plan-standard-free"
                      onClick={() => setTier('standard')}
                      className={`relative flex items-center justify-between p-md border rounded-xl cursor-pointer transition-all ${
                        tier === 'standard'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center gap-sm">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            tier === 'standard' ? 'border-primary' : 'border-outline-variant'
                          }`}
                        >
                          {tier === 'standard' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface text-[15px]">{TIER_LABELS.standard}</p>
                          <p className="font-body-sm text-on-surface-variant">{TIER_DESCRIPTIONS.standard}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-xs">
                        <span className="font-label-lg text-primary text-[16px]">Free</span>
                        <span className="text-[11px] text-on-surface-variant line-through">${TIER_PRICES.standard}</span>
                      </div>
                    </div>
                  )}

                  {/* ── Featured ── */}
                  {isPaypalEnabled ? (
                    /* PAID MODE — Featured $49 */
                    <div
                      id="plan-featured"
                      onClick={() => setTier('featured')}
                      className={`relative flex items-center justify-between p-md border rounded-xl cursor-pointer transition-all ${
                        tier === 'featured'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center gap-sm">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            tier === 'featured' ? 'border-primary' : 'border-outline-variant'
                          }`}
                        >
                          {tier === 'featured' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-xs">
                            <p className="font-label-md text-on-surface text-[15px]">{TIER_LABELS.featured}</p>
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Most Popular
                            </span>
                          </div>
                          <p className="font-body-sm text-on-surface-variant">{TIER_DESCRIPTIONS.featured}</p>
                        </div>
                      </div>
                      <span className="font-label-lg text-primary text-[16px]">${TIER_PRICES.featured}</span>
                    </div>
                  ) : (
                    /* FREE MODE — Featured Coming Soon */
                    <div
                      id="plan-featured-soon"
                      className="relative flex items-center justify-between p-md border border-outline-variant rounded-xl opacity-55 cursor-not-allowed bg-surface-container-lowest select-none"
                    >
                      <div className="flex items-center gap-sm">
                        <div className="w-5 h-5 rounded-full border border-outline-variant flex items-center justify-center" />
                        <div>
                          <div className="flex items-center gap-xs">
                            <p className="font-label-md text-on-surface text-[15px]">{TIER_LABELS.featured}</p>
                            <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Coming Soon
                            </span>
                          </div>
                          <p className="font-body-sm text-on-surface-variant">{TIER_DESCRIPTIONS.featured}</p>
                        </div>
                      </div>
                      <span className="font-label-lg text-on-surface-variant text-[16px] line-through">
                        ${TIER_PRICES.featured}
                      </span>
                    </div>
                  )}

                  {/* ── Premium Launch ── */}
                  {isPaypalEnabled ? (
                    /* PAID MODE — Premium $199 */
                    <div
                      id="plan-premium"
                      onClick={() => setTier('premium')}
                      className={`relative flex items-center justify-between p-md border rounded-xl cursor-pointer transition-all ${
                        tier === 'premium'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center gap-sm">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            tier === 'premium' ? 'border-primary' : 'border-outline-variant'
                          }`}
                        >
                          {tier === 'premium' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface text-[15px]">{TIER_LABELS.premium}</p>
                          <p className="font-body-sm text-on-surface-variant">{TIER_DESCRIPTIONS.premium}</p>
                        </div>
                      </div>
                      <span className="font-label-lg text-primary text-[16px]">${TIER_PRICES.premium}</span>
                    </div>
                  ) : (
                    /* FREE MODE — Premium Coming Soon */
                    <div
                      id="plan-premium-soon"
                      className="relative flex items-center justify-between p-md border border-outline-variant rounded-xl opacity-55 cursor-not-allowed bg-surface-container-lowest select-none"
                    >
                      <div className="flex items-center gap-sm">
                        <div className="w-5 h-5 rounded-full border border-outline-variant flex items-center justify-center" />
                        <div>
                          <div className="flex items-center gap-xs">
                            <p className="font-label-md text-on-surface text-[15px]">{TIER_LABELS.premium}</p>
                            <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Coming Soon
                            </span>
                          </div>
                          <p className="font-body-sm text-on-surface-variant">{TIER_DESCRIPTIONS.premium}</p>
                        </div>
                      </div>
                      <span className="font-label-lg text-on-surface-variant text-[16px] line-through">
                        ${TIER_PRICES.premium}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Checkout Button Area ── */}
              <div className="pt-sm mt-sm">
                {!isFormValid ? (
                  <div className="w-full py-md px-md bg-surface-container rounded-lg border border-outline-variant flex flex-col items-center justify-center gap-xs">
                    <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                      Please fill out all fields above to submit your tool.
                    </p>
                  </div>
                ) : isPaidTier ? (
                  /* ── PAID MODE: Real PayPal Buttons ── */
                  <div className="relative z-10 space-y-sm">
                    <p className="text-center font-label-sm text-on-surface-variant text-[13px]">
                      You will be charged{' '}
                      <strong className="text-primary">${TIER_PRICES[tier]}</strong>{' '}
                      {tier === 'featured' ? '/month' : 'one-time'} via PayPal.
                    </p>
                    <PayPalScriptProvider options={{ clientId: paypalClientId || 'sb', currency: 'USD', locale: 'en_US' }}>
                      <PayPalButtons
                        style={{ layout: 'horizontal', color: 'blue', shape: 'rect', label: 'pay' }}
                        disabled={submitting}
                        createOrder={async () => {
                          setSubmitting(true);
                          setError(null);
                          try {
                            const res = await fetch('/api/paypal/create-order', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title,
                                url,
                                description,
                                category,
                                email,
                                image_url: imageUrl,
                                tier,
                              }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order.');
                            return data.id;
                          } catch (err: any) {
                            setError(err.message || 'PayPal order initialization failed.');
                            setSubmitting(false);
                            throw err;
                          }
                        }}
                        onApprove={async (_data, actions) => {
                          try {
                            if (actions.order) {
                              const capture = await actions.order.capture();
                              console.log('PayPal Capture succeeded:', capture);
                              setSubmitSuccess(true);
                              setTimeout(() => {
                                onSuccess();
                                onClose();
                                resetForm();
                              }, 3000);
                            }
                          } catch (err: any) {
                            console.error('PayPal capture exception:', err);
                            setError('Payment captured but database sync failed. Please contact support.');
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        onError={(err) => {
                          console.error('PayPal checkout error:', err);
                          setError('PayPal checkout encountered an error. Please try again.');
                          setSubmitting(false);
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                ) : isStandardFreeMode || (!isPaypalEnabled && tier === 'standard') ? (
                  /* ── FREE MODE: Bypass Submit Button ── */
                  <button
                    type="button"
                    id="submit-free-btn"
                    onClick={handleBypassSubmit}
                    disabled={submitting}
                    className="bg-primary text-white w-full py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    {submitting ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : (
                      <>
                        Submit Your Tool for Free
                        <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                      </>
                    )}
                  </button>
                ) : (
                  /* ── PAID MODE: Standard PayPal Buttons ── */
                  <div className="relative z-10 space-y-sm">
                    <p className="text-center font-label-sm text-on-surface-variant text-[13px]">
                      You will be charged{' '}
                      <strong className="text-primary">${TIER_PRICES[tier]}</strong> one-time via PayPal.
                    </p>
                    <PayPalScriptProvider options={{ clientId: paypalClientId || 'sb', currency: 'USD', locale: 'en_US' }}>
                      <PayPalButtons
                        style={{ layout: 'horizontal', color: 'blue', shape: 'rect', label: 'pay' }}
                        disabled={submitting}
                        createOrder={async () => {
                          setSubmitting(true);
                          setError(null);
                          try {
                            const res = await fetch('/api/paypal/create-order', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title,
                                url,
                                description,
                                category,
                                email,
                                image_url: imageUrl,
                                tier,
                              }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'Failed to create PayPal order.');
                            return data.id;
                          } catch (err: any) {
                            setError(err.message || 'PayPal order initialization failed.');
                            setSubmitting(false);
                            throw err;
                          }
                        }}
                        onApprove={async (_data, actions) => {
                          try {
                            if (actions.order) {
                              await actions.order.capture();
                              setSubmitSuccess(true);
                              setTimeout(() => {
                                onSuccess();
                                onClose();
                                resetForm();
                              }, 3000);
                            }
                          } catch (err: any) {
                            setError('Payment captured but sync failed. Contact support.');
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        onError={(err) => {
                          console.error('PayPal checkout error:', err);
                          setError('PayPal checkout encountered an error. Please try again.');
                          setSubmitting(false);
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
