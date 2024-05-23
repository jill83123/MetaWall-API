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
    },

    isVerifiedEmail: {
      type: Boolean,
      default: false,
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
      default: 'intersex',
      enum: {
        values: ['female', 'male', 'intersex'],
        message: 'gender 只能是 female 或 male 或 intersex',
      },
    },

    photo: {
      type: String,
      default:
        'https://firebasestorage.googleapis.com/v0/b/metawall-97514.appspot.com/o/images%2F350746b6-05b6-44fe-8c78-3f51106a90cb.png?alt=media&token=a893adda-d7db-4b0b-829d-2d36e7c5bf00',
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
