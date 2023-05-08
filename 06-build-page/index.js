const fs = require('fs');
const path = require('path');

const stylesFolder = path.join(__dirname, 'styles');
const distFolder = path.join(__dirname, 'project-dist');
const assets = path.join(__dirname, 'assets');
const copyAssets = path.join(distFolder, 'assets');

function buildHtml() {
  const templateHtml = path.join(__dirname, 'template.html');
  const indexHtml = path.join(distFolder, 'index.html');

  fs.copyFile(templateHtml, indexHtml, (err) => {
    if (err) console.log(err);
  });

  const stream = fs.createReadStream(indexHtml, { encoding: 'utf8' });
  const headerContent = fs.createReadStream(path.join(__dirname, 'components/header.html'), 'utf8');
  const footerContent = fs.createReadStream(path.join(__dirname, 'components/footer.html'), 'utf8');
  const mainContent = fs.createReadStream(path.join(__dirname, 'components/articles.html'), 'utf8');

  let dataAccumulator = '';
  
  stream.on('data', data => {
    dataAccumulator += data.toString(); 
    const matchesHeader = dataAccumulator.match(/{{header}}/g);
    const matchesFooter = dataAccumulator.match(/{{footer}}/g);
    const matchesArticles = dataAccumulator.match(/{{articles}}/g);

    if (matchesHeader) {
      headerContent.on('data', dataHeader => {
        dataAccumulator = dataAccumulator.replaceAll(matchesHeader, dataHeader); 
        fs.writeFile(indexHtml, dataAccumulator)
      });
    }

    if (matchesFooter) {
      footerContent.on('data', dataFooter => {
        dataAccumulator = dataAccumulator.replaceAll(matchesFooter, dataFooter); 
        fs.writeFile(indexHtml, dataAccumulator)
      });
    }

    if (matchesArticles) {
      mainContent.on('data', dataArticles => {
        dataAccumulator = dataAccumulator.replaceAll(matchesArticles, dataArticles); 
        fs.writeFile(indexHtml, dataAccumulator)
      });
    }
  });

  stream.on('error', err => console.error(err));
}



function buildStyleCss() {
  const bundlePath = path.join(distFolder, 'style.css');
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

// const removeDeletedFiles = (copyPath, files) => {
//   fs.readdir(copyPath, (err, copyFiles) => {
//     if (err) console.log(err);
//     copyFiles.forEach((file) => {
//       const copyFilePath = path.join(copyPath, file);
//       fs.stat(copyFilePath, (err, stat) => {
//         if (err) console.log(err);
//         if (!stat.isDirectory() && !files.includes(file)) {
//           fs.unlink(copyFilePath, (err) => {
//             if (err) console.log(err);
//           });
//         }
//       });
//     });
//   });
// };

function copyAssetsFiles (folderPath, copyPath) {
  fs.mkdir(copyPath, { recursive: true }, (err) => {
    if (err) console.log(err);
  fs.readdir(folderPath, (err, files) => {
    if (err) console.log(err);
    files.forEach((file) => {
      const folderFilePath = path.join(folderPath, file);
      const copyFilePath = path.join(copyPath, file);
      fs.stat(folderFilePath, (err, stat) => {
        if (err) console.log(err);
        if (stat.isDirectory()) {
          copyAssetsFiles(folderFilePath, copyFilePath);
        } else {
          fs.copyFile(folderFilePath, copyFilePath, (err) => {
            if (err) console.log(err);
          });
        }
      });
    });
  });
});
};

function buildProject() {
  fs.mkdir(distFolder, { recursive: true }, (err) => {
    if (err) console.log(err);
  });
  buildHtml();
  buildStyleCss();
  copyAssetsFiles(assets, copyAssets);
}

buildProject();
