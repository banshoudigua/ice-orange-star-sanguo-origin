from pathlib import Path

from PIL import Image


SRC = Path("output/cdn-upload-final/sanguo-origin-board-a3-300dpi.png")
OUT = Path("output/cdn-upload-final/sanguo-origin-board-a3-300dpi-compressed.jpg")


def main():
    img = Image.open(SRC).convert("RGB")
    chosen = None
    # 先尽量保持原尺寸压缩；如果仍超过 1MB，再轻微缩小宽度保留打印可读性。
    variants = [(img, "full")]
    for target_width in (4200, 3840):
        if img.width > target_width:
            target_height = round(img.height * target_width / img.width)
            resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            variants.append((resized, f"w{target_width}"))

    for variant, label in variants:
        for quality in (70, 60, 52, 45, 38, 32, 28, 26, 24, 22, 20, 18):
            tmp = OUT.with_name(f"{OUT.stem}-{label}-q{quality}{OUT.suffix}")
            variant.save(tmp, format="JPEG", quality=quality, optimize=True, progressive=True)
            size = tmp.stat().st_size
            print(f"{label} q{quality}: {size / 1024 / 1024:.2f}MB")
            if size <= 1024 * 1024 and chosen is None:
                chosen = tmp
                break
        if chosen is not None:
            break
    if chosen is None:
        chosen = tmp
    chosen.replace(OUT)
    for item in OUT.parent.glob(f"{OUT.stem}-*{OUT.suffix}"):
        if item.exists():
            item.unlink()
    print(f"selected {OUT} {OUT.stat().st_size / 1024 / 1024:.2f}MB")


if __name__ == "__main__":
    main()
