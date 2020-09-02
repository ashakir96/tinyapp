const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('dev'));


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

app.get('/', (req, res) => {
  res.send('Hello!');
});

// adding cookies

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVars);
});

// using GET route to show the form - Create

app.get('/urls/new', (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render('urls_new', templateVars);
});

// registration page

app.get('/register', (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render('urls_register', templateVars);
})

app.post('/register', (req, res) => {
  let tempId = generateRandomString();
  res.cookie('user_id', tempId);
  users[tempId] = {id: tempId, username: req.body.username, password: req.body.password}
  res.redirect('/urls');
})


// added path for short url to show which website it redirects to

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render('urls_show', templateVars);
});

// random alphanumeric string generator for shortURL

const generateRandomString = () => {
  let output = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters[Math.round(Math.random() * 62)];
  } return output;
};

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