const Post = require('../models/post.js');
const User = require('../models/user.js');

const handleSuccess = require('../service/handleSuccess.js');
const createCustomError = require('../service/createCustomError.js');

const PostController = {
  async getPosts(req, res, next) {
    const { sort, q } = req.query;
    const timeSort = sort === 'asc' ? 'createdAt' : '-createdAt';
    const keywords = q !== '' && q !== undefined ? { content: new RegExp(req.query.q) } : {};

    const posts = await Post.find(keywords)
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .sort(timeSort);

    if (Object.keys(keywords).length !== 0 && posts.length === 0) {
      next(createCustomError({ statusCode: 404, message: '找不到相關貼文' }));
      return;
    }

    handleSuccess({ res, data: { posts } });
  },

  async createPost(req, res, next) {
    const { body } = req;

    const post = await Post.create({
      user: body.user,
      image: body.image || '',
      content: body.content,
      type: body.type,
      tags: body.tags || [],
      createdAt: Date.now(),
    });

    handleSuccess({ res, message: '新增成功', data: { post } });
  },

  async editPost(req, res, next) {
    const { body } = req;
    const { id } = req.params;

    if (!Object.keys(body).length) {
      next(createCustomError({ statusCode: 400, message: '修改欄位不得為空' }));
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

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '找不到 id' }));
      return;
    }

    handleSuccess({ res, message: '修改成功', data: { post } });
  },

  async deleteAllPosts(req, res, next) {
    const post = await Post.deleteMany();
    handleSuccess({
      res,
      message: `已刪除所有貼文(共 ${post.deletedCount} 筆)`,
      data: { posts: [] },
    });
  },

  async deletePost(req, res, next) {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '找不到 id' }));
      return;
    }

    handleSuccess({ res, message: '刪除成功' });
  },
};

module.exports = PostController;
