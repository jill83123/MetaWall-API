const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post.js');

// 取得所有待辦
router.get('/', PostController.getPosts);

// 刪除所有待辦
router.delete('/', PostController.deleteAllPosts);

module.exports = router;
