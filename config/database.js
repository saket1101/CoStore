const mongoose = require("mongoose");

const mongo_uri = process.env.MONGO_URI;

const connectDb = async () => {
  try {
    const result = await mongoose.connect(mongo_uri);
    console.log("Database connected successfully",result.connections[0].name);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDb;
