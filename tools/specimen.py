#!/usr/bin/env python3
"""Render a specimen PNG of the generated font for visual QA."""
import sys
from PIL import Image, ImageDraw, ImageFont

font_path = sys.argv[1] if len(sys.argv) > 1 else "fonts/ReallyAmazingFont.ttf"
out = sys.argv[2] if len(sys.argv) > 2 else "assets/specimen.png"

W, H = 1500, 1100
img = Image.new("RGB", (W, H), (244, 240, 231))
d = ImageDraw.Draw(img)
ink = (34, 30, 28)

lines = [
    ("ABCDEFGHIJKLM", 96),
    ("NOPQRSTUVWXYZ", 96),
    ("abcdefghijklm", 96),
    ("nopqrstuvwxyz", 96),
    ("0123456789 & ?!", 96),
    (". , : ; - ' \" ( ) /", 76),
    ("Handglove fifl ff", 110),
    ("The quick brown fox", 70),
]

y = 40
for text, size in lines:
    f = ImageFont.truetype(font_path, size)
    d.text((50, y), text, font=f, fill=ink)
    y += size + 34

img.save(out)
print("wrote", out)
