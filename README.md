# Atrament

*Atrament: (obsolete) ink*

THIS IS A WORK IN PROGRESS.

Atrament is a simple interface to Inkjs, which can be used as a core engine for your game app.

If you are looking for ready-to-use solution, take a look at Atrament-UI, HTML5 frontend to Atrament, based on Preact: https://github.com/technix/atrament-ui

See classes and methods description in the [HOWTO](https://github.com/technix/atrament/blob/master/HOWTO.md) document.
## Example

```
const gameConfig = {
  storyFile: 'filename.ink.json',
  transcript: true
};

const atrament = new Atrament(gameConfig);

function fileLoader(filename) {
  return new Promise((resolve) => {
    fs.readFile(filename, (err, data) => {
      resolve(data.toString());
    });
  });
}

atrament.on('loadStory', fileLoader);

atrament.startGame().then(renderScene);

function renderScene() {
  const scene = atrament.renderScene();
  console.log(scene.text.join(''));
  if (!scene.choices.length) {
    gameOver();
    return;
  }
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
    atrament.makeChoice(v.choice);
    renderScene();
  });
}

function gameOver() {
  console.log('END.');
}
```

## LICENSE
Atrament is distributed under MIT license.
Copyright (c) 2018 Serhii "techniX" Mozhaiskyi

inkjs is copyright (c) 2017 Yannick Lohse

Ink is copyright (c) 2017 inkle Ltd.
