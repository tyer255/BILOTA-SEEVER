import React, { useState } from 'react';
import { 
  Zap, Link2, Sliders, Clock, Hash, Copy, Check, 
  Code2, ExternalLink, ShieldCheck, Terminal
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('quick-start');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const sections = [
    { id: 'quick-start', label: 'Quick Start', icon: Zap },
    { id: 'url-structure', label: 'URL Structure', icon: Link2 },
    { id: 'customization', label: 'Customization', icon: Sliders },
    { id: 'watch-progress', label: 'Watch Progress', icon: Clock },
    { id: 'content-ids', label: 'Content IDs', icon: Hash },
  ];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const quickStartIframeCode = `<iframe
  src="https://bilotaserver.ai.studio/?embed=true&type=movie&id=550"
  width="100%"
  height="100%"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
></iframe>`;

  const reactEmbedCode = `import React from 'react';

export const VideoPlayer = ({ type = 'movie', id = '550', season = 1, episode = 1 }) => {
  const embedUrl = type === 'movie'
    ? \`https://bilotaserver.ai.studio/?embed=true&type=movie&id=\${id}\`
    : \`https://bilotaserver.ai.studio/?embed=true&type=tv&id=\${id}&s=\${season}&e=\${episode}\`;

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};`;

  const urlParamsList = [
    { param: 'embed', type: 'boolean', default: 'true', desc: 'Activates distraction-free fullscreen embed mode.' },
    { param: 'type', type: 'string', default: 'movie', desc: 'Type of content: "movie" or "tv".' },
    { param: 'id', type: 'string | number', default: '550', desc: 'The TMDB ID of the movie or television show.' },
    { param: 's / season', type: 'number', default: '1', desc: 'Season number (required for TV shows).' },
    { param: 'e / episode', type: 'number', default: '1', desc: 'Episode number (required for TV shows).' },
    { param: 'autoplay', type: 'boolean', default: 'true', desc: 'Starts playback automatically upon stream ready.' },
  ];

  const watchProgressCode = `// Bilota Server automatically caches watch progress to browser localStorage:
// Key: 'bilota_progress_{type}_{id}_{season}_{episode}'
// Value: { currentTime: 342.5, duration: 8120, updatedAt: 1729500000000 }

// Parent applications can also listen for postMessage events:
window.addEventListener('message', (event) => {
  if (event.data?.source === 'bilota-player') {
    const { action, currentTime, duration, progressPercent } = event.data;
    console.log(\`[Bilota Stream] \${action}: \${Math.round(progressPercent)}%\`);
  }
});`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>Developer Guides &amp; API</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Documentation
        </h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
          Everything you need to integrate Bilota Server video streaming, embed iframes, and configure player parameters.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN — Sidebar Navigation */}
        <aside className="lg:col-span-3 sticky top-24 space-y-1">
          <div className="p-3 rounded-2xl bg-[#0c1017]/80 border border-white/10 shadow-lg text-left">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-2 block">
              On This Page
            </span>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* RIGHT COLUMN — Main Content Area */}
        <main className="lg:col-span-9 space-y-12 text-left">
          
          {/* SECTION 1: Quick Start */}
          <section id="quick-start" className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Quick Start</h2>
                <p className="text-xs text-zinc-500">Embed Bilota Server in under 30 seconds</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Bilota Server provides clean, zero-ad iframe embeds that can be placed in any web application, native webview, or CMS. The embed automatically fetches high-speed HLS streams with multi-audio and quality selectors.
            </p>

            {/* Code Block */}
            <div className="rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-xl">
              <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">HTML Standard Iframe</span>
                <button
                  onClick={() => handleCopy(quickStartIframeCode, 'quick-iframe')}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  {copiedIndex === 'quick-iframe' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'quick-iframe' ? 'Copied!' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                <code>{quickStartIframeCode}</code>
              </pre>
            </div>

            {/* React Example */}
            <div className="rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-xl mt-4">
              <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">React Component Example</span>
                <button
                  onClick={() => handleCopy(reactEmbedCode, 'react-code')}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  {copiedIndex === 'react-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'react-code' ? 'Copied!' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                <code>{reactEmbedCode}</code>
              </pre>
            </div>
          </section>

          {/* SECTION 2: URL Structure */}
          <section id="url-structure" className="space-y-4 pt-6">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">URL Structure</h2>
                <p className="text-xs text-zinc-500">Query parameters and endpoint conventions</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Every Bilota Server stream endpoint accepts straightforward query parameters for identifying movies and television series.
            </p>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 font-mono text-xs text-emerald-400 break-all">
              https://bilotaserver.ai.studio/?embed=true&amp;type=[movie|tv]&amp;id=[tmdb_id]&amp;s=[season]&amp;e=[episode]
            </div>

            {/* Parameters Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-900/90 text-zinc-300 uppercase font-mono border-b border-white/10">
                  <tr>
                    <th className="p-3">Parameter</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Default</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {urlParamsList.map((p) => (
                    <tr key={p.param} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-emerald-400 font-semibold">{p.param}</td>
                      <td className="p-3 font-mono text-cyan-300">{p.type}</td>
                      <td className="p-3 font-mono text-zinc-400">{p.default}</td>
                      <td className="p-3 text-zinc-300">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 3: Customization */}
          <section id="customization" className="space-y-4 pt-6">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Customization</h2>
                <p className="text-xs text-zinc-500">Styling, colors, and player behavior</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Bilota Server allows styling and behavior configuration. You can style the player container with custom aspect ratios, borders, or CSS custom properties.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
                <h3 className="text-sm font-bold text-white">Landscape Fullscreen</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When maximizing on mobile or desktop, Bilota Server automatically applies native orientation lock and CSS fallback rotation to render the movie horizontally without requiring manual device rotation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2">
                <h3 className="text-sm font-bold text-white">Interactive Tap Controls</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tapping the video player smoothly toggles overlay controls on and off with auto-hide timeout after 3.5 seconds of inactivity during playback.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: Watch Progress */}
          <section id="watch-progress" className="space-y-4 pt-6">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Watch Progress</h2>
                <p className="text-xs text-zinc-500">Automatic local resume and cross-window events</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Bilota Server preserves watch positions per media item. When a user returns to a previously watched episode or movie, the player remembers their exact timestamp.
            </p>

            <div className="rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-xl">
              <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">Watch Progress &amp; Events</span>
                <button
                  onClick={() => handleCopy(watchProgressCode, 'progress-code')}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  {copiedIndex === 'progress-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'progress-code' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                <code>{watchProgressCode}</code>
              </pre>
            </div>
          </section>

          {/* SECTION 5: Content IDs */}
          <section id="content-ids" className="space-y-4 pt-6">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Content IDs</h2>
                <p className="text-xs text-zinc-500">Standard TMDB identification conventions</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Bilota Server resolves all media queries using standard The Movie Database (TMDB) identifiers. You can find any movie or show's TMDB ID directly from the URL on <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">themoviedb.org</a>.
            </p>

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-3">
              <div className="text-xs font-mono text-zinc-300">
                Example TMDB URLs:
              </div>
              <ul className="text-xs space-y-2 text-zinc-400 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">Movie:</span>
                  <span>themoviedb.org/movie/<strong className="text-white">550</strong>-fight-club &rarr; ID is <span className="text-emerald-300">550</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">Series:</span>
                  <span>themoviedb.org/tv/<strong className="text-white">1396</strong>-breaking-bad &rarr; ID is <span className="text-cyan-300">1396</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">Anime:</span>
                  <span>themoviedb.org/tv/<strong className="text-white">95479</strong>-jujutsu-kaisen &rarr; ID is <span className="text-purple-300">95479</span></span>
                </li>
              </ul>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
};
