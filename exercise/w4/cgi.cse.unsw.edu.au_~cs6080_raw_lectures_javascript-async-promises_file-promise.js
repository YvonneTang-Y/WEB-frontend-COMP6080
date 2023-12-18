const fs = require('fs');

function readFilePromise1(filename, encoding) {
  function promiseHandler(resolve, reject) {
    console.log('Running promise!');
    function callback(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    }
    fs.readFile(filename, encoding, callback);
  }
  return new Promise(promiseHandler);
};

const readFilePromise2 = (filename, encoding) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, encoding, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
};

const myPromise = readFilePromise2('chapter1.txt', 'utf-8');
myPromise.then(data => console.log('Data', data));
myPromise.catch(err => console.log('Error', err));
