from matplotlib import image
import numpy as np
import imageio
import matplotlib.pyplot as plt

DOMAIN_SIZE = 2048
RIVER_MAX_HEIGHT = 7.10


def read_tif(filepath: str) -> np.ndarray:
    im = imageio.imread(filepath)
    return im

def dem2rgb(dem: np.ndarray) -> np.ndarray:
    coeff_r = 256 ** 2
    coeff_g = 256
    coeff_b = 1.0

    s1 = dem + 10000.0
    s2 = s1 * 10.0

    R, s3 = s2 // coeff_r, s2 % coeff_r
    G, B = s3 // coeff_g, np.round(s2 % coeff_g)

    terrain_rgb = np.zeros((dem.shape[0], dem.shape[1], 3))
    terrain_rgb[:, :, 0] = R
    terrain_rgb[:, :, 1] = G
    terrain_rgb[:, :, 2] = B

    return terrain_rgb


def rgb2dem(t: np.ndarray) -> np.ndarray:
    dem = np.zeros((t.shape[0], t.shape[1]))

    coeff_r = 256.0 * 256.0
    coeff_g = 256.0
    coeff_b = 1.0

    dem[:, :] = t[:, :, 0] * coeff_r + t[:, :, 1] * coeff_g + t[:, :, 2] * coeff_b
    dem *= 0.1
    dem += -10000.0

    return dem


if __name__ == '__main__':
    
    dem = read_tif('./tight_bend_clip.tif')

    s_y, s_x = 2072, 1615
    e_y, e_x = s_y + DOMAIN_SIZE, s_x + DOMAIN_SIZE
    
    sub_dem = dem[s_y:e_y, s_x:e_x]

    b = (sub_dem <= RIVER_MAX_HEIGHT).astype('float32')
    boundary = np.zeros((b.shape[0], b.shape[1], 4))
    boundary[:, :, :] = b.reshape(b.shape[0], b.shape[1], 1)

    rgb = dem2rgb(sub_dem).astype('uint8')

    # sub_dem_prime = rgb2dem(rgb)


    imageio.imwrite('14-0-0-terrain.png', rgb)
    imageio.imwrite('14-0-0-boundary-all.png', boundary)