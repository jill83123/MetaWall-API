const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const PostController = require('../controllers/post.js');

// 新增貼文
router.post('/', auth, PostController.createPost);

// 編輯貼文
router.patch('/:id', PostController.editPost);

// 刪除單筆貼文
router.delete('/:id', PostController.deletePost);

module.exports = router;
