const Post = require('../models/post.js');
const handleSuccess = require('../service/handleSuccess.js');
const handleError = require('../service/handleError.js');

const PostController = {
  async getPosts(req, res) {
    try {
      const posts = await Post.find();
      handleSuccess({ res, data: { posts } });
    } catch (err) {
      handleError({ res, err });
    }
  },

  async createPost(req, res) {
    try {
      const { body } = req;

      const post = await Post.create({
        name: body.name,
        image: body.image || '',
        content: body.content,
        type: body.type,
        tags: body.tags || [],
        createdAt: Date.now(),
      });

      handleSuccess({ res, message: '新增成功', data: { post } });
    } catch (err) {
      handleError({ res, err });
    }
  },

  async editPost(req, res) {
    try {
      const { body } = req;
      const { id } = req.params;

      if (!Object.keys(body).length) {
        handleError({ res, message: '修改欄位不得為空' });
        return;
      }

      const editData = {
        image: body.image,
        content: body.content,
        type: body.type,
        tags: body.tags,
        updatedAt: Date.now(),
      };

      const post = await Post.findByIdAndUpdate(id, editData, { new: true, runValidators: true });

      if (post) {
        handleSuccess({ res, message: '修改成功', data: { post } });
      } else {
        handleError({ res, status: 404, message: '找不到 id' });
      }
    } catch (err) {
      handleError({ res, err });
    }
  },

  async deleteAllPosts(req, res) {
    try {
      const post = await Post.deleteMany();
      handleSuccess({
        res,
        message: `已刪除所有貼文(共 ${post.deletedCount} 筆)`,
        data: { posts: [] },
      });
    } catch (err) {
      handleError({ res, err });
    }
  },

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findByIdAndDelete(id);

      if (post) {
        handleSuccess({ res, message: '刪除成功' });
      } else {
        handleError({ res, status: 404, message: '找不到 id' });
      }
    } catch (err) {
      handleError({ res, err });
    }
  },
};

module.exports = PostController;
