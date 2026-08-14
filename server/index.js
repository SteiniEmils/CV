import express from 'express'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const dataPath = path.join(__dirname, '..', 'data', 'cv.json')
const adminDir = path.join(__dirname, 'admin')
const distDir = path.join(__dirname, '..', 'dist')
const loginHtml = path.join(adminDir, 'login.html')

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cv-admin'
const isDev = process.env.NODE_ENV !== 'production'
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: !isDev,
  maxAge: 7 * 24 * 60 * 60 * 1000
}

if (ADMIN_PASSWORD === 'cv-admin') {
  console.warn('Warning: using default admin password. Set ADMIN_PASSWORD to something strong.')
}

function parseCookies(req) {
  const header = req.headers.cookie || ''
  return Object.fromEntries(header.split(';').filter(Boolean).map(c => {
    const [k, ...rest] = c.trim().split('=')
    return [k, decodeURIComponent(rest.join('='))]
  }))
}

function isAuthenticated(req) {
  return parseCookies(req).cv_admin === '1'
}

function setAuthCookie(res) {
  res.cookie('cv_admin', '1', cookieOptions)
}

function clearAuthCookie(res) {
  res.clearCookie('cv_admin', { path: '/' })
}

function generateCv() {
  return new Promise((resolve, reject) => {
    exec('npm run generate-cv', { cwd: path.join(__dirname, '..') }, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout)
    })
  })
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

app.get('/api/cv', apiAuth, (req, res) => {
  try {
    const json = fs.readFileSync(dataPath, 'utf-8')
    res.set('Content-Type', 'application/json')
    res.send(json)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/cv', apiAuth, async (req, res) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2))
    await generateCv()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/admin/login', (req, res) => {
  res.sendFile(loginHtml)
})

app.post('/admin/login', (req, res) => {
  const { password } = req.body || {}
  if (password === ADMIN_PASSWORD) {
    setAuthCookie(res)
    res.redirect('/admin')
  } else {
    res.redirect('/admin/login?error=1')
  }
})

app.post('/admin/logout', (req, res) => {
  clearAuthCookie(res)
  res.redirect('/admin/login')
})

app.use('/admin', adminAuth, express.static(adminDir))

app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'))
})

app.use(express.static(distDir))

app.get('/', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`CV editor running on http://localhost:${PORT}/admin`)
})
