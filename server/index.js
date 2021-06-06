const express = require('express');
var multer = require('multer')
const path = require('path');
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
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
app.use('/uploads', express.static('uploads'));
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');
var ObjectId = require('mongoose').Types.ObjectId; 

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

const { OAuth2Client } = require('google-auth-library');
const { runInNewContext } = require('vm');
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

app.post('/upload', upload.any(), (req, res) => {
    for (var i = 0; i < req.body.fileNumber; i++) {
        console.log("file" + JSON.stringify(req.files));
    }

    // console.log("others"+req.body.id);
    insertPostingIntoDB(req.files, req.body);
    res.send("good");
})

//--------------------------------------------

const insertPostingIntoDB = (files, fields) => {
    const nFile = fields.fileNumber;
    var filenamelist = [];
    for (var i = 0; i < nFile; i++) {
        filenamelist[i] = files[i]["path"].slice(8,);
    }
    console.log(filenamelist);
    const post = new Posting({ 
                        location : fields.name, 
                        writer:fields.user,
                        writerId:fields.id, 
                        posting_content:fields.comment,
                        likes : 0,
                        filenumber: nFile,
                        image0 : filenamelist[0],
                        image1 : filenamelist[1],
                        image2 : filenamelist[2],
                        image3 : filenamelist[3],
                        image4 : filenamelist[4],
                        time : fields.time,
                        category:fields.category,
                        latitude : fields.latitude,
                        longtitude :fields.longtitude });

    post.save((err, postInfo) => { // 만약 에러가 있다면 클라이언트한테 json 형태로 알려줌
        if (err) return console.log({ success: false, err });
        //에러없다면 성공(200) 
        return console.log({ success: true, postInfo });
    })
    filenamelist = [];
    return post;
};

app.post('/night', function (req, res) {

    var selected = req.body.category;
    console.log(selected);

    Posting.find({ category: selected }, function (err, posts) {
        if (!posts) {//user 콜렉션 안에 이메일이 없다면(== user가 false)
            console.log('카테고리에 맞는 posting 찾기 실패')
        }
        res.send(posts);
    })
});

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
    console.log("포스팅 위치 : "+lat+lng);

    var post;
    Posting.find({ "latitude": lat , "longtitude" : lng}, function (err, location) {
        if (!location) {
            console.log('현재위치 posting 찾기 실패')
        }
        res.send(location);
        console.log("찾은 결과"+location);
    });

});
//-----------------------------------------------------------------------------------------
app.post('/addcomment', function (req, res) {
    var postid = new ObjectId(req.body.post_id);
    var userid = req.body.post_name;
    var time = req.body.post_time;
    var comment = req.body.post_comment;
    console.log(userid, time, comment);
                                                  
    Posting.updateOne({ _id: postid }, { $set: { 'comments': [{ "comment_writer": userid, "comment_content": comment, "comment_time": time }] } }, function (err, change) {
        if (!change) {
            console.log('현재 posting 댓글 넣기 실패');
        }
        res.send("change");
        console.log(change);
    });
});
//---------------------------------------------------------------------------------------
app.post('/likes', function (req, res) {
    var likess = req.body.likes;
    var postid = new ObjectId(req.body.post_id);
    console.log(likess, postid);

    Posting.updateOne({ _id: postid }, { $set: { likes: likess } }, function (err, change) {
        if (!change) {
            console.log('현재 포스팅 좋아요 넣기 실패');
            res.send("좋아요 추가 실패");
        }
        else{
            res.send("likes : " + likess);
            console.log("likes : " + likess);
        }
    });
})

app.post('/liked', function (req, res) {
    var userid = req.body.user;
    var updateLike = req.body.liked;
    var postid = req.body.post_id;
    console.log(userid, postid, updateLike);

    if(updateLike=="true"){
        User.updateMany({ ID : user }, { $pull: { 'liked': [{ "posting_id": postid }]  }}, function (err, change) {
            if (!change) {
                console.log('현재 posting 댓글 넣기 실패');
            }
            res.send("change");
            console.log(change);
        })
    }
    else{
        User.updateMany({ ID : user }, { $pull: { 'liked': { "posting_id": postid }  }}, function (err, change) {
            if (!change) {
                console.log('현재 posting 댓글 넣기 실패');
            }
            res.send("change");
            console.log(change);
        })
    }
})