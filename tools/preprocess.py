import os
import numpy as np
from scipy.signal import convolve2d
import imageio

def smooth_dem(dem: np.ndarray, min_value : int = -100):
    print('smoothing')

    
    
    valid_mask = dem > min_value

    print(dem.shape)

    print(np.where(np.isnan(dem)))

    kernel = np.ones((5,5), dtype=np.float64)
    kernel[2,2] = 0
    valid_neighbors = convolve2d(valid_mask, kernel, mode='same', boundary='fill', fillvalue=min_value)
    sum_neighbors = convolve2d(np.where(valid_mask, dem, 0), kernel, mode='same', boundary='fill', fillvalue=min_value)

    avg_neighbors = sum_neighbors / valid_neighbors
    avg_neighbors[~np.isfinite(avg_neighbors)] = dem.mean()

    filled_dem = np.copy(dem)
    filled_dem[dem <= min_value | np.isnan(dem)] = avg_neighbors[dem <= min_value | np.isnan(dem)]

    return filled_dem


RIVER_MAX_HEIGHT = 19.5

def read_tif(filepath: str) -> np.ndarray:
    im = imageio.v2.imread(filepath)
    return im


def read_rgb(filepath: str) -> np.ndarray:
    im = imageio.v2.imread(filepath)
    return im


def dem2rgb(dem: np.ndarray) -> np.ndarray:
    coeff_r = 256 ** 2
    coeff_g = 256
    coeff_b = 1.0

    s1 = dem + 10000.0
    s2 = s1 * 10.0

    R, s3 = s2 // coeff_r, s2 % coeff_r
    G, B = s3 // coeff_g, np.round(s3 % coeff_g)

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


def write_rgb(dem: np.ndarray, y: int, x: int, h: int, w: int, write: bool = True, name: str = 'terrain'):
    s_y, s_x = y, x
    e_y, e_x = s_y + h, s_x + w
    
    sub_dem = dem[s_y:e_y, s_x:e_x]

    # sub_dem = smooth_dem(sub_dem, min_value=4)

    rgb = dem2rgb(sub_dem).astype('uint8')

    # sub_dem_prime = rgb2dem(rgb)

    if write: imageio.imwrite(f'{name}.png', rgb)

    return rgb, sub_dem


def write_boundary(dem: np.ndarray, max_height: float = RIVER_MAX_HEIGHT, write : bool = True, name: str = 'boundary') -> np.ndarray:
    b = (dem <= max_height).astype('float32')
    boundary = np.zeros((b.shape[0], b.shape[1], 4), dtype=np.float32)

    boundary[:, :, :] = b.reshape(b.shape[0], b.shape[1], 1)
    boundary *= 255.0
    boundary = boundary.astype(np.uint8)

    if write: imageio.imwrite(f'{name}.png', boundary)

    return boundary


def flood_fill_boundary(boundary: np.ndarray, start_point: tuple[int, int], write: bool = True, name: str = 'boundary-simplified.png') -> np.ndarray:
    from skimage.segmentation import flood_fill
    
    flag = 2.0
    simplified = flood_fill(boundary, start_point, flag)

    simplified[simplified != flag] = 0.0
    simplified[simplified == flag] = 1.0

    output = np.zeros((simplified.shape[0], simplified.shape[1], 4))
    output[:, :, :] = simplified.reshape((simplified.shape[0], simplified.shape[1], 1))

    output *= 255.0
    output = output.astype(np.uint8)

    if write: imageio.imwrite(name, output)

    return simplified

def split_name(filepath: str):
    filename = os.path.basename(filepath)
    data_name, data_params = filename.split('--')
    s_y, s_x, h, w, river_z_cutoff = os.path.splitext(data_params)[0].split('-')

    return data_name, int(s_y), int(s_x), int(h), int(w), float(river_z_cutoff)