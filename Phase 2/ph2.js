var express = require('express');
var app = express();
var fs = require("fs");
var bodyParser = require('body-parser');
var session = require('express-session');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(session({secret:"djh23ioej238djwudhsdo12h#%$#@^", resave:false, saveUninitialized:true}));

app.get('/', function (req, res){
  res.sendFile( __dirname + "/" + "home.html");
});

app.get('/myTasks', function (req, res){
  if(req.session.userIndex) res.sendFile( __dirname + "/" + "index.html");
  else{
  	console.log("Log in first.");
  	res.redirect('/');
  }
});

app.get('/regPage', function (req, res){
  res.sendFile( __dirname + "/" + "register.html");
});

app.get('/loginPage', function (req, res){
  res.sendFile( __dirname + "/" + "login.html");
});

app.get('/logout', function (req, res){
  delete req.session.userIndex;
  delete req.session.userName;
  res.redirect('/');
});

//Update tasks on server.
app.post('/updateTasks', urlencodedParser, function (req, res){
	var newTbody = req.body;
	newTbody = JSON.stringify(newTbody);
	newTbody = newTbody.substring(9,newTbody.length-2);

	var data = fs.readFileSync( __dirname + "/" + "users.json", 'utf8');
    data = JSON.parse(data);
    data["users"][req.session.userIndex].tbody = newTbody;
    fs.writeFile(__dirname + "/" + "users.json",JSON.stringify(data), function (err) {
          if (err) return console.log(err);
        });

    res.end('Updated.');
});


//Login
app.post('/loginUser', urlencodedParser, function (req, res){
	var data = fs.readFileSync( __dirname + "/" + "users.json", 'utf8');
    data = JSON.parse(data);
    for(var x in data["users"]){
       	if(req.body.email == data["users"][x].email && req.body.pass == data["users"][x].pass){
       		req.session.userIndex = x;
       		req.session.userName = data["users"][x].name;
       		console.log("Successfully logged in.");
       		return res.redirect('/myTasks');
       	}
        else if(req.body.email == data["users"][x].email){
          return  res.sendFile( __dirname + "/" + "loginPassword.html");
        }
    }
	
    console.log("Invalid account.");
    res.sendFile( __dirname + "/" + "loginEmail.html");
});

//Register
app.post('/register', urlencodedParser, function (req, res){
	var data = fs.readFileSync( __dirname + "/" + "users.json", 'utf8');
    data = JSON.parse(data);
    for(var x in data["users"]){
       	if(req.body.email == data["users"][x].email){
       		console.log("This email is already used.");
       		return res.redirect('/regPage');
       	}
    }    

  var user = {
	'name':req.body.name,
	'email':req.body.email,
	'pass':req.body.pass,
	'tbody':''
  };
  user.tbody=JSON.stringify('<tbody><tr class="odd"><td valign="top" colspan="3" class="dataTables_empty">No data available in table</td></tr></tbody>');

  fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse(data);
       data["users"].push(user);
       fs.writeFile(__dirname + "/" + "users.json",JSON.stringify(data), function (err) {
          if (err) return console.log(err);
        });

    });

    res.redirect("/loginPage");
});

//Send a user his tasks
app.get('/sendMyTasks', function(req, res, next) {
  if(req.session.userIndex){
  	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       data = JSON.parse(data);
       res.json(data["users"][req.session.userIndex].tbody);
    });
  }
  else res.redirect('/');
});
//Send a user his name
app.get('/sendMyName', function(req, res, next) {
  if(req.session.userName) res.json(req.session.userName);
  else res.redirect('/');
});


app.get(/^(.+)$/,function(req,res){
	if(req.params[0] != '/favicon.ico') res.sendFile( __dirname + "/" + "404.html");
});

var server = app.listen(1337, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Server is ON, Listening on port 1337.");
});