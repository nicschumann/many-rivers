import os
import argparse

from preprocess import read_rgb, flood_fill_boundary



if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description='Builds a river boundary mask from a terrain RGB file.'
    )

    parser.add_argument('filepath', action='store', type=str, help='Path to the .png file containing the DEM in terrain rgb format.')
    parser.add_argument('--start', nargs=2, required=True, type=int, help='Starting point for flood filling and removing outliers below the specified elevation, but not part of the river.')
    args = parser.parse_args()
    
    filepath = args.filepath
    filename = os.path.splitext(os.path.basename(filepath))[0]

    boundary = read_rgb(filepath)[:, :, 3] # extract alpha channel
    
    x, y = tuple(args.start)
    
    flood_fill_boundary(boundary, (y, x), write=True, name=f'{filename}-simplified.png')