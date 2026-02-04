const express = require("express");
const userController = require("../controllers/usersControllers");
const followsController = require('../controllers/followsControllers');
const likesController = require('../controllers/likesControllers');
const bookmarksController = require('../controllers/bookmarksControllers');
const schemas = require("../schemas/users");
const { searchUsersSchema } = require('../schemas/search/searchSchema');
const validate = require("../middleware/validation");
const authorize = require("../middleware/authorize");
const { passwordResetLimiter } = require('../middleware/passwordResetLimiter');
const authenticate = require("../middleware/authenticate");
const { uploadProfilePicture } = require("../middleware/upload");
const router = express.Router();

router
  .route("/login")
  .post(validate(schemas.loginSchema), userController.loginUser);

router
  .route("/register")
  .post(validate(schemas.registerSchema), userController.registerUser);

router
  .route("/")
  .get(
    authenticate,
    authorize("admin"),
    validate(schemas.getAllUserSchema),
    userController.getAllUsers,
  );

// Search Users
router.get('/search', validate({ query: searchUsersSchema }), userController.searchUsers);

// Profile picture routes
router
  .route("/profile-picture")
  .post(authenticate, uploadProfilePicture, userController.uploadProfilePicture)
  .delete(authenticate, userController.deleteProfilePicture);

// Password reset routes
router.post("/forgot-password", passwordResetLimiter, validate(schemas.forgotPasswordSchema), userController.forgotPassword);
router.post("/reset-password", validate(schemas.resetPasswordSchema), userController.resetPassword);
router.patch("/change-password", authenticate, validate(schemas.changePasswordSchema), userController.changePassword);

// Get all bookmarked posts
router.get('/bookmarks', authenticate, bookmarksController.getUserBookmarks);

router
  .route("/:id")
  .get(authenticate, authorize("admin"), userController.getUser)
  .patch(
    authenticate,
    authorize("admin"),
    validate(schemas.updateUserSchema),
    userController.updateUser,
  )
  .delete(authenticate, authorize("admin"), userController.deleteUser);

// Get user's likes
router.get('/:userId/likes', authenticate, likesController.getUserLikes);

// Follow routes
router.post('/:userId/follow', authenticate, followsController.followUser);
router.delete('/:userId/follow', authenticate, followsController.unfollowUser);
router.get('/:userId/followers', authenticate, followsController.getFollowers);
router.get('/:userId/following', authenticate, followsController.getFollowing);

module.exports = router;
