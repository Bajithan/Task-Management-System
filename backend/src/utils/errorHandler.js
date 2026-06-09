const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
      details: err.details || null,
    },
  });
};

module.exports = { errorHandler };