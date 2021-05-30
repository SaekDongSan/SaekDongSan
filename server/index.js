const express = require('express');
const app = express();
const config = require('./config/key');
const {User} = require("./models/user");
const {Posting} = require("./models/posting");

app.use(express.static('client/public')); 

const mongoose = require('mongoose');

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, 
    useUnifiedTopology : true, 
    useCreateIndex: true, 
    useFindAndModify: false
}).then(()=> console.log('MongoDB Connected...'))
.catch(err=> console.log(err))

app.get('/', function(req, res){


    res.send('Hello');
});

app.get('/temp', function(req,res){
    res.send('this is temp!');
});


var port = 3000;
app.listen(port, function(){
    console.log('server on! http://localhost: '+port);
});


