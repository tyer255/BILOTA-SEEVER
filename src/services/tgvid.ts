/**
 * TGVID Reverse Engineering Service
 * Provides direct source extraction, cipher decryption, and stream parsing.
 */

export interface AudioTrack {
  label: string;
  lang: string;
  url: string;
}

export interface SubtitleTrack {
  label: string;
  lang: string;
  url: string;
}

export interface StreamSource {
  server: string;
  label: string;
  quality: string;
  type: 'hls' | 'dash' | 'mp4';
  url: string;
  mirrors?: string[];
  subtitles?: SubtitleTrack[];
  audio_tracks?: AudioTrack[];
  audios?: string[];
  qualities?: string[];
  multi_audio?: boolean;
  multi_quality?: boolean;
}

export interface TgvidResponse {
  ok: boolean;
  type: 'movie' | 'tv';
  tmdb_id: string | number;
  imdb_id?: string;
  title: string;
  year?: string | number;
  count?: number;
  links: StreamSource[];
  error?: string;
}

export interface MediaMeta {
  title: string;
  overview?: string;
  poster?: string;
  backdrop?: string;
  logo?: string;
  year?: string;
  rating?: number;
  genres?: string[];
}

// TGVID XOR Key discovered during reverse engineering of scramble-Blgi6dBn.js
const XOR_KEY = "tGfL1x#9vQ";
const TGVID_API_BASE = "https://tgvidapi.lovable.app";
const TMDB_KEY = "f1e46d83ecce5dc29c90d9d2ed41f2ed";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";

/**
 * Reverse-engineered unscramble algorithm from scramble-Blgi6dBn.js
 */
export function unscramble(t: string): string {
  try {
    const reversed = t.split("").reverse().join("");
    const decoded = atob(reversed);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    const result = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] ^ XOR_KEY.charCodeAt(i % 10) ^ (i & 255);
    }
    return new TextDecoder().decode(result);
  } catch (err) {
    console.error("Unscramble error:", err);
    return "";
  }
}

/**
 * Fetch direct playable video sources from TGVID API.
 * Gracefully handles 502 Bad Gateway / 404 No Links without throwing unhandled exceptions.
 */
export async function fetchDirectSources(
  type: 'movie' | 'tv',
  tmdbId: string | number,
  season: number = 1,
  episode: number = 1
): Promise<TgvidResponse> {
  const endpoint = type === 'movie' 
    ? `${TGVID_API_BASE}/api/m/${tmdbId}`
    : `${TGVID_API_BASE}/api/tv/${tmdbId}/${season}/${episode}`;

  try {
    const res = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!res.ok) {
      let errMsg = `No playable stream sources found for ID ${tmdbId}`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) {
          errMsg = errJson.error;
        }
      } catch {}

      return {
        ok: false,
        type,
        tmdb_id: tmdbId,
        title: '',
        links: [],
        error: errMsg
      };
    }

    const data: TgvidResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn(`Fetch sources warning for ${endpoint}:`, err);
    return {
      ok: false,
      type,
      tmdb_id: tmdbId,
      title: '',
      links: [],
      error: err.message || 'Stream temporarily unavailable'
    };
  }
}

/**
 * Fetch TMDB metadata including high-res transparent Movie Logo PNG
 */
export async function fetchTmdbMeta(
  type: 'movie' | 'tv',
  tmdbId: string | number
): Promise<MediaMeta> {
  try {
    const baseUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}`;
    const [detailsRes, imagesRes] = await Promise.all([
      fetch(`${baseUrl}?api_key=${TMDB_KEY}`).then(r => r.ok ? r.json() : null).catch(() => null),
      // Query images without language filter so all transparent logos are fetched
      fetch(`${baseUrl}/images?api_key=${TMDB_KEY}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    const json = detailsRes || {};
    const imgJson = imagesRes || {};

    // Filter and pick the best original transparent movie logo
    const rawLogos: Array<{
      file_path: string;
      iso_639_1: string | null;
      aspect_ratio?: number;
      width?: number;
      height?: number;
      vote_average?: number;
      vote_count?: number;
    }> = imgJson.logos || [];

    // 1. Prefer PNG logos with transparent background (alpha channel), fallback to SVG if none
    const pngLogos = rawLogos.filter(l => l.file_path && l.file_path.toLowerCase().endsWith('.png'));
    const pool = pngLogos.length > 0 ? pngLogos : rawLogos;

    // 2. Prefer high-quality English logo when available, otherwise suitable available language
    const enLogos = pool.filter(l => l.iso_639_1 === 'en');
    const candidates = enLogos.length > 0 ? enLogos : pool;

    // 3. Sort by quality (vote average, then vote count, then resolution width)
    const sorted = [...candidates].sort((a, b) => {
      const voteDiff = (b.vote_average || 0) - (a.vote_average || 0);
      if (Math.abs(voteDiff) > 0.05) return voteDiff;
      const countDiff = (b.vote_count || 0) - (a.vote_count || 0);
      if (countDiff !== 0) return countDiff;
      return (b.width || 0) - (a.width || 0);
    });

    const bestLogo = sorted[0];
    // High-resolution original transparent image from TMDB CDN (or w780 if original fails)
    const logoUrl = bestLogo?.file_path
      ? `https://image.tmdb.org/t/p/original${bestLogo.file_path}`
      : undefined;

    return {
      title: json.title || json.name || `Title #${tmdbId}`,
      overview: json.overview || "",
      poster: json.poster_path ? `${TMDB_IMAGE_BASE}w780${json.poster_path}` : undefined,
      backdrop: json.backdrop_path ? `${TMDB_IMAGE_BASE}w1280${json.backdrop_path}` : undefined,
      logo: logoUrl,
      year: (json.release_date || json.first_air_date || "").slice(0, 4),
      rating: json.vote_average ? Math.round(json.vote_average * 10) / 10 : undefined,
      genres: json.genres?.map((g: { name: string }) => g.name) || [],
    };
  } catch {
    return {
      title: `${type === 'movie' ? 'Movie' : 'TV Show'} #${tmdbId}`,
    };
  }
}

