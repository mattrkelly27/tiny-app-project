var express = require("express");




const bcrypt = require('bcrypt');




var app = express();




var PORT = 8080; // default port 8080




var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_ID: "old_user"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    user_ID: "old_user"
  }
};




const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123" //"$2b$10$NSXez7Ri7K1x67ggBvnhIOP0uHE0TJMFZZv8SbS1fYaDFrbcGHcUa"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123" //"$2b$10$NSXez7Ri7K1x67ggBvnhIOP0uHE0TJMFZZv8SbS1fYaDFrbcGHcUa"
  }
}




const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



const cookieParser = require("cookie-parser");
app.use(cookieParser());




app.set("view engine", "ejs");




app.get("/", (req, res) => {
  res.send("Hello!");
});




app.get("/hello", (req, res) => {
  let templateVars = {
    greeting: 'Hello World!'
  };
  res.render("hello_world", templateVars);
});




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});




app.get("/users.json", (req, res) => {
  res.json(users);
});




app.get("/urls/new", (req, res) => {    //this is the 'add a new url' page

  let templateVars = {
    shortURL: req.params.id,
    longURL: req.body.longURL,
    user_ID: req.cookies.user_ID
  };


  if (!req.cookies.user_ID) {
    res.send('Please login or register!');
  }

  res.render("urls_new", templateVars);
});




app.get("/urls/:id", (req, res) => {


   if (req.cookies.user_ID !== urlDatabase[req.params.id]['user_ID']) {
    res.send('Cannot edit!');
  }

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user_ID: users[req.params.user_ID]
  };

  res.render("urls_show", templateVars);
});




app.get("/urls", (req, res) => {

  if (!req.cookies.user_ID) {
    res.redirect("/login");
  }

  let templateVars = {
    user_ID: req.cookies.user_ID,
    urls: urlsForUser(req.cookies.user_ID)
  };


  res.render("urls_index", templateVars);
});





app.get("/u/:shortURL", (req, res) => {

 let templateVars = {
    user_ID: req.cookies.user_ID,
    urls: shortUrls()
  };

  res.render("urls_index", templateVars);
});




app.get("/register", (req, res) => {


  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_ID: users[req.body.user_ID],
  };

  res.render("urls_register", templateVars);
});




app.get("/login", (req, res) => {

   let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_ID: req.body.user_ID,
    email: req.body.email,
    password: req.body.password
  };

  res.render("urls_login", templateVars);
});





app.post('/login', (req, res) => {


  console.log(req.body.password);
  console.log(req.body.email);


  console.log(checkUserNamePassword(req.body.email, req.body.password));


  let userFound = checkUserNamePassword(req.body.email, req.body.password);
  if (userFound) {
    res.cookie('user_ID', userFound.id);
    res.redirect('/urls');
    //redirect him to the urls

  } else {
    res.send("403 Forbidden")
  }

});




app.post('/register', (req, res) => {
  if (req.body.email === "" || req.body.password === "" || isEmailTaken(req.body.email)) {
    res.redirect('/register');
    return console.log("400 bad request");
  }



  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);



  let user_ID = generateRandomString();
  users[user_ID] = { id: user_ID, email: req.body.email, password: hashedPassword }

  res.cookie("user_ID", user_ID);


  res.redirect('/urls');
});







app.post('/urls/login', (req, res) => {
  res.cookie("user_ID", req.body.user_ID);
  res.redirect('/urls');
});




app.post('/urls/logout', (req, res) => {
  res.clearCookie("user_ID", req.body.user_ID);
  res.redirect('/urls');
});




app.post('/urls/:id/delete', (req, res) => {

  if (req.cookies.user_ID !== urlDatabase[req.params.id]['user_ID']) {
    res.send('cannot delete!');
  }

  delete urlDatabase['req.params.id'];

  res.redirect('/urls');
});




app.post('/urls/:id', (req, res) => {

  // if (req.cookies.user_ID !== urlDatabase[req.params.id]['user_ID']) {
  //   res.send('cannot edit!');
  // }

  let shortURL = req.params.id;

  let url = urlDatabase[shortURL];

  let longURL = req.body.longURL;

  url.longURL = longURL;

  res.redirect('/urls');
});




app.post("/urls", (req, res) => {
  console.log("this is whole req.body ", req.body);

  let longURL = req.body.longURL;

  let user_ID = req.cookies.user_ID;


  urlDatabase[generateRandomString()] = {longURL, user_ID}  //this is shorthand for {longURL: longURL, user_ID: user_ID}
  res.redirect('/urls');
});







app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




function shortUrls() {

  let shortUrlDatabase = {};

  for (let shortUrl in urlDatabase) {

    shortUrlDatabase[shortUrl] = 'shortUrl';

  }

  return shortUrlDatabase;

}




function urlsForUser(id) {

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





function checkUserNamePassword(email, password){
  for (const userId in users) {
    const user = users[userId];
    if( user.email === email && user.password === password) {
      return users[userId];
    }
  }
}




function isEmailTaken(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
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


