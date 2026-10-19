from pathlib import Path
from math import cos, sin, pi

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
TMP_BG_DIR = ROOT / "output" / "tmp" / "map-backgrounds"
OUT_DIR = ROOT / "output" / "print-map"
CDN_DIR = ROOT / "output" / "cdn-upload-final"
OUT_DIR.mkdir(parents=True, exist_ok=True)
CDN_DIR.mkdir(parents=True, exist_ok=True)

FONT_REGULAR = Path("C:/Windows/Fonts/simsun.ttc")
FONT_BOLD = Path("C:/Windows/Fonts/simhei.ttf")

CITIES = [
    {"name": "洛阳", "position": 6, "price": 8, "toll": 2, "income": 2, "defense": 180, "upgrade": 5},
    {"name": "陈留", "position": 10, "price": 5, "toll": 1, "income": 1, "defense": 110, "upgrade": 3},
    {"name": "汜水关", "position": 14, "price": 6, "toll": 2, "income": 1, "defense": 150, "upgrade": 4},
    {"name": "虎牢关", "position": 18, "price": 7, "toll": 2, "income": 2, "defense": 170, "upgrade": 5},
    {"name": "邺城", "position": 23, "price": 6, "toll": 1, "income": 2, "defense": 130, "upgrade": 4},
    {"name": "许昌", "position": 28, "price": 7, "toll": 2, "income": 2, "defense": 160, "upgrade": 5},
]

TILE_CYCLE = [
    ("抽事件卡", "主持机结算", "#9d3a24"),
    ("银两", "+2 银两", "#ad762a"),
    ("粮草", "+1 粮草", "#4f7d48"),
    ("声望", "+1 声望", "#2e6b68"),
    ("抽事件卡", "主持机结算", "#9d3a24"),
    ("整备", "下次移动 +1", "#7a6935"),
    ("商路", "+2 银两", "#ad762a"),
    ("粮道", "+1 粮草", "#4f7d48"),
]


def make_font(size, bold=False):
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REGULAR
    return ImageFont.truetype(str(path), size)


def city_at(position):
    for city in CITIES:
        if city["position"] == position:
            return city
    return None


def tile_content(position):
    city = city_at(position)
    if city:
        return city["name"], f"买{city['price']} 通{city['toll']} 防{city['defense']}", "#8e2f1f", True
    if position == 1:
        return "起点", "过起点 +3 银两", "#a53623", False
    title, sub, tone = TILE_CYCLE[(position - 2) % len(TILE_CYCLE)]
    return title, sub, tone, False


def text_center(draw, xy, content, font, fill):
    draw.text(xy, content, font=font, fill=fill, anchor="mm")


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def fallback_background(size):
    width, height = size
    image = Image.new("RGB", size, "#7d3b21")
    pix = image.load()
    cx, cy = width / 2, height * 0.45
    max_dist = ((width / 2) ** 2 + (height / 2) ** 2) ** 0.5
    center = (255, 238, 190)
    mid = (219, 165, 82)
    edge = (111, 52, 30)
    for y in range(height):
        for x in range(width):
            dist = (((x - cx) ** 2 + (y - cy) ** 2) ** 0.5) / max_dist
            ratio = min(1, dist * 1.65)
            if ratio < 0.58:
                local = ratio / 0.58
                color = tuple(int(center[i] + (mid[i] - center[i]) * local) for i in range(3))
            else:
                local = (ratio - 0.58) / 0.42
                color = tuple(int(mid[i] + (edge[i] - mid[i]) * local) for i in range(3))
            pix[x, y] = color
    return image


def load_background(file_name, size):
    path = TMP_BG_DIR / file_name
    if path.exists():
        return Image.open(path).convert("RGB").resize(size, Image.Resampling.LANCZOS)
    return fallback_background(size)


def add_soft_panel(base, box, radius, fill, outline, scale):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    offset = int(12 * scale)
    shadow_draw.rounded_rectangle((box[0], box[1] + offset, box[2], box[3] + offset), radius=radius, fill=(45, 20, 8, 92))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(12 * scale)))
    base.alpha_composite(shadow)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=max(2, int(6 * scale)))


