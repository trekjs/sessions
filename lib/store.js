'use strict'

const Emitter = require('events')

module.exports = class Store extends Emitter {

  constructor (provider, options) {
    super()

    this.options = options
    this.provider = provider

    if (this.client && 'function' === typeof this.client.on) {
      this.client.on('connect', this.emit.bind(this, 'connect'))
      this.client.on('disconnect', this.emit.bind(this, 'disconnect'))
    }
  }

  get client () {
    return this.provider.client
  }

  get expires () {
    return this.options.expires
  }

  touch (cookie) {
    return { cookie: Object.create(cookie) }
  }

  prefix (sid) {
    return this.options.prefix + sid
  }

  clear () {
    return this.provider.clear()
  }

  delete (sid) {
    return this.provider.delete(this.prefix(sid))
  }

  get (sid) {
    return this.provider.get(this.prefix(sid))
  }

  has (sid) {
    return this.provider.has(this.prefix(sid))
  }

  set (sid, sess) {
    return this.provider.set(this.prefix(sid), sess, this.expires)
  }

}
