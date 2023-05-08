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

  const componentsPath = path.join(__dirname, 'components');
  const names = [];

  fs.readdir(componentsPath, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const filePath = path.join(componentsPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) console.log(err);
        if (stats.isFile()) {
          names.push(path.parse(filePath).name);
        }
      });
    });
  });

  const stream = fs.createReadStream(indexHtml, { encoding: 'utf8' });
  let dataAccumulator = '';

  stream.on('data', (data) => {
    dataAccumulator += data.toString();
  });

  stream.on('end', () => {
    Promise.all(
      names.map((name) => {
        const matches = dataAccumulator.match(new RegExp(`{{${name}}}`, 'g'));

        if (matches) {
          return fs.promises
            .readFile(path.join(componentsPath, `${name}.html`), 'utf8')
            .then((content) => {
              dataAccumulator = dataAccumulator.replaceAll(matches[0], content);
            })
            .catch((err) => console.log(err));
        }
      })
    ).then(() => {
      fs.writeFile(indexHtml, dataAccumulator, (err) => {
        if (err) console.log(err);
      });
    });
  });

  stream.on('error', (err) => console.error(err));
}

function buildStyleCss() {
  const bundlePath = path.join(distFolder, 'style.css');
  const bundleStream = fs.createWriteStream(bundlePath);

  fs.readdir(stylesFolder, (err, files) => {
    if (err) return;
    const cssFiles = files.filter((file) => file.endsWith('.css'));
    cssFiles.forEach((file) => {
      const filePath = path.join(stylesFolder, file);
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      stream.on('error', (err) => console.log(err));
      stream.pipe(bundleStream, { end: false });
    });
  });
}

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

function copyAssetsFiles(folderPath, copyPath) {
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
}

function buildProject() {
  fs.mkdir(distFolder, { recursive: true }, (err) => {
    if (err) console.log(err);
  });
  buildHtml();
  buildStyleCss();
  copyAssetsFiles(assets, copyAssets);
}

buildProject();
