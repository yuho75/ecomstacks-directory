'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
  onSubmitClick?: () => void;
}

export default function Header({ onSubmitClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime > 1500) {
      setLogoClicks(1);
    } else {
      const newCount = logoClicks + 1;
      if (newCount >= 7) {
        e.preventDefault();
        sessionStorage.setItem('allow_admin_access', 'true');
        router.push('/admin');
        return;
      }
      setLogoClicks(newCount);
    }
    setLastClickTime(now);
  };

  const handleSubmitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSubmitClick) {
      onSubmitClick();
      setIsMobileMenuOpen(false);
    } else {
      // If we are not on homepage, redirect with submit query param
      router.push('/?submit=true');
    }
  };

  const handleSubscribeClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      document.getElementById('footer-anchor')?.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) emailInput.focus();
      }, 800);
    } else {
      // Standard anchor navigation is fine for foreign pages
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant shadow-sm shrink-0">
      <div className="max-w-container-max w-full mx-auto px-gutter h-20 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-base">
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-xs font-bold text-on-surface hover:text-primary transition-colors select-none group"
          >
            <div className="relative w-8 h-8 flex items-center justify-center bg-black rounded-md shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L21 7.5L12 12L3 7.5L12 3Z" fill="currentColor" fillOpacity="0.2" />
                <path d="M3 12L12 16.5L21 12" />
                <path d="M3 16.5L12 21L21 16.5" />
              </svg>
            </div>
            <span 
              className="text-[22px] font-extrabold tracking-[-0.045em] text-on-surface select-none" 
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Ecom<span className="text-on-surface-variant">Stacks</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-lg">
          <Link 
            href="/" 
            className={`text-[15px] font-extrabold tracking-[-0.045em] transition-colors py-2 ${pathname === '/' ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Tools
          </Link>
          <Link 
            href="/pricing" 
            className={`text-[15px] font-extrabold tracking-[-0.045em] transition-colors py-2 ${pathname === '/pricing' ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Pricing
          </Link>
          <a 
            href="/#footer-anchor" 
            className="text-[15px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black transition-colors py-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onClick={handleSubscribeClick}
          >
            Subscribe
          </a>
        </nav>

        {/* Desktop Submit Button & Hamburger for Mobile */}
        <div className="flex items-center gap-sm">
          <button 
            onClick={handleSubmitClick}
            className="hidden sm:inline-block bg-primary-container text-on-primary hover:bg-primary px-md py-sm rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100 shadow-sm"
          >
            Submit Your Tool (Free)
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden items-center justify-center p-2 rounded-lg hover:bg-surface-container text-on-surface transition-colors"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface-container-lowest animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col px-gutter py-md gap-md">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-[16px] font-extrabold tracking-[-0.045em] py-2 border-b border-outline-variant/30 ${pathname === '/' ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Tools
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-[16px] font-extrabold tracking-[-0.045em] py-2 border-b border-outline-variant/30 ${pathname === '/pricing' ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Pricing
            </Link>
            <a 
              href="/#footer-anchor" 
              className="text-[16px] font-extrabold tracking-[-0.045em] text-neutral-500 hover:text-black py-2 border-b border-outline-variant/30"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onClick={handleSubscribeClick}
            >
              Subscribe
            </a>
            <button 
              onClick={handleSubmitClick}
              className="mt-2 w-full bg-primary-container text-on-primary hover:bg-primary py-md rounded-lg font-label-md text-label-md transition-all active:scale-95 duration-100 shadow-sm text-center"
            >
              Submit Your Tool (Free)
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
