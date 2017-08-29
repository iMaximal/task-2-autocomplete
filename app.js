const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');
const style = require('./manifest/stylus.json');
const expressValidator = require('express-validator');
const compression = require('compression');

const app = express();

// security filter
const helmet = require('helmet');
app.use(helmet());

//Compress all routes
app.use(compression());

const limiter = new RateLimit({
    windowMs: 15*60*1000, // 15 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
});

//  apply to all requests
app.use(limiter);

/* rendering engine, with change extension to .hbs */
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
        style() {
                return style['style.css'] ? style['style.css'] : 'style.css';
            }
        }
    }
));

/* views directory to search */
app.set('views', path.join(__dirname, 'views'));
/* set view engine */
app.set('view engine', '.hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Require our routes into the application.
require('./server/routes')(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
