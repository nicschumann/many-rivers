import os
import argparse



from preprocess import split_name, read_rgb, rgb2dem, write_boundary

if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description='Gets min, max, and mean elevations in the DEM.'
    )

    parser.add_argument('filepath', action='store', type=str, help='Path to the .png file containing the DEM in terrain rgb format.')
    args = parser.parse_args()
    
    
    filepath = args.filepath
    filename = os.path.splitext(os.path.basename(filepath))[0]

    rgb = read_rgb(filepath)
    dem = rgb2dem(rgb)
    
    print(f'max: {dem.max()}, min: {dem.min()}, mean: {dem.mean()}')