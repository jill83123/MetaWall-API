const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const PostController = require('../controllers/post.js');

router.get('/:id', auth, PostController.getPost);
router.post('/', auth, PostController.createPost);
router.patch('/:id', PostController.editPost);
router.delete('/:id', PostController.deletePost);

router.post('/:id/like', auth, PostController.likePost);
router.delete('/:id/unlike', auth, PostController.unlikePost);

router.post('/:id/comment', auth, PostController.createComment);
router.patch('/comment/:id', auth, PostController.editComment);
router.delete('/comment/:id', auth, PostController.deleteComment);

module.exports = router;
