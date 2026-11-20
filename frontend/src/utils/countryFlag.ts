const REGIONAL_INDICATOR_START = 0x1f1e6;
const REGIONAL_INDICATOR_END = 0x1f1ff;
const INVALID_ISO_CODES = new Set(['UN', 'XX', 'ZZ']);

/**
 * Extracts uppercase ISO 3166-1 alpha-2 code (e.g. 'FR', 'RU', 'AZ')
 * from a regional-indicator flag emoji (e.g. '🇫🇷').
 */
export function flagEmojiToIsoAlpha2(emoji?: string | null): string | null {
  if (!emoji) return null;
  const trimmed = emoji.trim();
  if (!trimmed) return null;

  const points: number[] = [];
  for (const ch of trimmed) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined && cp >= REGIONAL_INDICATOR_START && cp <= REGIONAL_INDICATOR_END) {
      points.push(cp);
      if (points.length === 2) break;
    }
  }

  if (points.length !== 2) return null;
  const code = String.fromCharCode(
    points[0] - REGIONAL_INDICATOR_START + 65,
    points[1] - REGIONAL_INDICATOR_START + 65
  );
  return INVALID_ISO_CODES.has(code) ? null : code;
}

/**
 * Validates and normalizes an ISO alpha-2 country code (or extracts it if a flag emoji was passed).
 */
export function normalizeIsoAlpha2(code?: string | null): string | null {
  if (!code) return null;
  const trimmed = code.trim();
  if (!trimmed) return null;

  if (/^[A-Za-z]{2}$/.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    return INVALID_ISO_CODES.has(upper) ? null : upper;
  }

  return flagEmojiToIsoAlpha2(trimmed);
}

/**
 * Attempts to extract ISO alpha-2 code from a standard flag URL (e.g. https://flagcdn.com/w40/fr.png).
 */
export function extractIsoFromFlagUrl(url?: string | null): string | null {
  if (!url) return null;
  const match = url.trim().match(/\/([a-zA-Z]{2})\.(?:png|svg|webp|jpg|jpeg)(?:\?.*)?$/i);
  if (!match) return null;
  const upper = match[1].toUpperCase();
  return INVALID_ISO_CODES.has(upper) ? null : upper;
}

/**
 * Checks whether a flag image URL is a usable http(s) or data image URL.
 */
export function isValidFlagUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed);
}

/**
 * Builds a FlagCDN PNG URL for the given ISO alpha-2 country code.
 */
export function buildFlagCdnUrl(isoAlpha2: string, width: 40 | 80 | 160 = 40): string {
  const clean = normalizeIsoAlpha2(isoAlpha2);
  if (!clean) return '';
  return `https://flagcdn.com/w${width}/${clean.toLowerCase()}.png`;
}

/**
 * Resolves the best available ISO alpha-2 code from explicit code, URL, or emoji.
 */
export function resolveFlagCode(
  code?: string | null,
  flagUrl?: string | null,
  flagEmoji?: string | null
): string | null {
  return (
    normalizeIsoAlpha2(code) ||
    extractIsoFromFlagUrl(flagUrl) ||
    flagEmojiToIsoAlpha2(flagEmoji)
  );
}
