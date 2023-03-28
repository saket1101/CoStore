const { catchAsyncError } = require("../middleware/createAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { instance } = require("../server");
const User = require("../models/UserModel");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");

module.exports.buySubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.role === "admin")
    return next(new ErrorHandler("Admin can't buy subscription"), 403);
  const plan_id = process.env.PLAN_ID || "plan_LVcVXZWloejtxP";
  const subscription = await instance.subscriptions.create({
    plan_id,
    customer_notify: 1,
    total_count: 12,
  });
  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  await user.save();
  res.status(201).json({
    success: "true",
    subscriptionId: subscription.id,
  });
});
module.exports.paymentVerification = catchAsyncError(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_signature, razorpay_order_id } =
    req.body;
  const user = await User.findById(req.user._id);
  const subscriptionId = user.subscription.id;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRETKEY)
    .update(razorpay_payment_id + "|" + subscriptionId, "utf-8")
    .digest("hex");
  const isAuthentic = razorpay_signature === generatedSignature;
  if (!isAuthentic)
    return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);

  // database comes here
  await Payment.create({
    razorpay_payment_id,
    razorpay_signature,
    razorpay_order_id,
  });
  user.subscription.status = "active";
  await user.save();
  res.redirect(
    `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
  );
});

module.exports.getRazorpayKey = catchAsyncError((req, res, next) => {
  res.status(200).json({
    success: "true",
    key: process.env.RAZORPAY_KEYID,
  });
});

module.exports.cancelSubscribtion = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne(req.user._id);
  const subscriptionId = user.subscription.id;
  let refund = false;
  await instance.subscriptions.cancel(subscriptionId);
  const payment = await Payment.findOne({
    razorpay_subscription_id: subscriptionId,
  });
  const gap = Date.now() - payment.createdAt;
  const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  if (refundTime > gap) {
    // await instance.payments.refund(payment.razorpay_payment_id);
    refund:true;
  }
  await payment.deleteOne()
  user.subscription.id= undefined;
  user.subscription.status= undefined;
  await user.save()
  res.status(200).json({
    success: "true",
    message: refund
      ? "subscription cancelled you will receive refund within 7 days"
      : "subscription cancelled , no refund initiated when a subscribiton was cancelled after 7 days",
  });
});
