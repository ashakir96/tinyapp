const findByEmail = (email, users) => {
  for (let userId in users) {
    let user = users[userId];
    if (user.email === email) {
      return user;
    }
  } return null;
};

const generateRandomString = () => {
  let output = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters[Math.round(Math.random() * 62)];
  } return output;
};

const urlsForUser = (id, urlDatabase) => {
  let newData = {};
  for (let item in urlDatabase) {
    let user = urlDatabase[item].userID;
    if (user === id) {
      newData[item] = urlDatabase[item];
    }
  } return newData;
};

module.exports = {
  findByEmail,
  generateRandomString,
  urlsForUser,
}