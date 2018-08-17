const Router = require('express').Router();
const controllers = require('./../controllers/controllers');

Router.get('/', controllers.myTodo);
Router.get('/todos', controllers.todos);
Router.post('/todos/insertTodo', controllers.insertTodo);
Router.get('/profile', controllers.profile);
Router.get('/logout', controllers.logout);

module.exports = Router;
