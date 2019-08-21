const dirTree = require('directory-tree');
const fs = require('fs');

const stats = {};

dirTree('./scripts/', null, item => {
  if (item.type === 'file') {
    // Random number added to filesize for illustrative purposes
    stats[item.path] = item.size + Math.floor(Math.random() * 1000);
  }
});

fs.writeFile('./public/stats.json', JSON.stringify(stats), 'utf8', err => {
  if (err) throw err;
  console.log('The file has been saved!');
});