from pathlib import Path
from math import cos, sin, pi

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "output" / "print-map"
OUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 4961, 3508
PNG_PATH = OUT_DIR / "sanguo-origin-print-map-a3.png"
PDF_PATH = OUT_DIR / "sanguo-origin-print-map-a3.pdf"
PDF_FALLBACK_PATH = OUT_DIR / "sanguo-origin-print-map-a3-fixed.pdf"

FONT_REGULAR = Path("C:/Windows/Fonts/simsun.ttc")
FONT_BOLD = Path("C:/Windows/Fonts/simhei.ttf")


def font(size, bold=False):
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REGULAR
    return ImageFont.truetype(str(path), size)


FONTS = {
    "title": font(118, True),
    "brand": font(78, True),
    "section": font(50, True),
    "tile": font(42, True),
    "tile_small": font(27, True),
    "num": font(31, True),
    "body": font(31, True),
    "small": font(25, True),
}


CITIES = [
    {"id": 1, "name": "洛阳", "position": 6, "price": 8, "toll": 2, "income": 2, "defense": 180, "upgrade": 5},
    {"id": 2, "name": "陈留", "position": 10, "price": 5, "toll": 1, "income": 1, "defense": 110, "upgrade": 3},
    {"id": 3, "name": "汜水关", "position": 14, "price": 6, "toll": 2, "income": 1, "defense": 150, "upgrade": 4},
    {"id": 4, "name": "虎牢关", "position": 18, "price": 7, "toll": 2, "income": 2, "defense": 170, "upgrade": 5},
    {"id": 5, "name": "邺城", "position": 23, "price": 6, "toll": 1, "income": 2, "defense": 130, "upgrade": 4},
    {"id": 6, "name": "许昌", "position": 28, "price": 7, "toll": 2, "income": 2, "defense": 160, "upgrade": 5},
]

CITY_BY_POS = {city["position"]: city for city in CITIES}

NORMAL_TILES = [
    ("起点", "过起点 +3 银两", "#a53623"),
    ("抽事件", "主持机结算", "#8f3f24"),
    ("银两", "+2 银两", "#a9752b"),
    ("粮草", "+1 粮草", "#4f7d48"),
    ("声望", "+1 声望", "#2e6b68"),
    ("武将", "抽人物卡", "#6e4f95"),
    ("整备", "下次移动 +1", "#516c94"),
    ("抽事件", "主持机结算", "#8f3f24"),
    ("商路", "+2 银两", "#a9752b"),
    ("粮道", "+1 粮草", "#4f7d48"),
]


def lerp(a, b, t):
    return int(a + (b - a) * t)


def gradient_background():
    image = Image.new("RGB", (WIDTH, HEIGHT), "#4a2414")
    pix = image.load()
    cx, cy = WIDTH / 2, HEIGHT * 0.42
    max_dist = ((WIDTH / 2) ** 2 + (HEIGHT / 2) ** 2) ** 0.5
    center = (255, 240, 197)
    mid = (229, 184, 101)
    edge = (138, 63, 33)
    for y in range(110, HEIGHT - 110):
        for x in range(120, WIDTH - 120):
            dist = (((x - cx) ** 2 + (y - cy) ** 2) ** 0.5) / max_dist
            if dist < 0.45:
                t = dist / 0.45
                color = tuple(lerp(center[i], mid[i], t) for i in range(3))
            else:
                t = min(1, (dist - 0.45) / 0.42)
                color = tuple(lerp(mid[i], edge[i], t) for i in range(3))
            pix[x, y] = color
    return image


def text_center(draw, xy, content, fnt, fill, anchor="mm"):
    draw.text(xy, content, font=fnt, fill=fill, anchor=anchor)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_shadowed_panel(base, box, radius, fill, outline, width=8, shadow=16):
    shadow_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow_layer)
    offset_box = (box[0], box[1] + shadow, box[2], box[3] + shadow)
    sd.rounded_rectangle(offset_box, radius=radius, fill=(48, 23, 10, 86))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(14))
    base.alpha_composite(shadow_layer)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def tile_content(position):
    city = CITY_BY_POS.get(position)
    if city:
        return city["name"], f"买{city['price']} 通{city['toll']} 防{city['defense']}", "#8e2f1f", True
    if position == 1:
        return NORMAL_TILES[0][0], NORMAL_TILES[0][1], NORMAL_TILES[0][2], False
    title, sub, tone = NORMAL_TILES[position % len(NORMAL_TILES)]
    return title, sub, tone, False


def draw_tile(base, position):
    draw = ImageDraw.Draw(base)
    cx, cy = WIDTH / 2, HEIGHT / 2 - 70
    rx, ry = 1960, 1045
    angle = (90 - (position - 1) * 360 / 30) * pi / 180
    x = cx + cos(angle) * rx
    y = cy + sin(angle) * ry
    title, sub, tone, is_city = tile_content(position)
    tw, th = (310, 184) if is_city else (252, 150)
    box = (int(x - tw / 2), int(y - th / 2), int(x + tw / 2), int(y + th / 2))
    if is_city:
        glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        gd.rounded_rectangle((box[0] - 14, box[1] - 14, box[2] + 14, box[3] + 14), radius=32, fill=(255, 211, 108, 115))
        glow = glow.filter(ImageFilter.GaussianBlur(18))
        base.alpha_composite(glow)

    rounded(draw, box, 26, "#f3ddb0", "#5a2e17", 8 if is_city else 6)
    inner = (box[0] + 13, box[1] + 13, box[2] - 13, box[3] - 13)
    rounded(draw, inner, 18, tone, None, 0)
    draw.ellipse((box[0] + 18, box[1] + 18, box[0] + 76, box[1] + 76), fill="#ffe8a8", outline="#d6a64d", width=5)
    text_center(draw, (box[0] + 47, box[1] + 50), str(position), FONTS["num"], "#5a2a12")
    text_center(draw, (x, box[1] + (82 if is_city else 70)), title, FONTS["tile"], "#fff1bd")
    text_center(draw, (x, box[1] + (132 if is_city else 112)), sub, FONTS["tile_small"], "#ffedc7")


