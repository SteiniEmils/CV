import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dataPath = path.join(__dirname, '..', 'data', 'cv.json')
const outPath = path.join(__dirname, '..', 'src', 'data', 'cv.ts')

const types = `export type Experience = {
  company: string
  role: string
  start: string
  end: string
  description: string
}

export type Education = {
  institution: string
  degree: string
  start: string
  end: string
}

export type Project = {
  name: string
  description: string
  url: string
  tech: string
  cover: string
  logo: string
  featured: boolean
  images: string[]
}

export type Stat = {
  value: string
  label: string
}

export type SkillCategory = {
  category: string
  items: string[]
}

export type Certification = {
  name: string
  issuer: string
  purpose: string
  logo: string
  status: 'doing' | 'done' | 'not-started'
}

export type SiteSettings = {
  appearance: 'default' | 'paper'
  colorScheme: 'light' | 'dark'
}`

export const OPTIMIZED_UPLOAD_URLS = {
  '/uploads/chatgpt-image-jun-3-2026-12-50-15-am-21b510bf.png': '/images/projects/shamba/cover.jpg',
  '/uploads/chatgpt-image-jun-3-2026-01-26-14-pm-502a6b1b.png': '/images/projects/shamba/01.jpg',
  '/uploads/chatgpt-image-jun-3-2026-12-12-25-am-e5b52f50.png': '/images/projects/shamba/02.jpg',
  '/uploads/chatgpt-image-jun-3-2026-12-12-25-am2-a94e039a.png': '/images/projects/shamba/03.jpg',
  '/uploads/chatgpt-image-jun-3-2026-12-50-15-am-e3f55bce.png': '/images/projects/shamba/04.jpg',
  '/uploads/chatgpt-image-jun-4-2026-02-57-12-pm-404e7a05.png': '/images/projects/shamba/05.jpg',
  '/uploads/a-clean-high-end-product-mockup-advertis-63fdd2c6.png': '/images/projects/hringr/cover.jpg',
  '/uploads/a-clean-commercial-product-poster-lookbo-05f5aec3.png': '/images/projects/hringr/01.jpg',
  '/uploads/a-clean-product-mockup-catalog-style-com-68163eb6.png': '/images/projects/hringr/02.jpg',
  '/uploads/a-clean-professional-product-tech-pack-c-b03ed1a4.png': '/images/projects/hringr/03.jpg',
  '/uploads/a-clean-technical-product-specification--8f3ce273.png': '/images/projects/hringr/04.jpg',
  '/uploads/a-detailed-product-design-spec-tech-pack-432d569a.png': '/images/projects/hringr/05.jpg',
  '/uploads/a-digital-photograph-features-a-black-ho-347305df.png': '/images/projects/hringr/06.jpg',
  '/uploads/a-digital-photograph-showcases-the-back--b9c74977.png': '/images/projects/hringr/07.jpg',
  '/uploads/a-gritty-vintage-styled-skatewear-advert-2ec24d0c.png': '/images/projects/hringr/08.jpg',
  '/uploads/a-high-quality-product-promotional-poste-253353b7.png': '/images/projects/hringr/09.jpg',
  '/uploads/a-studio-fashion-photoshoot-scene-with-a-df51a058.png': '/images/projects/hringr/10.jpg',
  '/uploads/a-studio-fashion-portrait-scene-a-young--6c0128f5.png': '/images/projects/hringr/11.jpg',
  '/uploads/wide-outdoor-action-photograph-of-a-skat-3a0dba20.png': '/images/projects/hringr/12.jpg',
}

export function rewriteOptimizedImageUrls(data) {
  if (!data || !Array.isArray(data.projects)) return false
  let changed = false
  for (const project of data.projects) {
    const nextCover = OPTIMIZED_UPLOAD_URLS[project.cover]
    if (nextCover && nextCover !== project.cover) {
      project.cover = nextCover
      changed = true
    }
    if (!Array.isArray(project.images)) continue
    project.images = project.images.map((src) => {
      const next = OPTIMIZED_UPLOAD_URLS[src]
      if (next && next !== src) {
        changed = true
        return next
      }
      return src
    })
  }
  return changed
}

