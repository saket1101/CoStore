const mongoose = require('mongoose')
mongoose.set("strictQuery",true)

const mongo_uri = `mongodb+srv://saketjha00:${process.env.MONGO_PASS}@cluster0.zikoif5.mongodb.net/?retryWrites=true&w=majority`

const connectDb = async()=>{
  try{
    const {connection} = await mongoose.connect(mongo_uri)
    console.log(`MongoDb connection : ${connection.host}`)
  }  catch(error){
    console.log(error.message)
  }
}




module.exports= connectDb