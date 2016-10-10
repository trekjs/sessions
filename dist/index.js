'use strict'

const Sessions = require('./sessions')

module.exports = createSessions

function createSessions (options) {
  const s = new Sessions(options)

  return function sessionMiddleware (ctx, next) {return __async(function*(){
    if (ctx.sessionId) return next()

    const result = yield s.process(ctx)

    ctx.session = result.session
    ctx.sessionId = result.sessionId

    return next()
  }())}
}

function __async(g){return new Promise(function(s,j){function c(a,x){try{var r=g[x?"throw":"next"](a)}catch(e){j(e);return}r.done?s(r.value):Promise.resolve(r.value).then(c,d)}function d(e){c(e,1)}c()})}
