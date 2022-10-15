from typing import Tuple
import imageio.v2 as imageio
import numpy as np

BOUNDARY_FLAG = -9999.0

def hsv_to_rgb(hsv: np.ndarray) -> np.ndarray:
    input_shape = hsv.shape
    hsv = hsv.reshape(-1, 3)
    h, s, v = hsv[:, 0], hsv[:, 1], hsv[:, 2]

    i = np.int32(h * 6.0)
    f = (h * 6.0) - i
    p = v * (1.0 - s)
    q = v * (1.0 - s * f)
    t = v * (1.0 - s * (1.0 - f))
    i = i % 6

    rgb = np.zeros_like(hsv)
    v, t, p, q = v.reshape(-1, 1), t.reshape(-1, 1), p.reshape(-1, 1), q.reshape(-1, 1)
    rgb[i == 0] = np.hstack([v, t, p])[i == 0]
    rgb[i == 1] = np.hstack([q, v, p])[i == 1]
    rgb[i == 2] = np.hstack([p, v, t])[i == 2]
    rgb[i == 3] = np.hstack([p, q, v])[i == 3]
    rgb[i == 4] = np.hstack([t, p, v])[i == 4]
    rgb[i == 5] = np.hstack([v, p, q])[i == 5]
    rgb[s == 0.0] = np.hstack([v, v, v])[s == 0.0]

    return rgb.reshape(input_shape)

class SimulationFileIO:
    @staticmethod
    def read_dem(path: str) -> Tuple[np.ndarray, int, int]:
        t = imageio.imread(path).astype('float32')
        y_max, x_max, _ = t.shape

        dem = np.zeros((y_max, x_max))

        # -9999 is the flag value representing the boundary
        dem_with_bounds = np.ones((y_max + 2, x_max + 2)) * BOUNDARY_FLAG

        coeff_r = 256.0 * 256.0
        coeff_g = 256.0
        coeff_b = 1.0

        dem[:, :] = t[:, :, 0] * coeff_r + t[:, :, 1] * coeff_g + t[:, :, 2] * coeff_b
        dem *= 0.1
        dem += -10000.0

        dem_with_bounds[1:y_max+1, 1:x_max+1] = dem

        return dem_with_bounds, y_max + 2, x_max + 2


    @staticmethod
    def read_inputs(path: str) -> Tuple[np.ndarray, int, int]:
        t = imageio.imread(path).astype('float32')
        y_max, x_max, _ = t.shape

        inputs_with_bounds = np.zeros((y_max + 2, x_max + 2))
        # presense of a water source is stored in the alpha channel
        inputs_with_bounds[1:y_max+1, 1:x_max+1] = t[:, :, 3] / 255.0

        return inputs_with_bounds, y_max + 2, x_max + 2

    @staticmethod
    def read_testcase(path: str) -> Tuple[np.ndarray, np.ndarray, int, int]:
        t = imageio.imread(path).astype('float32')
        y_max, x_max, _ = t.shape

        inputs_with_bounds = np.ones((y_max + 2, x_max + 2)) * BOUNDARY_FLAG
        # presense of a water source is stored in the alpha channel
        inputs_with_bounds[1:y_max+1, 1:x_max+1] = t[:, :, 3] / 255.0
        water_with_bounds = inputs_with_bounds.copy()

        xs = np.linspace(1, 0, x_max, endpoint=True)
        ys = np.linspace(1, 0, y_max, endpoint=True)
        xx, _ = np.meshgrid(xs, ys)

        mask_ones = np.where(inputs_with_bounds == 1.0)
        mask_zeros = np.where(inputs_with_bounds == 0.0)
        inputs_with_bounds[mask_ones] = 0.5
        inputs_with_bounds[mask_zeros] = 2.0
        inputs_with_bounds[1:y_max+1, 1:x_max+1] += xx

        water_with_bounds[mask_ones] = 0.4

        return inputs_with_bounds, water_with_bounds, y_max + 2, x_max + 2


    @staticmethod
    def write_dem(path: str, data: np.ndarray, write=True) -> np.ndarray:
        x_max = data.shape[0] - 1
        y_max = data.shape[1] - 1

        tmp = data[1:x_max, 1:y_max].copy()

        tmp = ((tmp - tmp.min()) / (tmp.max() - tmp.min())) * 255.0

        if write: imageio.imwrite(path, tmp.astype(np.uint8))

        return tmp

    @staticmethod
    def write_nonzero(path: str, data: np.ndarray, write=True) -> np.ndarray:
        x_max = data.shape[0] - 1
        y_max = data.shape[1] - 1

        tmp = data[1:x_max, 1:y_max].copy()

        tmp = (tmp - tmp.min()) / (tmp.max() - tmp.min())

        out = np.zeros((tmp.shape[0], tmp.shape[1], 3))

        out[:, :, 0] = tmp
        out[:, :, 2] = 1.0 - tmp
        out[np.where(out[:, :, 2] == 1.0)] = 0.0
        out *= 255.0
        
        if write: imageio.imwrite(path, out.astype(np.uint8))

        return out
    
    @staticmethod
    def write_angle(path: str, data: np.ndarray, normalize: bool = False, write=True) -> np.ndarray:
        x_max = data.shape[0] - 1
        y_max = data.shape[1] - 1

        tmp = data[1:x_max, 1:y_max].copy()
        mags = np.sqrt(np.power(tmp[:, :, 0], 2) + np.power(tmp[:, :, 1], 2))
        tmp_norm = tmp.copy()

        mags_mask = np.where(mags > 0.)
        tmp_norm[mags_mask[0], mags_mask[1], 0] /= mags[mags_mask]
        tmp_norm[mags_mask[0], mags_mask[1], 1] /= mags[mags_mask]

        angles = np.arccos(tmp_norm[:, :, 0])
        ys = tmp_norm[:, :, 1]

        y_mask = np.where(ys < 0.0)
        angles[y_mask] = np.pi - (angles[y_mask] + np.pi)
        angles += np.pi * 1.5
        hue = (angles / np.pi) / 2.0

        im = np.zeros((tmp.shape[0], tmp.shape[1], 3))
        im[:, :, 0] = hue
        
        if normalize:
            im[:, :, 1] = mags / mags.max()
        else:
            im[:, :, 1] = 1.0
        
        im[:, :, 2] = 127.0

        rgb = hsv_to_rgb(im)

        if write: imageio.imwrite(path, rgb.astype(np.uint8))

        return rgb

    @staticmethod
    def write_mag(path: str, data: np.ndarray, normalize: bool = False) -> np.ndarray:
        x_max = data.shape[0] - 1
        y_max = data.shape[1] - 1

        tmp = data[1:x_max, 1:y_max].copy()
        mags = np.sqrt(np.power(tmp[:, :, 0], 2) + np.power(tmp[:, :, 1], 2))

        mags = ((mags - mags.min()) / (mags.max() - mags.min())) * 255.0

        imageio.imwrite(path, mags.astype(np.uint8))

        return mags

    @staticmethod
    def write_abs(path: str, data: np.ndarray, normalize: bool = False) -> np.ndarray:
        x_max = data.shape[0] - 1
        y_max = data.shape[1] - 1

        tmp = data[1:x_max, 1:y_max].copy()
        
        im = np.zeros((tmp.shape[0], tmp.shape[1], 3))

        im[:, :, 0:2] = tmp

        imageio.imwrite(path, im)

        return im 

        