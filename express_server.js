const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" , userID: 'test' },
  "w2xEk2": { longURL: "http://www.google.com" , userID: 'test' },
  "426744": { longURL: "http://www.reddit.com" , userID: 'test' }
};

const users = {
  "test": {
    id: "test",
    email: "test@gmail.com",
    password: bcrypt.hashSync("1234", 10)
  }
};

//  ------ FUNCTION | RETURNS OBJECT OF USER ID'S URLS ------  //
const urlsForUser = id => {
  const urlKeys = Object.keys(urlDatabase);
  let  usersUrlList = {};
  for (let i = 0; i < urlKeys.length; i++) {
    if (urlDatabase[urlKeys[i]].userID === id) {
      usersUrlList[urlKeys[i]] = urlDatabase[urlKeys[i]];
    }
  }
  return usersUrlList;
};

//  ------ FUNCTION | RETURNS THE USER ID OF EMAIL PARAMETER ------  //
const returnID = (object, email) => {
  const keys = Object.keys(object);
  for (let i = 0; i < keys.length; i++) {
    if (object[keys[i]].email === email) {
      return keys[i];
    }
  }
  return false;

};

//  ------ FUNCTION | RETURN TRUE IF EMAIL IS IN USE ------ //
const checkEmailIsInUse = (object, email) => {
  const values = Object.values(object).filter(o => o.email === email);

  if (values.length) {
    return true;
  }

  return false;
};

// ----- FUNCTION | GENERATE UNIQUE ID ------ //
const generateRandomString = () => {
  return Math.random().toString(36).slice(5);
};

// ----- GET / MAKE NEW URL PAGE ------ //
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  } else {
    let templateVars = { user: users[req.session.user_id].email };
    res.render("urls_new", templateVars);
  }

});

// ----- POST / MAKE NEW SHORT URL && REDIRECT TO SHOW & EDIT SHORT URL PAGE  ------ //
app.post("/urls", (req, res) => {
  const makeURL = generateRandomString();
  urlDatabase[makeURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${makeURL}`);
});

// ----- GET / URLS PAGE ------ //
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let templateVars = { urls: urlsForUser(req.session.user_id) , user: users[req.session.user_id].email };
    res.render("urls_index", templateVars);
  } else {
    res.status(404).send(`NICE TRY HACKER`);
  }
});


// ----- GET / REGISTER PAGE ------ //
app.get("/register", (req, res) => {
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
  if (users[req.session.user_id]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL , user: users[req.session.user_id].email };
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/login');
  }
});


// ----- POST / LOGOUT ------ //
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// ----- Redirect URL ------ //
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
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
  urlDatabase[req.params.shortURL] = { longURL: req.body.editURL, userID: req.session.user_id };
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




