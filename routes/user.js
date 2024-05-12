const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const UserController = require('../controllers/user.js');

/**
 * @swagger
 * /user/sign_up:
 *   post:
 *     summary: 註冊
 *     tags:
 *       - 使用者相關
 *     description: |
 *       ### 注意事項
 *       1. 暱稱至少 2 個字元以上
 *       2. 密碼需 8 碼以上、至少包含一個字母和數字
 */
router.post('/sign_up', UserController.sign_up);

/**
 * @swagger
 * /user/sign_in:
 *   post:
 *     summary: 登入
 *     tags:
 *       - 使用者相關
 *     description:
 */
router.post('/sign_in', UserController.sign_in);

/**
 * @swagger
 * /user/updatePassword:
 *   post:
 *     summary: 重設密碼
 *     tags:
 *       - 使用者相關
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### 注意事項
 *       重設密碼後就必需重新登入
 */
router.post('/updatePassword', auth, UserController.updatePassword);

/**
 * @swagger
 * /user/check:
 *   post:
 *     summary: 驗證使用者
 *     tags:
 *       - 使用者相關
 *     security:
 *       - bearerAuth: []
 *     description: 驗證 token 是否正確或過期
 */
router.post('/check', auth, UserController.checkUser);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: 取得個人資料
 *     tags:
 *       - 使用者相關
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.get('/profile', auth, UserController.getUserData);

/**
 * @swagger
 * /user/profile:
 *   patch:
 *     summary: 編輯個人資料
 *     tags:
 *       - 使用者相關
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.patch('/profile', auth, UserController.editUserData);

/**
 * @swagger
 * /user/following:
 *   get:
 *     summary: 取得個人追蹤名單
 *     tags:
 *       - 追蹤功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.get('/following', auth, UserController.getFollowingList);

/**
 * @swagger
 * /user/{userId}/follow:
 *   post:
 *     summary: 追蹤某個使用者
 *     tags:
 *       - 追蹤功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.post('/:id/follow', auth, UserController.followUser);

/**
 * @swagger
 * /user/{userId}/unfollow:
 *   delete:
 *     summary: 取消追蹤某個使用者
 *     tags:
 *       - 追蹤功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.delete('/:id/unfollow', auth, UserController.unfollowUser);

/**
 * @swagger
 * /user/getLikePosts:
 *   get:
 *     summary: 取得個人按讚列表
 *     tags:
 *       - 貼文按讚功能
 *     security:
 *       - bearerAuth: []
 *     description:
 */
router.get('/getLikePosts', auth, UserController.getLikePosts);

module.exports = router;
