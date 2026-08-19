import crypto from 'crypto'
import { execFile } from 'child_process'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateCv } from '../scripts/generate-cv.js'
import { createAnalytics } from './analytics.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const dataDir = path.join(rootDir, 'data')
const dataPath = path.join(dataDir, 'cv.json')
const dataSeedPath = path.join(rootDir, 'data-seed', 'cv.json')
const uploadsDir = path.join(dataDir, 'uploads')
const adminDir = path.join(__dirname, 'admin')
const distDir = path.join(rootDir, 'dist')
const ALLOWED_UPLOAD_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])
const loginHtml = path.join(adminDir, 'login.html')
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')

const SESSION_COOKIE = 'cv_session'
const BUILD_TIMEOUT_MS = 90_000
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const isProduction = process.env.NODE_ENV === 'production'
const isDev = !isProduction

if (isProduction) {
  const missing = ['ADMIN_PASSWORD', 'SESSION_SECRET'].filter((name) => !process.env[name]?.trim())
  if (missing.length) {
    console.error(`Fatal: ${missing.join(' and ')} must be set in production. Refusing to start.`)
    process.exit(1)
  }
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || (isDev ? 'cv-admin' : '')
const SESSION_SECRET = process.env.SESSION_SECRET?.trim() || (isDev ? crypto.randomBytes(32).toString('hex') : '')

if (isProduction && ADMIN_PASSWORD === 'cv-admin') {
  console.error('Fatal: the development default password is not allowed in production. Set a strong ADMIN_PASSWORD.')
  process.exit(1)
}

if (!isProduction && !process.env.ADMIN_PASSWORD?.trim()) {
  console.warn('Warning: ADMIN_PASSWORD is unset; using the documented development default. Set ADMIN_PASSWORD before deploying.')
}
if (!isProduction && !process.env.SESSION_SECRET?.trim()) {
  console.warn('Warning: SESSION_SECRET is unset; using an ephemeral development secret. Sessions reset on restart.')
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: isProduction,
  maxAge: SESSION_TTL_MS
}

const sessions = new Map()
let saveChain = Promise.resolve()

function parseCookies(req) {
  const header = req.headers.cookie || ''
  const out = {}
  for (const part of header.split(';')) {
    if (!part) continue
    const [k, ...rest] = part.trim().split('=')
    if (!k) continue
    try {
      out[k] = decodeURIComponent(rest.join('='))
    } catch {
      out[k] = rest.join('=')
    }
  }
  return out
}

function sign(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex')
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a), 'utf8')
  const right = Buffer.from(String(b), 'utf8')
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

function passwordMatches(input) {
  const given = crypto.createHash('sha256').update(String(input ?? '')).digest()
  const expected = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest()
  return crypto.timingSafeEqual(given, expected)
}

