const mongoose = require('mongoose');

//Schema
const postingSchema = mongoose.Schema({
    location: {
        type: String,
        maxlength : 200,
    },
    writer:{
        type: String,
    },
    image0 : String,
    image1 : String,
    image2 : String,
    image3 : String,
    image4 : String,
    
    filenumber: Number,
    posting_content:{ 
        type: String,
        maxlength : 2000
    },
    category: String,
    likes : Number,
    time : String,
    latitude : Number,
    longtitude : Number
});

//Model
const Posting = mongoose.model('Posting', postingSchema);

//다른 파일에서도 쓸 수 있도록
module.exports = { Posting }