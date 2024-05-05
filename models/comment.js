const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'user 為必填'],
    },

    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      required: [true, 'post 為必填'],
    },

    comment: {
      type: String,
      required: [true, 'comment 為必填'],
      validate: {
        validator: function (comment) {
          return comment.trim().length !== 0;
        },
        message: 'comment 不得為空',
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

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
