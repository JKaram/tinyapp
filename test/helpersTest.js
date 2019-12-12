const { assert } = require('chai');

const { returnID, generateRandomString } = require('../helpers.js');

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

describe('generateRandomString', function() {
  it('should generate a string', function() {
    const output = generateRandomString()
    assert.equal(typeof output, 'string')
  });
});

describe('returnID', function() {
  it('should return a user with valid email', function() {
    const user = returnID(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });

  it('should return false', function() {
    const user = returnID(testUsers, "false@example.com")
    const expectedOutput = false;
    assert.equal(user, expectedOutput)
  });
});