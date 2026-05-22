'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/app/actions';

export default function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the administrator navigated via the Easter Egg logo click sequence
    const allowed = sessionStorage.getItem('allow_admin_access');
    if (allowed === 'true') {
      setAuthorized(true);
    } else {
      // Not authorized! Redirect them directly to the landing page
      router.replace('/');
    }
  }, [router]);

  if (authorized === null) {
    return <div className="min-h-[calc(100vh-160px)]" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginAdmin(username, password);
      if (result.success) {
        // Clear temporary entry permission as we are now fully authenticated via cookie
        sessionStorage.removeItem('allow_admin_access');
        // Refresh the page so the server component re-checks the cookies and renders the AdminPanel
        window.location.reload();
      } else {
        setError(result.error || 'Failed to authenticate.');
      }
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-gutter">
      <div className="w-full max-w-md bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant rounded-2xl shadow-xl p-lg animate-in fade-in zoom-in duration-300">
        
        {/* Branding & Header */}
        <div className="text-center mb-lg">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 text-primary border border-primary/20 rounded-2xl mb-sm">
            <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
          </div>
          <h2 className="font-display-md text-[24px] font-bold text-on-surface tracking-tight">
            Control Room Login
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Authenticate to manage the EcomStacks Directory
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-xs bg-error/10 border border-error/20 text-error rounded-xl p-md mb-md animate-in slide-in-from-top-4 duration-200">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-xs">error</span>
            <span className="font-body-sm text-body-sm leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* Username */}
          <div className="flex flex-col gap-xs">
            <label 
              htmlFor="username" 
              className="font-label-sm text-label-sm font-semibold text-on-surface-variant"
            >
              Admin Username
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-md text-[20px] text-on-surface-variant/60">
                person
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                disabled={loading}
                className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-xs">
            <label 
              htmlFor="password" 
              className="font-label-sm text-label-sm font-semibold text-on-surface-variant"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-md text-[20px] text-on-surface-variant/60">
                lock
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
                className="w-full pl-xl pr-md py-sm bg-surface-container border border-outline-variant rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary hover:bg-primary/95 py-sm rounded-xl font-label-md text-label-md font-bold transition-all active:scale-[0.98] duration-150 shadow-md flex items-center justify-center gap-xs disabled:opacity-75 disabled:cursor-not-allowed mt-xs"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Access Control Room</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
