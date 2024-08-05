function sceneListImages(scene) {
  scene.images = [];
  scene.content = scene.content.map((paragraph) => {
    paragraph.images = [];
    const imageTag = paragraph.tags?.IMAGE;
    if (imageTag) {
      if (Array.isArray(imageTag)) {
        scene.images = [...scene.images, ...imageTag];
        paragraph.images = imageTag;
      } else {
        scene.images.push(imageTag);
        paragraph.images = [imageTag];
      }
    }
    return paragraph;
  });
}

function tagDisabledChoices(scene) {
  scene.choices = scene.choices.map((choice) => {
    if (choice.tags.UNCLICKABLE || choice.tags.DISABLED || choice.tags.INACTIVE) {
      choice.disabled = true;
    }
    return choice;
  });
}

export default [
  sceneListImages,
  tagDisabledChoices
];
