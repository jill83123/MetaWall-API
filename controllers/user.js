const User = require('../models/user.js');
const Post = require('../models/post.js');

const validator = require('validator');
const bcrypt = require('bcryptjs');
const generateJWT = require('../service/generateJWT.js');
const decodeJWT = require('../service/decodeJWT.js');
const sendVerificationMail = require('../service/sendVerificationMail.js');

const handleSuccess = require('../service/handleSuccess.js');
const handleAsyncCatch = require('../service/handleAsyncCatch.js');
const createCustomError = require('../service/createCustomError.js');

function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

const UserController = {
  sign_up: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /user/sign_up:
     *   post:
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: String
     *                 description: 暱稱
     *               email:
     *                 type: String
     *                 description: 信箱
     *               password:
     *                 type: String
     *                 description: 密碼
     *               confirmPassword:
     *                 type: String
     *                 description: 確認密碼
     *             required:
     *               - name
     *               - email
     *               - password
     *               - confirmPassword
     *           example:
     *             name: Jill
     *             email: jill0407@gmail.com
     *             password: abc12345
     *             confirmPassword: abc12345
     */
    const { name, email, password, confirmPassword } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      next(createCustomError({ statusCode: 400, message: '欄位缺少或不得空白' }));
      return;
    }

    if (name.length < 2) {
      next(createCustomError({ statusCode: 400, message: 'name 至少 2 個字元以上' }));
      return;
    }

    if (!validatePassword(password)) {
      next(
        createCustomError({
          statusCode: 400,
          message: 'password 需 8 碼以上、至少包含一個字母和數字',
        })
      );
      return;
    }

    if (password !== confirmPassword) {
      next(createCustomError({ statusCode: 400, message: 'password 與 confirmPassword 不一致' }));
      return;
    }

    const newUser = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });

    const { id, auth_time } = newUser;
    const { token, expires } = generateJWT({ id, auth_time });

    await sendVerificationMail(newUser);
    handleSuccess({ res, message: '註冊成功', data: { token, expires } });
  }),

  sign_in: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /user/sign_in:
     *   post:
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: String
     *                 description: 信箱
     *               password:
     *                 type: String
     *                 description: 密碼
     *             required:
     *               - email
     *               - password
     *           example:
     *             email: jill0407@gmail.com
     *             password: abc12345
     */
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      next(createCustomError({ statusCode: 400, message: '欄位缺少或不得空白' }));
      return;
    }

    const user = await User.findOne({ email }).select('+password +auth_time');
    if (!user) {
      next(createCustomError({ statusCode: 404, message: '此帳號尚未註冊' }));
      return;
    }

    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth) {
      next(createCustomError({ statusCode: 401, message: '密碼不正確' }));
      return;
    }

    const { id, auth_time } = user;
    const { token, expires } = generateJWT({ id, auth_time });

    handleSuccess({ res, message: '登入成功', data: { token, expires } });
  }),

  updatePassword: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /user/updatePassword:
     *   post:
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               oldPassword:
     *                 type: String
     *                 description: 密碼
     *               newPassword:
     *                 type: String
     *                 description: 重設後的密碼
     *               confirmNewPassword:
     *                 type: String
     *                 description: 確認重設後的密碼
     *             required:
     *               - oldPassword
     *               - newPassword
     *               - confirmNewPassword
     *           example:
     *             oldPassword: abc12345
     *             newPassword: a1234567
     *             confirmNewPassword: a1234567
     */
    const { id, password } = req.user;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const isAuth = await bcrypt.compare(oldPassword, password);
    if (!isAuth) {
      next(createCustomError({ statusCode: 401, message: '密碼不正確' }));
      return;
    }

    if (!validatePassword(newPassword)) {
      next(
        createCustomError({
          statusCode: 400,
          message: 'password 需 8 碼以上、至少包含一個字母和數字',
        })
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      next(
        createCustomError({ statusCode: 400, message: 'newPassword 與 confirmNewPassword 不一致' })
      );
      return;
    }

    const updateData = {
      password: await bcrypt.hash(newPassword, 12),
      updatedAt: Date.now(),
      auth_time: Date.now(),
    };
    await User.findByIdAndUpdate({ _id: id }, updateData, { runValidators: true });

    const { token, expires } = generateJWT({ id, auth_time: updateData.auth_time });
    handleSuccess({ res, message: '密碼修改成功', data: { token, expires } });
  }),

  checkUser: handleAsyncCatch(async (req, res, next) => {
    handleSuccess({ res, message: '驗證成功' });
  }),

  getUserData: handleAsyncCatch(async (req, res, next) => {
    const { id, name, photo, gender, isVerifiedEmail } = req.user;

    const data = {
      user: {
        id,
        name,
        photo,
        gender,
        isVerifiedEmail,
      },
    };

    handleSuccess({ res, message: '取得資料成功', data });
  }),

  editUserData: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /user/profile:
     *   patch:
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: String
     *                 description: 暱稱
     *               photo:
     *                 type: String
     *                 description: 大頭貼
     *               gender:
     *                 type: String
     *                 description: 性別
     *           example:
     *             name: Fang
     *             photo: https://test.png
     *             gender: female
     */
    const { name, photo, gender } = req.body;

    if (!name?.trim() || !gender?.trim()) {
      next(createCustomError({ statusCode: 400, message: '欄位缺少或不得空白' }));
      return;
    }

    const isURL = await validator.isURL(photo);
    if (photo?.trim() && !isURL) {
      next(createCustomError({ statusCode: 400, message: 'photo 需為有效的網址' }));
      return;
    }

    const updateData = {
      name,
      photo,
      gender,
      updatedAt: Date.now(),
    };
    const newUserData = await User.findByIdAndUpdate({ _id: req.user.id }, updateData, {
      new: true,
      runValidators: true,
    });

    const data = {
      user: {
        name: newUserData.name,
        photo: newUserData.photo,
        gender: newUserData.gender,
      },
    };
    handleSuccess({ res, message: '修改資料成功', data });
  }),

  getFollowingList: handleAsyncCatch(async (req, res, next) => {
    const user = await User.findOne({ _id: req.user.id }).populate({
      path: 'following',
      populate: { path: 'user', select: 'name photo' },
    });

    const followingList = user.following || [];
    handleSuccess({ res, message: '取得追蹤列表成功', data: { followingList } });
  }),

  followUser: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /user/{userId}/follow:
     *  post:
     *    parameters:
     *      - $ref: '#/components/parameters/userIdParam'
     */
    const currentUserId = req.user.id;
    const { id: followedUserId } = req.params;

    if (currentUserId === followedUserId) {
      next(createCustomError({ statusCode: 400, message: '無法追蹤自己' }));
      return;
    }

    const followedUser = await User.findOne({ _id: followedUserId });
    if (!followedUser) {
      next(createCustomError({ statusCode: 404, message: '該名使用者不存在' }));
      return;
    }

    const isFollowing = followedUser.followers.some(
      (item) => item.user.toString() === currentUserId.toString()
    );
    if (isFollowing) {
      next(createCustomError({ statusCode: 400, message: '已追蹤該名使用者' }));
      return;
    }

    await User.findByIdAndUpdate(
      { _id: followedUserId },
      { $push: { followers: { user: currentUserId } } },
      { runValidators: true }
    );

    const currentUser = await User.findByIdAndUpdate(
      { _id: currentUserId },
      { $push: { following: { user: followedUserId } } },
      { runValidators: true, new: true }
    ).populate({
      path: 'following',
      populate: { path: 'user', select: 'name photo' },
    });

    const followingList = currentUser.following || [];
    handleSuccess({ res, message: '追蹤成功', data: { followingList } });
  }),

  unfollowUser: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /user/{userId}/unfollow:
     *  delete:
     *    parameters:
     *      - $ref: '#/components/parameters/userIdParam'
     */
    const currentUserId = req.user.id;
    const { id: followedUserId } = req.params;

    if (currentUserId === followedUserId) {
      next(createCustomError({ statusCode: 400, message: '無法取消追蹤自己' }));
      return;
    }

    const followedUser = await User.findOne({ _id: followedUserId });
    if (!followedUser) {
      next(createCustomError({ statusCode: 404, message: '該名使用者不存在' }));
      return;
    }

    const isFollowing = followedUser.followers.some(
      (item) => item.user.toString() === currentUserId.toString()
    );
    if (!isFollowing) {
      next(createCustomError({ statusCode: 400, message: '已取消追蹤該名使用者' }));
      return;
    }

    await User.findByIdAndUpdate(
      { _id: followedUserId },
      { $pull: { followers: { user: currentUserId } } },
      { runValidators: true }
    );

    const currentUser = await User.findByIdAndUpdate(
      { _id: currentUserId },
      { $pull: { following: { user: followedUserId } } },
      { runValidators: true, new: true }
    ).populate({
      path: 'following',
      populate: { path: 'user', select: 'name photo' },
    });

    const followingList = currentUser.following || [];
    handleSuccess({ res, message: '取消追蹤成功', data: { followingList } });
  }),

  getLikePosts: handleAsyncCatch(async (req, res, next) => {
    const likePosts = await Post.find({
      likes: { $in: [req.user.id] },
    })
      .select('user createdAt')
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .lean();

    handleSuccess({ res, message: '取得按讚列表成功', data: { likePosts } });
  }),

  verifyMail: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /user/verifyMail:
     *  post:
     *    requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: String
     *                 description: 用於驗證信箱的 token
     *             required:
     *               - token
     *             example:
     *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NGUxODEyMGQxNzE0ZDcxYjU0ZTY3NSIsImlhdCI6MTcxNjM5NDAwMiwiZXhwIjoxNzE2Mzk0NjAyfQ.1o3ceXcc-7w2eY_3vv3hgDU2VRnoOoNndlmfeMOhJcs
     */
    const { token } = req.body;
    const decode = await decodeJWT(token);

    const userData = await User.findByIdAndUpdate({ _id: decode.id }, { isVerifiedEmail: true });

    if (!userData) {
      next(createCustomError({ statusCode: 401, message: '驗證失敗，請確認網址是否正確' }));
      return;
    }
    if (userData.isVerifiedEmail) {
      next(createCustomError({ statusCode: 400, message: '已成功驗證信箱' }));
      return;
    }

    handleSuccess({ res, message: '驗證成功' });
  }),

  sendVerificationMail: handleAsyncCatch(async (req, res, next) => {
    if (req.user.isVerifiedEmail) {
      next(createCustomError({ statusCode: 400, message: '已成功驗證信箱' }));
      return;
    }

    await sendVerificationMail(req.user);
    handleSuccess({ res, message: '發送成功' });
  }),
};

module.exports = UserController;
