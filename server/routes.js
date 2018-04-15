const express = require('express')
const session = require('express-session')
const gauth = require('@reaktor/express-gauth')
const path = require('path')
const bodyParser = require('body-parser')
const db = require('./db')
const pdf = require('./pdf')
const config = require('./config')

const route = express.Router()

console.log('starting server')

/* Force https-redirect */
if (config.env === 'production') {
  route.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else {
      next()
    }
  })
}

if (config.auth_id) {
  console.log('Using authentication')
  const myGauth = gauth({
    clientID: config.auth_id,
    clientSecret: config.auth_secret,
    clientDomain: config.clientURL,
    allowedDomains: config.login_domains.split(','),
    returnToOriginalUrl: true,
    publicEndPoints: ['/assets/font1.otf', '/assets/font2.otf', '/assets/font3.otf', '/assets/font4.otf'],
  })

  route.use(session({
    secret: 'lol',
    resave: false,
    saveUninitialized: true,
  }))

  route.use(myGauth)
}

route.use(bodyParser.urlencoded({ extended: true }))
route.use(bodyParser.json())

route.use(express.static(path.resolve(__dirname, '../react/build')))

const handleDBRequest = (dbFunction, request, response) => {
  // make a new, empty object and fill it with the contents of request.params and request.body:
  const params = Object.assign({}, request.params, request.body)
  console.log(`Performing db operation "${dbFunction.name}" with params (next line):`)
  console.log(params)
  dbFunction(params)
    .then((res) => { response.send(res) })
    .catch((err) => {
      console.log(err)
      response.status(500).send('Database error')
    })
}

// Post request for saving CV with username and CV name
route.post('/api/cvs/:cvID', (request, response) => {
  handleDBRequest(db.save, request, response)
})

// Get request for loading CV with username and CV name
route.get('/api/cvs/:cvID', (request, response) => {
  handleDBRequest(db.load, request, response)
})

route.get('/api/cvsections', (request, response) => {
  handleDBRequest(db.loadCVSections, request, response)
})

// Post request for loading pdf
route.post('/api/pdf', (request, response) => {
  pdf.servePDF(response, request.body)
})

route.put('/api/cvs/:cvID', (request, response) => {
  handleDBRequest(db.rename, request, response)
})

route.get('/api/loggedInUser', (request, response) => {
  let username = 'defaultUser'
  let fullname = 'Default User'
  if (config.auth_id) {
    const email = request.user.emails[0].value
    username = email.split('@')[0]
    fullname = request.user.displayName
  }
  return db.configureUser({ username, fullname })
    .then(() => response.send(username))
    .catch(() => response.status(500).send('Database error'))
})

route.get('/api/users', (request, response) => {
  handleDBRequest(db.loadUserList, request, response)
})

route.get('/api/users/:username/cvs', (request, response) => {
  handleDBRequest(db.loadCVList, request, response)
})

route.post('/api/cvs/:cvID/copy', (request, response) => {
  handleDBRequest(db.copy, request, response)
})

route.delete('/api/cvs/:cvID', (request, response) => {
  handleDBRequest(db.deleteCV, request, response)
})

// Sends a preview based on the text from the request.
route.post('/actions/preview', (request, response) => {
  const params = request.body
  console.log('Loading preview for cv')
  pdf.getHTML(params)
    .then(previews => response.send(previews))
})

route.get('/assets/:filename', (request, response) => {
  console.log(`getting static file ${request.params.filename}`)
  db.getAsset(request.params)
    .then(({ filetype, file }) => {
      response.writeHead(200, {
        'Content-Type': filetype,
        'Content-Length': file.length,
      })
      response.end(file)
    })
    .catch((err) => {
      console.log(err)
      response.status(500).send('Database error')
    })
})

route.get('/api/languages', (request, response) => {
  handleDBRequest(db.loadLanguages, request, response)
})

if (config.env === 'production') {
  route.get('/*', (request, response) => {
    response.sendFile(path.join(__dirname, '../react/build', 'index.html'))
  })
}

module.exports = route
