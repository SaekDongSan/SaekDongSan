const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//Schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength : 50,
    },
    nickname : String,
    email:{
         type: String,
         trim : true, // 문자열 속 공백 없애주는 역할
         unique : 1 // 이메일 중복될 수 없게
    },
    token:{
        type: String
    }
});

// index.js의 save 가 실행 되기 전 실행될 함수이고, 
//실행한 뒤 next(=index.js의 save)로 이동
 



userSchema.methods.insertUserIntoDB = function(cb){
    var user= this;
    //jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken') // token = user._id + 'secretToken'

    user.token = token
    user.save(function(err,user){
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;
    //토큰을 decode(복호화)한다
    jwt.verify(token,'secretToken', function(err, decoded){
        //유저 아이디를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 토큰과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id":decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

//Model
const User = mongoose.model('User', userSchema);

//다른 파일에서도 쓸 수 있도록
module.exports = { User }