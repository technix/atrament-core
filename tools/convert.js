const path = require('path');
const fs = require('fs');
const {spawn} = require('child_process');

const inputFile = process.argv[2];
const outputTemp = `${inputFile}.tmp.json`;
const outputFile = `${inputFile}.json`;

const inkCompiler = path.resolve(__dirname, '../node_modules/inkjs', 'dist/inkjs-compiler.js');

const prc = spawn('node', [inkCompiler, '-o', outputTemp, inputFile]);

prc.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

prc.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

prc.on('close', () => {
  fs.readFile(outputTemp, 'utf-8', (err, data) => {
    if (err) {
      throw err;
    }
    const outputFileContent = data.replace('\uFEFF', '');
    fs.writeFile(outputFile, outputFileContent, () => {
      fs.unlink(outputTemp, (ferr) => {
        if (ferr) {
          throw ferr;
        }
        console.log(`Converted to ${outputFile}`);
      });
    });
  });
});
