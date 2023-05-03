const { catchAsyncError } = require("../middleware/createAsyncError");
const Course = require("../models/CourseModel");
const { getDataUri } = require("../utils/dataUri");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
const Stats = require("../models/statsModel")

//get all courses without lectures
module.exports.getAllCourse = catchAsyncError(async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const category = req.query.category || "";
  const courses = await Course.find({
    title:{
      $regex: keyword,
      $options: "i"
    },
    category:{
      $regex: category,
      $options: "i"
    }
  }).select("-lectures");
  res.status(200).json({
    success: "true",
    courses,
  });
});

// create course for admin
module.exports.createCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, createdBy, category } = req.body;
  const file = req.file;

  if (!title || !description || !category || !createdBy || !file)
    return next(new ErrorHandler("All fields are required", 400));

  // console.log(file)
  const fileUri = getDataUri(file)
  const myCloud =  await cloudinary.v2.uploader.upload(fileUri.content)
  const course = await Course.create({
    title,
    description,
    createdBy,
    category,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  res.status(200).json({
    success: "true",
    message: "Course created successfully , u can create lectures now",
  });
});

module.exports.getCourseLecture = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return new ErrorHandler("Course not found"), 404;
  course.views += 1;
  await course.save();
  res.status(200).json({
    success: "true",
    lectures: course.lectures,
  });
});

// add lecture 
//max video size 100mb allowed
module.exports.addLecture = catchAsyncError(async (req, res, next) => {
  const {id}= req.params;
  if (!id) return next (new ErrorHandler("Id is required"),404)
  const course = await Course.findById(id);
  if (!course) return new ErrorHandler("Course not found"), 404;
  const file = req.file;
  const {title,description} = req.body
  // const file = req.file
  // console.log(file)
  if(!title || !description || !file) return next (new ErrorHandler("All field are required"),404)


  // file upload here
  const fileUri = getDataUri(file)
  const myCloud =  await cloudinary.v2.uploader.upload(fileUri.content,{
    resource_type:"video"
  })
  course.lectures.push({
    title,
    description,
    video: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  course.numOfVideos = course.lectures.length;
  await course.save();
  res.status(200).json({
    success: "true",
     message:"Lecture added in course successfully",
  });
});

//delete course
module.exports.deleteCourse = catchAsyncError(async (req,res,next)=>{
  const {id} = req.params;
  const course = await Course.findById(id)
  if(!course) return (new ErrorHandler("Course not found"),404)
  await cloudinary.v2.uploader.destroy(course.poster.public_id)
  for (let i=0; i<course.lectures.length;i++){
    const singleLecture = course.lectures[i]
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
      resource_type:"video"
    })
  }
  await course.deleteOne()
  res.json({
    success:"true",
    message:"course Deleted successfully"
  })
})

// delete lecture
module.exports.deleteLecture = catchAsyncError(async (req,res,next)=>{
  const {courseId,lectureId} = req.query;
  const course = await Course.findById(courseId)
  if(!course) return (new ErrorHandler("Course not found"),404)
  const lecture = course.lectures.find((item)=>{
    if(item._id.toString() === lectureId.toString()) return item;
  })
  await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
    resource_type:"video"
  })
  course.lectures = course.lectures.filter((item)=>{
    if (item._id.toString() !== lectureId.toString()) return item
  })
  course.numOfVideos = course.lectures.length;
  await course.save();
  res.status(200).json({
    success: "true",
     message:"Lecture deleted in course successfully",
  });
})


Course.watch().on("change",async()=>{
  const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
  const courses = await Course.find({});
  let totalViews = 0;
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]
    totalViews += course.views;
  }
  stats[0].views = totalViews;
  stats[0].createdAt = new Date (Date.now());

  await stats[0].save()
})