const fs = require('fs');
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

const atrament = new Atrament(gameConfig);

atrament.on('loadStory', fileLoader);
atrament.on('loadGame', fileLoader);
atrament.on('error', (e) => console.error(e));

atrament.startGame().then(renderScene);

function renderScene() {
  const scene = atrament.getCurrentScene();
  console.log(scene.text.join(''));
  if (scene.choices.length) {
    const choices = scene.choices.map(
      (t) => ({name: t.choice, value: t.id})
    );
    const selected = Math.floor(Math.random() * choices.length);
    console.log('>>', choices[selected].name);
    atrament.makeChoice(choices[selected].value)
      .then(renderScene)
      .catch(gameOver);
  } else {
    gameOver();
  }
}

function gameOver() {
  console.log('END.');
}
