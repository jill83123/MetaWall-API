const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.js');
const UserController = require('../controllers/user.js');

router.post('/sign_up', UserController.sign_up);
router.post('/sign_in', UserController.sign_in);

router.post('/updatePassword', auth, UserController.updatePassword);

router.get('/profile', auth, UserController.getUserData);
router.patch('/profile', auth, UserController.editUserData);

router.get('/following', auth, UserController.getFollowingList);
router.post('/:id/follow', auth, UserController.followUser);
router.delete('/:id/unfollow', auth, UserController.unfollowUser);

router.get('/getLikePosts', auth, UserController.getLikePosts);

module.exports = router;
