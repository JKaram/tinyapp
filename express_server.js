const express = require('express');
const app = express();
var cookieParser = require('cookie-parser')
app.use(cookieParser())
const PORT = 8080;

const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));



app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" , userID: 'JaPrince' },
  "w2xEk2": { longURL: "http://www.google.com" , userID: 'JaPrince' },
  "426744": { longURL: "http://www.reddit.com" , userID: 'JaPrince' }
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
  },
  "JaPrince": {
    id: "JaPrince",
    email: "jamie@gmail.com",
    password: "1234"
  }
};

// Returns object of userid Urls
const urlsForUser = id => {
  const urlKeys = Object.keys(urlDatabase)
  let  usersUrlList = {};
  for (let i = 0; i < urlKeys.length; i++) {
    if (urlDatabase[urlKeys[i]].userID === id) {
      usersUrlList[urlKeys[i]] = urlDatabase[urlKeys[i]]
    }
  }
  return usersUrlList;
}

// Returns Users ID  of email that is entered
const returnID = (object, email) => {
  const keys = Object.keys(object)
  for (let i = 0; i < keys.length; i++) {
    if (object[keys[i]].email === email) {
      return keys[i]
    }
  }

  return false;

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
  if (!users[req.cookies['user_id']]) {
    res.redirect('/login')
  } else {
    let templateVars = { user: users[req.cookies['user_id']].email };
    res.render("urls_new", templateVars);
  }

});

// ----- Post new URL Redirect to check URL ------ //
app.post("/urls", (req, res) => {
  const makeURL = generateRandomString()
  urlDatabase[makeURL] = { longURL: req.body.longURL, userID: req.cookies['user_id'] };

  console.log('CREATED New URL', urlDatabase);  // Log the POST request body to the console
  res.redirect(`/urls/${makeURL}`)
});

// ----- List of URLs Page ------ //
app.get("/urls", (req, res) => {
  if (req.cookies['user_id']) {
  let templateVars = { urls: urlsForUser(req.cookies['user_id']) , user: users[req.cookies['user_id']].email };
  console.log('Main Page')
  res.render("urls_index", templateVars);
  } else {
    res.status(404).send(`NICE TRY HACKER`);
  }
});


// ----- Register Page ------ //
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_register", templateVars);
});

// ----- Register A new account ------ //
app.post("/register", (req, res) => {
  console.log('REGISTER', req.body.email, req.body.password);
  const idNum = generateRandomString()

  if (!checkEmailIsInUse(users, req.body.email) && req.body.password) {
    users[idNum] = { id: idNum, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    res.cookie('user_id', idNum);
    console.log('users[idNum]', idNum)
    res.redirect('/urls');
  } else {
    res.status(400).send(`Either your email is in use. Or the password feild is blank`);
  }

});

// ----- Login Page ------ //
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_login", templateVars);
});

// ----- Login to account ------ //
app.post("/login", (req, res) => {
  console.log('LOGIN', req.body.email, req.body.password);
  if (req.body.email === '' || req.body.password === '') {
    res.status(404).send(`One of these feilds are blank`);
  }
  if (checkEmailIsInUse(users, req.body.email)) {
    if (bcrypt.compareSync(req.body.password, users[returnID(users, req.body.email)].password)) {
      res.cookie('user_id', returnID(users, req.body.email));
      res.redirect('/urls');
    }
  } else {
    res.status(404).send(`NICE TRY HACKER`);
  }



});



// ----- Show URL ------ //
app.get("/urls/:shortURL", (req, res) => {
  console.log('SHOW URL', req.params.shortURL)
  if (users[req.cookies['user_id']]) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL , user: users[req.cookies['user_id']].email };
    console.log('TEMPLATE VARS------>', templateVars)
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/login');
  }
  
});


// ----- LOGOUT ------ //
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login')
});


// ----- Redirect URL ------ //
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  console.log(longURL)
  if (longURL) {
    console.log('REDIRECT')
    res.redirect(longURL);
  }
});

// ----- Delete URL ------ //
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies['user_id']) {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`)
  } else {
    res.status(404).send(`NICE TRY HACKER`);
  }
});


// ----- EDIT URL ------ //
app.post("/urls/:shortURL", (req, res) => {
  console.log('EDIT', req.params.shortURL, req.body.editURL);
  urlDatabase[req.params.shortURL] = { longURL: req.body.editURL, userID: req.cookies['user_id'] };
  console.log(urlDatabase)
  res.redirect(`/urls`)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});




