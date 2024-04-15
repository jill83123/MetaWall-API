function createCustomError({ statusCode, message }) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;

  return error;
}

module.exports = createCustomError;
