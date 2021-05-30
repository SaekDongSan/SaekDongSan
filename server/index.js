const express = require('express');
const app = express();
const config = require('./config/key');
const {User} = require("./models/user");
const {Posting} = require("./models/posting");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('구글 클라이언트 id');
const jwt = require('jsonwebtoken');
console.log("terminal");
app.use(express.static('client/public')); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, 
    useUnifiedTopology : true, 
    useCreateIndex: true, 
    useFindAndModify: false
}).then(()=> console.log('MongoDB Connected...'))
.catch(err=> console.log(err))


var port = 3000;
app.listen(port, function(){
    console.log('server on! http://localhost:'+port);
});


app.post('/login', function(req, res){
    console.log('arrive..');
    
    let s = '34'+req.body;
    console.log(s);
});


// app.post('/login', function(req, res){
//     console.log(req.body);
// 	async function verify() {
//         console.log("request : "+req.body);
// 		const ticket = await client.verifyIdToken({
// 			idToken: req.body.it
// 		});
// 		const payload = ticket.getPayload();
// 		const userid = payload['sub']; //21자리의 Google 회원 id 번호
//         console.log(userid);
// 		User.execute('SELECT `TOKEN` FROM `innoboost_user` WHERE `ID`= ?', [userid], (err, results) => {
// 			if (err) throw err;
// 			let token = '';
// 			if (results.length > 0) {
// 				console.log('DB에 있는 유저', results);
// 				token = updateToken(payload);
// 			} else {
// 				console.log('DB에 없는 유저');
// 				//새로 유저를 만들면 jwt 토큰값을 받아온다.
// 				token = insertUserIntoDB(payload);
// 			}
// 			res.send({
// 				token
// 			});
// 		});
// 	}
// 	verify().then(() => {}).catch(console.error);
// });