function pruneSessions() {
  const now = Date.now()
  for (const [id, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(id)
  }
}

function createSessionToken() {
  pruneSessions()
  const id = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + SESSION_TTL_MS
  sessions.set(id, { expiresAt })
  const payload = `${id}.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

function readSession(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [id, expiresRaw, signature] = parts
  const payload = `${id}.${expiresRaw}`
  if (!safeEqual(sign(payload), signature)) return null
  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    sessions.delete(id)
    return null
  }
  const stored = sessions.get(id)
  if (!stored || stored.expiresAt !== expiresAt) return null
  return { id, expiresAt }
}

function isAuthenticated(req) {
  return Boolean(readSession(parseCookies(req)[SESSION_COOKIE]))
}

function setAuthCookie(res) {
  res.cookie(SESSION_COOKIE, createSessionToken(), cookieOptions)
}

function clearAuthCookie(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction
  })
}

function destroySession(token) {
  const session = readSession(token)
  if (session) sessions.delete(session.id)
}

function enqueueSave(task) {
  const run = saveChain.then(task, task)
  saveChain = run.then(() => undefined, () => undefined)
  return run
}

function atomicWriteFile(filePath, contents) {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  const tmp = path.join(dir, `.${path.basename(filePath)}.${process.pid}.tmp`)
  fs.writeFileSync(tmp, contents)
  try {
    fs.renameSync(tmp, filePath)
  } catch (err) {
    if (err.code === 'EXDEV' || err.code === 'EEXIST' || err.code === 'EPERM' || process.platform === 'win32') {
      fs.copyFileSync(tmp, filePath)
      fs.unlinkSync(tmp)
    } else {
      try { fs.unlinkSync(tmp) } catch {}
      throw err
    }
  }
}

const analytics = createAnalytics({ dataDir, atomicWriteFile })

function distHasIndex(dir) {
  return fs.existsSync(path.join(dir, 'index.html'))
}

function isCrossDeviceError(err) {
  return Boolean(err && (err.code === 'EXDEV' || err.code === 'EPERM' || err.code === 'EBUSY'))
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  fs.cpSync(src, dest, { recursive: true, force: true })
}

function restoreLiveDist(fromDir) {
  if (!distHasIndex(fromDir)) return false
  copyDir(fromDir, distDir)
  return distHasIndex(distDir)
}

function recoverLiveDist() {
  if (distHasIndex(distDir)) return true
  const oldDir = path.join(rootDir, 'dist-old')
  const nextDir = path.join(rootDir, 'dist-next')
  if (distHasIndex(oldDir) && restoreLiveDist(oldDir)) {
    console.warn('Restored dist from dist-old after failed rebuild')
    return true
  }
  if (distHasIndex(nextDir) && restoreLiveDist(nextDir)) {
    console.warn('Installed dist-next in place after failed swap')
    return true
  }
  return distHasIndex(distDir)
}

function swapDist(nextDir) {
  if (!distHasIndex(nextDir)) {
    throw new Error('Rebuild output is missing index.html')
  }

  const oldDir = path.join(rootDir, 'dist-old')
  fs.rmSync(oldDir, { recursive: true, force: true })

  try {
    if (fs.existsSync(distDir)) fs.renameSync(distDir, oldDir)
    fs.renameSync(nextDir, distDir)
    fs.rmSync(oldDir, { recursive: true, force: true })
    return
  } catch (err) {
    if (!isCrossDeviceError(err)) {
      if (!distHasIndex(distDir)) {
        try { restoreLiveDist(oldDir) } catch {}
      }
      throw err
    }
  }

  // Cross-device: never rename/delete live dist first. Copy the new build over it in place.
  try {
    if (distHasIndex(distDir) && !distHasIndex(oldDir)) {
      copyDir(distDir, oldDir)
    }
    copyDir(nextDir, distDir)
    if (!distHasIndex(distDir)) {
      throw new Error('Cross-device dist copy produced no index.html')
    }
    fs.rmSync(nextDir, { recursive: true, force: true })
    fs.rmSync(oldDir, { recursive: true, force: true })
  } catch (err) {
    if (!distHasIndex(distDir)) {
      try { restoreLiveDist(oldDir) } catch {}
    }
    throw err
  }
}

function rebuildFrontend() {
  if (!fs.existsSync(viteBin)) {
    return Promise.reject(new Error('Vite is not installed; cannot rebuild the live site'))
  }
  generateCv()
  const outDir = path.join(rootDir, 'dist-next')
  fs.rmSync(outDir, { recursive: true, force: true })
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [viteBin, 'build', '--outDir', outDir, '--emptyOutDir'],
      {
        cwd: rootDir,
        timeout: BUILD_TIMEOUT_MS,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env }
      },
      (err, stdout, stderr) => {
        if (err) {
          fs.rmSync(outDir, { recursive: true, force: true })
          const timedOut = Boolean(err.killed)
          const detail = String(stderr || err.message || '').trim()
          reject(new Error(timedOut ? 'Site rebuild timed out' : (detail || 'Site rebuild failed')))
          return
        }
        try {
          swapDist(outDir)
          resolve(stdout)
        } catch (swapErr) {
          if (distHasIndex(distDir)) {
            fs.rmSync(outDir, { recursive: true, force: true })
          }
          reject(swapErr)
        }
      }
    )
  })
}

function namedCertifications(list) {
  if (!Array.isArray(list)) return []
  return list.filter((cert) => String(cert?.name || '').trim())
}

function namedProjects(list) {
  if (!Array.isArray(list)) return []
  return list.filter((project) => String(project?.name || '').trim())
}

function ensureUploadsDir() {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

function safeUploadName(original) {
  const ext = path.extname(String(original || '')).toLowerCase()
  if (!ALLOWED_UPLOAD_EXTS.has(ext)) return null
  const base = path.basename(String(original), ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image'
  return `${base}-${crypto.randomBytes(4).toString('hex')}${ext}`
}

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(dataSeedPath)) {
    if (!fs.existsSync(dataPath)) {
      console.error('Fatal: data/cv.json is missing and no seed file was found at data-seed/cv.json')
      process.exit(1)
    }
    return
  }
  if (!fs.existsSync(dataPath)) {
    fs.copyFileSync(dataSeedPath, dataPath)
    console.log('Initialized data/cv.json from seed')
    return
  }

  const current = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  const seed = JSON.parse(fs.readFileSync(dataSeedPath, 'utf-8'))
  const added = []
  for (const key of Object.keys(seed)) {
    if (key === 'certifications') continue
    if (!(key in current)) {
      current[key] = seed[key]
      added.push(key)
    }
  }
  const seedCerts = namedCertifications(seed.certifications)
  if (seedCerts.length > 0 && namedCertifications(current.certifications).length === 0) {
    current.certifications = seed.certifications
    added.push('certifications')
  } else if (Array.isArray(current.certifications) && Array.isArray(seed.certifications)) {
    const byName = new Map(seed.certifications.map((cert) => [cert.name, cert]))
    for (const cert of current.certifications) {
      const fromSeed = byName.get(cert.name)
      if (!fromSeed) continue
      for (const field of ['logo', 'purpose', 'issuer']) {
        if (!String(cert[field] || '').trim() && fromSeed[field]) {
          cert[field] = fromSeed[field]
          if (!added.includes('certifications')) added.push('certifications')
        }
      }
    }
  }
  if (Array.isArray(seed.projects)) {
    if (!Array.isArray(current.projects)) current.projects = []
    const have = new Set(namedProjects(current.projects).map((project) => project.name))
    for (const project of namedProjects(seed.projects)) {
      if (have.has(project.name)) continue
      current.projects.push(project)
      have.add(project.name)
      if (!added.includes('projects')) added.push('projects')
    }
    const byName = new Map(seed.projects.map((project) => [project.name, project]))
    for (const project of current.projects) {
      const fromSeed = byName.get(project.name)
      if (!fromSeed) continue
      for (const field of ['cover', 'logo']) {
        if (!String(project[field] || '').trim() && fromSeed[field]) {
          project[field] = fromSeed[field]
          if (!added.includes('projects')) added.push('projects')
        }
      }
      if (!('featured' in project) && 'featured' in fromSeed) {
        project.featured = fromSeed.featured
        if (!added.includes('projects')) added.push('projects')
      }
      const seedImages = Array.isArray(fromSeed.images) ? fromSeed.images.filter(Boolean) : []
      if ((!Array.isArray(project.images) || project.images.length === 0) && seedImages.length > 0) {
        project.images = seedImages
        if (!added.includes('projects')) added.push('projects')
      }
    }
  }
  if (added.length === 0) return
  atomicWriteFile(dataPath, JSON.stringify(current, null, 2) + '\n')
  console.log('Merged missing fields from seed into data/cv.json:', added.join(', '))
}

function apiAuth(req, res, next) {
  if (isAuthenticated(req)) return next()
  res.status(401).json({ error: 'Unauthorized' })
}

function adminAuth(req, res, next) {
  const p = req.path
  if (p === '/login' || p === '/login.html' || p === '/logout') return next()
  if (isAuthenticated(req)) return next()
  res.redirect('/admin/login')
}

app.get('/api/analytics', apiAuth, (req, res) => {
  try {
    res.json(analytics.getStats())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/cv', apiAuth, (req, res) => {
  try {
    const json = fs.readFileSync(dataPath, 'utf-8')
    res.set('Content-Type', 'application/json')
    res.send(json)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/upload', apiAuth, express.raw({ type: () => true, limit: '8mb' }), (req, res) => {
  try {
    ensureUploadsDir()
    const name = safeUploadName(req.query.filename)
    if (!name) {
      res.status(400).json({ error: 'Use a JPG, PNG, WebP, or GIF image.' })
      return
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(400).json({ error: 'Empty file' })
      return
    }
    fs.writeFileSync(path.join(uploadsDir, name), req.body)
    res.json({ url: `/uploads/${name}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/cv', apiAuth, async (req, res) => {
  try {
    const result = await enqueueSave(async () => {
      atomicWriteFile(dataPath, JSON.stringify(req.body, null, 2) + '\n')
      try {
        await rebuildFrontend()
        return { rebuilt: true }
      } catch (err) {
        return { rebuilt: false, error: err.message }
      }
    })
    if (result.rebuilt) {
      res.json({ ok: true, rebuilt: true })
    } else {
      res.status(500).json({
        ok: true,
        rebuilt: false,
        error: result.error || 'Saved, but the live site rebuild failed'
      })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/admin/login', (req, res) => {
  res.sendFile(loginHtml)
})

app.post('/admin/login', (req, res) => {
  const { password } = req.body || {}
  if (passwordMatches(password)) {
    setAuthCookie(res)
    res.redirect('/admin')
  } else {
    res.redirect('/admin/login?error=1')
  }
})

app.post('/admin/logout', (req, res) => {
  destroySession(parseCookies(req)[SESSION_COOKIE])
  clearAuthCookie(res)
  res.redirect('/admin/login')
})

app.use('/uploads', express.static(uploadsDir))
app.use('/admin', adminAuth, express.static(adminDir))

app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'))
})

app.use((req, res, next) => {
  if (analytics.shouldTrack(req) && !isAuthenticated(req)) {
    analytics.recordVisit(req)
  }
  next()
})

app.use(express.static(distDir))

app.get('/', (req, res, next) => {
  const index = path.join(distDir, 'index.html')
  if (!fs.existsSync(index)) {
    res.status(503).type('text/plain').send('Site build is unavailable.')
    return
  }
  res.sendFile(index, (err) => {
    if (err) next(err)
  })
})

const PORT = process.env.PORT || 3000

async function start() {
  ensureDataFile()
  ensureUploadsDir()
  if (isProduction) {
    try {
      console.log('Rebuilding site from data/cv.json…')
      await rebuildFrontend()
      console.log('Site rebuild complete')
    } catch (err) {
      console.error('Startup rebuild failed; serving existing dist:', err.message)
      recoverLiveDist()
      if (!distHasIndex(distDir)) {
        console.error('No usable dist/index.html to serve after failed rebuild')
      }
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CV editor running on http://0.0.0.0:${PORT}/admin`)
  })
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
