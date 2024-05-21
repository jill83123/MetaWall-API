const Post = require('../models/post.js');
const User = require('../models/user.js');
const Comment = require('../models/comment.js');

const handleSuccess = require('../service/handleSuccess.js');
const handleAsyncCatch = require('../service/handleAsyncCatch.js');
const createCustomError = require('../service/createCustomError.js');

const PostController = {
  getPosts: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /posts:
     *   get:
     *     parameters:
     *       - $ref: '#/components/parameters/keywordParam'
     *       - $ref: '#/components/parameters/sortParam'
     */
    const { sort, q } = req.query;
    const timeSort = sort === 'asc' ? 'createdAt' : '-createdAt';

    const user = await User.findById(req.user.id).lean();
    const followingUser = user.following.map((item) => item.user.toString());

    let fields = [
      {
        $or: [{ type: 'public' }, { user: { $in: [...followingUser, req.user.id] } }],
      },
    ];

    if (q?.trim()) {
      const keywords = new RegExp(q);
      fields.push({
        $or: [{ content: keywords }, { tags: keywords }],
      });
    }

    const posts = await Post.find({ $and: fields })
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .populate({
        path: 'comments',
        select: 'comment createdAt updatedAt -post',
      })
      .sort(timeSort)
      .lean();

    if (q?.trim() && posts.length === 0) {
      next(createCustomError({ statusCode: 404, message: '找不到相關貼文' }));
      return;
    }

    posts.forEach((post) => {
      const isLiked = post.likes.some((userId) => userId.toString() === req.user.id);
      post.isLiked = isLiked ? true : false;
      post.likes = post.likes.length;
    });

    handleSuccess({ res, data: { posts }, message: '取得貼文成功' });
  }),

  getPost: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post/{postId}:
     *  get:
     *    parameters:
     *      - $ref: '#/components/parameters/postIdParam'
     */
    const post = await Post.findOne({ _id: req.params.id })
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .populate({
        path: 'comments',
        select: 'comment createdAt updatedAt -post',
      })
      .lean();

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '該筆貼文不存在' }));
      return;
    }

    const isLiked = post.likes.some((userId) => userId.toString() === req.user.id);
    post.isLiked = isLiked ? true : false;
    post.likes = post.likes.length;

    handleSuccess({ res, data: { post }, message: '取得單一貼文成功' });
  }),

  getUserPosts: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /posts/user/{userId}:
     *  get:
     *    parameters:
     *      - $ref: '#/components/parameters/userIdParam'
     *      - $ref: '#/components/parameters/keywordParam'
     *      - $ref: '#/components/parameters/sortParam'
     */
    const user = await User.findById(req.params.id).select('name photo followers').lean();

    if (!user) {
      next(createCustomError({ statusCode: 404, message: '該名使用者不存在' }));
      return;
    }
    user.followers = user?.followers.length || 0;

    const { sort, q } = req.query;
    const timeSort = sort === 'asc' ? 'createdAt' : '-createdAt';
    const keywords = new RegExp(q);

    let fields = {};
    if (q?.trim()) {
      fields = { $or: [{ content: keywords }, { tags: keywords }] };
    }

    const posts = await Post.find({ user: { $in: [req.params.id] }, ...fields })
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .populate({
        path: 'comments',
        select: 'comment createdAt updatedAt -post',
      })
      .sort(timeSort)
      .lean();

    posts.forEach((post) => {
      const isLiked = post.likes.some((userId) => userId.toString() === req.user.id);
      post.isLiked = isLiked ? true : false;
      post.likes = post.likes.length;
    });

    handleSuccess({ res, message: '取得個人所有貼文成功', data: { user, posts } });
  }),

  createPost: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post:
     *   post:
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/postSchema'
     *           example:
     *             content: 當我出門一瞬間，就完蛋啦
     *             image: https://test.png
     *             type: friend
     *             tags:
     *               - 大背頭
     */
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

    const data = {
      ...post.toObject(),
      likes: 0,
      user: undefined,
    };
    handleSuccess({ res, message: '新增成功', data });
  }),

  editPost: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post/{postId}:
     *   patch:
     *     parameters:
     *       - $ref: '#/components/parameters/postIdParam'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/postSchema'
     *           example:
     *             content: 編輯後的內容
     *             image: https://test.png
     *             type: friend
     *             tags:
     *               - 編輯
     */
    const { id } = req.params;
    const { image, content, type, tags } = req.body;

    if (!Object.keys(req.body).length) {
      next(createCustomError({ statusCode: 400, message: '修改欄位不得為空' }));
      return;
    }

    const post = await Post.findById(id);

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '該筆貼文不存在' }));
      return;
    }

    if (req.user.id !== post.user.toString()) {
      next(createCustomError({ statusCode: 401, message: '沒有權限編輯此貼文' }));
      return;
    }

    const editData = {
      image,
      content,
      type,
      tags,
      updatedAt: Date.now(),
    };
    const newPost = await Post.findByIdAndUpdate(id, editData, {
      new: true,
      runValidators: true,
    }).lean();

    const isLiked = newPost.likes.some((userId) => userId.toString() === req.user.id);
    newPost.isLiked = isLiked ? true : false;
    newPost.likes = newPost.likes.length;

    newPost.user = undefined;

    handleSuccess({ res, message: '修改成功', data: { post: newPost } });
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
    /**
     * @swagger
     * /post/{postId}:
     *   delete:
     *     parameters:
     *       - $ref: '#/components/parameters/postIdParam'
     */
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '該筆貼文不存在' }));
      return;
    }

    if (req.user.id !== post.user.toString()) {
      next(createCustomError({ statusCode: 401, message: '沒有權限刪除此貼文' }));
      return;
    }

    await Post.findByIdAndDelete(id);
    handleSuccess({ res, message: '刪除成功' });
  }),

  likePost: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post/{postId}/like:
     *   post:
     *     parameters:
     *       - $ref: '#/components/parameters/postIdParam'
     */
    const { id: userId } = req.user;
    const { id: postId } = req.params;

    const post = await Post.findByIdAndUpdate(
      { _id: postId },
      { $addToSet: { likes: userId } },
      { runValidators: true }
    );

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '該筆貼文不存在' }));
      return;
    }

    const isLiked = post.likes.some((like) => like.toString() === userId.toString());
    if (isLiked) {
      next(createCustomError({ statusCode: 400, message: '已按讚此貼文' }));
      return;
    }

    const data = { currentLikes: post.likes.length + 1 };
    handleSuccess({ res, message: '按讚成功', data });
  }),

  unlikePost: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post/{postId}/unlike:
     *   delete:
     *     parameters:
     *       - $ref: '#/components/parameters/postIdParam'
     */
    const { id: userId } = req.user;
    const { id: postId } = req.params;

    const post = await Post.findByIdAndUpdate(
      { _id: postId },
      { $pull: { likes: userId } },
      { runValidators: true }
    );

    if (!post) {
      next(createCustomError({ statusCode: 404, message: '該筆貼文不存在' }));
      return;
    }

    const isUnLiked = post.likes.some((like) => like.toString() === userId.toString());
    if (!isUnLiked) {
      next(createCustomError({ statusCode: 400, message: '已取消按讚此貼文' }));
      return;
    }

    const data = { currentLikes: post.likes.length - 1 };
    handleSuccess({ res, message: '取消按讚成功', data });
  }),

  createComment: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post/{postId}/comment:
     *   post:
     *     parameters:
     *       - $ref: '#/components/parameters/postIdParam'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/commentSchema'
     *           example:
     *             comment: 今天的風真的好大！
     */
    const { id: userId } = req.user;
    const { id: postId } = req.params;

    const post = await Post.findOne({ _id: postId });
    if (!post) {
      next(createCustomError({ statusCode: 404, message: '該筆貼文不存在' }));
      return;
    }

    await Comment.create({
      user: userId,
      post: postId,
      comment: req.body.comment,
      createdAt: Date.now(),
    });

    handleSuccess({ res, message: '新增留言成功' });
  }),

  editComment: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post/comment/{commentId}:
     *   patch:
     *     parameters:
     *       - $ref: '#/components/parameters/commentIdParam'
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/commentSchema'
     *           example:
     *             comment: 編輯後的留言
     */
    const { id } = req.params;

    const comment = await Comment.findOne({ _id: id });
    if (!comment) {
      next(createCustomError({ statusCode: 404, message: '該筆留言不存在' }));
      return;
    }
    if (comment.user.id !== req.user.id) {
      next(createCustomError({ statusCode: 401, message: '沒有權限編輯此留言' }));
      return;
    }

    const newComment = await Comment.findByIdAndUpdate(
      { _id: id },
      {
        comment: req.body.comment,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );
    handleSuccess({ res, message: '編輯留言成功', data: { comment: newComment } });
  }),

  deleteComment: handleAsyncCatch(async (req, res, next) => {
    /**
     * @swagger
     * /post/comment/{commentId}:
     *   delete:
     *     parameters:
     *       - $ref: '#/components/parameters/commentIdParam'
     */
    const { id } = req.params;

    const comment = await Comment.findOne({ _id: id });
    if (!comment) {
      next(createCustomError({ statusCode: 404, message: '該筆留言不存在' }));
      return;
    }
    if (comment.user.id !== req.user.id) {
      next(createCustomError({ statusCode: 401, message: '沒有權限刪除此留言' }));
      return;
    }

    await Comment.findByIdAndDelete({ _id: id });
    handleSuccess({ res, message: '刪除留言成功' });
  }),
};

module.exports = PostController;
