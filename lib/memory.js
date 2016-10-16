'use strict'

// Memory Provider.

module.exports = class Memory extends Map {

  get (sid) {
    const sess = super.get(sid)
    if (!sess) return

    const expires = sess.cookie.expires
    if (expires && expires <= Date.now()) {
      this.delete(sid)
      return
    }

    return sess
  }

  set (sid, sess, expires) {
    super.set(sid, sess)
    // should clear old timer
    if (sess.__timer__) {
      sess.cookie.expires = new Date() + expires
      clearTimeout(sess.__timer__)
    }
    Object.defineProperty(sess, '__timer__', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: setTimeout(() => this.delete(sid), expires)
    })
  }

}