def draw_city_panel(draw, city, index):
    panel_w, panel_h = 505, 154
    left = 280 if index < 3 else 4176
    top = 480 + (index % 3) * 230
    rounded(draw, (left, top, left + panel_w, top + panel_h), 20, "#f5dfad", "#6a3518", 6)
    rounded(draw, (left + 16, top + 16, left + 98, top + 138), 14, "#8e2f1f", "#d6a64d", 4)
    text_center(draw, (left + 57, top + 78), str(city["position"]), FONTS["section"], "#ffe8a8")
    draw.text((left + 122, top + 25), city["name"], font=FONTS["section"], fill="#5a2413")
    draw.text((left + 122, top + 77), f"购买 {city['price']}  通行 {city['toll']}  征税 {city['income']}", font=FONTS["small"], fill="#643b1f")
    draw.text((left + 122, top + 113), f"防御 {city['defense']}  升级 {city['upgrade']}", font=FONTS["small"], fill="#643b1f")


def main():
    bg = gradient_background().convert("RGBA")
    draw = ImageDraw.Draw(bg)

    rounded(draw, (120, 110, WIDTH - 120, HEIGHT - 110), 110, None, "#2a1409", 34)
    rounded(draw, (205, 195, WIDTH - 205, HEIGHT - 195), 78, None, "#f5d583", 9)

    draw.line([(930, 2450), (1320, 2030), (1230, 1570), (1770, 1355), (2400, 1105), (2580, 1630), (3195, 1370), (3680, 1165), (4230, 615)], fill=(55, 126, 130, 150), width=112, joint="curve")
    draw.polygon([(705, 930), (845, 705), (980, 930)], fill=(122, 92, 57, 132))
    draw.polygon([(930, 980), (1100, 700), (1268, 980)], fill=(122, 92, 57, 132))
    draw.polygon([(3810, 2530), (3985, 2240), (4165, 2530)], fill=(122, 92, 57, 132))
    draw.polygon([(4050, 2578), (4230, 2290), (4410, 2578)], fill=(122, 92, 57, 132))
    draw.arc((398, 519, 4563, 2749), 0, 360, fill="#5d2d14", width=24)
    draw.arc((733, 769, 4228, 2499), 0, 360, fill="#fff2b7", width=8)

    draw_shadowed_panel(bg, (1652, 1128, 3310, 2078), 46, "#3d2114", "#5a2b13", 12)
    draw = ImageDraw.Draw(bg)
    text_center(draw, (2481, 1300), "冰橙星星乐", FONTS["brand"], "#ffe9a8")
    text_center(draw, (2481, 1418), "三国篇 · 起源", FONTS["title"], "#f7c85f")
    for i, line in enumerate(["30 格循环地图 · 主持机自动结算", "掷骰移动，经过起点获得银两奖励", "遇城池可购买、升级、交费或攻城"]):
        text_center(draw, (2481, 1535 + i * 68), line, font(43, True), "#f6dfaa")
    rounded(draw, (1905, 1790, 3057, 1910), 20, "#7b381d", "#d6a64d", 5)
    text_center(draw, (2481, 1852), "起点格：经过或到达均按主持机记录位置", font(35, True), "#fff0bd")

    for idx, city in enumerate(CITIES):
        draw_city_panel(draw, city, idx)

    rounded(draw, (560, 3010, 4400, 3260), 30, "#f4dda9", "#643116", 8)
    draw.text((695, 3050), "图例", font=FONTS["section"], fill="#702a17")
    draw.text((925, 3053), "城池：按格子标注购买/通行/防御", font=FONTS["body"], fill="#4d2a14")
    draw.text((925, 3110), "抽事件：打开小程序抽事件并播放语音", font=FONTS["body"], fill="#4d2a14")
    draw.text((925, 3167), "资源/武将：由主持机直接变更玩家数值或抽人物卡", font=FONTS["body"], fill="#4d2a14")
    draw.text((3100, 3053), "建议打印：A3 横版 / 300DPI", font=FONTS["body"], fill="#4d2a14")
    draw.text((3100, 3110), "棋子按 1-30 循环前进", font=FONTS["body"], fill="#4d2a14")
    draw.text((3100, 3167), "不用在地图额外放置事件标记", font=FONTS["body"], fill="#4d2a14")

    for pos in range(1, 31):
        draw_tile(bg, pos)
    draw = ImageDraw.Draw(bg)
    rounded(draw, (120, 110, WIDTH - 120, HEIGHT - 110), 110, None, "#2a1409", 34)

    rgb = bg.convert("RGB")
    rgb.save(PNG_PATH, "PNG", dpi=(300, 300))
    try:
        pdf_path = PDF_PATH
        rgb.save(pdf_path, "PDF", resolution=300.0, quality=95)
    except PermissionError:
        pdf_path = PDF_FALLBACK_PATH
        rgb.save(pdf_path, "PDF", resolution=300.0, quality=95)
    print(PNG_PATH)
    print(pdf_path)


if __name__ == "__main__":
    main()
