const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const checkImage = require('../middlewares/checkImage.js');

const uploadController = require('../controllers/upload.js');

// 上傳圖片
router.post('/image', auth, checkImage, uploadController.uploadImage);

module.exports = router;
