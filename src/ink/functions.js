class InkFunctions {
  constructor() {
    this.functions = {};
  }

  register(fnList) {
    Object.keys(fnList).forEach((fn) => {
      this.functions[fn] = fnList[fn];
    });
  }

  attach(story) {
    Object.keys(this.functions).forEach((fn) => {
      story.bindFunction(fn, this.functions[fn]);
    });
  }
}

export default InkFunctions;
