'use client';

import React, { useState } from 'react';
import { updateItemAdmin } from '@/app/actions';
import { getHybridDetails } from '@/lib/utils';

interface Item {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string;
  category: string;
  email: string;
  status: string;
  created_at: string;
  tier?: string;

  detailed_overview?: string;
  key_features?: string[];
  key_features_descriptions?: string[];
  rating?: number;
  rating_count?: number;
  customer_review?: string;
  customer_review_author?: string;
  customer_review_2?: string;
  customer_review_2_author?: string;
  integration_guide_1_label?: string;
  integration_guide_1_url?: string;
  integration_guide_2_label?: string;
  integration_guide_2_url?: string;
}

interface AdminEditModalProps {
  item: Item;
  secretKey: string | null;
  onClose: () => void;
  onSave: (updatedItem: Item) => void;
}

type Tab = 'core' | 'details' | 'features' | 'reviews';

export default function AdminEditModal({ item, secretKey, onClose, onSave }: AdminEditModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('core');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState(item.title || '');
  const [url, setUrl] = useState(item.url || '');
  const [description, setDescription] = useState(item.description || '');
  const [category, setCategory] = useState(item.category || 'Visual & Design');
  const [imageUrl, setImageUrl] = useState(item.image_url || '');
  const [email, setEmail] = useState(item.email || '');

  const [detailedOverview, setDetailedOverview] = useState(() => {
    const raw = item.detailed_overview || '';
    if (raw.trim().startsWith('{')) {
      try {
        return JSON.parse(raw).overview || '';
      } catch (e) {
        return raw;
      }
    }
    return raw;
  });

  const [hybridTitle1, setHybridTitle1] = useState(() => {
    const raw = item.detailed_overview || '';
    if (raw.trim().startsWith('{')) {
      try {
        return JSON.parse(raw).title1 || '';
      } catch (e) {}
    }
    return getHybridDetails(item.category, item.title).title1;
  });

  const [hybridDesc1, setHybridDesc1] = useState(() => {
    const raw = item.detailed_overview || '';
    if (raw.trim().startsWith('{')) {
      try {
        return JSON.parse(raw).desc1 || '';
      } catch (e) {}
    }
    return getHybridDetails(item.category, item.title).desc1;
  });

  const [hybridTitle2, setHybridTitle2] = useState(() => {
    const raw = item.detailed_overview || '';
    if (raw.trim().startsWith('{')) {
      try {
        return JSON.parse(raw).title2 || '';
      } catch (e) {}
    }
    return getHybridDetails(item.category, item.title).title2;
  });

  const [hybridDesc2, setHybridDesc2] = useState(() => {
    const raw = item.detailed_overview || '';
    if (raw.trim().startsWith('{')) {
      try {
        return JSON.parse(raw).desc2 || '';
      } catch (e) {}
    }
    return getHybridDetails(item.category, item.title).desc2;
  });

  const [rating, setRating] = useState<string>(String(item.rating || '4.9'));
  const [ratingCount, setRatingCount] = useState<string>(String(item.rating_count || '120'));

  const [feat1, setFeat1] = useState(item.key_features?.[0] || '');
  const [feat1Desc, setFeat1Desc] = useState(item.key_features_descriptions?.[0] || '');
  const [feat2, setFeat2] = useState(item.key_features?.[1] || '');
  const [feat2Desc, setFeat2Desc] = useState(item.key_features_descriptions?.[1] || '');
  const [feat3, setFeat3] = useState(item.key_features?.[2] || '');
  const [feat3Desc, setFeat3Desc] = useState(item.key_features_descriptions?.[2] || '');


  const [guideLabel, setGuideLabel] = useState(item.integration_guide_1_label || '');
  const [guideUrl, setGuideUrl] = useState(item.integration_guide_1_url || '');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const parsedRating = parseFloat(rating);
    const parsedRatingCount = parseInt(ratingCount, 10);

    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      setError('Rating must be a valid number between 0.0 and 5.0.');
      setSaving(false);
      return;
    }

    if (isNaN(parsedRatingCount) || parsedRatingCount < 0) {
      setError('Review count must be a non-negative integer.');
      setSaving(false);
      return;
    }

    const serializedOverview = JSON.stringify({
      overview: detailedOverview,
      title1: hybridTitle1,
      desc1: hybridDesc1,
      title2: hybridTitle2,
      desc2: hybridDesc2
    });

    const updates = {
      title,
      url,
      description,
      category,
      image_url: imageUrl,
      email,
      detailed_overview: serializedOverview,
      rating: parsedRating,
      rating_count: parsedRatingCount,
      key_features: [feat1, feat2, feat3].filter(Boolean).length > 0 ? [feat1, feat2, feat3] : undefined,
      key_features_descriptions: [feat1Desc, feat2Desc, feat3Desc].filter(Boolean).length > 0 ? [feat1Desc, feat2Desc, feat3Desc] : undefined,

      integration_guide_1_label: guideLabel || undefined,
      integration_guide_1_url: guideUrl || undefined,
    };

    try {
      const res = await updateItemAdmin(item.id, updates, secretKey);
      if (res && res.success) {
        onSave({
          ...item,
          ...updates
        });
      } else {
        throw new Error('Update returned non-success result.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update tool details. Please verify your admin privileges.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'core', label: '기본 정보 (Core)', icon: 'info' },
    { id: 'details', label: '상세 개요 (Copy)', icon: 'article' },
    { id: 'features', label: '핵심 기능 (Features)', icon: 'featured_play_list' },
    { id: 'reviews', label: '가이드 & 문서 (Docs)', icon: 'menu_book' },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-md bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Box */}
      <div className="relative bg-surface-container-lowest w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh] flex flex-col border border-outline-variant">
        {/* Header */}
        <div className="p-md md:p-lg flex justify-between items-center border-b border-outline-variant shrink-0 bg-surface-container-low">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary text-[24px]">edit_note</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Edit Tool Details (수동 편집기)</h2>
          </div>
          <button
            type="button"
            className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none disabled:opacity-50"
            onClick={onClose}
            disabled={saving}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant bg-surface-container-lowest overflow-x-auto custom-scrollbar shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-md px-base text-center font-label-md text-label-md transition-all duration-200 flex items-center justify-center gap-xs border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-bold bg-primary/5'
                  : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-neutral-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="p-md md:p-lg overflow-y-auto custom-scrollbar flex-grow space-y-md">
            {error && (
              <div className="bg-error-container text-on-error-container p-sm rounded-lg font-body-sm flex items-center gap-xs animate-shake">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: CORE INFORMATION */}
            {activeTab === 'core' && (
              <div className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Tool Name (서비스명)</label>
                    <input
                      className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Website URL (공식 주소)</label>
                    <input
                      className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">One-line Pitch (한 줄 슬로건)</label>
                  <input
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Category (카테고리)</label>
                    <select
                      className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={saving}
                    >
                      <option>Visual & Design</option>
                      <option>Copywriting & Marketing</option>
                      <option>Store Optimization</option>
                      <option>Automation</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Creator Email (등록자 이메일)</label>
                    <input
                      className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Thumbnail Image URL (썸네일 주소)</label>
                  <input
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-[12px]"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: DETAILED OVERVIEW */}
            {activeTab === 'details' && (
              <div className="space-y-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Detailed Overview (Gemini 상세 소개글)</label>
                  <textarea
                    className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[160px] leading-relaxed"
                    value={detailedOverview}
                    onChange={(e) => setDetailedOverview(e.target.value)}
                    placeholder="AI가 자동 생성하거나 수동으로 가공한 매력적인 상세 소개글입니다."
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Average Rating (평점: 0.0 ~ 5.0)</label>
                    <input
                      className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">Verified Reviews Count (리뷰 개수)</label>
                    <input
                      className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      type="number"
                      min="0"
                      value={ratingCount}
                      onChange={(e) => setRatingCount(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Hybrid Dynamic Sections */}
                <div className="pt-sm border-t border-outline-variant space-y-sm">
                  <h4 className="font-label-md text-label-md text-primary font-bold">Category Features (카테고리 상세 특징 2종)</h4>
                  
                  {/* Pair 1 */}
                  <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant space-y-sm">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">특징 1 제목 (Feature 1 Title)</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all font-semibold"
                        type="text"
                        value={hybridTitle1}
                        onChange={(e) => setHybridTitle1(e.target.value)}
                        placeholder="e.g. Automated Studio Quality"
                        disabled={saving}
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">특징 1 내용 (Feature 1 Description)</label>
                      <textarea
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all min-h-[60px] leading-relaxed"
                        value={hybridDesc1}
                        onChange={(e) => setHybridDesc1(e.target.value)}
                        placeholder="특징 1에 대한 자세한 마케팅 문구입니다."
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {/* Pair 2 */}
                  <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant space-y-sm">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">특징 2 제목 (Feature 2 Title)</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all font-semibold"
                        type="text"
                        value={hybridTitle2}
                        onChange={(e) => setHybridTitle2(e.target.value)}
                        placeholder="e.g. High-Speed Asset Pipeline"
                        disabled={saving}
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant font-bold">특징 2 내용 (Feature 2 Description)</label>
                      <textarea
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all min-h-[60px] leading-relaxed"
                        value={hybridDesc2}
                        onChange={(e) => setHybridDesc2(e.target.value)}
                        placeholder="특징 2에 대한 자세한 마케팅 문구입니다."
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: KEY FEATURES */}
            {activeTab === 'features' && (
              <div className="space-y-md">
                <p className="font-body-sm text-body-sm text-on-surface-variant bg-neutral-100 p-xs rounded border border-outline-variant">
                  상세 페이지의 중간 영역에 배치될 3가지 핵심 기능의 제목과 세부 설명문입니다.
                </p>

                <div className="space-y-sm border-l-4 border-primary pl-md pt-xs">
                  <h4 className="font-label-md text-label-md text-primary font-bold">Feature 1 (첫 번째 기능)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="md:col-span-1 flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">기능명</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        type="text"
                        value={feat1}
                        onChange={(e) => setFeat1(e.target.value)}
                        placeholder="e.g. AI Scene Creator"
                        disabled={saving}
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">설명 (Description)</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        type="text"
                        value={feat1Desc}
                        onChange={(e) => setFeat1Desc(e.target.value)}
                        placeholder="기능에 대한 직관적인 설명글을 적어주세요."
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-sm border-l-4 border-indigo-500 pl-md pt-xs">
                  <h4 className="font-label-md text-label-md text-indigo-600 font-bold">Feature 2 (두 번째 기능)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="md:col-span-1 flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">기능명</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        type="text"
                        value={feat2}
                        onChange={(e) => setFeat2(e.target.value)}
                        placeholder="e.g. Conversion Booster"
                        disabled={saving}
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">설명 (Description)</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        type="text"
                        value={feat2Desc}
                        onChange={(e) => setFeat2Desc(e.target.value)}
                        placeholder="기능에 대한 직관적인 설명글을 적어주세요."
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-sm border-l-4 border-teal-500 pl-md pt-xs">
                  <h4 className="font-label-md text-label-md text-teal-600 font-bold">Feature 3 (세 번째 기능)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="md:col-span-1 flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">기능명</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        type="text"
                        value={feat3}
                        onChange={(e) => setFeat3(e.target.value)}
                        placeholder="e.g. Frictionless Launch"
                        disabled={saving}
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">설명 (Description)</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        type="text"
                        value={feat3Desc}
                        onChange={(e) => setFeat3Desc(e.target.value)}
                        placeholder="기능에 대한 직관적인 설명글을 적어주세요."
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: INTEGRATION GUIDES */}
            {activeTab === 'reviews' && (
              <div className="space-y-md">
                {/* Integration Docs */}
                <div className="p-sm bg-surface-container-low rounded-xl border border-outline-variant space-y-sm">
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Integration Guide & Docs (가이드 문서 정보)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">문서 노출 명칭 (Label)</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                        type="text"
                        value={guideLabel}
                        onChange={(e) => setGuideLabel(e.target.value)}
                        placeholder="e.g. Setup Guide for Shopify"
                        disabled={saving}
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-label-sm text-label-sm text-on-surface-variant">문서 웹 링크 (URL)</label>
                      <input
                        className="border border-outline-variant rounded-lg p-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all"
                        type="url"
                        value={guideUrl}
                        onChange={(e) => setGuideUrl(e.target.value)}
                        placeholder="https://example.com/docs"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-md border-t border-outline-variant flex justify-end gap-sm bg-surface-container-low shrink-0">
            <button
              type="button"
              className="border border-outline-variant px-lg py-md rounded-lg font-label-md text-label-md hover:bg-neutral-100 transition-colors disabled:opacity-50"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all px-lg py-md rounded-lg font-label-md text-label-md flex items-center justify-center gap-xs font-semibold disabled:opacity-50"
              disabled={saving || !title || !url || !description || !imageUrl}
            >
              {saving ? (
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
                  Save Manual Edits
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
