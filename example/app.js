const fs = require('fs');
const inquirer = require('inquirer'); // eslint-disable-line import/no-extraneous-dependencies
const Atrament = require('../build/atrament');

const atrament = new Atrament();

const story = fs.readFileSync('intercept.ink.json');
const storyJson = JSON.parse(story);

atrament.initStory('intercept', storyJson);

const atramentstory = atrament.startStory();
choiceScreen(atramentstory);

function choiceScreen(sceneList) {
  const scene = sceneList[sceneList.length - 1];
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
    choiceScreen(atrament.continueStory(scene.id, v.choice));
  });
}
