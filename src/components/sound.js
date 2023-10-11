import { interfaces } from '../utils/interfaces';

export function playMusic(file) {
  const { sound, state } = interfaces();
  sound.stopMusic();
  if (file) {
    sound.playMusic(interfaces().loader.getAssetPath(file));
  }
  state.setSubkey('game', '$currentMusic', file);
}

export function playSound(file) {
  const { sound } = interfaces();
  sound.playSound(interfaces().loader.getAssetPath(file));
}
