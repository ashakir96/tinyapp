const assert = require('chai').assert;

const findByEmail = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findByEmail("user@example.com", testUsers);
    const actual = user.id;
    const expectedOutput = "userRandomID";
    assert.equal(actual, expectedOutput);
  });

  it('should return a undefined if the email is invalid', function() {
    const user = findByEmail("a@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});