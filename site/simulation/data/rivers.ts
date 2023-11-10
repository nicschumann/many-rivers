export type River = {
  name: string;
  slug: string;
  coordinates: [number, number];
  testcase: false;

  terrain_url: string;
  boundary_url: string;

  parameters: {
    erosion_speed: number;
    accretion_speed: number;
    accretion_upper_bound: number;
    erosion_lower_bound: number;
    min_failure_slope: number;
    initial_water: number;
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
    coordinates: [26.17488, -98.39611],
    testcase: false,

    terrain_url: "usgs-el-horcon-terrain.png",
    boundary_url: "usgs-el-horcon-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 1.5,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 10.0,
      color_normalization: 5.0,
    },
  },

  /**
   * NOTE(Nic): blows up immediately with these params...
   * I think it has to do with extreme noise in this DEM...
   */
  "final-bends-00": {
    name: "Final Bend 0",
    slug: "final-bends-00",
    coordinates: [26.17488, -98.39611],
    testcase: false,

    terrain_url: "final-bend-00.terrain.png",
    boundary_url: "final-bend-00.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.002,
      accretion_speed: 0.005,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 15.0,
      color_normalization: 12.0,
    },
  },
  "final-bends-01": {
    name: "Final Bend 1",
    slug: "final-bends-01",
    coordinates: [26.07172, -98.2383],
    testcase: false,

    terrain_url: "final-bend-01.terrain.png",
    boundary_url: "final-bend-01.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 11.0,
      color_normalization: 8.5,
    },
  },

  "final-bends-02": {
    name: "Final Bend 2",
    slug: "final-bends-02",
    coordinates: [26.0946613, -98.2702162],
    testcase: false,

    terrain_url: "final-bend-02.terrain.png",
    boundary_url: "final-bend-02.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 11.0,
      color_normalization: 11.0,
    },
  },

  /**
   * NOTE(Nic): blows up immediately with these params...
   * I think it has to do with extreme noise in this DEM...
   */
  "final-bends-03": {
    name: "Final Bend 3",
    slug: "final-bends-03",
    coordinates: [26.11572, -98.28185],
    testcase: false,

    terrain_url: "final-bend-03.terrain.png",
    boundary_url: "final-bend-03.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 13.0,
      color_normalization: 11.0,
    },
  },

  "final-bends-04": {
    name: "Final Bend 4",
    slug: "final-bends-04",
    coordinates: [26.06736, -98.07864],
    testcase: false,

    terrain_url: "final-bend-04.terrain.png",
    boundary_url: "final-bend-04.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 13.0,
      color_normalization: 9.0,
    },
  },
  /**
   * NOTE(Nic): This bend looks really nice. No defects or lidar errors.
   * Consider pulling other river segments for around this area.
   */
  "final-bends-05": {
    name: "Final Bend 5",
    slug: "final-bends-05",
    coordinates: [26.05842, -97.89649],
    testcase: false,

    terrain_url: "final-bend-05.terrain.png",
    boundary_url: "final-bend-05.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 11.0,
      color_normalization: 7.5,
    },
  },

  /**
   * NOTE(Nic): Rio Rico
   */
  "final-bends-06": {
    name: "Final Bend 6",
    slug: "final-bends-06",
    coordinates: [26.03601, -97.66267],
    testcase: false,

    terrain_url: "final-bend-06.terrain.png",
    boundary_url: "final-bend-06.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 9.0,
      color_normalization: 6.5,
    },
  },
  "final-bends-07": {
    name: "Final Bend 7",
    slug: "final-bends-07",
    coordinates: [25.94939, -97.24986],
    testcase: false,

    terrain_url: "final-bend-07.terrain.png",
    boundary_url: "final-bend-07.boundary.png",
    // NOTE(Nic): tune this.
    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: -5.0,
      color_normalization: 5.0,
    },
  },

  "final-bend-08": {
    name: "Final Bend 8",
    slug: "final-bend-08",
    coordinates: [25.94939, -97.24986],
    testcase: false,

    terrain_url: "final-bend-08.terrain.png",
    boundary_url: "final-bend-08.boundary.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: 3.0,
      color_normalization: 4.5,
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
      initial_water: 2.0,
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
      initial_water: 2.0,
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
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 25.0,
      color_contrast: 5.0,
      color_normalization: 4.0,
    },
  },

  /** NOTE(Nic): Los Ebanos explodes; water is miscalibrated. Need to add initial water. */
  "los-ebanos": {
    name: "Los Ebanos",
    slug: "los-ebanos",
    testcase: false,

    terrain_url: "usgs-los-ebanos-terrain.png",
    boundary_url: "usgs-los-ebanos-terrain-boundary-simplified-flows.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 80.0,
      color_contrast: 20.0,
      color_normalization: 12.0,
    },
  },

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
      initial_water: 2.0,
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
      initial_water: 2.0,
    },
    ui: {
      normalization_factor: 30.0,
      color_contrast: 4.5,
      color_normalization: 6.0,
    },
  },
};
