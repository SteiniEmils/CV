import express from 'express'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json({ limit: '10mb' }))

const dataPath = path.join(__dirname, '..', 'data', 'cv.json')
const adminDir = path.join(__dirname, 'admin')
const distDir = path.join(__dirname, '..', 'dist')

function generateCv() {
  return new Promise((resolve, reject) => {
    exec('npm run generate-cv', { cwd: path.join(__dirname, '..') }, (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout)
    })
  })
}

app.get('/api/cv', (req, res) => {
  try {
    const json = fs.readFileSync(dataPath, 'utf-8')
    res.set('Content-Type', 'application/json')
    res.send(json)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/cv', async (req, res) => {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 2))
    await generateCv()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.use(express.static(distDir))

app.use('/admin', express.static(adminDir))
app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminDir, 'index.html'))
})

app.get('/', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`CV editor running on http://localhost:${PORT}/admin`)
})
