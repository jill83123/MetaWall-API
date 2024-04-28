const sizeOf = require('image-size');
const { v4: uuidv4 } = require('uuid');

const firebase = require('../connections/firebase.js');
const bucket = firebase.storage().bucket(); // 建立 Storage 的 Bucket (儲存桶)

const handleSuccess = require('../service/handleSuccess.js');
const handleAsyncCatch = require('../service/handleAsyncCatch.js');
const createCustomError = require('../service/createCustomError.js');

const uploadController = {
  uploadImage: handleAsyncCatch(async (req, res, next) => {
    const { file } = req;
    const { type } = req.query;

    if (!type || (type !== 'avatar' && type !== 'post')) {
      next(createCustomError({ statusCode: 400, message: 'type 錯誤或不得為空' }));
      return;
    }

    if (file === undefined) {
      next(createCustomError({ statusCode: 400, message: '未上傳檔案' }));
      return;
    }

    const dimensions = sizeOf(file.buffer);
    if (type === 'avatar') {
      if (dimensions.width !== dimensions.height) {
        next(createCustomError({ statusCode: 400, message: '圖片寬高比必需為 1:1' }));
        return;
      }
      if (dimensions.width < 300 || dimensions.height < 300) {
        next(createCustomError({ statusCode: 400, message: '解析度寬度至少 300 像素以上' }));
        return;
      }
    }

    const blob = bucket.file(`images/${uuidv4()}.${dimensions.type}`);
    const blobStream = blob.createWriteStream();

    // 開始上傳圖片
    blobStream.end(file.buffer);

    blobStream.on('finish', () => {
      // 設定權限
      const config = {
        action: 'read',
        expires: '12-31-2500',
      };

      blob.getSignedUrl(config, (err, imageUrl) => {
        handleSuccess({ res, message: '上傳成功', data: { imageUrl } });
      });
    });

    blobStream.on('error', (err) => {
      next(createCustomError({ statusCode: 500, message: '上傳失敗' }));
    });
  }),
};

module.exports = uploadController;
