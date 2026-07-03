const express = require('express')
const add = require('./add')
const { securityMiddleware } = require('./src/security')

const app = express()

// Apply security middleware to all routes
app.use(securityMiddleware)
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  const a = parseInt(req.query.a)
  const b = parseInt(req.query.b)
  res.send(`Hello World!: ${add(a, b)}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})