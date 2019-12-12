const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: 'test' },
  "w2xEk2": { longURL: "http://www.google.com", userID: 'test' },
  "426744": { longURL: "http://www.reddit.com", userID: 'test' },
  "4267sdQ": { longURL: "http://www.facebook.com", userID: 'yoyo' }
};





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

console.log(Object.keys(urlsForUser('test',  urlDatabase)))
console.log(urlsForUser('test',  urlDatabase));
// var timeInMils = new Date().getTime();
// var timeInString = new Date(time).toString().slice(4, 15)

// console.log(timeInString)


// //  ------ FUNCTION | RETURNS FALSE IF SHORT URL IS NOT IN DATABASE ------  //
// const checkURL = (url, object) => {
//   const keys = Object.keys(object);
//   if (!keys.includes(url)) {
//     return false;
//   }
//   return true;
// };



// console.log(checkURL('426244', urlDatabase));