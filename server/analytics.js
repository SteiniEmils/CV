import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const BOT_RE = /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|preview|headless|wget|curl|python-requests|go-http-client/i
const RETENTION_DAYS = 90
const MAX_VISITS = 5000
const DEDUP_MS = 30 * 60 * 1000

const COUNTRY_NAMES = {
  IS: 'Iceland',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  NO: 'Norway',
  SE: 'Sweden',
  DK: 'Denmark',
  FI: 'Finland',
  NL: 'Netherlands',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  CA: 'Canada',
  AU: 'Australia',
  PL: 'Poland',
  IE: 'Ireland',
}

export function createAnalytics({ dataDir, atomicWriteFile }) {
  const analyticsPath = path.join(dataDir, 'analytics.json')
  let store = { visits: [] }
  let writeChain = Promise.resolve()

  function load() {
    fs.mkdirSync(dataDir, { recursive: true })
    if (!fs.existsSync(analyticsPath)) {
      store = { visits: [] }
      persist()
      return
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8'))
      store = { visits: Array.isArray(parsed.visits) ? parsed.visits : [] }
      prune()
    } catch {
      store = { visits: [] }
    }
  }

  function enqueueWrite(task) {
    const run = writeChain.then(task, task)
    writeChain = run.then(() => undefined, () => undefined)
    return run
  }

  function persist() {
    return enqueueWrite(async () => {
      atomicWriteFile(analyticsPath, JSON.stringify(store, null, 2) + '\n')
    })
  }

  function prune() {
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
    store.visits = store.visits
      .filter((visit) => Date.parse(visit.at) >= cutoff)
      .slice(-MAX_VISITS)
  }

  function clientIp(req) {
    const cf = req.headers['cf-connecting-ip']
    if (typeof cf === 'string' && cf.trim()) return cf.trim()
    const forwarded = req.headers['x-forwarded-for']
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0].trim()
    }
    return req.socket?.remoteAddress || ''
  }

  function visitorId(req) {
    const ip = clientIp(req)
    const ua = String(req.headers['user-agent'] || '')
    return crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 16)
  }

  function parseReferrer(value) {
    if (!value || typeof value !== 'string') {
      return { referrer: '', referrerHost: 'Direct / none' }
    }
    try {
      const url = new URL(value)
      if (url.hostname === 'steiniemils.com' || url.hostname.endsWith('.steiniemils.com')) {
        return { referrer: value, referrerHost: 'Your site' }
      }
      return { referrer: value, referrerHost: url.hostname.replace(/^www\./, '') }
    } catch {
      return { referrer: value, referrerHost: 'Unknown' }
    }
  }

  function deviceType(ua) {
    const value = String(ua || '').toLowerCase()
    if (!value) return 'unknown'
    if (/tablet|ipad/.test(value)) return 'tablet'
    if (/mobile|iphone|android/.test(value)) return 'mobile'
    return 'desktop'
  }

  function isBot(req) {
    const ua = String(req.headers['user-agent'] || '')
    if (!ua.trim()) return true
    return BOT_RE.test(ua)
  }

  function shouldTrack(req) {
    if (req.method !== 'GET') return false
    if (req.path !== '/') return false
    if (isBot(req)) return false
    return true
  }

  function recordVisit(req) {
    if (!shouldTrack(req)) return

    const now = Date.now()
    const id = visitorId(req)
    const recent = store.visits.slice(-40).reverse()
    const duplicate = recent.find((visit) => {
      return visit.visitorId === id && now - Date.parse(visit.at) < DEDUP_MS
    })
    if (duplicate) return

    const country = String(req.headers['cf-ipcountry'] || 'XX').toUpperCase()
    const { referrer, referrerHost } = parseReferrer(req.headers.referer || req.headers.referrer)
    const ua = String(req.headers['user-agent'] || '')

    store.visits.push({
      at: new Date(now).toISOString(),
      visitorId: id,
      country: country === 'XX' || country === 'T1' ? 'Unknown' : country,
      referrer,
      referrerHost,
      device: deviceType(ua),
    })

    prune()
    persist().catch(() => {})
  }

  function dayKey(iso) {
    return iso.slice(0, 10)
  }

  function inRange(iso, days) {
    const start = Date.now() - days * 24 * 60 * 60 * 1000
    return Date.parse(iso) >= start
  }

  function summaryFor(days) {
    const visits = days == null ? store.visits : store.visits.filter((visit) => inRange(visit.at, days))
    const unique = new Set(visits.map((visit) => visit.visitorId))
    return { views: visits.length, unique: unique.size }
  }

  function countBy(visits, keyFn) {
    const map = new Map()
    for (const visit of visits) {
      const key = keyFn(visit)
      map.set(key, (map.get(key) || 0) + 1)
    }
    return [...map.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
  }

  function countryLabel(code) {
    if (!code || code === 'Unknown') return 'Unknown'
    return COUNTRY_NAMES[code] || code
  }

  function getStats() {
    const weekVisits = store.visits.filter((visit) => inRange(visit.at, 7))
    const monthVisits = store.visits.filter((visit) => inRange(visit.at, 30))

    const dailyMap = new Map()
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      dailyMap.set(dayKey(date.toISOString()), { views: 0, unique: new Set() })
    }
    for (const visit of store.visits) {
      const key = dayKey(visit.at)
      if (!dailyMap.has(key)) continue
      const row = dailyMap.get(key)
      row.views += 1
      row.unique.add(visit.visitorId)
    }

    return {
      summary: {
        today: summaryFor(1),
        week: summaryFor(7),
        month: summaryFor(30),
        allTime: summaryFor(null),
      },
      daily: [...dailyMap.entries()].map(([date, row]) => ({
        date,
        views: row.views,
        unique: row.unique.size,
      })),
      countries: countBy(monthVisits, (visit) => visit.country).slice(0, 10).map(({ key, count }) => ({
        code: key,
        name: countryLabel(key),
        count,
      })),
      referrers: countBy(monthVisits, (visit) => visit.referrerHost).slice(0, 10).map(({ key, count }) => ({
        host: key,
        count,
      })),
      devices: countBy(monthVisits, (visit) => visit.device).map(({ key, count }) => ({
        type: key,
        count,
      })),
      recent: [...store.visits].reverse().slice(0, 25).map((visit) => ({
        at: visit.at,
        country: visit.country,
        countryName: countryLabel(visit.country),
        referrerHost: visit.referrerHost,
        device: visit.device,
      })),
    }
  }

  load()

  return { recordVisit, getStats, shouldTrack }
}
