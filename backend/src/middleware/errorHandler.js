// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: `Unique constraint violation on ${err.meta.target}`
      });
    }
    return res.status(400).json({
      error: 'Database Error',
      message: err.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.error || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

module.exports = errorHandler;
