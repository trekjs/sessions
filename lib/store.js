'use strict'

const Emitter = require('events')

const defaults = {
  prefix: 'trek:sess:',
  expires: 24 * 60 * 60 * 1000 // One day in ms
}

module.exports = class Store extends Emitter {
  constructor(provider, options) {
    super()

    this.provider = provider
    this.options = Object.assign({}, defaults, options)

    const client = this.client
    if (client && typeof client.on === 'function') {
      client.on('connect', this.emit.bind(this, 'connect'))
      client.on('disconnect', this.emit.bind(this, 'disconnect'))
    }
  }

  get client() {
    return this.provider.client
  }

  get expires() {
    return this.options.expires
  }

  prefix(sid) {
    return this.options.prefix + sid
  }

  delete(sid) {
    return this.provider.delete(this.prefix(sid))
  }

  get(sid) {
    return this.provider.get(this.prefix(sid))
  }

  has(sid) {
    return this.provider.has(this.prefix(sid))
  }

  set(sid, sess) {
    return this.provider.set(this.prefix(sid), sess, this.expires)
  }

  clear() {
    return this.provider.clear()
  }

  quit() {
    return this.provider.quit()
  }
}
