require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session')
var logger = require('morgan');
const mongoose = require('mongoose');
const MongoStore    = require('connect-mongo').default;
const passport = require('passport')
const passportCognitoStrategy = require('./utils/passport-strategies/cognito')
const authUtils = require('./utils/auth-utils')
const User = require('./model/user');
const flash = require('flash')

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true 
}
mongoose.set('useFindAndModify', false);
const clientPromise = mongoose.connect(process.env.MONGO_URI, mongoOptions).then(() => mongoose.connection.getClient()
)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var roomsRouter = require('./routes/rooms');
var reservationsRouter = require('./routes/reservations');
var basecampAuthRouter = require('./routes/basecamp-auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const sessionMiddleware = session({
    secret: process.env.COOKIE_KEY || "cookie_secret_123",
    resave: true,
    saveUninitialized: true,
    maxAge: 2592000000,
    cookie: {
        maxAge: 2592000000
    },
    store: MongoStore.create({clientPromise})
})

app.use(sessionMiddleware);
app.use(flash())
app.sessionMiddleware = sessionMiddleware // Storing a reference to session middleware for use in other modules

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session())

passport.serializeUser((user, done) => {
  return done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
  const user = await User.findOne({username: username})
  return done(null, user);
});

const env = (envName) => {
  return process.env[envName]
}
app.locals.env = env

passportCognitoStrategy(app, passport)



async function isLoggedToBasecamp(req, res, next) {
  const user = await User.findById(req.user._id)
  if (!user.basecamp ||!user.basecamp.access_token || !user.basecamp.access_token.content) {
    return res.redirect('/auth/basecamp/start')
  }
  return next()
}
app.use('/', authUtils.isLoggedIn, indexRouter);
app.use('/users', authUtils.isLoggedIn, authUtils.hasRole('admin'), usersRouter);
app.use('/rooms', authUtils.isLoggedIn, authUtils.hasRole('admin'), roomsRouter);
app.use('/reservations', authUtils.isLoggedIn, isLoggedToBasecamp, reservationsRouter);
app.use('/auth/basecamp', authUtils.isLoggedIn, basecampAuthRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
