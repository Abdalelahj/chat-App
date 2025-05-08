const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
  
    res.status(statusCode).json({
      success: false,
      error: {
        message: err.message || "Something went wrong",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  };
  
module.exports = errorHandler

// error status