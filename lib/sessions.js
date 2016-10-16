'use strict'

const { signed } = require('crc').crc32
const MemoryProvider = require('sessions-provider-memory')
const Store = require('./store')
const uid = require('./uid')

/**
 * Warning message for `Memory Provider` usage in production.
 */

const warning = `Warning: trek-sessions\' Memory Provider is not
  designed for a production environment, as it will leak
  memory, and will not scale past a single process.`

const cookieDefaults = {
  httpOnly: true,
  path: '/',
  overwrite: true,
  signed: true,
  maxAge: 24 * 60 * 60 * 1000 // one day in ms
}

const defaults = {
  key: 'trek.sid',
  prefix: 'trek:sess:',
  generateId: undefined,
  cookie: cookieDefaults,
  cookieLength: 24,
  rolling: false,
  verify: false,
  provider: null
}

module.exports = class Sessions {

  constructor (options) {
    options = Object.assign({}, options)
    Object.keys(options).forEach(k => {
      if (!(k in defaults)) delete options[k]
    })
    options.cookie = Object.assign({}, cookieDefaults, options.cookie)
    Object.assign(this, defaults, options)

    const { generateId, provider, verify, cookie } = this

    this.available = false
    if (!generateId) this.generateId = uid
    if (!provider) {
      if ('production'.startsWith(process.env.NODE_ENV)) console.warn(warning)
      this.provider = new MemoryProvider()
      this.available = true
    }

    if (false !== verify && 'function' !== typeof verify) {
      throw new TypeError('option detect must be function')
    }

    this.store = new Store(this.provider, {
      expires: cookie.maxAge || (cookie.expires && cookie.expires - Date.now()),
      prefix: this.prefix
    })
  }

  get path () {
    return this.cookie.path || '/'
  }

  matchPath (path, cookiePath) {
    if (cookiePath === '/') return true
    if (path.indexOf(cookiePath) === 0) return true
    return false
  }

  async process (ctx, next) {
    const result = await this.get(ctx)
    ctx.session = result.session
    ctx.sessionId = result.sessionId

    await next()

    result.session = ctx.session

    return await this.refresh(ctx.cookies, result)
  }

  async get ({ req, cookies }) {
    let sessionId = cookies.get(this.key, this.cookie)
    let isNew = false
    let session

    if (sessionId) {
      session = await this.store.get(sessionId)
    } else {
      sessionId = await this.generateId(this.cookieLength)
      session = await this.store.touch(this.cookie)
      isNew = true
    }

    if (!session || (this.verify && !this.verify(req, session))) {
      sessionId = await this.generateId(this.cookieLength)
      session = await this.store.touch(this.cookie)
      isNew = true
      // reset cookie
      cookies.set(this.key, null)
    }

    return {
      isNew,
      session,
      sessionId,
      originalHash: !isNew && hash(session)
    }
  }

  async refresh (cookies, { session, sessionId, originalHash, isNew }) {
    if (!session) {
      // session set to null, destroy session
      if (!isNew) {
        cookies.set(this.key, null)
        return await this.store.delete(sessionId)
      }
      // a new session and set to null, ignore destroy
      return
    }

    const newHash = hash(session)
    // rolling session will always reset cookie and session
    if (!this.rolling && newHash === originalHash) {
      // session not modified
      return
    }

    cookies.set(this.key, sessionId, this.cookie)
    await this.store.set(sessionId, session)
  }

}

function hash (sess) {
  return signed(JSON.stringify(sess))
}
