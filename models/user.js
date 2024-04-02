const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name 為必填'],
    },

    email: {
      type: String,
      required: [true, 'email 為必填'],
      unique: true,
      lowercase: true,
    },

    photo: {
      type: String,
      default: '',
    },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
