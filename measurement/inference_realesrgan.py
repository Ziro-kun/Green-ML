import argparse
import cv2
import glob
import os
import sys
import torch
from torch.nn import functional as F
import torchvision
from torchvision.transforms import functional as F_tv

# --- Fix for basicsr incompatibility with newer torchvision ---
# basicsr expects torchvision.transforms.functional_tensor, which was removed/moved in 0.17+
if not hasattr(torchvision.transforms, 'functional_tensor'):
    sys.modules['torchvision.transforms.functional_tensor'] = F_tv
from basicsr.archs.rrdbnet_arch import RRDBNet as RRDBNet_original
from basicsr.utils.download_util import load_file_from_url

from realesrgan import RealESRGANer
from realesrgan.archs.srvgg_arch import SRVGGNetCompact

# 탄소 배출 및 API 기록을 위한 추가 임포트
from codecarbon import OfflineEmissionsTracker
import requests
from datetime import datetime

# API 설정
API_URL = "http://127.0.0.1:8000/record"
NGROK_URL = "https://continently-shunnable-tripp.ngrok-free.dev/record"

# --- RRDBNet x2plus 대응을 위한 클래스 래핑 ---
class RRDBNet(RRDBNet_original):
    def __init__(self, *args, **kwargs):
        self.scale = kwargs.pop('scale', 4)  # Get scale and REMOVE from kwargs
        super(RRDBNet, self).__init__(*args, **kwargs)
        
        # Real-ESRGAN x2plus(scale=2) needs 12 channels. 
        # But some basicsr versions incorrectly scale it to 48.
        target_ch = 3
        if self.scale == 2: target_ch = 12
        elif self.scale == 1: target_ch = 3
        # for scale 4, we also want 3 channels (x4plus doesn't use pixel unshuffle)
        
        current_ch = self.conv_first.weight.shape[1]
        if current_ch != target_ch:
            print(f"  [Fix] Correcting conv_first channels for scale={self.scale}: {current_ch} -> {target_ch}")
            # Re-initialize with correct number of channels
            nf = self.conv_first.out_channels
            self.conv_first = torch.nn.Conv2d(target_ch, nf, 3, 1, 1)

    def forward(self, x):
        if self.scale > 1 and x.shape[1] == 3:
            # x2plus weights expect 12 channels, so we pixel_unshuffle if input is 3-ch
            try:
                # pixel_unshuffle increases channels by scale**2
                return super(RRDBNet, self).forward(F.pixel_unshuffle(x, self.scale))
            except Exception:
                # Fallback to original if already unshuffled or architecture differs
                return super(RRDBNet, self).forward(x)
        return super(RRDBNet, self).forward(x)

