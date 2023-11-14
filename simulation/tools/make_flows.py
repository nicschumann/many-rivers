import os
import argparse
import numpy as np
import imageio

from preprocess import read_rgb


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
        description='Mark inflows and outflows on a river boundary file.'
    )

    parser.add_argument('filepath', action='store', type=str, help='Path to the .png file containing the boundary in terrain rgba format.')
    parser.add_argument('--edges', nargs=2, action='store', choices=['top', 'left', 'bottom', 'right'])
    parser.add_argument('--inflow', nargs=2, required=False, type=int, help='Point along the inflow edge of the river.')
    parser.add_argument('--outflow', nargs=2, required=False, type=int, help='Point along the outflow edge of the river.')
    args = parser.parse_args()
    
    filepath = args.filepath
    filename = os.path.splitext(os.path.basename(filepath))[0]

    boundary = read_rgb(filepath) # extract alpha channel

    if args.edges:
        x_in, y_in = get_points_for_edge(args.edges[0])
        x_out, y_out = get_points_for_edge(args.edges[1])
    else:
        x_in, y_in = tuple(args.inflow)
        x_out, y_out = tuple(args.outflow)
    

    boundary = set_flow_edge(boundary, (y_in, x_in), np.array([255, 0, 0, 255]))
    boundary = set_flow_edge(boundary, (y_out, x_out), np.array([0, 0, 255, 255]))

    imageio.imwrite(f'{filename}-flows.png', boundary)


    
    