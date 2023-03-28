const DataUriParser = require("datauri/parser.js");
// const { extname } = require("path");
const path = require("path")

module.exports.getDataUri = (file)=>{
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString();
    // console.log(extName)
   return  parser.format(extName,file.buffer)
}