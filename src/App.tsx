import { useEffect, useRef, useState } from 'react'
import { cv } from './data/cv'
import { useLanguage } from './useLanguage.ts'
import { localize, type UIKey } from './i18n.ts'
import photo from './assets/photo.jpg'
import './App.css'

type Theme = 'dark' | 'light'

const THEME_KEY = 'cv-theme'

const PrintIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v8H6z" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
)

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.65 9.65 0 0 1 12 6.8c.85.004 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5v-1.3h-3v8.2h3v-4.6c0-1.4.5-2.4 1.8-2.4 1.1 0 1.6.8 1.6 2.3v4.7h3zM6.5 7.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM8 18.5v-8.2H5v8.2h3z" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.08.72 3.06a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.02-1.32a2 2 0 0 1 2.11-.45c.98.35 2.01.59 3.06.72A2 2 0 0 1 22 16.92z" />
  </svg>
)

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem(THEME_KEY) as Theme | null
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return [theme, toggle]
}

function Header({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const { lang, setLang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const nav: { id: string; key: UIKey }[] = [
    { id: 'about', key: 'about' },
    { id: 'experience', key: 'experience' },
    { id: 'skills', key: 'skills' },
    { id: 'projects', key: 'projects' },
    { id: 'contact', key: 'contact' },
  ]

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 760px)')
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <header ref={headerRef} className={`cv-header${menuOpen ? ' is-nav-open' : ''}`}>
      <a href="#" className="cv-logo">
        <span className="cv-logo-mark">SE</span>
        <span className="cv-logo-name">{cv.name}</span>
      </a>
      <nav id="cv-site-nav" className="cv-nav" aria-label={t('menu')}>
        {nav.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className="cv-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            {t(link.key)}
          </a>
        ))}
      </nav>
      <div className="cv-header-actions">
        <button
          className="cv-lang-toggle"
          onClick={() => setLang(lang === 'en' ? 'is' : 'en')}
          aria-label={lang === 'en' ? 'Switch to Icelandic' : 'Switch to English'}
        >
          {lang === 'en' ? 'IS' : 'EN'}
        </button>
        <button className="cv-theme-toggle" onClick={onToggle} aria-label="Toggle theme">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          type="button"
          className="cv-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="cv-site-nav"
          aria-label={t('menu')}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="cv-section-title">{children}</h2>
}

function Hero() {
  const { lang, t } = useLanguage()
  const profile = localize(cv as Record<string, unknown>, lang) as typeof cv

  return (
    <section className="cv-hero" id="about">
      <div className="cv-hero-content">
        <span className="cv-eyebrow">{profile.title}</span>
        <h1 className="cv-hero-name">{profile.name}</h1>
        <p className="cv-hero-summary">{profile.summary}</p>
        <div className="cv-hero-actions">
          <button type="button" className="cv-button cv-button-primary" onClick={() => window.print()}>
            <PrintIcon />
            {t('print')}
          </button>
          <a className="cv-button cv-button-outline" href={`mailto:${cv.email}`}>
            {t('contactMe')}
            <ArrowIcon />
          </a>
        </div>
      </div>
      <div className="cv-hero-image">
        <img src={photo} alt={profile.name} />
      </div>
    </section>
  )
}

