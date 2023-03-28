const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMyProfile,
  changePassword,
  updateProfile,
  updateprofilepicture,
  forgetPassword,
  resetPassword,
  addToPlaylist,
  removeFromPlaylist,
  getAllUsers,
  updateUserRole,
  deleteUser,
  deleteMyProfile
} = require("../controller/userController");
const { isAuthenticated, authorizeAdmin } = require("../middleware/auth");
const SingleUpload = require("../middleware/multer")

router.route("/register").post(SingleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/me").get(isAuthenticated, getMyProfile);
router.route("/me").delete(isAuthenticated,deleteMyProfile)

router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/updateprofile").put(isAuthenticated, updateProfile);
router
  .route("/updateprofilepicture")
  .put(isAuthenticated,SingleUpload, updateprofilepicture);

router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").patch(resetPassword);

// add to playlist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);

router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);


// admin routes

router.route("/admin/users").get(isAuthenticated,authorizeAdmin,getAllUsers)
router.route("/admin/user/:id").put(isAuthenticated,authorizeAdmin,updateUserRole).delete(isAuthenticated,authorizeAdmin,deleteUser)

module.exports = router;
