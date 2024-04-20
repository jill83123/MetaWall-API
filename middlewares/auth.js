const User = require('../models/user.js');
const decodeJWT = require('../service/decodeJWT.js');
const createCustomError = require('../service/createCustomError.js');

async function auth(req, res, next) {
  if (!req.headers.authorization?.startsWith('Bearer')) {
    next(createCustomError({ statusCode: 400, message: '缺少驗證資料' }));
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  const decode = await decodeJWT(token);

  const user = await User.findOne({ _id: decode.id }).select('+auth_time +password');

  if (!user) {
    next(createCustomError({ statusCode: 404, message: '此帳號不存在' }));
    return;
  }

  if (decode.auth_time !== user.auth_time) {
    next(createCustomError({ statusCode: 401, message: '驗證失敗，請重新登入' }));
    return;
  }

  req.user = user;

  next();
}

module.exports = auth;
