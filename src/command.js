import episode from './episode';
import story from './story';

const commands = {};
const dependencies = {
  episode,
  story
};

const Command = {
  register(cmd, callback, deps) {
    commands[cmd] = {callback, deps};
  },

  run(rawText) {
    const cmdArr = rawText.replace(/(\r\n\t|\n|\r\t)/gm, '').split(' ');
    const cmd = cmdArr[1];
    const params = cmdArr.slice(2);
    if (!(cmd in commands)) {
      return rawText;
    }
    const c = commands[cmd];
    // inject dependencies
    const cmdDeps = [];
    if (c.deps) {
      c.deps.forEach((d) => {
        cmdDeps.push(dependencies[d]);
      });
    }
    // run callback
    return c.callback(params, ...cmdDeps);
  }
};

export default Command;
