const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const jwt = require('jsonwebtoken');

//Schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength : 50,
        required : true
    },
    nickname : String,
    email:{
         type: String,
         trim : true, // 문자열 속 공백 없애주는 역할
         unique : 1 // 이메일 중복될 수 없게
    },
    token:{
        type: String
    },
    tokenExp:{
        type:Number
    }
});

// index.js의 save 가 실행 되기 전 실행될 함수이고, 
//실행한 뒤 next(=index.js의 save)로 이동
/* 
userSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){ // cb:callback function

    //plainPassword 1234567 vs db의 암호화된 비번 : $13dklf@ldkfslkdflksdjflskdjflskjf
    // 비교하기 위해 plainPassword 암호화하기

    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
      });
};

userSchema.methods.generateToken = function(cb){
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
*/

//Model
const User = mongoose.model('User', userSchema);

//다른 파일에서도 쓸 수 있도록
module.exports = { User }