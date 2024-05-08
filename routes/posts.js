const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const PostController = require('../controllers/post.js');

router.get('/', auth, PostController.getPosts);
router.get('/user/:id', auth, PostController.getUserPosts);

// router.delete('/', PostController.deleteAllPosts);

module.exports = router;
