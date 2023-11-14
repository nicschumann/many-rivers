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
  /**
   * NOTE(Nic): blows up immediately with these params...
   * I think it has to do with extreme noise in this DEM...
   */
  ilkrsr: {
    name: "Final Bend 0",
    slug: "ilkrsr",
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
  maf6rw: {
    name: "Final Bend 1",
    slug: "maf6rw",
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

  hckgux: {
    name: "Final Bend 2",
    slug: "hckgux",
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

  d4q9kf: {
    name: "Final Bend 3",
    slug: "d4q9kf",
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

  ouvkf8: {
    name: "Final Bend 4",
    slug: "ouvkf8",
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
  rmalox: {
    name: "Final Bend 5",
    slug: "rmalox",
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
  rt5kfy: {
    name: "Final Bend 6",
    slug: "rt5kfy",
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
  rbu1ks: {
    name: "Final Bend 7",
    slug: "rbu1ks",
    coordinates: [25.9497615, -97.2496318],
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

  xerpfb: {
    name: "Final Bend 8",
    slug: "xerpfb",
    coordinates: [25.943079, -97.5775448],
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

  sgn9lm: {
    name: "Final Bend 9",
    slug: "sgn9lm",
    coordinates: [26.0614541, -97.8665745],
    testcase: false,

    terrain_url: "final-bend-09.terrain.png",
    boundary_url: "final-bend-09.boundary.png",

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

  fin6uy: {
    name: "Final Bend 10",
    slug: "fin6uy",
    coordinates: [25.9560915, -97.293322],
    testcase: false,

    terrain_url: "final-bend-10.terrain.png",
    boundary_url: "final-bend-10.boundary.png",

    parameters: {
      erosion_speed: 0.02,
      accretion_speed: 0.018,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 1,
    },
    ui: {
      normalization_factor: 40.0,
      color_contrast: -10.0,
      color_normalization: 8.0,
    },
  },

  mzl8ju: {
    name: "Final Bends 11",
    slug: "mzl8ju",
    coordinates: [25.9148447, -97.5293984],
    testcase: false,

    terrain_url: "final-bend-11.terrain.png",
    boundary_url: "final-bend-11.boundary.png",

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

  t7xszw: {
    name: "Final Bend 12",
    slug: "t7xszw",
    coordinates: [26.0606078, -97.9336059],
    testcase: false,

    terrain_url: "final-bend-12.terrain.png",
    boundary_url: "final-bend-12.boundary.png",

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

  "7knwi4": {
    name: "Final Bend 13",
    slug: "7knwi4",
    coordinates: [26.0662789, -98.1664896],
    testcase: false,

    terrain_url: "final-bend-13.terrain.png",
    boundary_url: "final-bend-13.boundary.png",

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

  vaka6g: {
    name: "Final Bends 14",
    slug: "vaka6g",
    coordinates: [25.9987972, -97.6245861],
    testcase: false,

    terrain_url: "final-bend-14.terrain.png",
    boundary_url: "final-bend-14.boundary.png",

    parameters: {
      erosion_speed: 0.08,
      accretion_speed: 0.08,
      accretion_upper_bound: 0.001,
      erosion_lower_bound: 0.05,
      min_failure_slope: 80.0,
      initial_water: 4.0,
    },
    ui: {
      normalization_factor: 30.0,
      color_contrast: 4.5,
      color_normalization: 6.0,
    },
  },
};
