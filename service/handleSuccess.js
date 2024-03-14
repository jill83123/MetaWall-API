function handleSuccess({ res, message = '', data }) {
  res.send({
    success: true,
    message,
    data,
  });
}

module.exports = handleSuccess;
