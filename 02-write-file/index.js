const fs = require('fs');
const path = require('path');
const { stdin, stdout } = process;
const filePath = path.join(__dirname, 'text.txt');

let text = '';

const recordToTxt = () => {
  fs.writeFile(filePath, text, (err) => {
    if (err) { stdout.write(err + '\n');}
  });
};

stdout.write('Write your text:\n');

stdin.on('data', (data) => {
  const exit = data.toString().trim();
  if (exit === 'exit') { 
    stdout.write('Good luck!\n')
    process.exit();
  } 
    text += data + '\n';
    recordToTxt();
});

process.on('SIGINT', () => {
  stdout.write('\nGood luck!\n')
  process.exit();
});







