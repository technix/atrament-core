import { interfaces } from '../utils/interfaces';

export function playSound(snd) {
  const { sound, loader } = interfaces();
  const soundQueue = Array.isArray(snd) ? snd : [snd];
  soundQueue.forEach((file) => sound.playSound(loader.getAssetPath(file)));
}

export function stopSound(snd) {
  const { sound, loader } = interfaces();
  const soundQueue = Array.isArray(snd) ? snd : [snd];
  soundQueue.forEach((file) => sound.stopSound(file ? loader.getAssetPath(file) : null));
}

export function playMusic(mus) {
  const { sound, state, loader } = interfaces();
  const musicQueue = Array.isArray(mus) ? mus : [mus];
  const currentMusic = state.get().game.$currentMusic || [];
  musicQueue.forEach((file) => {
    sound.playMusic(loader.getAssetPath(file));
    currentMusic.push(file);
  });
  state.setSubkey('game', '$currentMusic', currentMusic);
}

export function playSingleMusic(mus) {
  const { sound, state, loader } = interfaces();
  const musicQueue = Array.isArray(mus) ? mus : [mus];
  sound.stopMusic();
  const file = musicQueue.pop();
  sound.playMusic(loader.getAssetPath(file));
  state.setSubkey('game', '$currentMusic', [file]);
}

export function stopMusic(mus) {
  const { sound, state, loader } = interfaces();
  const musicQueue = Array.isArray(mus) ? mus : [mus];
  let currentMusic = state.get().game.$currentMusic || [];
  musicQueue.forEach((file) => {
    sound.stopMusic(file ? loader.getAssetPath(file) : null);
    if (file) {
      currentMusic = currentMusic.filter((m) => m !== file);
    } else {
      currentMusic = [];
    }
  });
  state.setSubkey('game', '$currentMusic', currentMusic);
}
