const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user 為必填'],
    },

    image: {
      type: String,
      default: '',
    },

    content: {
      type: String,
      required: [true, 'content 為必填'],
      validate: {
        validator: function (content) {
          return content.trim().length !== 0;
        },
        message: 'content 不得為空',
      },
    },

    likes: {
      type: Number,
      default: 0,
    },

    comments: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: {
        values: ['friend', 'public'],
        message: 'type 只能是 friend 或 public',
      },
      required: [true, 'type 為必填'],
    },

    tags: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (tags) {
          if (!Array.isArray(tags)) return false;

          for (const tag of tags) {
            if (typeof tag !== 'string' || tag.trim() === '') {
              return false;
            }
          }
          return true;
        },
        message: 'tags 型別錯誤或不得為空',
      },
    },

    createdAt: {
      type: Number,
      immutable: true,
    },

    updatedAt: {
      type: Number,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
