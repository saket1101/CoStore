const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto")

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Email is mandatory"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Password is mandatory"],
    select: false,
    minLength: [8, "Password should be atleast 8 characters"],
  },
  role: {
    type: "String",
    enum: ["admin", "user"],
    default: "user",
  },
  subscription: {
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  playlist: [
    {
      course: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      poster: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
  
});
userSchema.methods.comparePasswrod = async function (password) {
  return  await bcrypt.compare(password,this.password)

};

userSchema.methods.getJwtToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
return token;
};

userSchema.methods.getResetToken = function(){
const resetToken = crypto.randomBytes(20).toString("hex");
this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
this.resetPasswordExpire  = Date.now() + 15*60*1000;
return resetToken;
}

const User = model("User", userSchema);


module.exports = User;
