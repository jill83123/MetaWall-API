const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('mongodb 連線成功');
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
