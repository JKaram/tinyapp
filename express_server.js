const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { returnID, urlsForUser,  checkEmailIsInUse, generateRandomString , checkShortURL , checkURL } = require('./helpers');


const PORT = 8080;
const app = express();


app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" , dateCreated : 'Dec 12 2019', timesVisited: 0, userID: 'test' },
  "w2xEk2": { longURL: "http://www.google.com" , dateCreated : 'Dec 12 2019', timesVisited: 0, userID: 'test' },
  "426744": { longURL: "http://www.reddit.com" , dateCreated : 'Dec 12 2019', timesVisited: 0, userID: 'test' }
};


const users = {
  "test": {
    id: "test",
    email: "test@gmail.com",
    password: bcrypt.hashSync("1234", 10)
  }
};

// ----- GET / REDIRECT TO URLS PAGE ------ //
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// ----- GET / MAKE NEW URL PAGE ------ //
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  } else {
    let templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  }

});

// ----- POST / MAKE NEW SHORT URL && REDIRECT TO SHOW & EDIT SHORT URL PAGE  ------ //
app.post("/urls", (req, res) => {
  const makeURL = generateRandomString();
  const timeInMils = new Date().getTime();
  const timeInString = new Date(timeInMils).toString().slice(4, 15);

  urlDatabase[makeURL] = { longURL: req.body.longURL, dateCreated : timeInString, timesVisited : 0, userID: req.session.user_id };
  
  res.redirect(`/urls/${makeURL}`);
});

// ----- GET / URLS PAGE ------ //
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase) , user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

// ----- GET / REGISTER PAGE ------ //
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }

  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

// ----- POST / REGISTER A NEW ACCOUNT ------ //
app.post("/register", (req, res) => {
  const idNum = generateRandomString();
  
  if (!checkEmailIsInUse(users, req.body.email) && req.body.password) {
    users[idNum] = { id: idNum, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    req.session.user_id =  idNum;
    res.redirect('/urls');
  } else {
    res.status(400).send(`Either your email is in use. Or the password feild is blank`);
  }
});

// ----- GET / LOGIN PAGE ------ //
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  
  if (users[req.session.user_id]) {
    res.redirect('/urls');
  }
  res.render("urls_login", templateVars);
});

// ----- POST / LOGIN  ------ //
app.post("/login", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(401).send(`One of these feilds are blank`);
  }
  if (checkEmailIsInUse(users, req.body.email)) {
    if (bcrypt.compareSync(req.body.password, users[returnID(users, req.body.email)].password)) {
      req.session.user_id = returnID(users, req.body.email);
      res.redirect('/urls');
    } else {
      res.status(401).send(`Wrong password`);
    }
  } else {
    res.status(401).send(`Email not on file`);
  }
});


// ----- GET / SHOW && EDIT SHORT URL PAGE ------ //
app.get("/urls/:shortURL", (req, res) => {
  
  if (checkShortURL(req.params.shortURL, urlDatabase)) {
    res.status(401).send(`This Short URL does not exist`);
  }
  
  let usersURLS =  Object.keys(urlsForUser(req.session.user_id, urlDatabase));

  if (usersURLS.includes(req.params.shortURL)) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL , timesVisited: urlDatabase[req.params.shortURL].timesVisited, dateCreated: urlDatabase[req.params.shortURL].dateCreated,  user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send(`You cannot edit this URL`);
  }

});


// ----- POST / LOGOUT ------ //
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// ----- Redirect URL ------ //
app.get("/u/:shortURL", (req, res) => {
  
  console.log('SHORT URL -------->',req.params.shortURL);
  console.log('URL DATABASE -------->',urlDatabase);
  console.log('CheckShortURL -------->',checkShortURL(req.params.shortURL, urlDatabase));
  if (checkShortURL(req.params.shortURL, urlDatabase)) {
    res.status(401).send(`This Short URL does not exist`);
  } else {
    urlDatabase[req.params.shortURL].timesVisited += 1;
    console.log('TIMES VISiTED --->', req.params.shortURL, urlDatabase[req.params.shortURL].timesVisited);
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

// ----- Delete URL ------ //
app.post("/urls/:shortURL/delete", (req, res) => {
  
  
  if (req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(404).send(`NICE TRY HACKER`);
  }
});


// ----- EDIT URL ------ //
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = { longURL: req.body.editURL, dateCreated: urlDatabase[req.params.shortURL].dateCreated, timesVisited: urlDatabase[req.params.shortURL].timesVisited, userID: req.session.user_id };
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




