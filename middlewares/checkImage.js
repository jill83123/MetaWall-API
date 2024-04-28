const path = require('path');
const multer = require('multer');
const createCustomError = require('../service/createCustomError.js');

const upload = multer({
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ext.match(/\.(jpg|jpeg|png)$/)) {
      cb(
        createCustomError({
          statusCode: 400,
          message: '圖片格式錯誤，僅限 jpg、jpeg、png 格式',
        })
      );
    }

    cb(null, true);
  },
}).single('image');

module.exports = upload;