function AboutSkills() {
  const { lang, t } = useLanguage()
  const profile = localize(cv as Record<string, unknown>, lang) as typeof cv

  return (
    <section className="cv-section cv-two-col" id="skills">
      <div className="cv-card">
        <SectionTitle>{t('aboutMe')}</SectionTitle>
        <p>{profile.summary}</p>
        <a href={`mailto:${cv.email}`} className="cv-link">
          {t('contactMe')} <ArrowIcon />
        </a>
      </div>
      <div className="cv-card">
        <SectionTitle>{t('technicalSkills')}</SectionTitle>
        <div className="cv-skills-grid">
          {profile.skillCategories?.map((group) => {
            const localizedGroup = localize(group as Record<string, unknown> & typeof group, lang)
            return (
              <div key={localizedGroup.category} className="cv-skill-group">
                <h3>{localizedGroup.category}</h3>
                <p>{localizedGroup.items.join(' • ')}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  const { lang, t } = useLanguage()

  return (
    <section className="cv-section cv-two-col" id="experience">
      <div className="cv-card">
        <SectionTitle>{t('experience')}</SectionTitle>
        <div className="cv-timeline">
          {cv.experience.map((exp, i) => {
            const e = localize(exp as Record<string, unknown> & typeof exp, lang)
            return (
              <article className="cv-timeline-item" key={`${e.company}-${e.role}-${i}`}>
                <h3>{e.role}</h3>
                <p className="cv-timeline-meta">
                  {e.company} <span>•</span> {e.start} – {e.end === 'Present' ? t('present') : e.end}
                </p>
                <p>{e.description}</p>
              </article>
            )
          })}
        </div>
      </div>
      <div className="cv-card cv-featured" id="projects">
        <SectionTitle>{t('projects')}</SectionTitle>
        <div className="cv-projects-list">
          {cv.projects.map((project) => {
            const p = localize(project as Record<string, unknown> & typeof project, lang)
            return (
              <article className="cv-project-item" key={p.name}>
                <h3>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.name} <ArrowIcon />
                  </a>
                </h3>
                <p>{p.description}</p>
                <div className="cv-featured-points">
                  {p.tech.split(',').map((tTech) => (
                    <span key={`${p.name}-${tTech.trim()}`} className="cv-featured-point">
                      {tTech.trim()}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function EducationLanguagesReferences() {
  const { lang, t } = useLanguage()

  return (
    <section className="cv-section cv-two-col" id="education">
      <div className="cv-card">
        <SectionTitle>{t('education')}</SectionTitle>
        <div className="cv-timeline">
          {cv.education.map((edu, i) => {
            const e = localize(edu as Record<string, unknown> & typeof edu, lang)
            return (
              <article className="cv-timeline-item" key={`${e.institution}-${e.degree}-${i}`}>
                <h3>{e.degree}</h3>
                <p className="cv-timeline-meta">
                  {e.institution} <span>•</span> {e.start} – {e.end}
                </p>
              </article>
            )
          })}
        </div>
      </div>
      <div className="cv-card cv-info">
        <SectionTitle>{t('languages')}</SectionTitle>
        <ul className="cv-language-list">
          {cv.languages?.map((language) => {
            const l = localize(language as Record<string, unknown> & typeof language, lang)
            return (
              <li key={l.name}>
                <strong>{l.name}</strong>
                <span>{l.proficiency}</span>
              </li>
            )
          })}
        </ul>
        <SectionTitle>{t('references')}</SectionTitle>
        <ul className="cv-reference-list">
          {cv.references?.map((reference) => {
            const r = localize(reference as Record<string, unknown> & typeof reference, lang)
            return (
              <li key={r.name}>
                <strong>{r.name}</strong>
                <span>{r.role}, {r.company}</span>
                <span>{t('availableOnRequest')}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function Stats() {
  const { lang } = useLanguage()

  return (
    <section className="cv-section cv-stats">
      {cv.stats?.map((stat) => {
        const s = localize(stat as Record<string, unknown> & typeof stat, lang)
        return (
          <div key={s.label} className="cv-stat">
            <span className="cv-stat-value">{s.value}</span>
            <span className="cv-stat-label">{s.label}</span>
          </div>
        )
      })}
    </section>
  )
}

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="cv-footer" id="contact">
      <div className="cv-footer-brand">
        <span className="cv-logo-mark">SE</span>
        <div>
          <strong>{cv.name}</strong>
          <p>{t('buildingSolutions')}</p>
        </div>
      </div>
      <div className="cv-footer-contact">
        <h3>{t('getInTouch')}</h3>
        <ul>
          {cv.phone && (
            <li>
              <PhoneIcon />
              <a href={`tel:${cv.phone.replace(/\s/g, '')}`}>{cv.phone}</a>
            </li>
          )}
          {cv.email && (
            <li>
              <MailIcon />
              <a href={`mailto:${cv.email}`}>{cv.email}</a>
            </li>
          )}
          {cv.website && (
            <li>
              <GlobeIcon />
              <a href={cv.website} target="_blank" rel="noopener noreferrer">
                {cv.website.replace(/^https?:\/\//, '')}
              </a>
            </li>
          )}
          {cv.linkedin && (
            <li>
              <LinkedInIcon />
              <a href={cv.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn Profile
              </a>
            </li>
          )}
          {cv.github && (
            <li>
              <GithubIcon />
              <a href={cv.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  )
}

function App() {
  const [theme, toggleTheme] = useTheme()

  return (
    <div className="cv-page">
      <Header theme={theme} onToggle={toggleTheme} />
      <main className="cv-main">
        <Hero />
        <AboutSkills />
        <Experience />
        <EducationLanguagesReferences />
        <Stats />
      </main>
      <Footer />
    </div>
  )
}

export default App
