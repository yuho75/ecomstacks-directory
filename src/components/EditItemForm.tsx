'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getOptimizedCloudinaryUrl } from '@/lib/utils';

interface EditItemFormProps {
  item: {
    id: string;
    title: string;
    url: string;
    description: string;
    image_url: string;
    category: string;
    email: string;
    tier?: string;
    paypal_subscription_id?: string;
    subscription_status?: string;
  };
  token: string;
}

export default function EditItemForm({ item, token }: EditItemFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [url, setUrl] = useState(item.url);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState(item.category || 'Visual & Design');
  const [imageUrl, setImageUrl] = useState(item.image_url);

  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [cancelling, setCancelling] = useState(false);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your Featured subscription? Your tool will return to standard listing when the period expires.")) {
      return;
    }
    
    setCancelling(true);
    setError(null);
    
    try {
      const res = await fetch('/api/paypal/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          token
        })
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel subscription.');
      }
      
      alert('Your subscription has been successfully cancelled. It will not renew next month.');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to request cancellation.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (deleteConfirmText !== item.title) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/items/${item.id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete tool listing.');
      }

      setDeleteSuccess(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete listing.');
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    } finally {
      setDeleting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary Direct Unsigned Upload (same as SubmissionModal)
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
      setError(err.message || 'Image upload failed.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !description || !category || !imageUrl) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/items/${item.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          title,
          url,
          description,
          category,
          image_url: imageUrl
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update tool details.');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push(`/items/${item.id}`);
        router.refresh();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-md md:p-lg">
      {submitSuccess ? (
        <div className="flex flex-col items-center justify-center py-xl text-center space-y-md">
          <span className="material-symbols-outlined text-[64px] text-green-500 animate-bounce">check_circle</span>
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Listing Updated!</h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
            Your tool <strong>{title}</strong> details have been successfully updated.
          </p>
          <p className="font-body-sm text-body-sm text-primary">
            Redirecting back to detail page...
          </p>
        </div>
      ) : (
        <form className="space-y-md" onSubmit={handleSubmit}>
          <div className="border-b border-outline-variant pb-xs mb-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface">Edit Listing Information</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Registered Owner: <span className="font-semibold">{item.email}</span> (Read-only)
            </p>
          </div>

          {/* Subscription Status Block */}
          {item.tier === 'featured' && (
            <div className="bg-surface-container rounded-xl p-md border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-md mb-md">
              <div>
                <p className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">workspace_premium</span>
                  Plan: <span className="font-extrabold text-primary">Featured Placement ($49/mo)</span>
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Status: {' '}
                  <span className={`font-semibold capitalize ${
                    item.subscription_status === 'active' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {item.subscription_status || 'active'}
                  </span>
                  {item.subscription_status === 'cancelled' && ' (Expiring at end of period)'}
                </p>
              </div>

              {item.subscription_status === 'active' && item.paypal_subscription_id && (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="border border-outline-variant hover:bg-neutral-100 font-label-md text-label-md px-md py-sm rounded-lg flex items-center gap-xs disabled:opacity-50 transition-all bg-white"
                >
                  {cancelling ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      Cancel Subscription
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="bg-error-container text-on-error-container p-sm rounded-lg font-body-sm flex items-center gap-xs animate-shake">
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
                disabled={submitting}
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
                disabled={submitting}
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
              disabled={submitting}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant">Category</label>
            <select 
              className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
            >
              <option>Visual & Design</option>
              <option>Copywriting & Marketing</option>
              <option>Store Optimization</option>
              <option>Automation</option>
            </select>
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
              disabled={submitting}
            />

            {imageUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-outline-variant bg-surface-container-low group">
                <img src={getOptimizedCloudinaryUrl(imageUrl)} alt="Uploaded thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="bg-error text-white px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:brightness-110 active:scale-95 transition-all shadow-lg"
                    disabled={submitting}
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
                onClick={() => !submitting && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-lg flex flex-col items-center justify-center bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all group select-none ${
                  isDragOver ? 'border-primary bg-primary/10' : 'border-outline-variant'
                } ${submitting ? 'pointer-events-none opacity-50' : ''}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-xs">
                    <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="font-label-md text-label-md text-primary animate-pulse">Uploading file...</span>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[36px] text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span>
                    <span className="font-label-md text-label-md text-on-surface mt-xs">Drag & drop image here or click to browse</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-2">Supports PNG, JPG, WEBP (Max 5MB)</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-sm justify-end pt-md border-t border-outline-variant">
            <button 
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="mr-auto border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all px-lg py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs"
              disabled={submitting}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Listing
            </button>
            <button 
              type="button"
              onClick={() => router.push(`/items/${item.id}`)}
              className="border border-outline-variant px-lg py-md rounded-lg font-label-md text-label-md hover:bg-neutral-100 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all px-lg py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs"
              disabled={submitting || uploading || !title || !url || !description || !imageUrl}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-base animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-w-md w-full p-lg space-y-md animate-scale-up">
            {deleteSuccess ? (
              <div className="text-center py-md space-y-sm">
                <span className="material-symbols-outlined text-[64px] text-red-500 animate-bounce">delete_forever</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Listing Deleted</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  <strong>{item.title}</strong> has been successfully deleted from EcomStacks directory.
                </p>
                <p className="font-body-sm text-body-sm text-primary">
                  Redirecting to homepage...
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-xs text-red-600">
                  <span className="material-symbols-outlined text-[32px]">warning</span>
                  <div className="space-y-xs">
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Delete Tool Listing?</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      This will immediately remove <strong>{item.title}</strong> from the EcomStacks public directory.
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50 text-red-800 p-sm rounded-lg font-body-sm border border-red-100">
                  To confirm permanent deletion, please type the name of your tool exactly:
                  <div className="font-bold text-center mt-2 select-text cursor-pointer">{item.title}</div>
                </div>

                <div className="flex flex-col gap-xs">
                  <input 
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type the tool name here"
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-center font-semibold bg-white"
                    disabled={deleting}
                  />
                </div>

                <div className="flex gap-sm pt-sm border-t border-outline-variant">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="flex-1 border border-outline-variant py-md rounded-lg font-label-md text-label-md hover:bg-neutral-100 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleDeleteSubmit}
                    className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all py-md rounded-lg font-label-md text-label-md text-white flex items-center justify-center gap-xs font-semibold"
                    disabled={deleting || deleteConfirmText !== item.title}
                  >
                    {deleting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                        Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
