import { cv } from './data/cv'
import './App.css'

function App() {
  return (
    <div className="cv">
      <header className="cv-header">
        <h1>{cv.name}</h1>
        <p className="cv-title">{cv.title}</p>
        <div className="cv-contact">
          {cv.location && <span>{cv.location}</span>}
          {cv.email && <a href={`mailto:${cv.email}`}>{cv.email}</a>}
          {cv.github && (
            <a href={cv.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {cv.website && (
            <a href={cv.website} target="_blank" rel="noopener noreferrer">
              Website
            </a>
          )}
          {cv.linkedin && (
            <a href={cv.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          )}
        </div>
      </header>

      <main>
        <section>
          <h2>About</h2>
          <p>{cv.summary}</p>
        </section>

        <section>
          <h2>Skills</h2>
          <ul className="cv-skills">
            {cv.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Experience</h2>
          {cv.experience.map((exp) => (
            <div className="cv-item" key={`${exp.company}-${exp.role}`}>
              <h3>
                {exp.role} <span className="cv-at">@ {exp.company}</span>
              </h3>
              <p className="cv-date">
                {exp.start} – {exp.end}
              </p>
              <p>{exp.description}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Projects</h2>
          {cv.projects.map((project) => (
            <div className="cv-item" key={project.name}>
              <h3>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.name}
                </a>
                {project.tech && (
                  <span className="cv-tech">{project.tech}</span>
                )}
              </h3>
              <p>{project.description || 'No description provided.'}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Education</h2>
          {cv.education.map((edu) => (
            <div className="cv-item" key={`${edu.institution}-${edu.degree}`}>
              <h3>
                {edu.degree} <span className="cv-at">@ {edu.institution}</span>
              </h3>
              <p className="cv-date">
                {edu.start} – {edu.end}
              </p>
            </div>
          ))}
        </section>
      </main>

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