export interface PresetItem {
  category: 'movie' | 'tv' | 'anime';
  type: 'movie' | 'tv';
  id: number;
  title: string;
  year: string;
  season?: number;
  episode?: number;
  badge?: string;
  serversCount?: number;
}

export const PRESET_ITEMS: PresetItem[] = [
  // 10 MOVIES
  { category: 'movie', type: 'movie', id: 550, title: 'Fight Club', year: '1999', badge: '14 Links' },
  { category: 'movie', type: 'movie', id: 27205, title: 'Inception', year: '2010', badge: '15 Links' },
  { category: 'movie', type: 'movie', id: 157336, title: 'Interstellar', year: '2014', badge: '11 Links' },
  { category: 'movie', type: 'movie', id: 155, title: 'The Dark Knight', year: '2008', badge: '10 Links' },
  { category: 'movie', type: 'movie', id: 693134, title: 'Dune: Part Two', year: '2024', badge: '21 Links' },
  { category: 'movie', type: 'movie', id: 76600, title: 'Avatar: The Way of Water', year: '2022', badge: '12 Links' },
  { category: 'movie', type: 'movie', id: 872585, title: 'Oppenheimer', year: '2023', badge: '21 Links' },
  { category: 'movie', type: 'movie', id: 324857, title: 'Spider-Man: Spider-Verse', year: '2018', badge: '14 Links' },
  { category: 'movie', type: 'movie', id: 299534, title: 'Avengers: Endgame', year: '2019', badge: '18 Links' },
  { category: 'movie', type: 'movie', id: 603, title: 'The Matrix', year: '1999', badge: '13 Links' },

  // 10 WEB SERIES
  { category: 'tv', type: 'tv', id: 1396, title: 'Breaking Bad', year: '2008', season: 1, episode: 1, badge: '13 Links' },
  { category: 'tv', type: 'tv', id: 66732, title: 'Stranger Things', year: '2016', season: 1, episode: 1, badge: '13 Links' },
  { category: 'tv', type: 'tv', id: 1399, title: 'Game of Thrones', year: '2011', season: 1, episode: 1, badge: '16 Links' },
  { category: 'tv', type: 'tv', id: 76479, title: 'The Boys', year: '2019', season: 1, episode: 1, badge: '11 Links' },
  { category: 'tv', type: 'tv', id: 94997, title: 'House of the Dragon', year: '2022', season: 1, episode: 1, badge: '10 Links' },
  { category: 'tv', type: 'tv', id: 84958, title: 'Loki', year: '2021', season: 1, episode: 1, badge: '12 Links' },
  { category: 'tv', type: 'tv', id: 100088, title: 'The Last of Us', year: '2023', season: 1, episode: 1, badge: '4 Links' },
  { category: 'tv', type: 'tv', id: 93405, title: 'Squid Game', year: '2021', season: 1, episode: 1, badge: '23 Links' },
  { category: 'tv', type: 'tv', id: 71446, title: 'Money Heist', year: '2017', season: 1, episode: 1, badge: '19 Links' },
  { category: 'tv', type: 'tv', id: 60574, title: 'Peaky Blinders', year: '2013', season: 1, episode: 1, badge: '10 Links' },

  // 10 ANIME
  { category: 'anime', type: 'tv', id: 1429, title: 'Attack on Titan', year: '2013', season: 1, episode: 1, badge: '11 Links' },
  { category: 'anime', type: 'tv', id: 13916, title: 'Death Note', year: '2006', season: 1, episode: 1, badge: '16 Links' },
  { category: 'anime', type: 'tv', id: 95479, title: 'Jujutsu Kaisen', year: '2020', season: 1, episode: 1, badge: '12 Links' },
  { category: 'anime', type: 'tv', id: 85937, title: 'Demon Slayer', year: '2019', season: 1, episode: 1, badge: '5 Links' },
  { category: 'anime', type: 'tv', id: 37854, title: 'One Piece', year: '1999', season: 1, episode: 1, badge: '13 Links' },
  { category: 'anime', type: 'tv', id: 31910, title: 'Naruto Shippuden', year: '2007', season: 1, episode: 1, badge: '19 Links' },
  { category: 'anime', type: 'tv', id: 209867, title: 'Solo Leveling', year: '2024', season: 1, episode: 1, badge: '17 Links' },
  { category: 'anime', type: 'tv', id: 114410, title: 'Chainsaw Man', year: '2022', season: 1, episode: 1, badge: '10 Links' },
  { category: 'anime', type: 'movie', id: 129, title: 'Spirited Away', year: '2001', badge: '10 Links' },
  { category: 'anime', type: 'movie', id: 372058, title: 'Your Name', year: '2016', badge: '11 Links' },
];
