import argparse
from preprocess import split_name, read_tif, write_rgb

if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description="converts a DEM in .tif format into a MapBox TerrainRGB file."
    )

    parser.add_argument('filepath', action="store", type=str, help="Path to the .tif file containing the DEM as raw float elevation data.")
    args = parser.parse_args()
    
    
    filepath = args.filepath
    result = split_name(filepath)

    print('Reading .tif; for large files, this can take a while.')
    dem = read_tif(filepath)
    
    write_rgb(dem,result[1], result[2], result[3], result[4], write=True, name=f'{result[0]}-terrain')