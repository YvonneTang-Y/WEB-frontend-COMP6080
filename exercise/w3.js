/* 
Reads in up to 20 dates in the format "YYYY/MM/DD" from argv
For each date, calculates how many days since that date have passed
Creates a list of keys:value pairs that store date:days-since-date
Outputs this as JSON to a file on the file system
*/

// import moment from 'moment';
// import fs from 'fs';
// import differenceInDays from 'date-fns/differenceInDays';

// function daysSinceDate(moment) {
//     const result = differenceInDays(
//         Date.now(),
//         sinceDate
//     )
//     console.log(result);
//     return 1;
// }

// const dates = process.argv.splice(2);
// const dayssinceobj = {};
// console.log(dates);
// for (const date of dates) {
//     const ymdSplit = date.split('/');
//     const daysSince = daysSinceDate(new Date(ymdSplit[0], ymdSplit[1], ymdSplit[2], 0, 0));
//     dayssinceobj[date] = daysSince;
// }

// const content = JSON.stringify(dayssinceobj);
// try {
//     fs.writeFileSync('./output.json', content);
// }

import express from 'express';
import fs from 'fs';
import https from 'https';
const app = express();
const port = 3000;

let total = 0;

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/blah', (req, res) => {
  res.send('mango')
})
app.get('/secrets', (req, res) => {
  const data = fs.readFileSync('./data.json', {encoding: 'utf8', flag: 'r'});
  console.log(data);
  res.send('mango')
})
app.get('/scrape', (req, res) => {
    const resdata = fetch(req.query.url).then(a=> a.json()).then(data => {
        console.log(data);
    });
    // console.log(req.query);
    // https.get(req.query.url, function(res) {
    //     console.log(`Status: ${res.statusCode}`);
    //     res.setEncoding('utf8');
    //     res.on('data', function(sourcecode) {
    //         const divsplit = sourcecode.split('<div');
    //         const count = divsplit.length - 1;
    //         total += count;
    //     });
    //     res.on('finish', function () {
    //         res.send(total);
    //     })
    // }).on('error', function(err) {
    //     console.log(err);
    // });
    res.send('...')
})
app.listen(port, () => {
  console.log('Example app listening onport ${port}');
})