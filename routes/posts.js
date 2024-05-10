const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const PostController = require('../controllers/post.js');

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: 取得所有貼文
 *     tags:
 *       - 動態貼文
 *     security:
 *       - bearerAuth: []
 *     description: 僅顯示 **空開貼文** 以及 **追蹤中的使用者的貼文**
 */
router.get('/', auth, PostController.getPosts);

/**
 * @swagger
 * '/posts/user/{userId}':
 *   get:
 *     summary: 取得個人所有貼文
 *     tags:
 *       - 動態貼文
 *     security:
 *       - bearerAuth: []
 *     description: 取得某個使用者的所有貼文
 */
router.get('/user/:id', auth, PostController.getUserPosts);

// router.delete('/', PostController.deleteAllPosts);

module.exports = router;
