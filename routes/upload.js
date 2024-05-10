const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const checkImage = require('../middlewares/checkImage.js');

const uploadController = require('../controllers/upload.js');

/**
 * @swagger
 * /upload/image/:
 *   post:
 *     summary: 上傳圖片
 *     tags:
 *       - 其它
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### 圖片限制
 *       1. 僅限 1mb 以下
 *       2. 僅限 JPG、JPEG、PNG 的圖片
 *       ### 大頭貼
 *       1. 圖片寬高比必需為 1:1
 *       2. 解析度寬度至少 300 像素以上
 */
router.post('/image', auth, checkImage, uploadController.uploadImage);

module.exports = router;
