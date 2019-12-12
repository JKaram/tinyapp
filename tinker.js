const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca" , userID: 'test' },
  "w2xEk2": { longURL: "http://www.google.com" , userID: 'test' },
  "426744": { longURL: "http://www.reddit.com" , userID: 'test' },
  "4267sdQ": { longURL: "http://www.facebook.com" , userID: 'yoyo' }
};





const urlsForUser = (id, object) => {
  const urlKeys = Object.keys(object);
  console.log(urlKeys)
  let  usersUrlList = {};
  for (let i = 0; i < urlKeys.length; i++) {
    if (object[urlKeys[i]].userID === id) {
      usersUrlList[urlKeys[i]] = object[urlKeys[i]];
    }
  }
  return usersUrlList;
};

console.log(urlsForUser('test', urlDatabase))