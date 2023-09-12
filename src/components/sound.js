import { interfaces } from '../utils/interfaces';
import getAssetPath from './assetpath';

export function playMusic(file) {
  const { sound, state } = interfaces();
  sound.stopMusic();
  if (file) {
    sound.playMusic(getAssetPath(file));
  }
  state.setSubkey('game', '$currentMusic', file);
}

export function playSound(file) {
  const { sound } = interfaces();
  sound.playSound(getAssetPath(file));
}
