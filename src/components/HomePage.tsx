import React from 'react';
import { Play, BookOpen, Sparkles, ShieldCheck, Zap, Activity, Film, Tv, ArrowRight } from 'lucide-react';
import { PRESET_ITEMS, PresetItem } from '../services/tgvid';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectMedia?: (preset: PresetItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectMedia }) => {
  // Select a visually engaging cross-section of movies, web series, and anime
  const featuredMedia = [
    PRESET_ITEMS[0],  // Fight Club
    PRESET_ITEMS[4],  // Dune: Part Two
    PRESET_ITEMS[10], // Breaking Bad
    PRESET_ITEMS[12], // Game of Thrones
    PRESET_ITEMS[22], // Jujutsu Kaisen
    PRESET_ITEMS[26], // Solo Leveling
  ];

  const handleMediaClick = (item: PresetItem) => {
    if (onSelectMedia) {
      onSelectMedia(item);
    }
    onNavigate('/demo');
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20">
        {/* Two-Part Layout: Left & Right Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT SECTION */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            
            {/* 1. Small action button near the top */}
            <button
              onClick={() => onNavigate('/demo')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors shadow-sm cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Bilota Streaming Engine v2.4 Live</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* 2. Prominent brand / logo area */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Bilota <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Server</span>
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-zinc-300">
                Ultra-Fast, Ad-Free Video Streaming &amp; Embed Engine
              </p>
            </div>

            {/* 3. Tagline / Short description */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              Direct HLS source extraction with pristine video delivery. Zero popups, zero intrusive overlays, and pure player performance designed for seamless web and mobile embedding.
            </p>

            {/* 4. Statistics row containing 3–4 numerical metrics */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-white/10">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">0%</span>
                <span className="text-xs text-zinc-400">Ads &amp; Redirects</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">&lt;85ms</span>
                <span className="text-xs text-zinc-400">Stream Extraction</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">99.9%</span>
                <span className="text-xs text-zinc-400">Uptime SLA</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">1080p</span>
                <span className="text-xs text-zinc-400">Multi-Quality HLS</span>
              </div>
            </div>

            {/* 5. Two primary call-to-action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('/demo')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Try Live Demo</span>
              </button>

              <button
                onClick={() => onNavigate('/documentation')}
                className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <BookOpen className="w-4 h-4 text-zinc-400" />
                <span>View Documentation</span>
              </button>
            </div>
          </div>

          {/* RIGHT SECTION: Visual media grid or poster-style display area */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Media Card Showcase Frame */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#0c1017]/80 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Popular Content Grid</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">Click to test instant playback</span>
                </div>

                {/* 2x3 Visual Media Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {featuredMedia.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMediaClick(item)}
                      className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer flex flex-col"
                    >
                      {/* Media Header Visual */}
                      <div className="h-28 sm:h-32 bg-gradient-to-br from-zinc-800 to-zinc-950 flex flex-col justify-between p-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-center justify-between relative z-10">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            item.type === 'movie' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                            {item.type === 'movie' ? 'Movie' : 'Series'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">{item.year}</span>
                        </div>

                        <div className="flex items-center justify-center my-auto">
                          <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all shadow-md">
                            <Play className="w-4 h-4 text-white group-hover:text-black fill-current ml-0.5" />
                          </div>
                        </div>

                        <div className="relative z-10">
                          <span className="text-[10px] font-mono text-emerald-400/90 font-medium">{item.badge}</span>
                        </div>
                      </div>

                      {/* Card Content Footer */}
                      <div className="p-2.5 bg-zinc-950/90 border-t border-white/5 flex flex-col">
                        <h3 className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 font-mono">TMDB: {item.id}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live TMDB &amp; HLS CDN Ready</span>
                  </span>
                  <button
                    onClick={() => onNavigate('/demo')}
                    className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
                  >
                    <span>Open in Demo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
