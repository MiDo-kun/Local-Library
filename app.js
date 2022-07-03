require('dotenv').config({path: `${__dirname}/.env`});

const createError = require('http-errors');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
const catalogRouter = require('./routes/catalog.js');

// Connecting to the MongoDB Atlas Database
const mongoDB = process.env.MONGODB_URI;

// Connecting to local database
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => {
      console.log("Connected to the database....");
   }).catch(() => {
      console.log("Connection Failed.");
   });

const app = express();

app.set('/views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);


app.use((req, res, next) => {
   next(createError(404));
});

app.use((error, request, response, next) => {
   response.locals.message = error.message;
   response.locals.error = request.app.get('env') === 'development' ? error : {};

   response.status(error.status || 500);
   response.render('error');
});

module.exports = app;