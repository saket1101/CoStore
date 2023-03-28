const mongoose = require('mongoose')
mongoose.set("strictQuery",true)


const connectDb = async()=>{
  try{
    const {connection} = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDb connection : ${connection.host}`)
  }  catch(error){
    console.log(error.message)
  }
}

module.exports= connectDb