
function parseTags(tags) {
  const tagsObj = {};
  tags.forEach((item) => {
    let content = item.match(/\s*(\w+)\s*:\s*(.+?)\s*$/);
    if (Array.isArray(content)) {
      // tag is in "key: value" format
      const [, key, value] = content;
      const firstChar = value.substr(0, 1);
      if (firstChar === '{' || firstChar === '[') {
        content = JSON.parse(value); // this is JSON
      } else {
        content = value;
      }
      tagsObj[key] = content;
    } else {
      tagsObj[item] = true; // use tag as key name
    }
  });
  return tagsObj;
}

function getScene(thisStory, cmdInstance) {
  const scene = {
    type: 'text',
    content: [],
    text: [],
    tags: {},
    choices: []
  };
  while (thisStory.canContinue) {
    thisStory.Continue();
    const {currentText} = thisStory;
    if (currentText.indexOf('>>>') === 0) {
      // parse command
      const output = cmdInstance.run(currentText, thisStory);
      if (output) {
        scene.text.push(output);
      }
    } else {
      // add story text
      scene.text.push(currentText); // eslint-disable-line new-cap
    }
    // add tags
    const tags = parseTags(thisStory.currentTags);
    if (tags.scene) {
      scene.type = tags.scene;
    }
    scene.tags = Object.assign({}, scene.tags, tags);
    // save content - text along with tags
    scene.content.push({text: currentText, tags});
  }
  thisStory.currentChoices.forEach((choice, id) => {
    scene.choices.push({id, choice: choice.text});
  });
  return scene;
}

export default getScene;
