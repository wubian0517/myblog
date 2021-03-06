var express      = require('express');
var path         = require('path');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var busboy = require('connect-busboy');

//使用session
var session      = require('express-session');
var MongoStore   = require('connect-mongo')(session);
var settings     = require('./settings');
//使用flash
var flash = require('connect-flash');

var routes       = require('./routes/index');
var user         = require('./routes/user');
var admin         = require('./routes/admin');
var upload         = require('./routes/upload');

var app          = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(busboy({
    highWaterMark: 2 * 1024 * 1024, // Max  sizeof internal stream buffer
    limits: {
        fileSize: 10 * 1024 * 1024, //上传文件限制到此大小
        parts: 256,
        files: 1,
        headerPairs: 1000,
        fieldSize: 1024,
        fields: 128
    }
}));

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//session
app.use(cookieParser());
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db
    })
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(flash());

app.use('/', routes);
app.use('/user', user);
app.use('/admin', admin);
app.use('/upload', upload);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

var port = 3000;
app.listen(port, function(){
    console.log('Welcome, project start at port ' + port + '!');
})