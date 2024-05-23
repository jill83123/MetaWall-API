const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const isVerifiedEmail = require('../middlewares/isVerifiedEmail.js');

const PostController = require('../controllers/post.js');

/**
 * @swagger
 * /post/{postId}:
 *   get:
 *     summary: 取得單一貼文
 *     tags:
 *       - 動態貼文
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.get('/:id', auth, PostController.getPost);

/**
 * @swagger
 * /post:
 *   post:
 *     summary: 新增一篇貼文
 *     tags:
 *       - 動態貼文
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.post('/', auth, isVerifiedEmail, PostController.createPost);

/**
 * @swagger
 * /post/{postId}:
 *   patch:
 *     summary: 編輯單一貼文
 *     tags:
 *       - 動態貼文
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.patch('/:id', auth, isVerifiedEmail, PostController.editPost);

/**
 * @swagger
 * /post/{postId}:
 *   delete:
 *     summary: 刪除單一貼文
 *     tags:
 *       - 動態貼文
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.delete('/:id', auth, isVerifiedEmail, PostController.deletePost);

/**
 * @swagger
 * /post/{postId}/like:
 *   post:
 *     summary: 按讚一篇貼文
 *     tags:
 *       - 貼文按讚功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.post('/:id/like', auth, isVerifiedEmail, PostController.likePost);

/**
 * @swagger
 * /post/{postId}/unlike:
 *   delete:
 *     summary: 取消按讚一篇貼文
 *     tags:
 *       - 貼文按讚功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.delete('/:id/unlike', auth, isVerifiedEmail, PostController.unlikePost);

/**
 * @swagger
 * /post/{postId}/comment:
 *   post:
 *     summary: 新增貼文留言
 *     tags:
 *       - 貼文留言功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.post('/:id/comment', auth, isVerifiedEmail, PostController.createComment);

/**
 * @swagger
 * /post/comment/{commentId}:
 *   patch:
 *     summary: 編輯貼文留言
 *     tags:
 *       - 貼文留言功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.patch('/comment/:id', auth, isVerifiedEmail, PostController.editComment);

/**
 * @swagger
 * /post/comment/{commentId}:
 *   delete:
 *     summary: 刪除貼文留言
 *     tags:
 *       - 貼文留言功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.delete('/comment/:id', auth, isVerifiedEmail, PostController.deleteComment);

module.exports = router;
