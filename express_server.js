var express = require("express");
var app = express();
var PORT = 8080; // default port 8080



const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



var urlDatabase = {  //urlDatabase: keys are short url, values are long url
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



const cookieParser = require("cookie-parser");
app.use(cookieParser());




app.set("view engine", "ejs");




app.get("/", (req, res) => {
  res.send("Hello!");
});




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});




app.get("/hello", (req, res) => {
  let templateVars = {
    greeting: 'Hello World!'
  };
  res.render("hello_world", templateVars);
});




app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});




app.get("/urls/new", (req, res) => {

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.user_ID
  };
  res.render("urls_new", templateVars);
});




app.post('/urls/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});




app.post('/urls/logout', (req, res) => {
  res.clearCookie("username", req.body.username);
  res.redirect('/urls');
});




app.post("/urls", (req, res) => {
  console.log("this is whole req.body ", req.body);
  urlDatabase[generateRandomString()] = req.body['longURL'];
  res.redirect('/urls');
});




app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: users[req.params.user_ID]
  };

  console.log(req.params.user_ID);

  res.render("urls_show", templateVars);
});




app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});




app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});




app.post('urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
  urlDatabase[req.params.id];
  res.redirect('/urls');
});




app.get("/register", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: users[req.body.user_ID],   ////////
    email: req.body.email,
    password: req.body.email
  };
  res.render("urls_register", templateVars);
});





app.post('/register', (req, res) => {

  if (req.body.email === "" || req.body.password === "" || isEmailTaken(req.body.email)) {
    res.redirect('/register');
    return console.log("400 bad request");
  }

  let user_id = generateRandomString();
  users[user_id] = { id: user_id, email: req.body.email, password: req.body.password }

  res.cookie("email", req.body.email);
  res.cookie("password", req.body.password);
  res.cookie("user_id", user_id);

  res.redirect('/urls');
});




app.get("/login", (req, res) => {

   let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: users[req.body.user_ID],   ////////
    email: req.body.email,
    password: req.body.email
  };

  res.render("urls_login", templateVars);
});




app.post('/login', (req, res) => {

  let userFound = checkUserNamePassword(req.body.email, req.body.password);
  if(userFound){
    res.cookie('user_id', userFound.id);
    res.redirect('/urls');
    //redirect him to the urls

  } else{
    res.send("Sorry!. The email not found in the database");
  }
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//1. Registration - We check whether the email is taken or not?
//2. Login - you need to verify the email and password



function checkUserNamePassword(email, password){
  for(const userId in users){
    const user = users[userId];
    if(user.email === email && user.password === password){
      return users[userId];
    }
  }
}

function isEmailTaken(email){
  for(const userId in users){
    const user = users[userId];
    if(user.email === email){
      return true;
    }
  }
  return false;
}



function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}


