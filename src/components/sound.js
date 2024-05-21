import { interfaces } from '../utils/interfaces';

export function playSound(file) {
  const { sound, loader } = interfaces();
  sound.playSound(loader.getAssetPath(file));
}

export function stopSound(file) {
  const { sound, loader } = interfaces();
  sound.stopSound(file ? loader.getAssetPath(file) : null);
}

export function playMusic(file) {
  const { sound, state, loader } = interfaces();
  sound.stopMusic();
  sound.playMusic(loader.getAssetPath(file));
  state.setSubkey('game', '$currentMusic', file);
}

export function stopMusic(file) {
  const { sound, state, loader } = interfaces();
  sound.stopMusic(file ? loader.getAssetPath(file) : null);
  state.setSubkey('game', '$currentMusic', false);
}
