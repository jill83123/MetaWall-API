const rateLimit = require('express-rate-limit');
const createCustomError = require('../service/createCustomError.js');

const statusCode = 429;

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  handler: (req, res, next) => {
    next(createCustomError({ statusCode, message: '發出過多的請求，請稍後再試！' }));
  },
});

const verifyMailLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
  handler: (req, res, next) => {
    next(createCustomError({ statusCode, message: '已送出驗證信，請於 1 分鐘後再試！' }));
  },
});

module.exports = {
  generalLimiter,
  verifyMailLimiter,
};
