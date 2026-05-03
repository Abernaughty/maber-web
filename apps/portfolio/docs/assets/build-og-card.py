"""
Compose the 1200x630 OpenGraph card for dev.maber.io.

Run: python apps/portfolio/docs/assets/build-og-card.py
Output: apps/portfolio/static/images/og-card.png
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# --- paths ---
HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent.parent.parent  # maber-web
PORTFOLIO = REPO / "apps" / "portfolio"
BEAR = PORTFOLIO / "static" / "images" / "bear-coding.png"
OUT = PORTFOLIO / "static" / "images" / "og-card.png"
FONTS = Path(
    r"C:/Users/maber/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/"
    r"31689fee-c8bf-44a8-baca-c10ea1409b32/3c66f9c6-72fb-4d0b-9d1d-3b43ce3031c3/"
    r"skills/canvas-design/canvas-fonts"
)

# --- design tokens (mirror tokens.css) ---
W, H = 1200, 630
BG = (10, 11, 10, 255)            # #0a0b0a
ACCENT = (34, 211, 238, 255)      # #22d3ee
ACCENT_DIM = (34, 211, 238, 102)  # 40% alpha
TEXT = (230, 231, 227, 255)       # #e6e7e3
MUTED = (230, 231, 227, 143)      # 56%
DIM = (230, 231, 227, 92)         # 36%
RULE = (255, 255, 255, 20)        # subtle border

# --- canvas ---
canvas = Image.new("RGBA", (W, H), BG)

# --- bear, right side ---
bear_src = Image.open(BEAR).convert("RGBA")
# scale bear so its height ~= H * 0.92
scale = (H * 0.95) / bear_src.height
bw = int(bear_src.width * scale)
bh = int(bear_src.height * scale)
bear = bear_src.resize((bw, bh), Image.LANCZOS)

# darken bear slightly so it doesn't overpower text
darken = Image.new("RGBA", bear.size, (0, 0, 0, 70))
bear = Image.alpha_composite(bear, darken)

# place bear: anchor right edge a bit beyond canvas to bleed
bear_x = W - bw + 60
bear_y = H - bh + 20
canvas.alpha_composite(bear, (bear_x, bear_y))

# Vertical gradient veil over the bear half so left text is fully legible.
# Horizontal gradient: opaque dark on left, fading to transparent at ~70% width.
veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd = ImageDraw.Draw(veil)
for x in range(W):
    t = x / W
    # ease — high opacity through the text area, fade across mid-canvas
    if t < 0.40:
        a = 220
    elif t < 0.78:
        a = int(220 * (1 - (t - 0.40) / 0.38))
    else:
        a = 0
    vd.line([(x, 0), (x, H)], fill=(10, 11, 10, a))
canvas.alpha_composite(veil)

# Subtle vertical gradient bottom darken for footer legibility
botveil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bvd = ImageDraw.Draw(botveil)
for y in range(H):
    if y < H * 0.78:
        continue
    t = (y - H * 0.78) / (H * 0.22)
    a = int(140 * t)
    bvd.line([(0, y), (W, y)], fill=(10, 11, 10, a))
canvas.alpha_composite(botveil)

# --- frame rules ---
draw = ImageDraw.Draw(canvas)
# thin top + bottom rules (border subtle)
draw.line([(48, 56), (W - 48, 56)], fill=RULE, width=1)
draw.line([(48, H - 56), (W - 48, H - 56)], fill=RULE, width=1)
# accent tick on left margin (visual anchor)
draw.rectangle([(48, 56), (50, 168)], fill=ACCENT)

# --- fonts ---
def f(name, size):
    return ImageFont.truetype(str(FONTS / name), size)

mono_reg = lambda s: f("JetBrainsMono-Regular.ttf", s)
mono_bold = lambda s: f("JetBrainsMono-Bold.ttf", s)
sans_bold = lambda s: f("InstrumentSans-Bold.ttf", s)
sans_reg = lambda s: f("InstrumentSans-Regular.ttf", s)

# --- top status line (terminal frame) ---
top_left = "~/maber.io · main"
top_right_l = "open to work"
top_right_r = "remote · colorado springs"

draw.text((68, 36), top_left, font=mono_reg(15), fill=DIM)
# right-align two pieces
trr_w = draw.textlength(top_right_r, font=mono_reg(15))
trl_w = draw.textlength(top_right_l, font=mono_reg(15))
sep_w = draw.textlength(" · ", font=mono_reg(15))
right_x = W - 68 - trr_w
draw.text((right_x, 36), top_right_r, font=mono_reg(15), fill=DIM)
draw.text((right_x - sep_w - trl_w, 36), top_right_l, font=mono_reg(15), fill=DIM)
# pulsing dot stand-in: small green circle
dot_x = int(right_x - sep_w - trl_w - 18)
draw.ellipse([(dot_x, 42), (dot_x + 10, 52)], fill=(34, 197, 94, 255))

# --- prompt + name ---
LX = 80          # left margin for content
y = 130

draw.text((LX, y), "$", font=mono_bold(18), fill=ACCENT)
draw.text((LX + 22, y), "whoami", font=mono_reg(18), fill=DIM)
y += 36

# Name: "Mike" white + "Abernathy" cyan, large display
name_size = 112
mike = "Mike "
abn = "Abernathy"
mike_font = sans_bold(name_size)
abn_font = sans_bold(name_size)
mike_w = draw.textlength(mike, font=mike_font)
draw.text((LX, y), mike, font=mike_font, fill=TEXT)
draw.text((LX + mike_w, y), abn, font=abn_font, fill=ACCENT)

# baseline tweak: name is roughly 112*1.0 tall
y += int(name_size * 1.05)

# subtitle prompt
draw.text((LX, y), "$", font=mono_bold(18), fill=ACCENT)
draw.text((LX + 22, y), "cat /etc/about", font=mono_reg(18), fill=DIM)
y += 32

# tagline (split across two lines for OG legibility at small sizes)
draw.text((LX, y), "Cloud & Platform Engineer", font=mono_reg(26), fill=TEXT)
y += 38
draw.text((LX, y), "azure · iac · devops", font=mono_reg(22), fill=MUTED)

# --- footer: domain + version ---
foot = "dev.maber.io"
foot_w = draw.textlength(foot, font=mono_reg(16))
draw.text((68, H - 84), foot, font=mono_reg(16), fill=ACCENT_DIM)
draw.text((68 + foot_w + 12, H - 84), "·", font=mono_reg(16), fill=RULE)
draw.text((68 + foot_w + 26, H - 84), "engineer's desk", font=mono_reg(16), fill=DIM)

# --- save ---
canvas.convert("RGB").save(OUT, "PNG", optimize=True)
print(f"wrote {OUT} ({OUT.stat().st_size:,} bytes)")
