const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080;
const cookieParser = require('cookie-parser');


app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('dev'));
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

// random alphanumeric string generator for shortURL

const generateRandomString = () => {
  let output = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters[Math.round(Math.random() * 62)];
  } return output;
};

const findByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  } return null;
}

// home page example

app.get('/', (req, res) => {
  res.send('Hello!');
});

// adding cookies

app.post('/login', (req, res) => {
  res.cookie('user', req.body.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render('urls_index', templateVars);
});

// using GET route to show the form - Create

app.get('/urls/new', (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render('urls_new', templateVars);
});

// registration page

app.get('/register', (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    res.statusCode = 400;
    return res.send('error ' + res.statusCode);
  }
  if (findByEmail(email)) {
    res.statusCode = 400;
    return res.send('error ' + res.statusCode);
  }
  let tempId = generateRandomString();
  res.cookie('user_id', tempId);
  users[tempId] = {id: tempId, email: email, password: password}
  res.redirect('/urls');
});

//login page

app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render('urls_login', templateVars);
});

// added path for short url to show which website it redirects to

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
  res.render('urls_show', templateVars);
});


// storing the users inputted value to the urlDatabase - Add

app.post('/urls', (req, res) => {
  let temp = generateRandomString();
  urlDatabase[temp] = req.body.longURL;
  res.redirect(`/urls/${temp}`);
});

// redirecting user to main site

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// route that removes URL resource - Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// updating an existing resource

app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});