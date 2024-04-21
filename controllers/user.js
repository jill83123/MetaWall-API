const User = require('../models/user.js');

const validator = require('validator');
const bcrypt = require('bcryptjs');
const generateJWT = require('../service/generateJWT.js');

const handleSuccess = require('../service/handleSuccess.js');
const createCustomError = require('../service/createCustomError.js');

function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

const UserController = {
  async sign_up(req, res, next) {
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

    handleSuccess({ res, message: '註冊成功', data: { token, expires } });
  },

  async sign_in(req, res, next) {
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
  },

  async updatePassword(req, res, next) {
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
  },

  async getUserData(req, res, next) {
    const { name, photo, gender } = req.user;

    const data = {
      user: {
        name,
        photo,
        gender,
      },
    };

    handleSuccess({ res, message: '取得資料成功', data });
  },

  async editUserData(req, res, next) {
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
  },
};

module.exports = UserController;
