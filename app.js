var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//TODO: auto require models, servives, routes
var eodModel = require('./models/eod');
var signalModel = require('./models/signal');
var indexModel = require('./models/index');
var tickerModel = require('./models/ticker');
var userModel = require('./models/user');
var commonModel = require('./models/common');
var marketModel = require('./models/market');


var coreService = require('./services/core');
var eodService = require('./services/eod');
var signalService = require('./services/signal');
var indexService = require('./services/index');
var tickerService = require('./services/ticker');
var userService = require('./services/user');

var coreRoutes = require('./routes/core');
var eodRoutes = require('./routes/eod');
var signalRoutes = require('./routes/signal');
var indexRoutes = require('./routes/index');
var tickerRoutes = require('./routes/ticker');
var userRoutes = require('./routes/user');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', coreRoutes);
app.use('/eod', eodRoutes);
app.use('/signal', signalRoutes);
app.use('/index', indexRoutes);
app.use('/ticker', tickerRoutes);
app.use('/user', userRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;