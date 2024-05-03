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

// 按讚一篇貼文
router.post('/:id/like', auth, PostController.likePost);

// 取消按讚一篇貼文
router.delete('/:id/unlike', auth, PostController.unlikePost);

module.exports = router;
