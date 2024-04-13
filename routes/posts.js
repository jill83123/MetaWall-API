const express = require('express');
const router = express.Router();

const PostController = require('../controllers/post.js');
const handleAsyncCatch = require('../service/handleAsyncCatch.js');

// 取得所有待辦
router.get('/', handleAsyncCatch(PostController.getPosts));

// 刪除所有待辦
router.delete('/', handleAsyncCatch(PostController.deleteAllPosts));

module.exports = router;
