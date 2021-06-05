const express = require('express');
const app = express();
const config = require('./config/key');
const { User } = require("./models/user");
const { Posting } = require("./models/posting");
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('client/public'));

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('구글 클라이언트 id');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');

var port = 3000;
app.listen(port, function () {
    console.log('server on! http://localhost:' + port);
});

// ----------------------Google Login 
app.post('/login', function (req, res) {
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: req.body.it
        });
        const payload = ticket.getPayload();
        const userid = payload['sub']; //21자리의 Google 회원 id 번호
        console.log(userid);

        User.findOne({ ID: userid }, (err, user) => {
            var userSignedIn;
            if (err) throw err;
            let token = '';
            if (user) {//user 콜렉션 안에 이메일이 없다면(== user가 false)
                userSignedIn = user;
                console.log('DB에 있는 유저', user.ID);
                token = updateToken(payload);
            }
            else {
                //새로 유저를 만들면 jwt 토큰값을 받아온다.
                userSignedIn = insertUserIntoDB(payload);
                console.log('DB에 없는 유저');
            }

            // console.log("보낼 정보입니다" ,userSignedIn);
            res.send({
                ID: userSignedIn.ID, name: userSignedIn.NAME, email: userSignedIn.EMAIL
            });
        });
    }
    verify().then(() => { }).catch(console.error);
});

const updateToken = function (payload) {

    User.findOne({ ID: payload.sub }, (err, user) => {
        console.log('토큰 업데이트');
        token = 0;
        var token = jwt.sign(user._id.toHexString(), 'secretToken');
        return token;
    });

}

const insertUserIntoDB = (payload) => {

    console.log(" --- insert" + payload.sub + "----");

    const user = new User({ ID: payload.sub, NAME: payload.name, EMAIL: payload.email });
    user.save((err, userInfo) => { // 만약 에러가 있다면 클라이언트한테 json 형태로 알려줌
        if (err) return console.log({ success: false, err });
        //에러없다면 성공(200) 
        return console.log({ success: true });
    })

    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    user.TOKEN = token;
    return user;
};
//-----------------------------------------------------

//--------포스팅------------------------------
app.post('/upload', function (req, res) {
    // //파일 받기 
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //console.log(fields);
        console.log(fields);
        console.log(files);
    });
});

//--------------------------------------------