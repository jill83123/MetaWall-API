const handleAsyncCatch = require('../service/handleAsyncCatch.js');
const createCustomError = require('../service/createCustomError.js');

const isVerifiedEmail = handleAsyncCatch(async (req, res, next) => {
  if (!req.user.isVerifiedEmail) {
    next(createCustomError({ statusCode: 403, message: '您尚未驗證信箱，無法使用此功能' }));
    return;
  }
  next();
});

module.exports = isVerifiedEmail;
