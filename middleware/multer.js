const multer = require("multer")

const storage = multer.memoryStorage();

const SingleUpload = multer({storage}).single("file");

module.exports = SingleUpload;