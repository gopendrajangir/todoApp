const bcrypt = require('bcryptjs');

module.exports.checkUser = (data, username, email, password, profileImage, req, res) => {
  const connection = require('./db');
  connection.query(`SELECT * FROM users WHERE username = "${data[0]}" OR email = "${data[1].email}"`,
    (err, results, fields) => {
      if (err) {
        throw err;
      } else if (results.length != 0) {
        console.log('username already taken');
        req.flash('usernameTaken','Username has already been taken');
        res.render('signup',{flash:req.flash('usernameTaken')});
      } else {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if(err) throw err;
          const data = [[username, email, hash, profileImage]];
          addUser(data, connection, req, res);
        })
      }
  });
}

function addUser (data, connection, req, res) {
  connection.query('INSERT INTO users (username, email, password, profileImage) VALUES ?', [data], (err, results, fields) => {
    if(err) {
      throw err;
    } else {
      console.log('Data inserted successfully');
      selectByUsername(data[0][0], connection, req, res);
    }
  })
}

function selectByUsername (username, connection, req, res){
  connection.query(`SELECT * FROM users WHERE username = "${username}"`,(err, results, fields) => {
    if(err) throw err;
    else {
      req.login(results[0],(err)=> {
        if(err) throw err;
        console.log(req.isAuthenticated());
        res.redirect('/myTodo');
      })
    }
  });
}

module.exports.loginUser = (username, password, done) => {
  const connection = require('./db');
  connection.query(`SELECT * FROM users WHERE username = "${username}"`,(err, results, fields) => {
    if(err) throw err;
    if(results.length == 0) {
      return done(null, false);
    } else{
      const hash = results[0].password;
      bcrypt.compare(password, hash, (err, response) => {
        if(response) {
          console.log(results[0]);
          return done(null, results[0]);
        } else {
          return done(null, false);
        }
      })
    }
  })
}

module.exports.getProfile = (id, req, res, next) => {
  const connection = require('./db');
  connection.query(`SELECT * FROM users WHERE id = "${id}"`,(err, results, fields) => {
    if(err) throw err;
    if(results.length == 0) {
      next();
    } else{
      res.locals.profile = results[0];
      next();
    }
  })
}

module.exports.insertTodo = (data, req, res) => {
  const connection = require('./db');
  connection.query('INSERT INTO data (userId, dateTime, data) VALUES ?', [data], (err, results, fields) => {
    if(err) {
      throw err;
    } else {
      console.log('Todo inserted successfully');
      getTodos(data[0][0], req, res);
    }
  })
}

function getTodos(id, req, res) {
  const connection = require('./db');
  connection.query(`SELECT * from data where userId=${id}`, (err, results, fields) => {
    if(err) {
      throw err;
    } else {
      res.locals.todos = results;
      res.render('todos',{flash:req.flash('successSignup')});
    }
  })
}

module.exports.addFbUser = (data, req, res, user)=> {
  const connection = require('./db');
  connection.query(`SELECT * FROM users WHERE id = "${data[0]}"`,(err, results, fields) => {
    if(err) {
      throw err;
    } else {
      if(results.length != 0) {
        req.login(user, (err) => {
          if(err) throw err;
          res.redirect('/myTodo');
        })
      } else {
        connection.query('INSERT INTO users (id, username, email, profileImage) VALUES ?', [data], (err, results, fields) => {
          if(err) {
            throw err;
          } else {
            console.log('Data inserted successfully');
            req.login(user,(err) => {
              if(err) throw err;
              res.redirect('/myTodo');
            })
          }
        })
      }
    }
  })
}

module.exports.getTodos = getTodos;
