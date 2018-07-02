const fs = require('fs');
const atrament = require('../build/atrament');

const gameConfig = {
  episodes: [
    process.argv[2]
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

atrament.init(gameConfig);

atrament.on('loadStory', fileLoader);
atrament.on('loadGame', fileLoader);
atrament.on('error', (e) => console.error(e));

atrament.startGame().then(renderScene);

function renderScene() {
  const scene = atrament.renderScene();
  console.log(scene.text.join(''));
  if (scene.choices.length) {
    const choices = scene.choices.map(
      (t) => ({name: t.choice, value: t.id})
    );
    const selected = Math.floor(Math.random() * choices.length);
    console.log('=>', choices[selected].name);
    atrament.makeChoice(choices[selected].value)
      .then(renderScene)
      .catch(gameOver);
  } else {
    gameOver();
  }
}

function gameOver() {
  console.log('END.');
  const d = atrament.debug();
  const res = {
    knots: {},
    turns: {}
  };
  for (k in d._turnIndices) {
    if (res.knots[k]) {
      res.knots[k] += 1;
    } else {
      res.knots[k] = 1;
    }
    if (res.turns[k]) {
      res.turns[k].push(d._turnIndices[k]);
    } else {
      res.turns[k] = [d._turnIndices[k]];
    }
  }

  console.log(res);
  console.log(atrament.debug());
}
