import { useContext } from 'react'
import { LanguageContext } from './i18n.tsx'
import type { Lang, UIKey } from './i18n.ts'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: UIKey) => string
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
