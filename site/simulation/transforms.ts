/**
 * x, y, z => r, theta, phi
 */
export const cartesian_to_spherical = (
  [x, y, z]: [number, number, number],
  origin: [number, number, number] = [0, 0, 0]
): [number, number, number] => {
  const [o_x, o_y, o_z] = origin;
  const [t_x, t_y, t_z] = [x - o_x, y - o_y, z - o_z];

  // console.log(`centered pos (1): ${[x, y, z].map((x) => x.toFixed(3))}`);

  const r = Math.sqrt(t_x * t_x + t_y * t_y + t_z * t_z);
  const theta = Math.acos(t_y / r);
  const phi =
    Math.sign(-t_z) * Math.acos(t_x / Math.sqrt(t_x * t_x + t_z * t_z));

  return [r, theta, phi];
};

export const spherical_to_cartesian = (
  [r, theta, phi]: [number, number, number],
  origin: [number, number, number] = [0, 0, 0]
): [number, number, number] => {
  const [o_x, o_y, o_z] = origin;
  const [x, y, z] = [
    r * Math.sin(theta) * Math.cos(phi),
    r * Math.cos(theta),
    -r * Math.sin(theta) * Math.sin(phi),
  ];

  // console.log(`centered pos (2): ${[x, y, z].map((x) => x.toFixed(3))}`);

  return [x + o_x, y + o_y, z + o_z];
};
