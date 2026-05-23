'use client';

import React, { useState } from 'react';
import RequestEditModal from './RequestEditModal';

interface EditToolButtonProps {
  itemId: string;
  itemTitle: string;
}

export default function EditToolButton({ itemId, itemTitle }: EditToolButtonProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsEditOpen(true)}
        className="border border-outline-variant text-on-surface bg-surface-container-lowest px-md py-sm rounded-lg font-semibold text-[15px] flex items-center justify-center gap-xs hover:bg-neutral-50 active:scale-95 transition-all w-full sm:w-auto text-center cursor-pointer select-none whitespace-nowrap"
        title="Request secure edit link"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
        Edit Listing
      </button>

      <RequestEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        itemId={itemId}
        itemTitle={itemTitle}
      />
    </>
  );
}
