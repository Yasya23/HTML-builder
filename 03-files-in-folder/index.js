const fs = require('fs');
const path = require('path');
const secretFolderPath = path.join(__dirname, '/secret-folder');

function printFileInformation(file) {
  const filesecretFolderPath = path.join(secretFolderPath, file);
  fs.stat(filesecretFolderPath, (err, stats) => {
    if (err) console.log(err);
    if (stats.isFile()) {
      const sizeInKb = stats.size /1024;
      const pathInfo = path.parse(filesecretFolderPath)
      const extension = pathInfo.ext.slice(1);
      const name = pathInfo.name;
      console.log(`${name} - ${extension} - ${sizeInKb}kb`);
    }
  })
}

fs.readdir(secretFolderPath, (err, files) => {
  if (err) console.log(err);
  files.forEach(file => printFileInformation(file));
});