def draw_tile(base, position, center, radius, scale):
    draw = ImageDraw.Draw(base)
    angle = (90 - (position - 1) * 360 / 30) * pi / 180
    x = center[0] + cos(angle) * radius[0]
    y = center[1] + sin(angle) * radius[1]
    title, sub, tone, is_city = tile_content(position)
    tw = int((188 if is_city else 164) * scale)
    th = int((112 if is_city else 98) * scale)
    box = (int(x - tw / 2), int(y - th / 2), int(x + tw / 2), int(y + th / 2))
    if is_city:
        glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        pad = int(12 * scale)
        glow_draw.rounded_rectangle((box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad), radius=int(20 * scale), fill=(255, 211, 108, 125))
        glow = glow.filter(ImageFilter.GaussianBlur(int(10 * scale)))
        base.alpha_composite(glow)

    rounded(draw, box, int(14 * scale), "#f3ddb0", "#5a2e17", max(3, int(4 * scale)))
    inner = (box[0] + int(7 * scale), box[1] + int(7 * scale), box[2] - int(7 * scale), box[3] - int(7 * scale))
    rounded(draw, inner, int(10 * scale), tone)
    badge = (box[0] + int(12 * scale), box[1] + int(12 * scale), box[0] + int(48 * scale), box[1] + int(48 * scale))
    draw.ellipse(badge, fill="#ffe8a8", outline="#d6a64d", width=max(2, int(3 * scale)))

    fonts = {
        "num": make_font(max(16, int(19 * scale)), True),
        "title": make_font(max(20, int((30 if is_city else 24) * scale)), True),
        "sub": make_font(max(14, int(16 * scale)), True),
    }
    text_center(draw, (box[0] + int(30 * scale), box[1] + int(32 * scale)), str(position), fonts["num"], "#5a2a12")
    text_center(draw, (x, box[1] + int((50 if is_city else 45) * scale)), title, fonts["title"], "#fff1bd")
    text_center(draw, (x, box[1] + int((82 if is_city else 72) * scale)), sub, fonts["sub"], "#ffedc7")


def draw_city_panel(draw, city, index, size, scale):
    width, height = size
    panel_w = int(318 * scale)
    panel_h = int(100 * scale)
    margin_x = int(72 * scale)
    top = int((170 + (index % 3) * 136) * scale)
    left = margin_x if index < 3 else width - margin_x - panel_w
    rounded(draw, (left, top, left + panel_w, top + panel_h), int(14 * scale), "#f5dfad", "#6a3518", max(3, int(4 * scale)))
    rounded(draw, (left + int(10 * scale), top + int(10 * scale), left + int(64 * scale), top + int(90 * scale)), int(9 * scale), "#8e2f1f", "#d6a64d", max(2, int(3 * scale)))
    text_center(draw, (left + int(37 * scale), top + int(51 * scale)), str(city["position"]), make_font(max(20, int(26 * scale)), True), "#ffe8a8")
    draw.text((left + int(78 * scale), top + int(14 * scale)), city["name"], font=make_font(max(22, int(28 * scale)), True), fill="#5a2413")
    draw.text((left + int(78 * scale), top + int(51 * scale)), f"购买 {city['price']}  通行 {city['toll']}  征税 {city['income']}", font=make_font(max(13, int(16 * scale)), True), fill="#643b1f")
    draw.text((left + int(78 * scale), top + int(74 * scale)), f"防御 {city['defense']}  升级 {city['upgrade']}", font=make_font(max(13, int(16 * scale)), True), fill="#643b1f")


