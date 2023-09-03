export type River = {
    name: string
    slug: string
    testcase: false

    terrain_url: string
    boundary_url: string

    parameters: {
        erosion_speed: 0.02,
        accretion_speed: 0.018, 
        accretion_upper_bound: 0.001,
        erosion_lower_bound: 0.05,
        min_failure_slope: 80.0,
    }
}

export const rivers : {[slug: string]: River} = {
    'el-horcon': {
        name: 'El Horcón',
        slug: 'el-horcon',
        testcase: false,

        terrain_url: 'usgs-el-horcon-terrain.png',
        boundary_url: 'usgs-el-horcon-terrain-boundary-simplified-flows.png',

        parameters: {
            erosion_speed: 0.02,
            accretion_speed: 0.018, 
            accretion_upper_bound: 0.001,
            erosion_lower_bound: 0.05,
            min_failure_slope: 80.0,
        }
    },
    'hidalgo': {
        name: 'Hidalgo',
        slug: 'hidalgo',
        testcase: false,

        terrain_url: 'usgs-hidalgo-terrain.png',
        boundary_url: 'usgs-hidalgo-terrain-boundary-simplified-flows.png',

        parameters: {
            erosion_speed: 0.02,
            accretion_speed: 0.018, 
            accretion_upper_bound: 0.001,
            erosion_lower_bound: 0.05,
            min_failure_slope: 80.0,
        }
    },
    'las-rusias': {
        name: 'Las Rusias',
        slug: 'las-rusias',
        testcase: false,

        terrain_url: 'usgs-las-rusias-terrain.png',
        boundary_url: 'usgs-las-rusias-terrain-boundary-simplified-flows.png',

        parameters: {
            erosion_speed: 0.02,
            accretion_speed: 0.018, 
            accretion_upper_bound: 0.001,
            erosion_lower_bound: 0.05,
            min_failure_slope: 80.0,
        }
    },
    'los-ebanos': {
        name: 'Los Ebanos',
        slug: 'los-ebanos',
        testcase: false,

        terrain_url: 'usgs-los-ebanos-terrain.png',
        boundary_url: 'usgs-los-ebanos-terrain-boundary-simplified-flows.png',

        parameters: {
            erosion_speed: 0.02,
            accretion_speed: 0.018, 
            accretion_upper_bound: 0.001,
            erosion_lower_bound: 0.05,
            min_failure_slope: 80.0,
        }
    },
    'nuevo-progreso': {
        name: 'Nuevo Progreso',
        slug: 'nuevo-progreso',
        testcase: false,

        terrain_url: 'usgs-nuevo-progreso-terrain.png',
        boundary_url: 'usgs-nuevo-progreso-terrain-boundary-simplified-flows.png',

        parameters: {
            erosion_speed: 0.02,
            accretion_speed: 0.018, 
            accretion_upper_bound: 0.001,
            erosion_lower_bound: 0.05,
            min_failure_slope: 80.0,
        }
    },
    'san-luisito': {
        name: 'San Luisito',
        slug: 'san-luisito',
        testcase: false,

        terrain_url: 'usgs-san-luisito-terrain.png',
        boundary_url: 'usgs-san-luisito-terrain-boundary-simplified-flows.png',

        parameters: {
            erosion_speed: 0.02,
            accretion_speed: 0.018, 
            accretion_upper_bound: 0.001,
            erosion_lower_bound: 0.05,
            min_failure_slope: 80.0,
        }
    }
}