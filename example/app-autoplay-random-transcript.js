const fs = require('fs');
const Atrament = require('../build/atrament').default;

const gameConfig = {
  transcript: true,
  storyFile: process.argv[2]
};

// Promise-based file loader, return file contents when resolved
function fileLoader(filename) {
  return new Promise((resolve) => {
    fs.readFile(filename, (err, data) => {
      resolve(data.toString());
    });
  });
}


const atrament = new Atrament(gameConfig);

atrament.on('loadStory', fileLoader);
atrament.on('loadGame', fileLoader);
atrament.on('error', (e) => console.error(e));

atrament.startGame().then(renderScene);

function renderScene() {
  const scene = atrament.renderScene();
  if (scene.choices.length) {
    const choices = scene.choices.map(
      (t) => ({name: t.choice, value: t.id})
    );
    const selected = Math.floor(Math.random() * choices.length);
    atrament.makeChoice(choices[selected].value)
      .then(renderScene)
      .catch(gameOver);
  } else {
    gameOver();
  }
}

function gameOver() {
  const transcript = atrament.getTranscript();
  fs.writeFile(
    `${gameConfig.episodes[0]}.transcript`,
    JSON.stringify(transcript, null, ' '),
    () => {
      console.log('Transcript is saved.');
    }
  );
}
