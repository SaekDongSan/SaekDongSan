const mongoose = require('mongoose');

//Schema
const postingSchema = mongoose.Schema({
    title: {
        type: String,
        maxlength : 200,
        required : true
    },
    writer:{
        type: String,
        required : true
    },
    image: String,
    posting_content:{
        type: String,
        maxlength : 2000
    },
    coment_content:{
        type: String,
        maxlength : 1000
    },
    comment_writer : {
        type: String,
        required : true
    },
    comment_likes : Number,
    comment_time : String
});

//Model
const Posting = mongoose.model('Posting', postingSchema);

//다른 파일에서도 쓸 수 있도록
module.exports = { Posting }