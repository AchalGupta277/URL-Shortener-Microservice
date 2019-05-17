'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();
var dns = require('dns');

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

let bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));


let mongooseConn=mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



var urlSchema=new mongoose.Schema({
  url:String,
  shortened:Number
});

var URL=mongoose.model('URL',urlSchema);

function runMe(){
  // let url=new URL({url:"www.justcall.io",shortened:1});
  let url=new URL({url:"www.justcall.io",shortened:1});
  url.save(function(err,data){
    console.log(data);
  });
}
// runMe();

function findMe(){
  URL.findOne({url:"www.justcall.io"},function(err,data){
  if(err) return err;
    console.log(data);
  });
}

// findMe();

// countMe();

// saveURL("smm.ai");
function saveURL(urlString,res){
  URL.countDocuments({},function(err,data){
    let shortenedVal=data;
    let url=new URL({url:urlString,shortened:shortenedVal});
    url.save(function(err,data){
     res.json({"original_url":data.url,"short_url":data.shortened});
  });
  });
}


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/api/shorturl/:short',function(req,res){
      URL.findOne({shortened:req.params.short},function(err,data){
        if(err) res.json({"error":"invalid URL"});
        // console.log(data.url);
        res.redirect(data.url);
      });
});
app.post('/api/shorturl/new',function(req,res){
    let urlString=req.body.url;
    dns.lookup(urlString,function(err,addresses,family){
      if(err) res.json({"error":"invalid URL"});
      saveURL(urlString,res);
    });
});

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});