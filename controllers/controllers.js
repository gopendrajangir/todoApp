const passport = require('passport');
const bcrypt = require('bcryptjs');
const query = require('./../db/query');

module.exports.home = (req, res) => {
  if(req.isAuthenticated()){
    res.redirect('/myTodo');
  } else {
    res.redirect('/login');
  }
}

module.exports.myTodo = (req, res) => {
  req.flash('successSigned','You have successfully login '+ res.locals.profile.username);
  res.redirect('/myTodo/profile');
}

module.exports.todos = (req, res) => {
  query.getTodos(req.user, req, res);
}

module.exports.insertTodo = (req, res) => {
  const time = req.body.time;
  const todo = req.body.todo;
  const id = req.user;
  const data = [[id, time, todo]];
  query.insertTodo(data, req, res);
}

module.exports.profile = (req, res) => {
  res.render('profile',{flash:req.flash('successSigned')});
}

module.exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/');
}

module.exports.login = (req, res) => {
  res.render('login');
}

module.exports.facebookAuthentication = (req, res, next) => {
  passport.authenticate('facebook', (err, user, info) => {
    if(err) throw err;
    if(!user) {
      req.flash('incorrect','Incorrect username or password');
      res.render('login',{flash:req.flash('incorrect')});
    } else {
      const fbProfile = [[user.id, user.displayName,"unknown","nofile.png"]];
      query.addFbUser(fbProfile, req, res, user);
    }
  })(req, res, next);
}

module.exports.loginPost = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) throw err;
    console.log(user);
    if(!user) {
      req.flash('notSigned','Please signup before login');
      res.render('signup',{flash:req.flash('notSigned')});
    } else {
      req.login(user, (err) => {
        if(err) throw err;
        res.redirect('/myTodo');
      })
    }
  })(req, res, next);
}

module.exports.signup = (req, res) => {
  res.render('signup');
}

module.exports.signupPost = (req, res) => {
  req.checkBody('username','Username length should be from 5 to 15 characters').isLength({min:5, max:15});
  req.checkBody('email','Invalid email').isEmail();
  req.checkBody('password','Invalid password').isLength({min:5});
  req.checkBody('password2','Password does not match').matches(req.body.password);

  var errors = req.validationErrors();

  if(errors) {
    res.render('signup',{errors:errors});
  } else {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    var profileImage;
    if(req.file) {
      console.log('file is uploading ...');
      profileImage = req.file.filename;
    } else {
      console.log('file could not be uploaded');
      profileImage = "nofile.png";
    }
    const checkData = [username, email];
    query.checkUser(checkData, username, email, password, profileImage, req, res);
  }
}

passport.serializeUser((user, done) => {
  console.log("Inside serializeUser");
  done(null, user.id);
})

passport.deserializeUser((user_id, done) => {
  console.log("Inside deserializeUser");
  done(null, user_id);
})
