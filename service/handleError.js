const mongoose = require('mongoose');

function handleMongooseError(err) {
  let status = null;
  let errorMessage = null;

  if (err.errors) {
    status = 400;
    const errorFields = Object.keys(err.errors);
    errorMessage = errorFields
      .map((field) => {
        return err.errors[field]?.message || `${field} 型別錯誤`;
      })
      .join('、');
  } else if (err.path === '_id') {
    status = 404;
    errorMessage = '找不到 id';
  } else {
    status = 500;
    errorMessage = '資料庫錯誤';
  }

  return {
    mongooseErrorStatus: status,
    mongooseErrorMessage: errorMessage,
  };
}

function handleError({ res, err, status, message }) {
  let statusCode = status || 400;
  let errorMessage = message || '發生錯誤，請稍後再試';

  if (err && err instanceof mongoose.Error) {
    const { mongooseErrorMessage, mongooseErrorStatus } = handleMongooseError(err);
    statusCode = mongooseErrorStatus;
    errorMessage = mongooseErrorMessage;
  }

  res.status(statusCode).send({
    success: false,
    message: errorMessage,
    error: err,
  });
}

module.exports = handleError;
