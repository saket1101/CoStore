const express = require("express");
const router = express.Router();
const {
  getAllCourse,
  createCourse,
  getCourseLecture,
  addLecture,
  deleteCourse,
  deleteLecture,
} = require("../controller/courseController");
const SingleUpload = require("../middleware/multer");
const { isAuthenticated, authorizeAdmin,authorizeSubscribers } = require("../middleware/auth");

// get all course without any lecture
router.route("/courses").get(getAllCourse);
// create course only for admin
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, SingleUpload, createCourse);

//add lecture, delete course, get course details
router
  .route("/course/:id")
  .get(isAuthenticated,authorizeSubscribers, getCourseLecture)
  .post(isAuthenticated, authorizeAdmin, SingleUpload, addLecture)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse);

  // delete lecture
  router.route('/lecture').delete(isAuthenticated,authorizeAdmin,deleteLecture)
module.exports = router;
