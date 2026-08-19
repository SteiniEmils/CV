export type Appearance = 'default' | 'paper'
export type ColorScheme = 'light' | 'dark'

export type SiteSettings = {
  appearance: Appearance
  colorScheme: ColorScheme
}

export const COLOR_SCHEME_KEY = 'cv-theme'

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  appearance: 'default',
  colorScheme: 'light',
}

export function normalizeSettings(raw: unknown): SiteSettings {
  const value = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    appearance: value.appearance === 'paper' ? 'paper' : 'default',
    colorScheme: value.colorScheme === 'dark' ? 'dark' : 'light',
  }
}

export function readSiteSettingsFromDom(): SiteSettings {
  if (typeof document === 'undefined') return DEFAULT_SITE_SETTINGS
  const el = document.getElementById('cv-site-settings')
  if (!el?.textContent?.trim()) return DEFAULT_SITE_SETTINGS
  try {
    return normalizeSettings(JSON.parse(el.textContent))
  } catch {
    return DEFAULT_SITE_SETTINGS
  }
}

export function applyTheme(appearance: Appearance, colorScheme: ColorScheme) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  html.dataset.appearance = appearance
  html.dataset.theme = colorScheme
  html.style.colorScheme = colorScheme
}

export function readStoredColorScheme(fallback: ColorScheme): ColorScheme {
  if (typeof window === 'undefined') return fallback
  const saved = localStorage.getItem(COLOR_SCHEME_KEY)
  return saved === 'dark' || saved === 'light' ? saved : fallback
}
