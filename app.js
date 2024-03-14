const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const handleError = require('./service/handleError.js');

// router
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');

const app = express();

// 連接資料庫
require('./connections/Mongodb.js');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// router
app.use('/post', postRouter);
app.use('/posts', postsRouter);

// catch 404
app.use((req, res, next) => {
  handleError({ res, status: 404, message: 'API 路徑不存在' });
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.type === 'entity.parse.failed') {
    return handleError({ res, err, message: '格式錯誤' });
  }

  handleError({ res, err, status: err.status || 500 });
});

module.exports = app;
