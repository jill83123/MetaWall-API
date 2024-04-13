function handleAsyncCatch(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((error) => next(error));
  };
}

module.exports = handleAsyncCatch;
