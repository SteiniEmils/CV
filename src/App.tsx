import { useEffect, useState } from 'react'
import { cv } from './data/cv'
import photo from './assets/photo.jpg'
import './App.css'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'cv-theme'

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10 12 15 17 10" />
    <path d="M12 15V3" />
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

const navLinks = ['About', 'Experience', 'Skills', 'Projects', 'Contact']

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return [theme, toggle]
}

function Header({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <header className="cv-header">
      <a href="#" className="cv-logo">
        <span className="cv-logo-mark">SE</span>
        <span className="cv-logo-name">{cv.name}</span>
      </a>
      <nav className="cv-nav">
        {navLinks.map((link) => (
          <a key={link} href={`#${link.toLowerCase()}`} className="cv-nav-link">
            {link}
          </a>
        ))}
      </nav>
      <button className="cv-theme-toggle" onClick={onToggle} aria-label="Toggle theme">
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
}

function Hero() {
  return (
    <section className="cv-hero" id="about">
      <div className="cv-hero-content">
        <span className="cv-eyebrow">{cv.title}</span>
        <h1 className="cv-hero-name">{cv.name}</h1>
        <p className="cv-hero-summary">{cv.summary}</p>
        <div className="cv-hero-actions">
          <button className="cv-button cv-button-primary" onClick={() => window.print()}>
            <DownloadIcon />
            Download CV
          </button>
          <a className="cv-button cv-button-outline" href={`mailto:${cv.email}`}>
            Contact me
            <ArrowIcon />
          </a>
        </div>
      </div>
      <div className="cv-hero-image">
        <img src={photo} alt={cv.name} />
      </div>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="cv-section-title">{children}</h2>
}

function AboutSkills() {
  return (
    <section className="cv-section cv-two-col" id="skills">
      <div className="cv-card">
        <SectionTitle>About Me</SectionTitle>
        <p>{cv.summary}</p>
        <a href={`mailto:${cv.email}`} className="cv-link">
          Learn more <ArrowIcon />
        </a>
      </div>
      <div className="cv-card">
        <SectionTitle>Technical Skills</SectionTitle>
        <div className="cv-skills-grid">
          {cv.skillCategories?.map((group) => (
            <div key={group.category} className="cv-skill-group">
              <h3>{group.category}</h3>
              <p>{group.items.join(' • ')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section className="cv-section cv-two-col" id="experience">
      <div className="cv-card">
        <SectionTitle>Experience</SectionTitle>
        <div className="cv-timeline">
          {cv.experience.map((exp) => (
            <article className="cv-timeline-item" key={`${exp.company}-${exp.role}`}>
              <h3>{exp.role}</h3>
              <p className="cv-timeline-meta">
                {exp.company} <span>•</span> {exp.start} – {exp.end}
              </p>
              <p>{exp.description}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="cv-card cv-featured" id="projects">
        <SectionTitle>Featured Project</SectionTitle>
        {cv.projects.slice(0, 1).map((project) => (
          <article key={project.name}>
            <h3>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {project.name} <ArrowIcon />
              </a>
            </h3>
            <p>{project.description}</p>
            <div className="cv-featured-points">
              {project.tech.split(',').map((t) => (
                <span key={t.trim()} className="cv-featured-point">
                  {t.trim()}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Stats() {
  return (
    <section className="cv-section cv-stats">
      {cv.stats?.map((stat) => (
        <div key={stat.label} className="cv-stat">
          <span className="cv-stat-value">{stat.value}</span>
          <span className="cv-stat-label">{stat.label}</span>
        </div>
      ))}
    </section>
  )
}

function Footer() {
  return (
    <footer className="cv-footer" id="contact">
      <div className="cv-footer-brand">
        <span className="cv-logo-mark">SE</span>
        <div>
          <strong>{cv.name}</strong>
          <p>Building solutions, delivering results.</p>
        </div>
      </div>
      <div className="cv-footer-contact">
        <h3>Get in touch</h3>
        <ul>
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
          {cv.github && !cv.linkedin && (
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
        <Stats />
      </main>
      <Footer />
    </div>
  )
}

export default App
