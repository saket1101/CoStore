require("dotenv").config();
const express = require("express");
const app = express();
const port =  process.env.PORT || 4000;
const cookieparser = require("cookie-parser");
const errorMiddleware = require("./middleware/Error");
const cloudinary = require("cloudinary");
const Razorpay = require("razorpay");
const Stats = require("./models/statsModel");
const nodeCron = require("node-cron");
const cors = require("cors")

// import database
const connectDb = require("./config/database");
connectDb();

// using cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//razorpay integration
module.exports.instance = new Razorpay({
  key_id: "rzp_test_Q8oVwWqLZh2rin",
  key_secret: process.env.RAZORPAY_SECRETKEY,
});

// nodecron integration
nodeCron.schedule("0 0 0 1 * *", async () => {
  // console.log("a")
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

// using middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieparser());
app.use(cors({
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// import all routers
const userRouter = require("./routes/userRoutes");
const courseRouter = require("./routes/coursesRoutes");
const paymetRouter = require("./routes/paymentRoutes");
const otherRouter = require("./routes/ohterRoutes");

// using routes
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", paymetRouter);
app.use("/api/v1", otherRouter);

app.use(errorMiddleware);
//listening port

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
