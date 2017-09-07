'use strict'

const { signed } = require('crc').crc32
const Store = require('./store')

const WARNING = `Warning: trek-sessions' Memory Provider is not
  designed for a production environment, as it will leak
  memory, and will not scale past a single process.`

const KEY = 'trek.sid'
const PREFIX = 'trek:sess:'
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000 // One day in ms

const defaultsOfCookie = {
  httpOnly: true,
  maxAge: ONE_DAY_IN_MS,
  overwrite: true,
  path: '/',
  signed: true
}

const defaults = {
  cookie: defaultsOfCookie,
  expires: ONE_DAY_IN_MS,
  generateId: undefined,
  prefix: PREFIX,
  provider: undefined,
  key: KEY,
  skip: false,
  verify: false
}

module.exports = class Sessions {
  constructor(options = {}, isProd) {
    Object.keys(options).forEach(k => !(k in defaults) && delete options[k])
    options.cookie = Object.assign({}, defaultsOfCookie, options.cookie)

    const { cookie, expires, generateId, prefix, provider } = Object.assign(
      this,
      defaults,
      options
    )

    if (!generateId) this.generateId = require('ruid')
    if (!provider) {
      if (!isProd) console.warn(WARNING)
      const MemoryProvider = require('sessions-provider-memory')
      this.provider = new MemoryProvider()
    }

    this.expires = expires || cookie.maxAge
    this.store = new Store(this.provider, {
      expires: this.expires,
      prefix
    })
  }

  touch() {
    return { cookie: Object.create(this.cookie) }
  }

  async process(ctx, next) {
    if (this.skip && this.skip(ctx)) return next()
    if (!this.match(ctx.req.path, this.cookie.path)) return next()

    const result = await this.get(ctx.req, ctx.cookies)

    ctx.session = result.session
    ctx.sessionId = result.sessionId

    await next()

    result.session = ctx.session

    await this.refresh(ctx.cookies, result)
  }

  async get(req, cookies) {
    let sessionId = cookies.get(this.key, this.cookie)
    let session = null
    let fresh = false

    if (sessionId) {
      session = await this.store.get(sessionId)
    } else {
      sessionId = await this.generateId()
      session = await this.touch()
      fresh = true
    }

    if (!session || (this.verify && this.verify(req, session))) {
      sessionId = await this.generateId()
      session = await this.touch()
      fresh = true
      // Reset cookie
      cookies.set(this.key, null)
    }

    return {
      fresh,
      session,
      sessionId,
      originalHash: !fresh && this.hash(session)
    }
  }

  async refresh(cookies, { fresh, session, sessionId, originalHash }) {
    // Delete session
    if (!session) {
      // Session set to null, destroy session
      if (!fresh) {
        cookies.set(this.key, null)
        await this.store.delete(sessionId)
        return
      }
      // A new session and set to null, ignore destroy
      return
    }

    const newHash = this.hash(session)
    // Rolling session will always reset cookie and session
    if (!this.rolling && newHash === originalHash) {
      // Session not modified
      return
    }

    cookies.set(this.key, sessionId, this.cookie)
    await this.store.set(sessionId, session)
  }

  match(pathname, cookiePath = '/') {
    return cookiePath === '/' || pathname.startsWith(cookiePath)
  }

  hash(session) {
    return signed(JSON.stringify(session))
  }
}
