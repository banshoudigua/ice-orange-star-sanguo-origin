from pathlib import Path

from PIL import Image


TARGET_DIR = Path("output/cdn-upload-final/themes/chaoshan-travel/attack")
LIMIT_BYTES = 1024 * 1024


def main():
    for path in sorted(TARGET_DIR.glob("eat-contest-*.png")):
        img = Image.open(path).convert("RGB")
        original = path.stat().st_size
        chosen = None
        for width in (1024, 960, 900, 840, 768):
            if img.width > width:
                height = round(img.height * width / img.width)
                variant = img.resize((width, height), Image.Resampling.LANCZOS)
            else:
                variant = img
            for quality in (82, 76, 70, 64, 58, 52, 46, 40):
                tmp = path.with_suffix(f".w{width}.q{quality}.jpg")
                variant.save(tmp, format="JPEG", quality=quality, optimize=True, progressive=True)
                size = tmp.stat().st_size
                print(f"{path.name} w{width} q{quality}: {size / 1024 / 1024:.2f}MB")
                if size <= LIMIT_BYTES:
                    chosen = tmp
                    break
                tmp.unlink()
            if chosen:
                break
        if not chosen:
            print(f"no under-limit result for {path.name}")
            continue
        jpg_path = path.with_suffix(".jpg")
        chosen.replace(jpg_path)
        path.unlink()
        print(
            f"converted {path.name}: {original / 1024 / 1024:.2f}MB -> "
            f"{jpg_path.name} {jpg_path.stat().st_size / 1024 / 1024:.2f}MB"
        )


if __name__ == "__main__":
    main()
