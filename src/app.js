'use strict';

/**
 * Setting up a global http error for handle API errors
 */
import { HttpError } from './utils/http-error';
global.HttpError = HttpError;

import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import formData from 'express-form-data';
import apiRouter from './route';
import config from './utils/config';

let app = express();
  
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(formData.parse());
app.use(formData.stream());
app.use(formData.union());
app.use(cookieParser(config.cookieSecret));
app.enable('trust proxy');
app.use(session({
  secret: config.sessionSecret, //'keyboard cat offset',
  resave: false,
  saveUninitialized: true
}));

/*
 * Connecting routers
 */
app.use('/cdn', [(req, res, next) => {
  //todo: control access
  console.log('Serving file...');
  next();
}], express.static('cdn'));

app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  res.writeHead(404);
  res.write('Not found');
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.error(err);
    res.end();
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.end();
});

export default app;