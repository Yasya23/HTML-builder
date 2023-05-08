const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'files');
const copyFolder = path.join(__dirname, 'files-copy');

const removeDeletedFiles = (copyPath, files) => {
  fs.readdir(copyPath, (err, copyFiles) => {
    if (err) console.log(err);
    copyFiles.forEach((file) => {
      const copyFilePath = path.join(copyPath, file);
      fs.stat(copyFilePath, (err, stat) => {
        if (err) console.log(err);
        if (!stat.isDirectory() && !files.includes(file)) {
          fs.unlink(copyFilePath, (err) => {
            if (err) console.log(err);
          });
        }
      });
    });
  });
};

const copyNewAndUpdatedFiles = (folderPath, copyPath) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) console.log(err);
    files.forEach((file) => {
      const folderFilePath = path.join(folderPath, file);
      const copyFilePath = path.join(copyPath, file);
      fs.stat(folderFilePath, (err, stat) => {
        if (err) console.log(err);
        if (stat.isDirectory()) {
          copyNewAndUpdatedFiles(folderFilePath, copyFilePath);
        } else {
          fs.copyFile(folderFilePath, copyFilePath, (err) => {
            if (err) console.log(err);
            console.log(`${file} was copied to files-copy`);
          });
        }
      });
    });
  });
};

const copyFiles = (folder, copy) => {
  fs.mkdir(copy, { recursive: true }, (err) => {
    if (err) console.log(err);
    fs.readdir(folder, (err, files) => {
      if (err) console.log(err);
      removeDeletedFiles(copy, files);
      copyNewAndUpdatedFiles(folder, copy);
    });
  });
};

copyFiles(folder, copyFolder);
