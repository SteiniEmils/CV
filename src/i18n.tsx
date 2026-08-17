import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { ui, type Lang, type UIKey } from './i18n.ts'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: UIKey) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'cv-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved === 'en' || saved === 'is') return saved
    return navigator.language.toLowerCase().startsWith('is') ? 'is' : 'en'
  })

  const setLang = useCallback((value: Lang) => setLangState(value), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = useCallback((key: UIKey) => ui[lang][key], [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
