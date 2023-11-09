import json
import argparse
from pathlib import Path
import numpy as np
from typing import Tuple

from preprocess import read_tif
from imageio.v2 import imwrite, imread

def dem2rgba(dem: np.ndarray) -> np.ndarray:
    # Normalization parameters
    min_elevation = -50.0
    max_elevation = 100.0
    range_elevation = max_elevation - min_elevation
    
    # Normalize the elevations to the range of 0 to 1
    normalized = (dem - min_elevation) / range_elevation
    
    # Scale and bias to utilize the full 8-bit range of each channel
    normalized *= 255.0**3  # We use 255^3 because we will decode in float

    # Split into four 8-bit channels
    r = np.floor(normalized / (255.0**2))
    g = np.floor((normalized - r * 255.0**2) / 255.0)
    b = np.floor(normalized - r * 255.0**2 - g * 255.0)
    a = (normalized % 255.0).astype(np.uint8)
    
    # Stack the channels into an 8-bit per channel RGBA image
    rgba_image = np.stack((r, g, b, a), axis=-1).astype(np.uint8)
    
    return rgba_image

def dem2rgb(dem_array: np.ndarray) -> np.ndarray:
    # Check if the dem_array contains any value out of the range
    if np.any(dem_array < -10000.0) or np.any(dem_array > 9000.0):
        raise ValueError("Elevation data contains values out of range")

    # Adjust the elevations to be positive
    adjusted_dem = dem_array + 10000.0

    # Scale the values
    scaled_dem = adjusted_dem * 10.0

    # Calculate the RGB components
    R = (scaled_dem // (256 * 256)).astype(np.uint8)
    G = ((scaled_dem // 256) % 256).astype(np.uint8)
    B = (scaled_dem % 256).astype(np.uint8)

    # Stack the channels along the last axis to create an RGB image
    return np.stack((R, G, B), axis=-1)


def rgba2dem(rgba: np.ndarray) -> np.ndarray:
    # Make sure that the input is in the correct range [0, 255]
    if np.any(rgba < 0) or np.any(rgba > 255):
        raise ValueError("RGBA values must be in the range [0, 255]")

    # Ensure the input is of type float, to match shader operations
    rgba = rgba.astype(np.float32)
    
    # Constants matching the encoding process in Python and GLSL
    min_elevation = -50.0
    max_elevation = 100.0
    range_elevation = max_elevation - min_elevation
    
    # Convert the RGBA channels back to a single float value
    value = (rgba[:, :, 0] * (255.0**2) * 255.0 +
             rgba[:, :, 1] * (255.0**2) +
             rgba[:, :, 2] * 255.0 +
             rgba[:, :, 3])
    
    # Normalize to the range 0 to 1
    value /= (255.0**3) * 255.0
    
    # Scale and bias to get the original elevation
    dem = value * range_elevation + min_elevation
    
    return dem

def rgb2dem(rgb_image: np.ndarray) -> np.ndarray:
    # Ensure the input is a 3D numpy array
    if len(rgb_image.shape) != 3 or rgb_image.shape[2] != 3:
        raise ValueError("Input image must be an RGB image with 3 channels.")

    # Ensure that the dtype is unsigned 8-bit integer
    if rgb_image.dtype != np.uint8:
        raise ValueError("Input image must be of type uint8.")

    # Split the image into R, G, and B components
    R, G, B = rgb_image[:, :, 0], rgb_image[:, :, 1], rgb_image[:, :, 2]

    # Combine the channels and calculate the elevation
    elevation = -10000.0 + ((R.astype(np.float32) * 256.0 * 256.0 +
                             G.astype(np.float32) * 256.0 +
                             B.astype(np.float32)) * 0.1)

    return elevation

def crop_dem(dem: np.ndarray, y: int, x: int, h: int = 1800, w: int = 1800) -> np.ndarray:
    s_y, s_x = y, x
    e_y, e_x = s_y + h, s_x + w
    
    sub_dem = np.copy(dem[s_y:e_y, s_x:e_x])

    return sub_dem


def dem2boundary(dem: np.ndarray, max_height: float) -> Tuple[np.ndarray, np.ndarray]:
    b = (dem <= max_height).astype('float32')
    boundary = np.zeros((b.shape[0], b.shape[1], 4), dtype=np.float32)

    boundary[:, :, :] = b.reshape(b.shape[0], b.shape[1], 1)
    boundary *= 255.0
    boundary = boundary.astype(np.uint8)

    return boundary, b

def flood_fill_boundary(boundary: np.ndarray, start_point: tuple[int, int]) -> Tuple[np.ndarray, np.ndarray]:
    from skimage.segmentation import flood_fill
    
    flag = 2.0
    simplified = flood_fill(boundary, start_point, flag)

    simplified[simplified != flag] = 0.0
    simplified[simplified == flag] = 1.0

    output = np.zeros((simplified.shape[0], simplified.shape[1], 4))
    output[:, :, :] = simplified.reshape((simplified.shape[0], simplified.shape[1], 1))

    output *= 255.0
    output = output.astype(np.uint8)

    return output, simplified


def set_flow_edge(boundary: np.ndarray, point: tuple[int, int], fill: np.ndarray) -> np.ndarray:
    y, x = point

    if y == 0 or y == -1 or y == boundary.shape[0] - 1:
        boundary[y, np.where(boundary[y, :, 0] != 0), :] = fill

    if x == 0 or x == -1 or x == boundary.shape[1] - 1:
        boundary[np.where(boundary[:, x, 0] != 0), x, :] = fill

    return boundary

def get_points_for_edge(edge):
    if edge == 'left':
        return 0, 1
    elif edge == 'right':
        return -1, 1
    elif edge == 'top':
        return 1, 0
    elif edge == 'bottom':
        return 1, -1
    
    return 0, 0


if __name__ == '__main__':
    
    parser = argparse.ArgumentParser(
        description='Processes a basic TIF DEM file into compressed format and metadata textures ready for the webgl simulator.'
    )

    parser.add_argument('--input', '-i', action='store', type=str, help='Path to the .png file containing the DEM in terrain rgb format.')
    parser.add_argument('--meta', '-m', action='store', type=str, required=True, help='DEM elevations below this level are considered underwater.')
    args = parser.parse_args()

    dem_raw = read_tif(args.input)
    dem_meta = json.load(open(args.meta, 'r'))

    domain_base_x, domain_base_y = dem_meta['domain_basepoint']
    river_z_plane = dem_meta['river_z_plane']
    river_base_x, river_base_y = dem_meta['river_basepoint']

    # 1. Crop and write domain as a terrain file.
    dem = crop_dem(dem_raw, domain_base_y, domain_base_x) # y, then x
    dem_rgba = dem2rgb(dem)
    imwrite(Path(args.input).with_suffix('.terrain.png'), dem_rgba)

    test = imread(Path(args.input).with_suffix('.terrain.png'))
    test_dem = rgb2dem(test)
    recorded_error = dem - test_dem
    print(f'max positive deviation: {recorded_error.max()} max negative deviation: {recorded_error.min()}')
    

    # 2. Flood fill and identify river
    _, boundary = dem2boundary(dem, river_z_plane)
    boundary, _  = flood_fill_boundary(boundary, (river_base_y, river_base_x)) # y, then x

    x_in, y_in = get_points_for_edge(dem_meta["inflow"])
    x_out, y_out = get_points_for_edge(dem_meta["outflow"])

    boundary = set_flow_edge(boundary, (y_in, x_in), np.array([255, 0, 0, 255]))
    boundary = set_flow_edge(boundary, (y_out, x_out), np.array([0, 0, 255, 255]))

    imwrite(Path(args.input).with_suffix('.boundary.png'), boundary)

    



    # imwrite('final-bend-08.tif', dem_all)

    # sub_dem = crop_dem(dem_all, 8500, 2000)

    # # Test

    # img = dem2rgba(sub_dem)

    # imwrite('./test.png', img)
    # img_2 = imread('./test.png')

    # dem_2 = rgba2dem(img_2)

    # err = dem_2 - sub_dem

    # print(err.min(), err.max())


