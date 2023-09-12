/* eslint no-bitwise: "off" */

export default function hashCode(str) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i += 1) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
