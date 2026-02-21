// OfferMind Promo Video — Design Tokens
// Dark cinematic palette with warm accents

export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const FPS = 30;
export const DURATION_IN_SECONDS = 30;
export const TOTAL_FRAMES = FPS * DURATION_IN_SECONDS; // 900

// Scene frame ranges
export const SCENES = {
  intro: { start: 0, duration: 5 * FPS },        // 0-150
  painPoints: { start: 5 * FPS, duration: 7 * FPS }, // 150-360
  features: { start: 12 * FPS, duration: 8 * FPS },  // 360-600
  stats: { start: 20 * FPS, duration: 7 * FPS },     // 600-810
  cta: { start: 27 * FPS, duration: 3 * FPS },       // 810-900
};

// Colors
export const COLORS = {
  bg: '#0a0a0f',
  bgGradient1: '#0d1117',
  bgGradient2: '#161b22',
  primary: '#6366f1',       // indigo
  primaryGlow: '#818cf8',
  accent: '#f59e0b',        // warm amber
  accentSoft: '#fbbf24',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  surface: 'rgba(255,255,255,0.05)',
  surfaceBorder: 'rgba(255,255,255,0.08)',
  success: '#34d399',
  rose: '#fb7185',
};

// Typography
export const FONTS = {
  display: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  body: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
};
