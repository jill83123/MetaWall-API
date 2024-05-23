const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { generalLimiter } = require('./middlewares/rateLimiters.js');
const handleError = require('./service/handleError.js');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.js');

// 記錄重大錯誤
process.on('uncaughtException', (err) => {
  console.error('Uncaught Fatal Exception !\n', err);
  process.exit(1);
});

// 未捕捉到的 catch
process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection:\n', promise);
  console.error('原因:\n', reason);
});

// router
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const uploadRouter = require('./routes/upload');

const app = express();

// 連接資料庫
require('./connections/mongodb.js');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(generalLimiter);

// router
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/upload', uploadRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// catch 404
app.use((req, res, next) => {
  res.status(404).send({
    success: false,
    message: 'API 路徑不存在',
  });
});

// error handler
app.use((err, req, res, next) => {
  handleError(err);

  const response = {
    success: false,
    message: err.message || '發生錯誤，請聯絡管理員',
  };

  if (process.env.NODE_ENV === 'dev') {
    response.error = err;
  }

  res.status(err.statusCode || 500).send(response);
});

module.exports = app;
