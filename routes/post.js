const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post.js');

// 新增待辦
router.post('/', PostController.createPost);

// 編輯待辦
router.patch('/:id', PostController.editPost);

// 刪除單筆待辦
router.delete('/:id', PostController.deletePost);

module.exports = router;
