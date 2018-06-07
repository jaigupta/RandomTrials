var express = require('express')
var app = express()
var md5 = require('md5');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodejs2db');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

var User = require('./user.js');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.get('/', function(req, res) {
  let content = '<a href="/login">Login</a><br/>' +
    '<a href="/signup">Signup</a><br/>';
  res.send(content);
});

app.get('/login', function(req, res) {
  res.send('<form method="POST" action="/login">' +
    'Username:<input type="text" name="username"><br/>'+
    'Password:<input type="password" name="password"><br/>' +
    '<input type="submit" value="Submit">');
});

app.post('/login', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let passwordHash = md5(password);
  console.log('finding user:' + username);
  console.log('password:' + passwordHash);
  User.findOne({username:username, passHash: passwordHash}, function(err, user) {
    if (err) {
      res.send('Err in login: ' + err);
      return;
    }
    if (!user) {
      res.send('No such user!');
      return;
    }
    res.send('Login successful! Welcome!');
  });
});

app.get('/signup', function(req, res) {
  res.send('<form method="POST" action="/signup">' +
    'Username:<input type="text" name="username"><br/>'+
    'Password:<input type="password" name="password"><br/>' +
    '<input type="submit" value="Submit">');
});


app.post('/signup', function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let passwordHash = md5(password);

  let user = new User({username: username, passHash: passwordHash});
  user.save(function(err){
    if (err) {
      res.send('Signup failed with error: '+ err + "Try again <a href='/signup'>here</a>");
      return;
    }
    res.send('Singup successful. Login <a href="/login">here</a>.');
  })
});

app.listen(3000, ()=>(console.log('Listening...')));
