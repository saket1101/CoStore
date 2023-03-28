const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const statsSchema = new Schema({
    users:{
        type:Number,
        default:0
    },
    subscriptions:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    },
    createdAt:{
        type:String,
        default:Date.now()
    }
});

const Stats = mongoose.model("Stats",statsSchema);

module.exports = Stats