import numpy as np
from preprocess import read_rgb, rgb2dem
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

import numpy as np
np.set_printoptions(precision=1)


def set_initial_height(H: np.ndarray, radius: int) -> np.ndarray:
    y_center, x_center = H.shape[0] // 2, H.shape[1] // 2

    y_indices, x_indices = np.ogrid[:H.shape[0], :H.shape[1]]
    dist_from_center = np.sqrt((x_indices - x_center)**2 + (y_indices - y_center)**2)
    mask = dist_from_center <= radius
    H[mask] = 0.25

    return H 



# MacLABSWE Simulation Procedure

# 1) Initialize macroscopic water depth and velocities
# 2) Choose lattice size, and determine particle speed e
# 3) Calculate f_eq from (eq 8) using depth and velocity.
# 4) Update depth and velocut using eqs (15) and (16)
# 5) Apply boundary conditions if needed, and repeat step (2)

# Set eddy viscosity # m
g = 9.18 # m/s^2
threshold = 0.001 # 1 cm 

# number of lattice points.
N_L = 100

E = np.array([
    [ 0,  0],
    [ 0,  1], # 0 in the y, 1 in the x
    [-1,  1],
    [-1,  0],
    [-1, -1],
    [ 0, -1],
    [ 1, -1],
    [ 1,  0],
    [ 1,  1],
])




# Intialize Macroscopic Vas
H = set_initial_height(np.ones((N_L, N_L)) * 0.1, 50)

U = np.zeros((N_L, N_L, 2))
U[:, :, 1] = np.ones((N_L, N_L)) * 0.5

# Set Lattice size
dx = 1.
nu = 0.3 # m^2 / s:  5.33 used in a 2d flow in paper.

e = 6.0 * nu / dx
dt = dx / e

# dt = 0.2
# e = dt / dx


print(f'eddy viscosity (nu): {nu} m^2/s')
print(f'lattice size (dx): {dx} m, lattice speed (e): {e} m/s, dt: {dt} s')

# plt.imshow(H)
# plt.show()

def calculate_equilibrium_distribution(H: np.ndarray, U: np.ndarray) -> np.ndarray:
    F_eq = np.zeros((9, N_L, N_L))

    l_parr = 1.0
    l_diag = 0.25

    # Velocity Product Terms
    U_dot_U = (U ** 2).sum(axis=-1)
    E_dot_U = (E[:, None, None, :] * U[None, :, :, :]).sum(axis=-1) # should be (9, N_L, N_L)
    E_dot_U_sq = E_dot_U ** 2

    # Lattice Speed Powers
    e_2 = e**2
    e_4 = e_2**2

    F_eq[0] = H * (1.0 - (5.0/6.0) * (g*H)/e_2 - (2.0/3.0) * (U_dot_U/e_2))

    F_eq[1:] = H * ((1.0/6.0) * (g*H)/e_2 + (1.0/3.0) * (E_dot_U[1:]/e_2) + (1.0/2.0) * (E_dot_U_sq[1:]/e_4) - (1.0/6.0) * (U_dot_U/e_2))

    F_eq[2] *= l_diag
    F_eq[4] *= l_diag
    F_eq[6] *= l_diag
    F_eq[8] *= l_diag

    return F_eq


def update_depth_and_velocity(F_eq: np.ndarray) -> tuple[np.ndarray, np.ndarray]:

    # Calculate Array after streaming on Feq
    y_indices, x_indices = np.indices((N_L, N_L))

    new_x_indices = np.empty_like(F_eq, dtype=np.int32)
    new_y_indices = np.empty_like(F_eq, dtype=np.int32)
    vel_indices = np.arange(9)[:, None, None]

    for k in range(9):
        new_y_indices[k] = y_indices + E[k, 0]
        new_x_indices[k] = x_indices + E[k, 1]
    
    # Reflected Boundary Conditions
    new_x_indices[np.where(new_x_indices == -1.0)] = 1.0
    new_x_indices[np.where(new_x_indices == N_L)] = N_L - 2.0
    new_y_indices[np.where(new_y_indices == -1.0)] = 1.0
    new_y_indices[np.where(new_y_indices == N_L)] = N_L - 2.0

    F_eq_prime = F_eq[vel_indices, new_y_indices, new_x_indices]
    # No gravitational Effects Accounted For...


    # Calculate H
    H_prime = F_eq_prime.sum(axis=0)

    # Calculate U
    U_prime = np.zeros((N_L, N_L, 2))
    U_prime[:, :, 0] = (F_eq_prime * E[:, None, None, 0]).sum(axis=0)
    U_prime[:, :, 1] = (F_eq_prime * E[:, None, None, 1]).sum(axis=0)

    H_prime_thresholded = H_prime.copy().reshape(N_L, N_L, 1)
    H_prime_thresholded[np.where(H_prime_thresholded < threshold)] = threshold

    U_prime /= H_prime.reshape(N_L, N_L, 1)

    return H_prime, U_prime

fig, ax = plt.subplots()
im = ax.imshow(H, vmin=0.1, vmax=0.25)


def update(frame):
    global H, U

    F_eq = calculate_equilibrium_distribution(H, U)
    H, U = update_depth_and_velocity(F_eq)
    im.set_array(H)

    return [im]

ani = FuncAnimation(fig, update, frames=range(1000), blit=True)

plt.show()
    
    

    

    
        



