const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.js');

const auth = require('../middlewares/auth.js');
const handleAsyncCatch = require('../middlewares/handleAsyncCatch.js');

// 註冊
router.post('/sign_up', handleAsyncCatch(UserController.sign_up));

// 登入
router.post('/sign_in', handleAsyncCatch(UserController.sign_in));

// 修改密碼
router.post(
  '/updatePassword',
  handleAsyncCatch(auth),
  handleAsyncCatch(UserController.updatePassword)
);

// 取得個人資料
router.get('/profile', handleAsyncCatch(auth), handleAsyncCatch(UserController.getUserData));

// 編輯個人資料
router.patch('/profile', handleAsyncCatch(auth), handleAsyncCatch(UserController.editUserData));

module.exports = router;
