module.exports = (api) => {
  // api.cache(true);
  const isTest = api.env('test');
  const presetEnv = {
    targets: {
      browsers: ['>0.5%', 'not ie 11', 'not op_mini all']
    }
  };
  if (isTest) {
    // fix issue with Story constructor in class AtramentStory
    // presetEnv.exclude = ['@babel/plugin-transform-classes'];
    presetEnv.targets = { node: 'current' };
  }
  return {
    presets: [
      ['@babel/preset-env', presetEnv]
    ]
  };
};
