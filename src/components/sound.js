import { interfaces } from '../utils/interfaces';

export function playMusic(file) {
  const { sound, state, loader } = interfaces();
  sound.stopMusic();
  if (file) {
    sound.playMusic(loader.getAssetPath(file));
  }
  state.setSubkey('game', '$currentMusic', file);
}

export function playSound(file) {
  const { sound, loader } = interfaces();
  sound.playSound(loader.getAssetPath(file));
}
