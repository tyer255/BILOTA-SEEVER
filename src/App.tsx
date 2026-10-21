/**
 * Bilota Server - Next-Gen Video Streaming & Embed Platform
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { DemoPage } from './components/DemoPage';
import { DocumentationPage } from './components/DocumentationPage';
import { StandaloneEmbedPlayer } from './components/StandaloneEmbedPlayer';
import { PresetItem } from './services/tgvid';

export default function App() {
  // 1. Embed Mode Detection (query param ?embed=true or hash or path)
  const [embedParams, setEmbedParams] = useState<{
    isEmbed: boolean;
    type: 'movie' | 'tv';
    id: string;
    season: number;
    episode: number;
  } | null>(null);

  // 2. Active Page Routing: '/' | '/demo' | '/documentation'
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedPresetForDemo, setSelectedPresetForDemo] = useState<PresetItem | undefined>(undefined);

  // Sync route on mount and listen to popstate (browser back/forward)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseRoute = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isEmbed = urlParams.get('embed') === 'true' || 
                      window.location.hash.includes('embed') || 
                      window.location.pathname === '/embed';

      if (isEmbed) {
        const type = (urlParams.get('type') === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
        const id = urlParams.get('id') || '550';
        const season = parseInt(urlParams.get('s') || urlParams.get('season') || '1', 10);
        const episode = parseInt(urlParams.get('e') || urlParams.get('episode') || '1', 10);

        setEmbedParams({
          isEmbed: true,
          type,
          id,
          season,
          episode,
        });
        return;
      }

      setEmbedParams(null);

      // Check URL path or hash for page navigation
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');
      const pageParam = urlParams.get('page');

      if (path === '/demo' || hash === '/demo' || pageParam === 'demo') {
        setCurrentPath('/demo');
      } else if (path === '/documentation' || hash === '/documentation' || pageParam === 'documentation' || pageParam === 'docs') {
        setCurrentPath('/documentation');
      } else {
        setCurrentPath('/');
      }
    };

    parseRoute();

    const handlePopState = () => {
      parseRoute();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 4. EMBED MODE: Display only video player in a full-screen layout
  if (embedParams?.isEmbed) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none">
        <StandaloneEmbedPlayer
          type={embedParams.type}
          id={embedParams.id}
          season={embedParams.season}
          episode={embedParams.episode}
        />
      </div>
    );
  }

  // MAIN WEBSITE EXPERIENCE: Persistent Top Nav + 3 Specified Pages
  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Persistent Top Navigation Bar */}
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />

      {/* Main Page Views */}
      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectMedia={(preset) => setSelectedPresetForDemo(preset)}
          />
        )}

        {currentPath === '/demo' && (
          <DemoPage initialPreset={selectedPresetForDemo} />
        )}

        {currentPath === '/documentation' && (
          <DocumentationPage />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-white/10 bg-[#080b11] py-8 text-xs text-zinc-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">Bilota Server</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span>· All streams retrieved via direct extraction</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('/')} className="hover:text-zinc-300 transition-colors">Home</button>
            <button onClick={() => navigateTo('/demo')} className="hover:text-zinc-300 transition-colors">Demo</button>
            <button onClick={() => navigateTo('/documentation')} className="hover:text-zinc-300 transition-colors">Documentation</button>
            <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
