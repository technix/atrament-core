const atramentConfig = {
  applicationID: '!CHANGE_THIS',
  settings: {
    volume: 0,
    mute: true
  }
};

export function getConfig() {
  return atramentConfig;
}

export function setConfig(InkStory, cfg) {
  if (!cfg) {
    return;
  }
  atramentConfig.InkStory = InkStory;
  Object.entries(cfg).forEach(([k, v]) => {
    // TODO use better deep copy here
    // TODO merge default config with the new config
    atramentConfig[k] = JSON.parse(JSON.stringify(v));
  });
}
