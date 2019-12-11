const express = require('express');
const app = express();
var cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));



app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  '7xc3lK': 'http://tsn.ca'
};

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
};



// return true if email is already in use 
const checkEmailIsInUse = (object, email) => {
  const values = Object.values(object).filter(o => o.email === email);

  if (values.length) {
    return true;
  }

  return false;
};
// ----- Generate Random String ------ //
function generateRandomString() {
  return Math.random().toString(36).slice(5)
}

// ----- new URL page ------ //
app.get("/urls/new", (req, res) => {
  let templateVars = { username : users[req.cookies['user_id']].email };
  console.log('New URL')
  res.render("urls_new", templateVars);
});

// ----- Post new URL Redirect to check URL ------ //
app.post("/urls", (req, res) => {
  const makeURL = generateRandomString()
  urlDatabase[makeURL] = req.body.longURL;
  console.log('CREATED New URL', req.body.longURL);  // Log the POST request body to the console
  res.redirect(`/urls/${makeURL}`)
});

// ----- List of URLs ------ //
app.get("/urls", (req, res) => { 
  console.log(req.cookies['user_id'])
  let templateVars = { urls: urlDatabase, username : users[req.cookies['user_id']].email  };
  
  console.log('templateVars', templateVars)
  console.log('Main Page')
  res.render("urls_index", templateVars);
});


// ----- Register Page ------ //
app.get("/register", (req, res) => {
  res.render("urls_register");
});

// ----- Register A new account ------ //
app.post("/register", (req, res) => {
  console.log('REGISTER', req.body.email, req.body.password);
  const idNum = generateRandomString()

  if (!checkEmailIsInUse(users, req.body.email) && req.body.password) {
    users[idNum] = { id: idNum, email: req.body.email, password: req.body.password };
    res.cookie('user_id', idNum);
    console.log('users[idNum]',idNum)
    res.redirect('/urls');
  } else { 
    res.status(400).send(`Either your email is in use. Or the password feild is blank`);
  }

});

// ----- Show URL ------ //
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username : users[req.cookies['user_id']].email };
  console.log('SHOW URL', req.params.shortURL)
  res.render("urls_show", templateVars);
});


// ----- LOGIN  ------ //
app.post("/login", (req, res) => {
  console.log('SHOW USERNAME', req.body.username)
  res.cookie('username', req.body.username)
  res.redirect('/urls')
});

// ----- LOGOUT ------ //
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
});


// ----- Redirect URL ------ //
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  if (longURL) {
    console.log('REDIRECT')
    res.redirect(longURL);
  }
});

// ----- Delete URL ------ //
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('Delete', urlDatabase[req.params.shortURL]);
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
});


// ----- EDIT URL ------ //
app.post("/urls/:shortURL", (req, res) => {
  console.log('EDIT', req.params.shortURL, req.body.editURL);
  urlDatabase[req.params.shortURL] = req.body.editURL
  console.log(urlDatabase)
  res.redirect(`/urls`)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
