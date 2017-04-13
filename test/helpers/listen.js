module.exports = app => {
  return new Promise((resolve, reject) => {
    app.server = app.run(function (err) {
      if (err) {
        return reject(err)
      }
      const { port } = this.address()
      resolve(`http://localhost:${port}`)
    })
  })
}
