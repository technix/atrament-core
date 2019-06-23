class InkCommands {
  constructor() {
    this.commands = {};
  }

  register(cmd, callback) {
    this.commands[cmd] = callback;
  }

  run(rawText, storyObj) {
    const cmdArr = rawText.replace(/(\r\n\t|\n|\r\t)/gm, '').split(' ');
    const cmd = cmdArr[1];
    const params = cmdArr.slice(2);
    if (!(cmd in this.commands)) {
      return rawText;
    }
    // run callback
    return this.commands[cmd](params, storyObj, cmd);
  }
}

export default InkCommands;
