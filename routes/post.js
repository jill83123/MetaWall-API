const express = require('express');
const router = express.Router();

const PostController = require('../controllers/post.js');

const auth = require('../middlewares/auth.js');
const handleAsyncCatch = require('../middlewares/handleAsyncCatch.js');

// 新增待辦
router.post('/', handleAsyncCatch(auth), handleAsyncCatch(PostController.createPost));

// 編輯待辦
router.patch('/:id', handleAsyncCatch(PostController.editPost));

// 刪除單筆待辦
router.delete('/:id', handleAsyncCatch(PostController.deletePost));

module.exports = router;
