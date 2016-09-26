const defaultErrorMessage = 'Unknown error';

export function ClientError(err, req, res, next) {
  if (err.httpCode) { // is HttpError object?
    console.error('Client Error', err); //todo: remove in production
    res.status(err.httpCode).json({
      error: err
    });
  } else {
    next(err);
  }
}

export function ApiError(err, req, res, next) {
  console.error('Server Error', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: {
      description: err && err.message || defaultErrorMessage,
      httpCode: 500,
      restParams: err.restParams || {}
    }
  });
}