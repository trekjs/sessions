'use strict'

const Emitter = require('events')

module.exports = class Store extends Emitter {

  constructor (provider, options) {
    super()

    this.options = options
    this.provider = provider

    if (this.providerClient && 'function' === typeof this.providerClient.on) {
      this.providerClient.on('connect', this.emit.bind(this, 'connect'))
      this.providerClient.on('disconnect', this.emit.bind(this, 'disconnect'))
    }

    Object.defineProperty(this, 'size', {
      get: async () => {
        return await this.provider.size
      }
    })
  }

  get providerClient () {
    return this.provider.client
  }

  get expires () {
    return this.options.expires
  }

  touch (cookie) {
    cookie = Object.assign({}, cookie)
    return { cookie }
  }

  prefix (sid) {
    return this.options.prefix + sid
  }

  // get size () {
  //   return this.provider.size
  // }

  async clear () {
    return await this.provider.clear()
  }

  async delete (sid) {
    return await this.provider.delete(this.prefix(sid))
  }

  async entries () {
    return await this.provider.entries()
  }

  // forEach () {}

  async get (sid) {
    return await this.provider.get(this.prefix(sid))
  }

  async has (sid) {
    return await this.provider.has(this.prefix(sid))
  }

  async keys () {
    return await this.provider.keys()
  }

  async set (sid, sess) {
    return await this.provider.set(this.prefix(sid), sess, this.expires)
  }

  async values () {
    return await this.provider.values()
  }

  [Symbol.iterator] () {}

}
