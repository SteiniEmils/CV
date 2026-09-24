import { useEffect } from 'react'
import { cv } from './data/cv'
import { localize } from './i18n.ts'
import { useLanguage } from './useLanguage.ts'

function fillPlaceholders(text: string) {
  const site = String(cv.website || 'https://steiniemils.com').replace(/^https?:\/\//, '')
  return String(text || '')
    .replaceAll('{name}', cv.name)
    .replaceAll('{email}', cv.email)
    .replaceAll('{site}', site)
}

function paragraphs(body: string) {
  return fillPlaceholders(body)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function PrivacyPage() {
  const { lang } = useLanguage()
  const page = localize(cv.privacy as Record<string, unknown>, lang) as {
    title?: string
    updated?: string
    sections?: Array<{ heading?: string; body?: string; items?: string[] }>
  }
  const title = page.title || (lang === 'is' ? 'Persónuvernd' : 'Privacy')
  const sections = Array.isArray(page.sections) ? page.sections : []

  useEffect(() => {
    const previous = document.title
    document.title = `${title} — ${cv.name}`
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <article className="cv-card cv-privacy">
      <h1 className="cv-section-title">{title}</h1>
      {page.updated ? <p className="cv-privacy-updated">{page.updated}</p> : null}
      {sections.map((raw, index) => {
        const section = localize(raw as Record<string, unknown>, lang) as {
          heading?: string
          body?: string
          items?: string[]
        }
        const items = Array.isArray(section.items)
          ? section.items.map((item) => fillPlaceholders(item)).filter(Boolean)
          : []
        return (
          <section key={`${section.heading || 'section'}-${index}`}>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {paragraphs(String(section.body || '')).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {items.length > 0 ? (
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        )
      })}
    </article>
  )
}
