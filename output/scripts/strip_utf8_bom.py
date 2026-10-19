from pathlib import Path


FILES = [
    "miniprogram/pages/room/room.wxml",
    "miniprogram/pages/room/room.js",
    "miniprogram/pages/characters/characters.wxml",
    "miniprogram/pages/cities/cities.wxml",
    "output/themes/chaoshan-travel/prompts/image-prompts-batch-full.jsonl",
    "output/themes/chaoshan-travel/prompts/image-prompts-retry-failed.jsonl",
    "output/themes/chaoshan-travel/prompts/tts-events.jsonl",
    "output/themes/chaoshan-travel/prompts/tts-food-cards.jsonl",
]


def main():
    for name in FILES:
        path = Path(name)
        if not path.exists():
            continue
        data = path.read_bytes()
        if data.startswith(b"\xef\xbb\xbf"):
            path.write_bytes(data[3:])
            print(f"stripped BOM: {name}")


if __name__ == "__main__":
    main()
