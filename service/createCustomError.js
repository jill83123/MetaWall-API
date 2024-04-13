function createCustomError({ statusCode, message, next }) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;

  next(error);
}

module.exports = createCustomError;
