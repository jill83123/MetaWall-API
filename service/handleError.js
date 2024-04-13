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

function handleError(err) {
  if (err && err instanceof mongoose.Error) {
    const { mongooseErrorMessage, mongooseErrorStatus } = handleMongooseError(err);
    err.isOperational = true;
    err.statusCode = mongooseErrorStatus;
    err.message = mongooseErrorMessage;
  }

  if (err && err.type === 'entity.parse.failed') {
    err.isOperational = true;
    err.message = '格式錯誤';
  }

  return err;
}

module.exports = handleError;
