const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const paymentSchema = new Schema({
  razorpay_payment_id: { type: "String", requrired: true },
  razorpay_signature: { type: "String", requrired: true },
  razorpay_order_id: { type: "String", requrired: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = model("Payment", paymentSchema);

module.exports = Payment;
