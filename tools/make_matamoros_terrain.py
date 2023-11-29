import numpy as np
from scipy.signal import convolve2d
from preprocess import split_name, read_tif, write_rgb, write_boundary



if __name__ == '__main__':

    # parser = argparse.ArgumentParser(
    #     description="converts a DEM in .tif format into a MapBox TerrainRGB file."
    # )

    # parser.add_argument('filepath', action="store", type=str, help="Path to the .tif file containing the DEM as raw float elevation data.")
    # args = parser.parse_args()
    
    
    # filepath = args.filepath
    # result = split_name(filepath)

    # print('Reading .tif; for large files, this can take a while.')
    # dem = read_tif(filepath)
    # print(f'tif size: {dem.shape}')

    top_filepath = 'final-bend-08--upper.tif'
    bottom_filepath = 'final-bend-08--lower.tif'
    offset = 20

    dem_top = read_tif(top_filepath)
    dem_bot = read_tif(bottom_filepath)
    dem_all = np.zeros((20024, 10012))
    dem_all[:10012, :] = dem_top
    dem_all[10012:, :-offset] = dem_bot[:, offset:]


    img, sub_dem = write_rgb(dem_all, 8500, 2000, 1800, 1800, write=True, name='final-bend-08-terrain')


    print(sub_dem.min())
    print(sub_dem.max())

    write_boundary(sub_dem, 6, write=True, name=f'final-bend-08-terrain-boundary')

