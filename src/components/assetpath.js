import { interfaces } from '../utils/interfaces';

export default function getAssetPath(file) {
  const state = interfaces().state.get();
  return `${state.game.$path}/${file}`; // TODO: use environment to generate valid path
}
