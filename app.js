const express = require('express');
const path = require('path');
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MySQLStore = require('express-mysql-session')(session);
const FacebookStrategy = require('passport-facebook').Strategy;
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const index = require('./routes/index');
const todos = require('./routes/todos');
const db = require('./db/db');
const query = require('./db/query');
const bcrypt = require('bcryptjs');

var app = express();

app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

passport.use(new FacebookStrategy({
    clientID: "2146968241988168",
    clientSecret: "8ee758090dbaf64a01de19670a93f0cb",
    callbackURL: "https://powerful-dusk-81349.herokuapp.com/auth/facebook/callback"
  }, (accessToken, refreshToken, profile, done) => {
      done(null, profile);
  }
))

passport.use(new LocalStrategy(
  (username,password,done) => {
    query.loginUser(username, password, done);
  }
))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

const options = {
  host:'sql12.freemysqlhosting.net',
  user:'sql12252465',
  password:'aDNMD2Xavr',
  database:'sql12252465'
}

const sessionStore = new MySQLStore(options);

app.use(session({
  secret: "secret",
  store: sessionStore,
  saveUninitialized: false,
  resave: false
}))

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if(req.user) {
    query.getProfile(req.user, req, res, next);
  }else {
    next();
  }
})

app.use(expressValidator());

app.use('/myTodo', todos);
app.use('/',index);

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
  if(!err) {
    console.log(`Server is listening at port ${port}`);
  } else {
    console.log(`Server is unable to listen on port ${port}`);
  }
})
