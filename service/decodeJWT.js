const jwt = require('jsonwebtoken');

async function decodeJWT(token) {
  return await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
}

module.exports = decodeJWT;