def draw_board(size, bg_file, out_path, center, radius, title_box, legend_box):
    width, height = size
    scale = min(width / 2880, height / 2160)
    base = load_background(bg_file, size).convert("RGBA")
    tint = Image.new("RGBA", size, (91, 43, 22, 45))
    base.alpha_composite(tint)
    draw = ImageDraw.Draw(base)

    border = int(28 * scale)
    rounded(draw, (border, border, width - border, height - border), int(42 * scale), None, "#2a1409", max(8, int(16 * scale)))
    rounded(draw, (border * 2, border * 2, width - border * 2, height - border * 2), int(30 * scale), None, "#f5d583", max(3, int(5 * scale)))
    draw.ellipse((center[0] - radius[0] - int(88 * scale), center[1] - radius[1] - int(68 * scale), center[0] + radius[0] + int(88 * scale), center[1] + radius[1] + int(68 * scale)), outline="#5d2d14", width=max(6, int(12 * scale)))
    draw.ellipse((center[0] - radius[0] + int(110 * scale), center[1] - radius[1] + int(90 * scale), center[0] + radius[0] - int(110 * scale), center[1] + radius[1] - int(90 * scale)), outline="#fff2b7", width=max(2, int(4 * scale)))

    add_soft_panel(base, title_box, int(28 * scale), "#3d2114", "#5a2b13", scale)
    draw = ImageDraw.Draw(base)
    text_center(draw, (int((title_box[0] + title_box[2]) / 2), title_box[1] + int(82 * scale)), "冰橙星星乐", make_font(max(38, int(54 * scale)), True), "#ffe9a8")
    text_center(draw, (int((title_box[0] + title_box[2]) / 2), title_box[1] + int(160 * scale)), "三国篇 · 起源", make_font(max(52, int(74 * scale)), True), "#f7c85f")
    lines = ["30 格循环地图 · 抽事件卡", "掷骰移动，经过起点获得银两奖励", "遇城池可购买、升级、交费或攻城"]
    for index, line in enumerate(lines):
        text_center(draw, (int((title_box[0] + title_box[2]) / 2), title_box[1] + int((230 + index * 44) * scale)), line, make_font(max(21, int(27 * scale)), True), "#f6dfaa")

    for city_index, city in enumerate(CITIES):
        draw_city_panel(draw, city, city_index, size, scale)

    for position in range(1, 31):
        draw_tile(base, position, center, radius, scale)

    draw = ImageDraw.Draw(base)
    rounded(draw, legend_box, int(18 * scale), "#f4dda9", "#643116", max(3, int(5 * scale)))
    left = legend_box[0] + int(46 * scale)
    top = legend_box[1] + int(36 * scale)
    draw.text((left, top), "图例", font=make_font(max(22, int(30 * scale)), True), fill="#702a17")
    draw.text((left + int(128 * scale), top + int(2 * scale)), "城池：按格子标注购买/通行/防御", font=make_font(max(17, int(21 * scale)), True), fill="#4d2a14")
    draw.text((left + int(128 * scale), top + int(42 * scale)), "抽事件卡：打开小程序抽事件并播放语音", font=make_font(max(17, int(21 * scale)), True), fill="#4d2a14")
    draw.text((left + int(128 * scale), top + int(82 * scale)), "棋子按 1-30 循环前进，不放置额外人物卡区域", font=make_font(max(17, int(21 * scale)), True), fill="#4d2a14")
    rounded(draw, (border, border, width - border, height - border), int(42 * scale), None, "#2a1409", max(8, int(16 * scale)))

    rgb = base.convert("RGB")
    rgb.save(out_path, "PNG", dpi=(300, 300))
    cdn_path = CDN_DIR / out_path.name
    rgb.save(cdn_path, "PNG", dpi=(300, 300), optimize=True)
    print(out_path)
    print(cdn_path)


def main():
    draw_board(
        (4961, 3508),
        "sanguo-origin-map-bg-a3-max-3408x2416.png",
        OUT_DIR / "sanguo-origin-board-a3-300dpi.png",
        (2480, 1785),
        (1860, 1090),
        (1680, 1260, 3280, 1840),
        (920, 3035, 4040, 3338),
    )
    draw_board(
        (3408, 2416),
        "sanguo-origin-map-bg-a3-max-3408x2416.png",
        OUT_DIR / "sanguo-origin-board-gptimage2-max-a3-ratio.png",
        (1704, 1230),
        (1280, 752),
        (1155, 868, 2253, 1268),
        (632, 2090, 2776, 2300),
    )
    draw_board(
        (2880, 2880),
        "sanguo-origin-map-bg-print-2880.png",
        OUT_DIR / "sanguo-origin-board-print-2880.png",
        (1440, 1500),
        (1115, 860),
        (930, 1030, 1950, 1510),
        (420, 2540, 2460, 2716),
    )
    draw_board(
        (3840, 2160),
        "sanguo-origin-map-bg-mini-3840x2160.png",
        OUT_DIR / "sanguo-origin-board-miniprogram-3840x2160.png",
        (1920, 1100),
        (1450, 710),
        (1320, 785, 2520, 1220),
        (900, 1880, 2940, 2060),
    )


if __name__ == "__main__":
    main()
