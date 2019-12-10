const express = require('express');
const app = express();
var cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080; 

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  '7xc3lK': 'http://tsn.ca'
};

// ----- Generate Random String ------ //
function generateRandomString() {
  return Math.random().toString(36).slice(5)
 }

// ----- new URL page ------ //
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  console.log('New URL')
  res.render("urls_new", templateVars);
});

// ----- Post new URL Redirect to check URL ------ //
app.post("/urls", (req, res) => {
  const makeURL = generateRandomString()
  urlDatabase[makeURL] = req.body.longURL;
  console.log('CREATED New URL');  // Log the POST request body to the console
  res.redirect(`/urls/${makeURL}`)
});

// ----- List of URLs ------ //
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase , username: req.cookies["username"] };
  console.log('Main Page', templateVars)
  res.render("urls_index", templateVars);
});

// ----- Show URL ------ //
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] , username: req.cookies["username"] };
  console.log('SHOW URL', req.params.shortURL)
  console.log(templateVars);
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
  if(longURL) {
  console.log('REDIRECT')
  res.redirect(longURL);
  } 
});

// ----- Delete URL ------ //
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log('Delete');  // Log the POST request body to the console
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