def run_realesrgan_inference(
    input='inputs',
    model_name='RealESRGAN_x4plus',
    output='results',
    denoise_strength=0.5,
    outscale=4,
    model_path=None,
    suffix='out',
    tile=0,
    tile_pad=10,
    pre_pad=0,
    face_enhance=False,
    fp32=False,
    alpha_upsampler='realesrgan',
    ext='auto',
    gpu_id=None,
    project_name="Real-ESRGAN-Inference"
):
    # determine models according to model names
    model_name = model_name.split('.')[0]
    if model_name == 'RealESRGAN_x4plus':  # x4 RRDBNet model
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        netscale = 4
        file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth']
    elif model_name == 'RealESRNet_x4plus':  # x4 RRDBNet model
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        netscale = 4
        file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/RealESRNet_x4plus.pth']
    elif model_name == 'RealESRGAN_x2plus':  # x2 RRDBNet model
        model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
        netscale = 2
        file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth']
    elif model_name == 'realesr-general-x4v3':  # x4 VGG-style model (S size)
        model = SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4, act_type='prelu')
        netscale = 4
        file_url = [
            'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-wdn-x4v3.pth',
            'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth'
        ]

    # determine model paths
    if model_path is not None:
        actual_model_path = model_path
    else:
        actual_model_path = os.path.join('weights', model_name + '.pth')
        if not os.path.isfile(actual_model_path):
            ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
            for url in file_url:
                actual_model_path = load_file_from_url(
                    url=url, model_dir=os.path.join(ROOT_DIR, 'weights'), progress=True, file_name=None)

    # use dni to control the denoise strength
    dni_weight = None
    if model_name == 'realesr-general-x4v3' and denoise_strength != 1:
        wdn_model_path = actual_model_path.replace('realesr-general-x4v3', 'realesr-general-wdn-x4v3')
        actual_model_path = [actual_model_path, wdn_model_path]
        dni_weight = [denoise_strength, 1 - denoise_strength]

    # restorer
    upsampler = RealESRGANer(
        scale=netscale,
        model_path=actual_model_path,
        dni_weight=dni_weight,
        model=model,
        tile=tile,
        tile_pad=tile_pad,
        pre_pad=pre_pad,
        half=not fp32,
        gpu_id=gpu_id)

    if face_enhance:  # Use GFPGAN for face enhancement
        from gfpgan import GFPGANer
        face_enhancer = GFPGANer(
            model_path='https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth',
            upscale=outscale,
            arch='clean',
            channel_multiplier=2,
            bg_upsampler=upsampler)
    os.makedirs(output, exist_ok=True)

    if os.path.isfile(input):
        paths = [input]
    else:
        paths = sorted(glob.glob(os.path.join(input, '*')))

    # 1. 탄소 배출 측정 시작
    tracker = OfflineEmissionsTracker(country_iso_code="KOR", save_to_file=False, log_level="error")
    tracker.start()
    print(f"🚀 [{project_name}] 탄소 측정 시작...")

    for idx, path in enumerate(paths):
        imgname, extension = os.path.splitext(os.path.basename(path))
        print('Testing', idx, imgname)

        img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
        if img is None: continue
        if len(img.shape) == 3 and img.shape[2] == 4:
            img_mode = 'RGBA'
        else:
            img_mode = None

        try:
            if face_enhance:
                _, _, output_img = face_enhancer.enhance(img, has_aligned=False, only_center_face=False, paste_back=True)
            else:
                output_img, _ = upsampler.enhance(img, outscale=outscale)
        except RuntimeError as error:
            print('Error', error)
            print('If you encounter CUDA out of memory, try to set --tile with a smaller number.')
        else:
            if ext == 'auto':
                extension = extension[1:]
            else:
                extension = ext
            if img_mode == 'RGBA':  # RGBA images should be saved in png format
                extension = 'png'
            if suffix == '':
                save_path = os.path.join(output, f'{imgname}.{extension}')
            else:
                save_path = os.path.join(output, f'{imgname}_{suffix}.{extension}')
            cv2.imwrite(save_path, output_img)

    # 4. 측정 종료 및 데이터 전송
    emissions_data = tracker.stop()
    try:
        duration = tracker.final_emissions_data.duration
        energy = tracker.final_emissions_data.energy_consumed
    except AttributeError:
        duration = 0.0
        energy = 0.0

    print("\n" + "="*40)
    print(f"✅ {project_name} Completed!")
    print(f"🌲 Total Carbon: {emissions_data:.6f} kg CO2")
    print("="*40)

    # API 전송
    payload = {
        "project_name": project_name,
        "emissions": float(emissions_data),
        "energy_consumed": float(energy),
        "duration": float(duration),
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(API_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'}, timeout=5)
        if response.status_code == 200:
            print("Successfully recorded session to Local API.")
        else:
            print(f"Local API Error ({response.status_code}), retrying with ngrok...")
            requests.post(NGROK_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'}, timeout=10)
    except Exception as e:
        print(f"Connection error to local API, retrying with ngrok...")
        try:
            requests.post(NGROK_URL, json=payload, headers={'ngrok-skip-browser-warning': 'true'}, timeout=10)
        except Exception:
            print("Failed to record session to both Local and Ngrok API.")

def main():
    """Inference demo for Real-ESRGAN.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--input', type=str, default='inputs', help='Input image or folder')
    parser.add_argument(
        '-n',
        '--model_name',
        type=str,
        default='RealESRGAN_x4plus',
        help=('Model names: RealESRGAN_x4plus | RealESRNet_x4plus | RealESRGAN_x2plus | '
              'realesr-general-x4v3'))
    parser.add_argument('-o', '--output', type=str, default='results', help='Output folder')
    parser.add_argument(
        '-dn',
        '--denoise_strength',
        type=float,
        default=0.5,
        help=('Denoise strength. 0 for weak denoise (keep noise), 1 for strong denoise ability. '
              'Only used for the realesr-general-x4v3 model'))
    parser.add_argument('-s', '--outscale', type=float, default=4, help='The final upsampling scale of the image')
    parser.add_argument(
        '--model_path', type=str, default=None, help='[Option] Model path. Usually, you do not need to specify it')
    parser.add_argument('--suffix', type=str, default='out', help='Suffix of the restored image')
    parser.add_argument('-t', '--tile', type=int, default=0, help='Tile size, 0 for no tile during testing')
    parser.add_argument('--tile_pad', type=int, default=10, help='Tile padding')
    parser.add_argument('--pre_pad', type=int, default=0, help='Pre padding size at each border')
    parser.add_argument('--face_enhance', action='store_true', help='Use GFPGAN to enhance face')
    parser.add_argument(
        '--fp32', action='store_true', help='Use fp32 precision during inference. Default: fp16 (half precision).')
    parser.add_argument(
        '--alpha_upsampler',
        type=str,
        default='realesrgan',
        help='The upsampler for the alpha channels. Options: realesrgan | bicubic')
    parser.add_argument(
        '--ext',
        type=str,
        default='auto',
        help='Image extension. Options: auto | jpg | png, auto means using the same extension as inputs')
    parser.add_argument(
        '-g', '--gpu-id', type=int, default=None, help='gpu device to use (default=None) can be 0,1,2 for multi-gpu')

    args = parser.parse_args()
    
    run_realesrgan_inference(
        input=args.input,
        model_name=args.model_name,
        output=args.output,
        denoise_strength=args.denoise_strength,
        outscale=args.outscale,
        model_path=args.model_path,
        suffix=args.suffix,
        tile=args.tile,
        tile_pad=args.tile_pad,
        pre_pad=args.pre_pad,
        face_enhance=args.face_enhance,
        fp32=args.fp32,
        alpha_upsampler=args.alpha_upsampler,
        ext=args.ext,
        gpu_id=args.gpu_id
    )

if __name__ == '__main__':
    main()


# python inference_realesrgan.py -n RealESRGAN_x4plus -i inputs --face_enhance  으로 실행