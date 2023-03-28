const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, "Plz Enter Course Title"],
    minLength: [4, "Title must be more than 4 character"],
    maxLength: [80, "Title can not exceed more than 80 character"],
  },
  description: {
    type: String,
    required: [true, "plz enter courese Description"],
    minLength: [20, "Description must be more than 20 character"],
  },
  lectures: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  numOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: [true, "Enter creator name"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course = model("Course", courseSchema);

module.exports = Course;
