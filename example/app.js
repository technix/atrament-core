const fs = require('fs');
const inquirer = require('inquirer'); // eslint-disable-line import/no-extraneous-dependencies
const Atrament = require('../build/atrament');

const gameConfig = {
  episodes: [
    'intercept.ink.json'
  ]
};

// Promise-based file loader, return file contents when resolved
function fileLoader(filename) {
  return new Promise((resolve) => {
    fs.readFile(filename, (err, data) => {
      resolve(data);
    });
  });
}

const atrament = new Atrament(gameConfig, fileLoader, fileLoader);

// promise-based file saver
atrament.on('saveGame', (p) => new Promise((resolve) => {
  fs.writeFile(p.id, JSON.stringify(p.data), () => {
    console.log('Game saved');
    resolve();
  });
}));


setTimeout(() => {
  atrament.saveGame('savefile.json');
}, 2000);


atrament.startGame().then(renderScene);

function renderScene() {
  const scene = atrament.getCurrentScene();
  console.log(scene.text.join(''));
  const choices = scene.choices.map(
    (t) => ({name: t.choice, value: t.id})
  );
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: ' ',
      choices
    }
  ]).then((v) => {
    atrament.makeChoice(v.choice).then(renderScene);
  });
}
