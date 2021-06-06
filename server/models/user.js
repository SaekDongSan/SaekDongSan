const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//Schema
const userSchema = mongoose.Schema({
    ID : String,
    EMAIL:{
         type: String,
         trim : true, // 문자열 속 공백 없애주는 역할
         unique : 1 // 이메일 중복될 수 없게
    },    
    NAME: {
        type: String,
        maxlength : 50,
    },
    likedlist : [{ posting_id : String}],
    nickname : String,
    TOKEN:{
        type: String
    }
});


//Model
const User = mongoose.model('User', userSchema);

//다른 파일에서도 쓸 수 있도록
module.exports = { User }
