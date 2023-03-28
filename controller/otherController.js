const { catchAsyncError } = require("../middleware/createAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { EmailSend } = require("../utils/sendEmail");
const Stats = require("../models/statsModel");

module.exports.contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return next(new ErrorHandler("All fields are required"), 400);
  const to = process.env.MY_MAIL;
  const subject = "contact from coursebundle";
  const text = `I am ${name} my email is ${email}. \n message is ${message}`;
  await EmailSend(to, subject, text);
  res.status(200).json({
    success: "true",
    message: "your message has been sent",
  });
});

module.exports.courseContact = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course)
    return next(new ErrorHandler("All fields are required"), 400);

  const to = process.env.MY_MAIL;
  const subject = "Request for a course from coursebundle";
  const text = `I am ${name} my email is ${email}. \n message is ${course}`;
  await EmailSend(to, subject, text);
  res.status(200).json({
    success: "true",
    message: "request message has been sent",
  });
});

module.exports.getDashboardStats = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
  const statsData = [];
  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }
  const requireSize = 12 - stats.length;
  for (let i = 0; i < requireSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }
  const userCount = statsData[11].users;
  const subscriptionCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

let userProfit = true, subscriptionProfit = true, viewProfit = true;
let userPercentage = 0, subscriptionPercentage = 0, viewPercentage = 0;

if(statsData[10].users === 0) userPercentage = userCount * 100;

if(statsData[10].subscriptions === 0) subscriptionPercentage = subscriptionCount * 100;

if(statsData[10].views === 0) viewPercentage = viewsCount * 100;

else {
    const difference = {
        users : statsData[11].users - statsData[10].users,
        subscriptions : statsData[11].subscriptions - statsData[10].subscriptions,
        views : statsData[11].views - statsData[10].views,
    };
    userPercentage = (difference.users / statsData[10].users)*100
    subscriptionPercentage = (difference.subscriptions / statsData[10].subscriptions)*100
    viewPercentage = (difference.views / statsData[10].views)*100

    if(userPercentage < 0) userProfit = false;
    if(subscriptionPercentage < 0) subscriptionProfit = false;
    if(viewPercentage < 0) viewProfit = false;

}

  res.status(200).json({
    success: "true",
    Stats:statsData,
    userCount,
    subscriptionCount,
    viewsCount,userPercentage,subscriptionPercentage,viewPercentage,userProfit,subscriptionProfit,viewProfit
  });
});
