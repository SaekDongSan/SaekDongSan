const express = require('express');
var multer = require('multer')
const path = require('path');
var filenamelist = [];
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
            filenamelist.push(new Date().valueOf() + path.extname(file.originalname));
        }
    }),
});
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
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('구글 클라이언트 id');


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
// app.post('/upload', upload.array('myFiles'), function (req, res) {
//     console.log(req.files);
//     console.log(req.body);
//     //파일 받기 
//     var form = new formidable.IncomingForm();
//     form.parse(req, function (err, fields, files) {
//         console.log(fields);
//         console.log(files);
//         insertPostingIntoDB(files, fields);
//     });
//     res.send("good");
// });


app.post('/upload', upload.any(), (req, res) => {
    // console.log("file"+req.files.length);
    // console.log("others"+req.body.id);
    insertPostingIntoDB(req.files, req.body);
    res.send("good");
})

//--------------------------------------------

const insertPostingIntoDB = (files, fields) => {

    const nFile = fields.fileNumber;
    // console.log(filenamelist);
    // var orgImgNameList = new Object();

    var saveImgNameList = new Object();
    for (var j = 0; j < nFile; j++) {
        // orgImgNameList[j] = files[j]["name"];
        saveImgNameList[j] = filenamelist[j];
    }
    const post = new Posting({
        loaction: fields.name,
        writer: fields.id,
        posting_content: fields.comment,
        likes: 0,
        filenumber: nFile,
        time: fields.time,
        category: fields.category,
        latitude: fields.latitude,
        longtitude: fields.longtitude
    });

    // post.oimages = [];
    // post.oimages.push(orgImgNameList);
    post.simages = [];
    post.simages.push(saveImgNameList);

    post.save((err, postInfo) => { // 만약 에러가 있다면 클라이언트한테 json 형태로 알려줌
        if (err) return console.log({ success: false, err });
        //에러없다면 성공(200) 
        return console.log({ success: true, postInfo });
    })

    console.log("------------crete Posting object!!----- " + JSON.stringify(post.simages));
    // console.log("------------crete Posting object!!----- "+JSON.stringify(post.oimages));
    return post;
};

//---------------------------------------------------------
app.post('/category', function (req, res) {

    var selected = req.body.category;
    console.log(selected);

    Posting.find({ category: selected }, function (err, posts) {
        if (!posts) {//user 콜렉션 안에 이메일이 없다면(== user가 false)
            console.log('카테고리에 맞는 posting 찾기 실패')
        }
        res.send(posts);
    })
});

//--------------------------------------------------------------------
app.post('/showpost', function (req, res) {

    var lat = req.body.lat;
    var lng = req.body.lng;
    console.log(lat);
    console.log(lng);

    Posting.find({ latitude: lat, longtitude: lng }, function (err, location) {
        if (!location) {
            console.log('현재위치 posting 찾기 실패')
        }
        res.send(location);
        console.log(location);
    });
});
//-----------------------------------------------------------------------------------------
app.post('/addcomment', function (req, res) {
    var postid = req.body.post_id;
    var userid = req.body.post_name;
    var time = req.body.post_time;
    var comment = req.body.post_comment;
    console.log(userid, time, comment);

    Posting.updateMany({ _id: postid }, { $push: { add_comments: [{ "comment_id": new ObjectId(), "comment_author": userid, "comment_text": comment, "comment_createdAt": time }] } }, function (err, change) {
        if (!change) {
            console.log('현재 posting 댓글 넣기 실패');
        }
        res.send("change");
        console.log(change);
    });
});
//---------------------------------------------------------------------------------------
app.post('/likes', function (req, res) {
    var likes = req.body.likes;
    var postid = req.body.post_id;
    console.log(likes, postid);
    Posting.updateOne({ _id: postid }, { $set: { like: likes } }, function (err, change) {
        if (!change) {
            console.log('현재 포스팅 좋아요 넣기 실패');
        }
        res.send("change");
        console.log(change);
    });
})
