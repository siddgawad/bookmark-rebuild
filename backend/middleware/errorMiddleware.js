const errorHandler = (err, req, res, next) => {
    console.error('Error Handler:', err);
  
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', tokenExpired: true });
    }
  
    // Handle Redis errors
    if (err.message && err.message.includes('Redis')) {
      return res.status(503).json({ message: 'Service temporarily unavailable' });
    }
  
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
  
    // Handle mongoose unique constraint errors
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(409).json({ 
        message: 'Duplicate key error - resource already exists',
        field: Object.keys(err.keyValue)[0]
      });
    }
  
    // Handle mongoose cast errors (invalid ObjectId etc.)
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
  
    // Default to 500 internal server error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    return res.status(statusCode).json({
      message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
  };
  
  export default errorHandler;