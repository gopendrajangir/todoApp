const mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit: 10,
  host:'sql12.freemysqlhosting.net',
  user:'sql12252465',
  password:'aDNMD2Xavr',
  database:'sql12252465'
})

pool.getConnection((err, connection) => {
  if(err) {
    console.log('unable to connect to server');
  } else {
    module.exports = connection;
  }
})
