const jwt = require('jsonwebtoken');
const ms = require('ms');

require('dotenv').config();

function generateJWT(data) {
  const expiresIn = process.env.JWT_EXPIRES;
  const expiresInTimestamp = Date.now() + ms(expiresIn);

  const token = jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  return {
    token,
    expires: expiresInTimestamp,
  };
}

module.exports = generateJWT;
