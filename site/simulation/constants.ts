export const RENDER_SCALE = 0.75;
export const TARGET_FRAMETIME = 0.033; // 30 frames
export const TILE_SIZE = [384, 384]; // max is roughly 512^2...
export const TERRAIN_SIZE = [
  TILE_SIZE[0] * RENDER_SCALE,
  TILE_SIZE[1] * RENDER_SCALE,
];
export const DEFAULT_INTERPOLATION = "nearest";
