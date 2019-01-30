var express = require("express");

const bcrypt = require('bcrypt');

var app = express();  //ser variable app to express server -- used in handlers

var PORT = 8080; // default port 8080

var urlDatabase = {     //user database that stores short and long urls
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_ID: "userRandomID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    user_ID: "userRandomID"
  }
};

const users = {     //user database that stores passwords and emails
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$NSXez7Ri7K1x67ggBvnhIOP0uHE0TJMFZZv8SbS1fYaDFrbcGHcUa"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$NSXez7Ri7K1x67ggBvnhIOP0uHE0TJMFZZv8SbS1fYaDFrbcGHcUa"
  }
}

const bodyParser = require("body-parser");      //middleware -- parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');  //encrypts cookies sent to webpage
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set("view engine", "ejs");


app.get("/", (req, res) => {   // '/' screen prints 'hello'
  res.send("Hello!");
});

app.get("/hello", (req, res) => { // '/hello' screen prints 'hello world'
  let templateVars = {
    greeting: 'Hello World!'
  };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {  // easy way to see current urlDatabase
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {  //easy way to see users database
  res.json(users);
});

app.get("/urls/new", (req, res) => {    //this is the 'add a new url' page
  let templateVars = {
    shortURL: req.params.id,
    longURL: req.body.longURL,
    user_ID: req.session.user_ID
  };
  if (!req.session.user_ID) {
    res.send('Please login or register!');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {  //edit existing urls
   if (req.session.user_ID !== urlDatabase[req.params.id]['user_ID']) {
    res.send('Cannot edit!');
  }
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_ID: users[req.params.user_ID]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {  // 'main' page -- lists the **signed in** users urls
  if (!req.session.user_ID) {
    res.redirect("/login");
  }
  let templateVars = {
    user_ID: req.session.user_ID,
    urls: urlsForUser(req.session.user_ID)
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {  // if not signed in you can see this page of short urls
 let templateVars = {
    user_ID: req.session.user_ID,
    urls: shortUrls()
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {  //register page -- you need to register before you can save and view urls
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_ID: users[req.body.user_ID],
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {  // login page -- you must login to view your urls
   let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_ID: req.body.user_ID,
    email: req.body.email,
    password: req.body.password
  };
  res.render("urls_login", templateVars);
});


app.post('/login', (req, res) => {    // references the users database to sees if you are an existing user
  let userFound = authenticateUser(req.body.email, req.body.password);
  if (userFound) {
    req.session.user_ID = userFound.id;
    res.redirect('/urls');
  } else {
    res.send("403 Forbidden")
  }
});

app.post('/register', (req, res) => {         // creates a new user in the users database
  if (req.body.email === "" || req.body.password === "" || isEmailTaken(req.body.email)) {
    res.redirect('/register');
    return console.log("400 bad request");
  }
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  let newUser = generateRandomString();
  users[newUser] = { id: newUser, email: req.body.email, password: hashedPassword }
  req.session.user_ID = newUser;
  res.redirect('/urls');
});

app.post('/urls/login', (req, res) => {     //when the user logs in the user_ID is set to the session cookie
  req.session.user_ID = req.body.user_ID;
  res.redirect('/urls');
});

app.post('/urls/logout', (req, res) => {  //when the user logs out the session cookie is deleted
  req.session = null;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {  //this will delete a url from the urlDatabase
  if (req.session.user_ID !== urlDatabase[req.params.id]['user_ID']) {
    res.send('cannot delete!');
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {  //edit a long url inside the urlDatabase
  let shortURL = req.params.id;
  let url = urlDatabase[shortURL];
  let longURL = req.body.longURL;
  url.longURL = longURL;
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {  //add a new url and attatch it to a short url -- whish is a random string
  console.log("this is whole req.body ", req.body);
  let longURL = req.body.longURL;
  let user_ID = req.session.user_ID;
  urlDatabase[generateRandomString()] = {longURL, user_ID}  //this is shorthand for {longURL: longURL, user_ID: user_ID}
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function shortUrls() {  //creates a database for only short urls
  let shortUrlDatabase = {};
  for (let shortUrl in urlDatabase) {
    shortUrlDatabase[shortUrl] = 'shortUrl';
  }
  return shortUrlDatabase;
}

function authenticateUser(email, password) {  //compares input email and password to email and encrypted password in urlDatabase
  for (let key in users) {
    if (users[key].email === email) {
      if(bcrypt.compareSync(password, users[key].password)) {
        return users[key];
      }
    }
  }
  return false;
}

function urlsForUser(id) {  //looks at urlDatabase -- creates an object of just that user's urls

  let totalUrls = {};

  for (let item in urlDatabase) {
    if (urlDatabase[item].user_ID === id) {
      let temp = {
        shortURL: item,
        longURL: urlDatabase[item].longURL
      };

      totalUrls[item] = temp;
    }
  }
  return totalUrls;
}

function checkUserNamePassword(email, password){  //looks at users database -- is email or password taken?
  for (const userId in users) {
    const user = users[userId];
    if( user.email === email && user.password === password) {
      return users[userId];
    }
  }
}

function isEmailTaken(email) {  //looks at users database to find out if an email exists already
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

function generateRandomString() {  //generates a random string -- used for making id's
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i <= 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}