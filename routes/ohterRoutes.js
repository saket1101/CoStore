const express = require("express");
const { contact,courseContact,getDashboardStats } = require("../controller/otherController");
const { isAuthenticated, authorizeAdmin } = require("../middleware/auth");
const router = express.Router()

// contact form 
router.route("/contact").post(contact)
// request form
router.route("/courserequest").post(courseContact)

//get admin stats
router.route("/admin/stats").get(isAuthenticated,authorizeAdmin,getDashboardStats)


module.exports = router;