function toPublicCv(data) {
  const clone = structuredClone(data)
  rewriteOptimizedImageUrls(clone)
  if (Array.isArray(clone.certifications)) {
    clone.certifications = clone.certifications.filter(
      (cert) => cert.status === 'done' || cert.status === 'doing'
    )
  }
  if (Array.isArray(clone.references)) {
    clone.references = clone.references.map((ref) => {
      const publicRef = { ...ref }
      delete publicRef.phone
      delete publicRef.email
      return publicRef
    })
  }
  return clone
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
}

function updateIndexMeta(data) {
  const rootDir = path.join(__dirname, '..')
  const indexPath = path.join(rootDir, 'index.html')
  const photoSrc = path.join(rootDir, 'src', 'assets', 'photo.jpg')
  const photoDest = path.join(rootDir, 'public', 'images', 'profile.jpg')
  const siteUrl = String(data.website || 'https://steiniemils.com').replace(/\/$/, '')
  const name = String(data.name || 'CV')
  const role = String(data.title || 'Developer')
  const description = String(data.hook || data.summary || `Personal CV of ${name}`).slice(0, 200)
  const pageTitle = `${name} — ${role}`
  const canonical = `${siteUrl}/`
  const imageUrl = `${siteUrl}/images/profile.jpg`

  if (fs.existsSync(photoSrc)) {
    fs.mkdirSync(path.dirname(photoDest), { recursive: true })
    fs.copyFileSync(photoSrc, photoDest)
  }

  const meta = [
    `<title>${escapeHtml(pageTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="author" content="${escapeHtml(name)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(name)}" />`,
    `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta property="og:locale" content="en_IS" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
  ].join('\n    ')

  let html = fs.readFileSync(indexPath, 'utf-8')
  if (!html.includes('<!-- cv-meta:start -->')) {
    throw new Error('index.html is missing cv-meta markers')
  }
  html = html.replace(
    /<!-- cv-meta:start -->[\s\S]*?<!-- cv-meta:end -->/,
    `<!-- cv-meta:start -->\n    ${meta}\n    <!-- cv-meta:end -->`,
  )
  fs.writeFileSync(indexPath, html)
}

function normalizeSettings(raw) {
  const value = raw && typeof raw === 'object' ? raw : {}
  return {
    appearance: value.appearance === 'paper' ? 'paper' : 'default',
    colorScheme: value.colorScheme === 'dark' ? 'dark' : 'light',
  }
}

function updateSiteSettings(data) {
  const rootDir = path.join(__dirname, '..')
  const indexPath = path.join(rootDir, 'index.html')
  const settings = normalizeSettings(data.settings)
  const json = JSON.stringify(settings)

  let html = fs.readFileSync(indexPath, 'utf-8')
  if (!html.includes('<!-- cv-settings:start -->')) {
    throw new Error('index.html is missing cv-settings markers')
  }
  html = html.replace(
    /<!-- cv-settings:start -->[\s\S]*?<!-- cv-settings:end -->/,
    `<!-- cv-settings:start -->\n    <script id="cv-site-settings" type="application/json">${json}</script>\n    <!-- cv-settings:end -->`,
  )
  fs.writeFileSync(indexPath, html)
}

export function generateCv() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const publicData = toPublicCv(data)
  const cvString = JSON.stringify(publicData, null, 2)
  const file = `// Auto-generated from data/cv.json. Do not edit this file by hand.\n\n${types}\n\nexport const cv = ${cvString} as const\n`
  fs.writeFileSync(outPath, file)
  updateIndexMeta(data)
  updateSiteSettings(data)
  console.log('Generated src/data/cv.ts from data/cv.json')
  console.log('Updated index.html meta from data/cv.json')
  console.log('Updated index.html site settings from data/cv.json')
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (invokedDirectly) generateCv()
