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


// Creates a brand new Promise
const myPromise = new Promise((resolve, reject) => {
  // if the action succeeds, call resolve() with the result
  // or,if the action failed, call reject() with the reason
});

myPromise.then(
  () =>{
    // this callback will be called if myPromise is fulfilled
  },
  () =>{
    // this specific callback will be called if myPromise is rejected
  }
);

// In addition to giving a callback for errors in .then(), you can give a
// catch-all error handler as .catch()
myPromise.catch(
  () => {
    // handle the problem here
  }
)


const fs = require('fs').promises;
const handler = (data, index) => {
  console.Log(`Chapter $(index}:`,data);
  return fs.readFile(`chapter${index + 1}.txt`,'utf-8');
};

const files1 = fs.readFile( 'chapter1.txt', 'utf-8')
files1
  .then(data => handler(data,1))
  .then(data => handler(data,2))
  .then(data => handler(data,3))
  .then(data => handler(data,4))
  .then(data => {
    console.log('Chapter 5:', data);
  })
  .catch(err => {
    console.log('Error:', err);
  });

  const dinnerPlans = startToPrepareDinner()
    .then(lightBBQ)
    .then(stokeFire)
    .then(grilisteak)
    .then(EAT)
    .catch(eatNothing) // in case we burn ourselves

  const restPlans = dinnerPlans
    .then(watchYoutube)
    .then(eveningStroll)
    .catch(goToBed) // maybe the internet was out

    Promise.all([files1, files2, files3, files4, files5])