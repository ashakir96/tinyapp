const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const findByEmail = require('./helpers');

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey']
}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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


// random alphanumeric string generator for shortURL

const generateRandomString = () => {
  let output = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters[Math.round(Math.random() * 62)];
  } return output;
};

const urlsForUser = (id) => {
  let newData = {};
  for (let item in urlDatabase) {
    let user = urlDatabase[item].userID;
    if (user === id) {
      newData[item] = urlDatabase[item];
    }
  } return newData;
};

// home page example

app.get('/', (req, res) => {
  let user = users[req.session.userID];
  if (!user) {
    return res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

// adding cookies

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  let user = users[req.session.userID];
  if (!user) {
    return res.redirect('/login');
  }
  let templateVars = {urls: urlsForUser(req.session.userID), user: user};
  res.render('urls_index', templateVars);
});

// registration page

app.get('/register', (req, res) => {
  let templateVars = {user: users[req.session.userID]};
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    return res.sendStatus(400);
  }

  let foundUser = findByEmail(email, users);

  if (foundUser) {
    return res.sendStatus(400);
  }

  let tempId = generateRandomString();
  req.session.userID = tempId;
  let hashedPassword = bcrypt.hashSync(password, 10);
  users[tempId] = {id: tempId, email: email, password: hashedPassword};
  res.redirect('/urls');
});

//login page

app.get('/login', (req, res) => {
  let templateVars = {user: users[req.session.userID]};
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    return res.sendStatus(400);
  }

  let foundUser = findByEmail(email, users);

  if (!foundUser) {
    return res.sendStatus(403);
  }

  let matched = bcrypt.compareSync(password, foundUser.password);
  if (!matched) {
    return res.sendStatus(403);
  }

  req.session.userID = foundUser.id;
  res.redirect('/urls');
});

// using GET route to show the form - Create

app.get('/urls/new', (req, res) => {
  if (!users[req.session.userID]) {
    return res.redirect('/login');
  }
  let templateVars = {user: users[req.session.userID]};
  res.render('urls_new', templateVars);
});

// added path for short url to show which website it redirects to

app.get('/urls/:shortURL', (req, res) => {
  if (req.session.userID === urlDatabase[req.params.shortURL].userID) {
    let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.userID]};
    res.render('urls_show', templateVars);
  } else {
    res.sendStatus(403);
  }
});

// storing the users inputted value to the urlDatabase - Add

app.post('/urls', (req, res) => {
  let user = users[req.session.userID];
  if (!user) {
    return res.redirect('/login');
  }
  let temp = generateRandomString();
  urlDatabase[temp] = {longURL: req.body.longURL, userID: req.session.userID};
  res.redirect(`/urls/${temp}`);
});

// redirecting user to main site

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  let newURL = longURL.slice(0, 7);
  let httpsURL = longURL.slice(0,8);
  if (newURL === "http://" || httpsURL === "https://") {
    res.redirect(longURL);
  } else {
    res.redirect("http://" + longURL);
  }
});

// route that removes URL resource - Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  let user = users[req.session.userID];
  if (!user) {
    return res.redirect('/login');
  }
  if (req.session.userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    return res.sendStatus(403);
  }
});

// updating an existing resource

app.post('/urls/:id', (req, res) => {
  let user = users[req.session.userID];
  if (!user) {
    return res.redirect('/login');
  }
  if (req.session.userID === urlDatabase[req.params.id].userID) {
    let shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.longURL;
    return res.redirect('/urls');
  } else {
    return res.sendStatus(403);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});