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

  set (sid, sess) {
    super.set(sid, sess)
    setTimeout(() => this.delete(sid), expires(sess))
  }

}

function expires (sess) {
  return sess.cookie.expires ?
    sess.cookie.expires - Date.now() :
    sess.cookie.maxAge
}
