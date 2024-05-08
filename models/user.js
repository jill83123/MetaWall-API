const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'email 為必填'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: 'email 格式不正確',
      },
      select: false,
    },

    password: {
      type: String,
      required: [true, 'password 為必填'],
      select: false,
    },

    name: {
      type: String,
      required: [true, 'name 為必填'],
    },

    gender: {
      type: String,
      default: null,
      enum: {
        values: ['female', 'male', 'intersex'],
        message: 'gender 只能是 female 或 male 或 intersex',
      },
    },

    photo: {
      type: String,
      default: null,
    },

    followers: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: [true, 'user 為必填'],
        },
        createdAt: {
          type: Number,
          default: Date.now,
        },
        _id: false,
      },
    ],

    following: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: [true, 'user 為必填'],
        },
        createdAt: {
          type: Number,
          default: Date.now,
        },
        _id: false,
      },
    ],

    createdAt: {
      type: Number,
      default: Date.now(),
      immutable: true,
      select: false,
    },

    updatedAt: {
      type: Number,
      default: null,
      select: false,
    },

    auth_time: {
      type: Number,
      default: Date.now(),
      select: false,
    },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
