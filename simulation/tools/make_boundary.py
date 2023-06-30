import os
import argparse
from preprocess import split_name, read_rgb, rgb2dem, write_boundary

if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description='Builds a river boundary mask from a terrain RGB file.'
    )

    parser.add_argument('filepath', action='store', type=str, help='Path to the .png file containing the DEM in terrain rgb format.')
    parser.add_argument('--z', action='store', type=float, required=True, help='DEM elevations below this level are considered underwater.')
    args = parser.parse_args()
    
    
    filepath = args.filepath
    filename = os.path.splitext(os.path.basename(filepath))[0]

    print('Reading .tif; for large files, this can take a while.')
    rgb = read_rgb(filepath)
    dem = rgb2dem(rgb)
    
    write_boundary(dem, args.z, write=True, name=f'{filename}-boundary')