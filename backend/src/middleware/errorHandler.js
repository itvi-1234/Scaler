/**
 * Global error handler middleware.
 * Catches all errors thrown in route handlers and returns a consistent JSON response.
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;
