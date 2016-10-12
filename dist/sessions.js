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
      expires: cookie.maxAge || (cookie.expires && cookie.expires - Date.now()),
      prefix: this.prefix
    })
  }

  process (ctx) {return __async(function*(){
    const result = yield this.get(ctx)

    yield this.refresh(ctx.cookies, result)

    return result
  }.call(this))}

  get ({ req, cookies }) {return __async(function*(){
    let sessionId = cookies.get(this.key, this.cookie)
    let isNew = false
    let session

    if (sessionId) {
      session = yield this.store.get(sessionId)
    } else {
      sessionId = yield this.generateId(this.cookieLength)
      session = yield this.store.generate(this.cookie)
      isNew = true
    }

    if (!session || (this.verify && !this.verify(req, session))) {
      sessionId = yield this.generateId(this.cookieLength)
      session = yield this.store.generate(this.cookie)
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
  }.call(this))}

  refresh (cookies, { session, sessionId, originalHash, isNew }) {return __async(function*(){
    if (!session) {
      // session set to null, destroy session
      if (!isNew) {
        cookies.set(this.key, null)
        return yield this.store.delete(sessionId)
      }
      // a new session and set to null, ignore destroy
      return
    }

    if (!originalHash) {
      cookies.set(this.key, sessionId, this.cookie)
      yield this.store.set(sessionId, session)
    }
  }.call(this))}

}

function hash (sess) {
  return signed(JSON.stringify(sess))
}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
