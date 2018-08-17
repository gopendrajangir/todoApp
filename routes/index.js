const Router = require('express').Router();
const controllers = require('./../controllers/controllers');
const passport = require('passport');
const multer = require('multer');
const todos = require('./todos');

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads/')
  }
})

var upload = multer({storage: storage});

Router.use('/myTodo', authenticationMiddleware(), todos);
Router.get('/auth/facebook', authenticationMiddleware(), passport.authenticate('facebook'));

Router.get('/auth/facebook/callback', controllers.facebookAuthentication);

Router.get('/', authenticationMiddleware(), controllers.home);

Router.get('/login', authenticationMiddleware(), controllers.login);
Router.post('/login', controllers.loginPost);

Router.get('/signup', authenticationMiddleware(), controllers.signup);
Router.post('/signup', upload.single('picture'), controllers.signupPost);

module.exports = Router;

function authenticationMiddleware() {
  return (req, res, next) => {
    if(req.isAuthenticated()) {
      if(req.path == '/') {
        res.redirect('/myTodo');
      } else if (req.path == '/signup') {
        res.redirect('/myTodo');
      } else if (req.path == '/login') {
        res.redirect('/myTodo');
      } else if (req.path == '/auth/facebook') {
        res.redirect('/myTodo');
      } else {
        next();
      }
    } else {
      if(req.path == '/myTodo') {
        res.redirect('/');
      } else {
        next();
      }
    }
  }
}
