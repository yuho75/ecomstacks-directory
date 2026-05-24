'use client';

interface VisitWebsiteButtonProps {
  itemId: string;
  url: string;
}

export default function VisitWebsiteButton({ itemId, url }: VisitWebsiteButtonProps) {
  const handleClick = () => {
    fetch('/api/track-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, type: 'website_click' }),
    }).catch(() => {});
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="bg-primary text-on-primary px-md py-sm rounded-lg font-semibold text-[15px] flex items-center justify-center gap-xs hover:brightness-110 active:scale-95 transition-all w-full sm:w-auto text-center whitespace-nowrap shadow-sm"
    >
      Visit Website{' '}
      <span className="material-symbols-outlined text-[18px]">north_east</span>
    </a>
  );
}
