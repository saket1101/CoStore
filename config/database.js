const mongoose = require('mongoose')
// mongoose.set("strictQuery",true)


const connectDb = async()=>{
    const {connection} = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDb connection : ${connection.host}`)
}

module.exports= connectDb