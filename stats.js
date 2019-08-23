const fs = require('fs');

// Some random stats, but could be real
const stats = {
  'main.js': Math.floor(Math.random() * 1000),
  'vendor.js': Math.floor(Math.random() * 1000)
};

fs.writeFile('public/stats.json', JSON.stringify(stats), 'utf8', err => {
  if (err) throw err;
  console.log('The file has been saved!', __dirname);
});