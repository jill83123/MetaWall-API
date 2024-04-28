const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const UserController = require('../controllers/user.js');

// 註冊
router.post('/sign_up', UserController.sign_up);

// 登入
router.post('/sign_in', UserController.sign_in);

// 修改密碼
router.post('/updatePassword', auth, UserController.updatePassword);

// 取得個人資料
router.get('/profile', auth, UserController.getUserData);

// 編輯個人資料
router.patch('/profile', auth, UserController.editUserData);

module.exports = router;
