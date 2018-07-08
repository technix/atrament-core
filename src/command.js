class Command {
  constructor(deps) {
    this.dependencies = deps;
    this.commands = {};
  }

  register(cmd, callback, deps) {
    this.commands[cmd] = {callback, deps};
  }

  run(rawText) {
    const cmdArr = rawText.replace(/(\r\n\t|\n|\r\t)/gm, '').split(' ');
    const cmd = cmdArr[1];
    const params = cmdArr.slice(2);
    if (!(cmd in this.commands)) {
      return rawText;
    }
    const c = this.commands[cmd];
    // inject dependencies
    const cmdDeps = [];
    if (c.deps) {
      c.deps.forEach((d) => {
        cmdDeps.push(this.dependencies[d]);
      });
    }
    // run callback
    return c.callback(params, ...cmdDeps);
  }
}

export default Command;
