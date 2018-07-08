class InkObservers {
  constructor() {
    this.observers = {};
  }

  register(obList) {
    Object.keys(obList).forEach((ob) => {
      this.observers[ob] = obList[ob];
    });
  }

  attach(story) {
    Object.keys(this.observers).forEach((ob) => {
      story.observeVar(ob, this.observers[ob]);
    });
  }
}

export default InkObservers;
