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

  set (sid, sess)   {
    super.set(sid, sess)
    setTimeout(() => {
      process.nextTick(() => this.delete(sid))
    }, sess.cookie.maxAge)
  }

}
