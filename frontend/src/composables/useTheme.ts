import { computed, readonly, ref, watch } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'travelplanner_theme';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

const themeMode = ref<ThemeMode>('system');
const systemPrefersDark = ref<boolean>(false);

let isInitialized = false;
let mediaQueryList: MediaQueryList | null = null;

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidThemeMode(raw) ? raw : 'system';
  } catch {
    return 'system';
  }
}

function persistTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore storage quota or private mode errors
  }
}

function readSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(DARK_MEDIA_QUERY).matches;
}

const resolvedTheme = computed<ResolvedTheme>(() => {
  if (themeMode.value === 'dark') return 'dark';
  if (themeMode.value === 'light') return 'light';
  return systemPrefersDark.value ? 'dark' : 'light';
});

const isDark = computed<boolean>(() => resolvedTheme.value === 'dark');

function applyThemeToDocument(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  // Ensure body never holds a stale dark class that could override html toggle
  document.body?.classList.remove('dark');
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

watch(
  resolvedTheme,
  (resolved) => {
    if (isInitialized) {
      applyThemeToDocument(resolved);
    }
  },
  { flush: 'sync' }
);

function handleMediaChange(event: MediaQueryListEvent): void {
  systemPrefersDark.value = event.matches;
  applyThemeToDocument(resolvedTheme.value);
}

function handleStorageSync(event: StorageEvent): void {
  if (event.key !== THEME_STORAGE_KEY) return;
  const nextMode: ThemeMode = isValidThemeMode(event.newValue) ? event.newValue : 'system';
  if (themeMode.value !== nextMode) {
    themeMode.value = nextMode;
    applyThemeToDocument(resolvedTheme.value);
  }
}

export function initTheme(): ResolvedTheme {
  systemPrefersDark.value = readSystemPrefersDark();
  themeMode.value = readStoredTheme();

  if (!isInitialized && typeof window !== 'undefined') {
    isInitialized = true;

    if (typeof window.matchMedia === 'function') {
      mediaQueryList = window.matchMedia(DARK_MEDIA_QUERY);
      if (typeof mediaQueryList.addEventListener === 'function') {
        mediaQueryList.addEventListener('change', handleMediaChange);
      } else if (typeof mediaQueryList.addListener === 'function') {
        mediaQueryList.addListener(handleMediaChange);
      }
    }

    window.addEventListener('storage', handleStorageSync);
  }

  applyThemeToDocument(resolvedTheme.value);
  return resolvedTheme.value;
}

export function setTheme(mode: ThemeMode): void {
  if (!isValidThemeMode(mode)) return;
  themeMode.value = mode;
  persistTheme(mode);
  applyThemeToDocument(resolvedTheme.value);
}

export function toggleTheme(): void {
  setTheme(isDark.value ? 'light' : 'dark');
}

export function useTheme() {
  if (!isInitialized && typeof window !== 'undefined') {
    initTheme();
  }

  return {
    themeMode: readonly(themeMode),
    systemPrefersDark: readonly(systemPrefersDark),
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
    initTheme,
  };
}
