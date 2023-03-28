const { catchAsyncError } = require("./createAsyncError");
const jwt = require('jsonwebtoken');
const User = require("../models/UserModel");
const ErrorHandler = require("../utils/errorHandler");

module.exports.isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token) return next(new ErrorHandler("Not logged in"),401)

    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    req.user = await User.findById(decoded._id)
    next()
});

module.exports.authorizeAdmin = (req,res,next)=>{
    if(req.user.role !== "admin") return next(new ErrorHandler (`${req.user.role} is not allowed to access this resource`),403)

    next()
}
module.exports.authorizeSubscribers = (req,res,next)=>{
    if(req.user.subscription.status !== "active" && req.user.role !== "admin") return next(new ErrorHandler (`Only subscriber can access this`),403)

    next()
}