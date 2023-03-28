const { catchAsyncError } = require("../middleware/createAsyncError");
const User = require("../models/UserModel");
const ErrorHandler = require("../utils/errorHandler");
const { EmailSend } = require("../utils/sendEmail");
const { sendToken } = require("../utils/sendToken");
const crypto = require("crypto");
const Course = require("../models/CourseModel");
const cloudinary = require("cloudinary");
const {getDataUri} = require("../utils/dataUri");
const Stats = require("../models/statsModel")

module.exports.register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  // const file = req.file
  const file = req.file;
  if (!name || !email || !password || !file)
    return next(new ErrorHandler("All fields are required", 404));
  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already exist", 409));
  // cloudinary for fileupload
  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  sendToken(res, user, "Registerd successfully", 201);
});

module.exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("All fields are required"), 401);
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("User Not found", 404));
  const isMatch = await user.comparePasswrod(password);
  if (!isMatch) return next(new ErrorHandler("Wrong password Entered"), 404);
  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

module.exports.logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      // secure:true,
      sameSite: "none",
    })
    .json({ sucess: "true", message: "logout successfully" });
});

module.exports.getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ sucess: "true", user });
});

module.exports.changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("All fields are required"), 401);
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePasswrod(oldPassword);
  if (!isMatch) return next(new ErrorHandler("Wrong oldpassword Entered"), 404);
  user.password = newPassword;
  await user.save();

  res
    .status(201)
    .json({ success: "true", message: "change password successfully" });
});

module.exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (name) user.name = name;
  if (email) user.email = email;
  await user.save();
  res
    .status(201)
    .json({ success: "true", message: "user Profile updated successfully" });
});

module.exports.updateprofilepicture = catchAsyncError(
  async (req, res, next) => {
    // cloutdinary:todo
    const file = req.file;
    const user = await User.findById(req.user._id);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    await user.save()
    res.status(201).json({
      success: "true",
      message: "Profile picture updated successfully",
    });
  }
);

module.exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found"), 400);
  const resetToken = await user.getResetToken();
  await user.save();
  // will do email sending with nodemailer
  const url = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
  //http://localhost:3000/resetPassword/dfdlfjdlfdkfj
  const message = `Clck on the given link to reset you password ${url}, if u have not requested then  plz ignore`;
  await EmailSend(user.email, "coursebundle resetpasswrod", message);
  res.status(201).json({
    success: "true",
    message: `Reset token has been sent to ${user.email}`,
  });
});

module.exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired"), 404);
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  res.status(201).json({
    success: "true",
    message: "Password reset successfull",
  });
});

module.exports.addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("Invalid course Id"), 404);
  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });
  if (itemExist)
    return next(new ErrorHandler("Item already exist in playlist"), 409);

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();
  res.status(200).json({
    success: "true",
    message: "course added to playlist successfully",
  });
});

module.exports.removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("Invalid course Id"), 404);
  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });
  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({
    success: "true",
    message: "course removed from playlist successfully",
  });
});


// adminn controller
module.exports.getAllUsers = catchAsyncError(async (req, res, next) => {
const users = await User.find({})
  res.status(200).json({
    success: "true",
    users
  });
});

module.exports.updateUserRole = catchAsyncError(async (req, res, next) => {
const user = await User.findById(req.params.id)
if (!user) return next(new ErrorHandler("User not found"), 400);
if(user.role === "user") user.role = "admin";
else user.role = "user"
await user.save()
  res.status(200).json({
    success: "true",
    message:"Role updated successfully"
  });
});

module.exports.deleteUser = catchAsyncError(async (req, res, next) => {
const user = await User.findById(req.params.id)
if (!user) return next(new ErrorHandler("User not found"), 400);
await cloudinary.v2.uploader.destroy(user.avatar.public_id)
// cancel subscription
await user.deleteOne()
  res.status(200).json({
    success: "true",
    message:"user deleted successfully"
  });
});

module.exports.deleteMyProfile = catchAsyncError(async (req, res, next) => {
const user = await User.findById(req.user._id)

await cloudinary.v2.uploader.destroy(user.avatar.public_id)
// cancel subscription
await user.deleteOne()
  res.status(200).cookie("token",null,{
    expires:new Date(Date.now())
  }).json({
    success: "true",
    message:"user deleted successfully"
  });
});


User.watch().on("change",async()=>{
  const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
  const subscription = await User.find({"subscription.status":"active"});

  stats[0].users = await User.countDocuments();
  stats[0].subscriptions = subscription.length;
  stats[0].createdAt = new Date (Date.now());

  await stats[0].save()
})