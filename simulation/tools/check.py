from imageio.v2 import imread
from encode import rgba2dem

img_2 = imread('./final-bend-08.terrain.png')

print(img_2[0,0])

dem_2 = rgba2dem(img_2)

print(dem_2.min(), dem_2.max())

print(dem_2[0, 0], dem_2[0, 1], dem_2[0, 2])