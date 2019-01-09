const fs = require('fs');
const Atrament = require('../build/atrament').default;

let atrament;
let currentPlay = 1;
const numPlays = process.argv[3] || 100;

const gameConfig = {
  storyFile: process.argv[2]
};

const res = {
  knots: {},
  turns: {}
};


// Promise-based file loader, return file contents when resolved
function fileLoader(filename) {
  return new Promise((resolve) => {
    fs.readFile(filename, (err, data) => {
      resolve(data.toString());
    });
  });
}

function playGame(cfg) {
  console.log(currentPlay);
  atrament = new Atrament(cfg);
  atrament.on('loadStory', fileLoader);
  atrament.on('loadGame', fileLoader);
  atrament.on('error', (e) => console.error(e));
  atrament.startGame().then(renderScene);
}

function renderScene() {
  const scene = atrament.renderScene();
  //console.log(scene.text.join(''));
  if (scene.choices.length) {
    const choices = scene.choices.map(
      (t) => ({name: t.choice, value: t.id})
    );
    const selected = Math.floor(Math.random() * choices.length);
    //console.log('=>', choices[selected].name);
    atrament.makeChoice(choices[selected].value)
      .then(renderScene)
      .catch(gameOver);
  } else {
    gameOver();
  }
}

function gameOver() {
  //console.log('END.');
  // console.log(atrament.debug());
  const d = atrament.debug();
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
  currentPlay += 1;
  if (currentPlay <= numPlays) {
    playGame(gameConfig);
  } else {
    for (k in res.turns) {
      const min = Math.min( ...res.turns[k] );
      const max = Math.max( ...res.turns[k] );
      const average = Math.round( res.turns[k].reduce((a,b) => a + b, 0) / res.turns[k].length);
      res.turns[k] = {
        max,
        min,
        average
      };
    }
    console.log(res.turns);
    console.log(res.knots);
  }
}

playGame(gameConfig);
