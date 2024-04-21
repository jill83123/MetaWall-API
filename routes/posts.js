const express = require('express');
const router = express.Router();

const PostController = require('../controllers/post.js');

const auth = require('../middlewares/auth.js');
const handleAsyncCatch = require('../middlewares/handleAsyncCatch.js');

// 取得所有貼文
router.get('/', handleAsyncCatch(auth), handleAsyncCatch(PostController.getPosts));

// 刪除所有貼文
router.delete('/', handleAsyncCatch(PostController.deleteAllPosts));

module.exports = router;
