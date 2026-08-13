import { useEffect, useState } from 'react'
import { cv } from './data/cv'
import photo from './assets/photo.jpg'
import './App.css'

const PASSWORD = 'SoldisEbba'
const STORAGE_KEY = 'cv-unlocked'

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
    <rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M8 11V7a4 4 0 0 1 8 0v4"
    />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
    />
    <path fill="none" stroke="currentColor" strokeWidth="2" d="m22 6-10 7L2 6" />
  </svg>
)

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
    />
  </svg>
)

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.65 9.65 0 0 1 12 6.8c.85.004 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path
      fill="currentColor"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5v-1.3h-3v8.2h3v-4.6c0-1.4.5-2.4 1.8-2.4 1.1 0 1.6.8 1.6 2.3v4.7h3zM6.5 7.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM8 18.5v-8.2H5v8.2h3z"
    />
  </svg>
)

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
    />
  </svg>
)

const ContactLink = ({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) => (
  <a
    className="cv-contact-link"
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
    <span>{label}</span>
  </a>
)

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <div className="cv-password-gate">
      <div className="cv-password-card">
        <LockIcon />
        <h1>{cv.name}</h1>
        <p className="cv-password-subtitle">Private CV — password required</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(false)
            }}
            placeholder="Enter password"
            autoFocus
          />
          {error && (
            <p className="cv-password-error">Incorrect password. Try again.</p>
          )}
          <button type="submit">Unlock</button>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY) === 'true'
      : false
  )

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true)
    }
  }, [])

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  const websiteLabel = cv.website.replace(/^https?:\/\//, '')
  const githubHandle = cv.github.replace(/^https?:\/\/github\.com\//, '')

  return (
    <div className="cv">
      <div className="cv-layout">
        <aside className="cv-sidebar">
          <div className="cv-identity">
            <img className="cv-photo" src={photo} alt={cv.name} />
            <h1>{cv.name}</h1>
            <p className="cv-title">{cv.title}</p>
          </div>

          <div className="cv-contact">
            {cv.email && (
              <ContactLink
                href={`mailto:${cv.email}`}
                icon={<MailIcon />}
                label={cv.email}
              />
            )}
            {cv.website && (
              <ContactLink
                href={cv.website}
                icon={<GlobeIcon />}
                label={websiteLabel}
              />
            )}
            {cv.github && (
              <ContactLink
                href={cv.github}
                icon={<GithubIcon />}
                label={githubHandle}
              />
            )}
            {cv.linkedin && (
              <ContactLink
                href={cv.linkedin}
                icon={<LinkedInIcon />}
                label="LinkedIn"
              />
            )}
          </div>

          <div className="cv-sidebar-section">
            <h2>Skills</h2>
            <ul className="cv-skills">
              {cv.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="cv-main">
          <section>
            <h2>About</h2>
            <p className="cv-summary">{cv.summary}</p>
          </section>

          <section>
            <h2>Experience</h2>
            {cv.experience.map((exp) => (
              <article className="cv-item" key={`${exp.company}-${exp.role}`}>
                <header>
                  <h3>
                    {exp.role} <span className="cv-at">@ {exp.company}</span>
                  </h3>
                  <p className="cv-date">
                    {exp.start} – {exp.end}
                  </p>
                </header>
                <p>{exp.description}</p>
              </article>
            ))}
          </section>

          <section>
            <h2>Projects</h2>
            {cv.projects.map((project) => (
              <article className="cv-item" key={project.name}>
                <header>
                  <h3>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.name}
                      <ExternalIcon />
                    </a>
                  </h3>
                  {project.tech && (
                    <div className="cv-tech-list">
                      {project.tech.split(',').map((t) => (
                        <span className="cv-tech" key={t.trim()}>
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </header>
                <p>{project.description || 'No description provided.'}</p>
              </article>
            ))}
          </section>

          <section>
            <h2>Education</h2>
            {cv.education.map((edu) => (
              <article className="cv-item" key={`${edu.institution}-${edu.degree}`}>
                <header>
                  <h3>
                    {edu.degree}{' '}
                    <span className="cv-at">@ {edu.institution}</span>
                  </h3>
                  <p className="cv-date">
                    {edu.start} – {edu.end}
                  </p>
                </header>
              </article>
            ))}
          </section>
        </main>
      </div>

      <footer className="cv-footer">
        <p>
          Built with <a href="https://react.dev">React</a> and{' '}
          <a href="https://vitejs.dev">Vite</a>.
        </p>
      </footer>
    </div>
  )
}

export default App
