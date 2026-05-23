'use client';

import React, { useState, useRef } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmissionModal({ isOpen, onClose, onSuccess }: SubmissionModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Visual & Design');
  const [email, setEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Cloudinary Direct Unsigned Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate is image
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploading(true);
    setError(null);

    const isBypass = process.env.NEXT_PUBLIC_MOCK_BYPASS === 'true';

    if (isBypass) {
      // Simulate real premium upload delay with beautiful visual response
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

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ditb2aeea'; // fallback to standard user cloud if not in env
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

  // Handles developer bypass submission (when PayPal client id is not configured)
  const handleBypassSubmit = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, description, category, email, image_url: imageUrl }),
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
  };

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

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
              <h3 className="font-headline-lg text-headline-lg text-on-surface">Payment Successful!</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                Thank you! Your tool <strong>{title}</strong> has been successfully submitted and is now in <strong>pending</strong> approval status.
              </p>
              <p className="font-body-sm text-body-sm text-primary">
                Redirecting back to homepage...
              </p>
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
                    <option>Visual & Design</option>
                    <option>Copywriting & Marketing</option>
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
                <label className="font-label-sm text-label-sm text-on-surface-variant">Thumbnail Image (16:9 Recommended)</label>
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
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="font-label-sm text-label-sm text-primary animate-pulse">Uploading to Cloudinary...</p>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[36px] text-outline group-hover:text-primary transition-colors mb-xs">cloud_upload</span>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Drag and drop or <span className="text-primary font-semibold">click to upload</span></p>
                      </>
                    )}
                  </div>
                )}
                {!imageUrl && (
                  <div className="mt-xs text-center">
                    <span className="text-on-surface-variant font-body-sm text-[12px]">또는 </span>
                    <button
                      type="button"
                      onClick={() => {
                        const mockUrls = [
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
                          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
                          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80'
                        ];
                        const randomUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
                        setImageUrl(randomUrl);
                        setError(null);
                      }}
                      className="text-primary font-semibold hover:underline font-body-sm text-[12px] inline-flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">image</span>
                      테스트용 고화질 데모 이미지 자동 선택하기
                    </button>
                  </div>
                )}
              </div>

              {/* Price and Checkout */}
              <div className="pt-md border-t border-outline-variant mt-lg">
                <div className="flex justify-between items-center mb-md">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Listing Fee</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">One-time payment for lifetime listing.</p>
                  </div>
                  <span className="font-headline-md text-headline-md text-primary">$9.99</span>
                </div>

                {!isFormValid ? (
                  <div className="w-full py-md px-md bg-surface-container rounded-lg border border-outline-variant flex flex-col items-center justify-center gap-xs">
                    <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
                      Please fill out all fields above and upload a thumbnail to unlock payment options.
                    </p>
                  </div>
                ) : (
                  <div className="w-full space-y-sm">
                    {/* Render standard PayPal script provider if a client ID exists */}
                    {paypalClientId ? (
                      <PayPalScriptProvider 
                        options={{ 
                          clientId: paypalClientId,
                          components: 'buttons',
                          currency: 'USD'
                        }}
                      >
                        <PayPalButtons 
                          style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
                          disabled={submitting}
                          createOrder={async () => {
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
                                  image_url: imageUrl
                                })
                              });
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error || 'PayPal order creation failing.');
                              return data.id; // Returns order.id to PayPal Buttons SDK
                            } catch (err: any) {
                              setError(err.message || 'PayPal payment setup failed.');
                              throw err;
                            }
                          }}
                          onApprove={async (data, actions) => {
                            // PayPal popup closes, payment captures
                            setSubmitting(true);
                            try {
                              if (actions.order) {
                                const details = await actions.order.capture();
                                console.log('PayPal Captured transaction details:', details);
                                setSubmitSuccess(true);
                                setTimeout(() => {
                                  onSuccess();
                                  onClose();
                                  resetForm();
                                }, 3000);
                              } else {
                                throw new Error('Action context unavailable.');
                              }
                            } catch (err: any) {
                              console.error(err);
                              setError('Payment capture succeeded, but state update failed. Our administrators will review the payment.');
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                          onError={(err) => {
                            console.error('PayPal button error:', err);
                            setError('PayPal payment encountered an error.');
                          }}
                        />
                      </PayPalScriptProvider>
                    ) : (
                      /* Developer Bypass Mode: Shows when PAYPAL_CLIENT_ID is not configured */
                      <div className="bg-primary/5 p-md rounded-lg border border-primary/20 flex flex-col items-center justify-center space-y-xs">
                        <span className="font-label-sm text-label-sm text-primary font-bold">Dev Sandbox Bypass Mode</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant text-center max-w-sm">
                          Real PayPal Credentials not configured in .env. Click below to submit this tool directly into standard `pending` approval status.
                        </p>
                        <button 
                          type="button"
                          onClick={handleBypassSubmit}
                          disabled={submitting}
                          className="bg-primary text-white w-full py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs hover:brightness-110 active:scale-95 transition-all"
                        >
                          {submitting ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <>
                              Submit & Pay ($9.99 Sandbox Demo)
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
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
