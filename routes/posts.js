const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const PostController = require('../controllers/post.js');

// 取得所有貼文
router.get('/', auth, PostController.getPosts);

// 刪除所有貼文
router.delete('/', PostController.deleteAllPosts);

module.exports = router;
