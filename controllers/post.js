const Post = require('../models/post.js');
const User = require('../models/user.js');

const handleSuccess = require('../service/handleSuccess.js');
const handleAsyncCatch = require('../service/handleAsyncCatch.js');
const createCustomError = require('../service/createCustomError.js');

const PostController = {
  getPosts: handleAsyncCatch(async (req, res, next) => {
    const { sort, q } = req.query;

    const timeSort = sort === 'asc' ? 'createdAt' : '-createdAt';
    const keywords = new RegExp(q);

    let fields = {};
    if (q?.trim()) {
      fields = { $or: [{ content: keywords }, { tags: keywords }] };
    }

    const posts = await Post.find(fields)
      .populate({
        path: 'user',
        select: '+name +photo -_id',
      })
      .sort(timeSort);

    if (q?.trim() && posts.length === 0) {
      next(createCustomError({ statusCode: 404, message: '找不到相關貼文' }));
      return;
    }

    handleSuccess({ res, data: { posts } });
  }),

  createPost: handleAsyncCatch(async (req, res, next) => {
    const { id } = req.user;
    const { image, content, type, tags } = req.body;

    const post = await Post.create({
      user: id,
      image: image || '',
      content,
      type,
      tags: tags || [],
      createdAt: Date.now(),
    });

    post.user = undefined;
    handleSuccess({ res, message: '新增成功', data: { post } });
  }),

  editPost: handleAsyncCatch(async (req, res, next) => {
    const { id } = req.params;
    const { image, content, type, tags } = req.body;

    if (!Object.keys(req.body).length) {
      next(createCustomError({ statusCode: 400, message: '修改欄位不得為空' }));
      return;
    }

    const editData = {
      image,
      content,
      type,
      tags,
      updatedAt: Date.now(),
    };

    const post = await Post.findByIdAndUpdate(id, editData, { new: true, runValidators: true });

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '找不到 id' }));
      return;
    }

    post.user = undefined;
    handleSuccess({ res, message: '修改成功', data: { post } });
  }),

  deleteAllPosts: handleAsyncCatch(async (req, res, next) => {
    const post = await Post.deleteMany();

    if (post.deletedCount === 0) {
      next(createCustomError({ statusCode: 400, message: '已沒有貼文可刪除' }));
      return;
    }

    handleSuccess({
      res,
      message: `已刪除所有貼文(共 ${post.deletedCount} 筆)`,
      data: { posts: [] },
    });
  }),

  deletePost: handleAsyncCatch(async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '找不到 id' }));
      return;
    }

    handleSuccess({ res, message: '刪除成功' });
  }),
};

module.exports = PostController;
