var express = require("express");
var app = express();
var PORT = 8080; // default port 8080



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



const cookieParser = require("cookie-parser");
app.use(cookieParser());



app.set("view engine", "ejs");



var urlDatabase = {  //urlDatabase: keys are short url, values are long url
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
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
  res.render("urls_new");
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
  // console.log(req.body['longURL']);
  urlDatabase[generateRandomString()] = req.body['longURL'];
  // console.log(urlDatabase);
  res.send("You got it baby!");
});



app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
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

  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);

  urlDatabase[req.params.id];
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}


