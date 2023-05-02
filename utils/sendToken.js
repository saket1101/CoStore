module.exports.sendToken = (res,user,message,sendCode = 201)=>{
    const token = user.getJwtToken();
    // const token = user.token
    const options = {
        expires: new Date(Date.now() + 15*24*60*60*1000),
        httpOnly:true,
        secure:true,
        sameSite:"none"
    }
res.status(sendCode).cookie("token",token,options).json({
    success:"true",
    user,message
})
}