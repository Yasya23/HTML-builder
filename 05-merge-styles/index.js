const fs = require('fs');
const path = require('path');

const stylesFolder = path.join(__dirname, 'styles');
const distFolder = path.join(__dirname, 'project-dist');

function buildBundleCss() {
  const bundlePath = path.join(distFolder, 'bundle.css');
  const bundleStream = fs.createWriteStream(bundlePath);

  fs.readdir(stylesFolder, (err, files) => {
    if (err) {
      console.log(err);
      return;
    }
    const cssFiles = files.filter(file => file.endsWith('.css'));
    cssFiles.forEach((file) => {
      const filePath = path.join(stylesFolder, file);
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      stream.on('error', (err) => console.log(err));
      stream.pipe(bundleStream, { end: false });
    });
  });
};

buildBundleCss()