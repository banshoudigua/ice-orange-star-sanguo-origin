import json
import os
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path.cwd()
CDN_DIR = ROOT / "output" / "cdn-upload-final"
BACKUP_DIR = ROOT / "output" / "cdn-upload-final-original-backup" / "over-1mb-20260716"
REPORT_PATH = ROOT / "output" / "reports" / "cdn-image-compress-over-1mb-20260716.json"
MIN_SIZE = 1024 * 1024
EXTS = {".png", ".jpg", ".jpeg", ".webp"}


def size_mb(value):
    return round(value / 1024 / 1024, 2)


def backup_file(path):
    rel = path.relative_to(CDN_DIR)
    target = BACKUP_DIR / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        shutil.copy2(path, target)


def save_png(img, target, colors):
    source = img
    if source.mode not in ("RGB", "RGBA", "P"):
        source = source.convert("RGBA" if "A" in source.getbands() else "RGB")
    if source.mode == "P":
        source.save(target, format="PNG", optimize=True, compress_level=9)
        return
    method = Image.Quantize.FASTOCTREE if source.mode == "RGBA" else Image.Quantize.MEDIANCUT
    quantized = source.quantize(colors=colors, method=method)
    quantized.save(target, format="PNG", optimize=True, compress_level=9)


def compress_image(path):
    before = path.stat().st_size
    backup_file(path)
    ext = path.suffix.lower()
    tmp = path.with_name(path.name + ".compressing" + ext)

    img = Image.open(path)
    img.load()

    candidates = []
    if ext in (".jpg", ".jpeg"):
        for quality in (60, 52, 45):
            tmp_candidate = path.with_name(path.name + f".q{quality}" + ext)
            img.convert("RGB").save(tmp_candidate, format="JPEG", quality=quality, optimize=True, progressive=True)
            candidates.append(tmp_candidate)
    elif ext == ".webp":
        for quality in (60, 52, 45):
            tmp_candidate = path.with_name(path.name + f".q{quality}" + ext)
            img.save(tmp_candidate, format="WEBP", quality=quality, method=6)
            candidates.append(tmp_candidate)
    else:
        for colors in (256, 192, 128):
            tmp_candidate = path.with_name(path.name + f".c{colors}" + ext)
            save_png(img, tmp_candidate, colors)
            candidates.append(tmp_candidate)

    best = min(candidates, key=lambda item: item.stat().st_size)
    after = best.stat().st_size
    changed = after < before
    if changed:
        shutil.copy2(best, path)
    for item in candidates:
        if item.exists():
            item.unlink()
    return {
        "file": str(path.relative_to(ROOT)),
        "before": before,
        "after": after if changed else before,
        "beforeMB": size_mb(before),
        "afterMB": size_mb(after if changed else before),
        "changed": changed,
    }


def main():
    files = [
        path
        for path in CDN_DIR.rglob("*")
        if path.is_file() and path.suffix.lower() in EXTS and path.stat().st_size > MIN_SIZE
    ]
    results = []
    for path in sorted(files, key=lambda item: item.stat().st_size, reverse=True):
        try:
            result = compress_image(path)
            results.append(result)
            state = "OK" if result["changed"] else "KEEP"
            print(f'{state} {result["file"]} {result["beforeMB"]}MB -> {result["afterMB"]}MB')
        except Exception as exc:
            result = {
                "file": str(path.relative_to(ROOT)),
                "error": str(exc),
                "before": path.stat().st_size,
                "after": path.stat().st_size,
                "beforeMB": size_mb(path.stat().st_size),
                "afterMB": size_mb(path.stat().st_size),
                "changed": False,
            }
            results.append(result)
            print(f'FAIL {result["file"]}: {result["error"]}')

    before_total = sum(item.get("before", 0) for item in results)
    after_total = sum(item.get("after", 0) for item in results)
    summary = {
        "scanned": len(files),
        "changed": len([item for item in results if item.get("changed")]),
        "failed": len([item for item in results if item.get("error")]),
        "beforeMB": size_mb(before_total),
        "afterMB": size_mb(after_total),
        "savedMB": size_mb(before_total - after_total),
        "backupDir": str(BACKUP_DIR.relative_to(ROOT)),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps({"summary": summary, "results": results}, ensure_ascii=False, indent=2), encoding="utf-8")
    print("SUMMARY " + json.dumps(summary, ensure_ascii=False))


if __name__ == "__main__":
    main()
