import test from 'ava'
import Engine from 'trek-engine'
import request from 'request-promise'
import sessions from '..'

const listen = app => {
  return new Promise((resolve, reject) => {
    app.run(function (err) {
      if (err) {
        return reject(err)
      }
      const { port } = this.address()
      resolve(`http://localhost:${port}`)
    })
  })
}

test('should use memory provider', async t => {
  const app = new Engine()

  app.config.set('cookie', {
    keys: ['trek', 'engine']
  })

  app.use(sessions({
    cookie: {
      signed: false,
      maxAge: 60 * 1000 // 1 minutes
    }
  }))

  app.use(ctx => {
    if (ctx.session.count) {
      ctx.session.count++
    } else {
      ctx.session.count = 1
    }
    ctx.res.body = ctx.session
  })

  const url = await listen(app)
  let res = await request({ url, json: true })
  t.is(res.count, 1)

  const jar = request.jar()
  res = await request({ url, jar, json: true })
  t.is(res.count, 1)

  res = await request({ url, jar, json: true })
  t.is(res.count, 2)

  res = await request({ url, jar, json: true })
  t.is(res.count, 3)
})
