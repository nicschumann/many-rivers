export type River = {
  name: string;
  slug: string;
  testcase: false;

  terrain_url: string;
  boundary_url: string;

  parameters: {
    erosion_speed: number;
    accretion_speed: number;
    accretion_upper_bound: number;
    erosion_lower_bound: number;
    min_failure_slope: number;
  };
  ui: {
    normalization_factor: number;
    color_contrast: number;
    color_normalization: number;
  };
};

export const rivers: { [slug: string]: River } = {
  "el-horcon": {
    name: "El Horcón",
    slug: "el-horcon",
    testcase: false,

    terrain_url: "usgs-el-horcon-terrain.png",
    boundary_url: "usgs-el-horcon-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 10.0,
      color_normalization: 7.0,
    },
  },
  "rio-bravo": {
    name: "Río Bravo",
    slug: "rio-bravo",
    testcase: false,

    terrain_url: "usgs-rio-bravo-terrain.png",
    boundary_url: "usgs-rio-bravo-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 8.0,
      color_normalization: 9.5,
    },
  },
  hidalgo: {
    name: "Hidalgo",
    slug: "hidalgo",
    testcase: false,

    terrain_url: "usgs-hidalgo-terrain.png",
    boundary_url: "usgs-hidalgo-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
    },
    ui: {
      normalization_factor: 60.0,
      color_contrast: 20.0,
      color_normalization: 7.0,
    },
  },
  "las-rusias": {
    name: "Las Rusias",
    slug: "las-rusias",
    testcase: false,

    terrain_url: "usgs-las-rusias-terrain.png",
    boundary_url: "usgs-las-rusias-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
    },
    ui: {
      normalization_factor: 25.0,
      color_contrast: 5.0,
      color_normalization: 4.0,
    },
  },

  /** NOTE(Nic): Los Ebanos explodes; water is miscalibrated. Need to add initial water. */
  // 'los-ebanos': {
  //     name: 'Los Ebanos',
  //     slug: 'los-ebanos',
  //     testcase: false,

  //     terrain_url: 'usgs-los-ebanos-terrain.png',
  //     boundary_url: 'usgs-los-ebanos-terrain-boundary-simplified-flows.png',

  //     parameters: {
  //         erosion_speed: 0.02,
  //         accretion_speed: 0.018,
  //         accretion_upper_bound: 0.001,
  //         erosion_lower_bound: 0.05,
  //         min_failure_slope: 80.0,
  //     },
  //     ui: {
  //         normalization_factor: 80.0,
  //         color_contrast: 20.0,
  //         color_normalization: 12.0
  //     }
  // },
  "nuevo-progreso": {
    name: "Nuevo Progreso",
    slug: "nuevo-progreso",
    testcase: false,

    terrain_url: "usgs-nuevo-progreso-terrain.png",
    boundary_url: "usgs-nuevo-progreso-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 9.0,
      color_normalization: 8.0,
    },
  },
  "san-luisito": {
    name: "San Luisito",
    slug: "san-luisito",
    testcase: false,

    terrain_url: "usgs-san-luisito-terrain.png",
    boundary_url: "usgs-san-luisito-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
    },
    ui: {
      normalization_factor: 30.0,
      color_contrast: 4.5,
      color_normalization: 6.0,
    },
  },
};
