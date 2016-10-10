'use strict'

const { signed } = require('crc').crc32
const Store = require('./store')
const Memory = require('./memory')
const uid = require('./uid')

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

    if (!generateId) this.generateId = uid
    if (!provider) this.provider = new Memory()

    if (false !== verify && 'function' !== typeof verify) {
      throw new TypeError('option detect must be function')
    }

    this.store = new Store(this.provider, {
      expires: cookie.maxAge || (cookies.expires && cookies.expires - Date.now()),
      prefix: this.prefix
    })
  }

  async process (ctx) {
    const result = await this.get(ctx)

    await this.refresh(ctx.cookies, result)

    return result
  }

  async get ({ req, cookies }) {
    let sessionId = cookies.get(this.key, this.cookie)
    let isNew = false
    let session

    if (!sessionId) {
      sessionId = await this.generateId(this.cookieLength)
      session = await this.store.generate(this.cookie)
      isNew = true
    } else {
      session = await this.store.get(sessionId)
    }

    if (!session || (this.verify && !this.verify(req, session))) {
      sessionId = await this.generateId(this.cookieLength)
      session = await this.store.generate(this.cookie)
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

    if (!originalHash) {
      cookies.set(this.key, sessionId, this.cookie)
      await this.store.set(sessionId, session)
    }
  }

}

function hash (sess) {
  return signed(JSON.stringify(sess))
}
