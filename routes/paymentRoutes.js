const express = require("express");
const { buySubscription,paymentVerification, getRazorpayKey,cancelSubscribtion } = require("../controller/paymentController");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router()

router.route("/subscribe").get(isAuthenticated,buySubscription)
//verify payment and save reference in database
router.route("/paymentverification").post(isAuthenticated,paymentVerification)

//get razorpay key
router.route("/razorpaykey").get(getRazorpayKey)

//cancel subscribtion
router.route("/subscribe/cancel").delete(isAuthenticated,cancelSubscribtion)

module.exports = router;