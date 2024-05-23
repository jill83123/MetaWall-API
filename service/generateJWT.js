const jwt = require('jsonwebtoken');
const ms = require('ms');

require('dotenv').config();

function generateJWT(data, expires) {
  const expiresIn = expires || process.env.JWT_EXPIRES;
  const expiresInTimestamp = Date.now() + ms(expiresIn);

  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn,
  });

  return {
    token,
    expires: expiresInTimestamp,
  };
}

module.exports = generateJWT;
