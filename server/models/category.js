const mongoose = require('mongoose');

//Schema
const locationSchema = mongoose.Schema({
    posting_id : Number,
    category: {
        type: Number,
        maxlength : 200,
        required : true
    },
    latitude:{
        type: Number,
        required : true
    },
    likes: String
});

//Model
const Location = mongoose.model('Location', postingSchema);

//다른 파일에서도 쓸 수 있도록
module.exports = { Location }