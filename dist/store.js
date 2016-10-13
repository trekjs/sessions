'use strict'

const Emitter = require('events')

module.exports = class Store extends Emitter {

  constructor (provider, options) {
    super()

    this.options = options
    this.provider = provider

    Object.defineProperty(this, 'size', {
      get: () => __async(function*(){
        return yield this.provider.size
      }.call(this))
    })
  }

  touch (cookie) {
    cookie = Object.assign({}, cookie)
    if (!cookie.expires && cookie.maxAge) {
      cookie.expires = new Date(Date.now() + cookie.maxAge)
    }
    return { cookie }
  }

  prefix (sid) {
    return this.options.prefix + sid
  }

  // get size () {
  //   return this.provider.size
  // }

  clear () {return __async(function*(){
    return yield this.provider.clear()
  }.call(this))}

  delete (sid) {return __async(function*(){
    return yield this.provider.delete(this.prefix(sid))
  }.call(this))}

  entries () {return __async(function*(){
    return yield this.provider.entries()
  }.call(this))}

  // forEach () {}

  get (sid) {return __async(function*(){
    return yield this.provider.get(this.prefix(sid))
  }.call(this))}

  has (sid) {return __async(function*(){
    return yield this.provider.has(this.prefix(sid))
  }.call(this))}

  keys () {return __async(function*(){
    return yield this.provider.keys()
  }.call(this))}

  set (sid, sess) {return __async(function*(){
    return yield this.provider.set(this.prefix(sid), sess)
  }.call(this))}

  values () {return __async(function*(){
    return yield this.provider.values()
  }.call(this))}

  [Symbol.iterator] () {}

}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
