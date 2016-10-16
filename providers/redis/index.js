'use strict'

const redis = require('redis')
const parse = require('fast-json-parse')
const stringify = require('fast-safe-stringify')

const defaults = {
  // serializer
  serializer: { parse, stringify },
  // redis client
  client: undefined,
  // redis client options
  clientOptions: undefined
}

module.exports = class RedisProvider {

  constructor (options) {
    options = Object.assign({}, options)
    Object.keys(options).forEach(k => {
      if (!(k in defaults)) delete options[k]
    })
    Object.assign(this, defaults, options)

    if (!this.client) {
      this.client = redis.createClient(this.clientOptions)
    }
  }

  async clear () {
    return new Promise((resolve, reject) => {
      this.client.flushdb(err => {
        err ? reject(err) : resolve()
      })
    })
  }

  async get (sid) {
    return new Promise((resolve, reject) => {
      this.client.get(sid, (err, data) => {
        if (err) return reject(err)
        if (!data) return resolve()
        const result = this.serializer.parse(data.toString())
        if (result.err) return reject(result.err)
        resolve(result.value)
      })
    })
  }

  async set (sid, sess, expires) {
    return new Promise((resolve, reject) => {
      this.client.setex(sid, expires / 1000, this.serializer.stringify(sess), err => {
        err ? reject(err) : resolve()
      })
    })
  }

  async delete (sid) {
    return new Promise((resolve, reject) => {
      this.client.del(sid, err => {
        err ? reject(err) : resolve()
      })
    })
  }

}
