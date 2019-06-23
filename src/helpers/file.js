const fs = require('fs');

export function loadFile(filename) {
  return new Promise((resolve) => {
    fs.readFile(filename, (err, data) => {
      resolve(data.toString());
    });
  });
}

export function saveFile(saveData) {
  return new Promise((resolve) => {
    fs.writeFile(saveData.id, JSON.stringify(saveData), resolve);
  });
}
