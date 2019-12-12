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


//  ------ FUNCTION | RETURNS TRUE IF SHORT URL IS NOT IN DATABASE ------  //
const checkShortURL = (url, object) => {
  const keys = Object.keys(object);
  if (!keys.includes(url)) {
    return true;
  }
  return false;
};


//  ------ FUNCTION | RETURNS THE USER ID OF EMAIL PARAMETER ------  //
const checkURL = (url, object ) => {
  const keys = Object.keys(object);
  for (let i = 0; i < keys.length; i++) {
    if (object[keys[i]] === url) {
      return keys[i];
    }
  }
  return false;
};

//  ------ FUNCTION | RETURNS OBJECT OF USER ID'S URLS ------  //
const urlsForUser = (id, object) => {
  const urlKeys = Object.keys(object);
  let  usersUrlList = {};
  for (let i = 0; i < urlKeys.length; i++) {
    if (object[urlKeys[i]].userID === id) {
      usersUrlList[urlKeys[i]] = object[urlKeys[i]];
    }
  }
  return usersUrlList;
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
  return Math.random().toString(36).slice(2);
};


module.exports = { returnID, urlsForUser, checkEmailIsInUse, generateRandomString, checkShortURL, checkURL }