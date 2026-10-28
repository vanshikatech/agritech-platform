// 404 Not Found Handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.type === 'entity.parse.failed') statusCode = 400;
  if (err.code === 11000) statusCode = 409;
  if (err.message === 'Origin is not allowed by CORS') statusCode = 403;
  if (err.name === 'MongooseServerSelectionError') statusCode = 503;
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'The request could not be completed. Please try again later.'
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

const sendControllerError = (res, err) => {
  let statusCode = err.statusCode || 500;
  if (err.name === 'ValidationError' || err.name === 'CastError') statusCode = 400;
  if (err.code === 11000) statusCode = 409;
  if (['MongooseServerSelectionError', 'MongoNetworkError'].includes(err.name)) statusCode = 503;
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'The request could not be completed. Please try again later.'
    : err.message;
  return res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler, sendControllerError };
