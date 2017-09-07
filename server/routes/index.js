const homeController = require('../controllers').home
const citiesController = require('../controllers').cities
const bodyParser = require('body-parser')
const csrf = require('csurf')
// setup route middlewares
const csrfProtection = csrf({ cookie: true })
const jsonParser = bodyParser.json();
// for validate FORM submit
const parseForm = bodyParser.urlencoded({ extended: false })

module.exports = app => {
    app.get("/", csrfProtection, homeController.get)
    app.post('/search', citiesController.search)
};
