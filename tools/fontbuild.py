#!/usr/bin/env python3
"""
Build "Really Amazing Font" — an original high-contrast transitional serif
(drawn in the *spirit* of Baskerville / Mrs Eaves, not a copy of any font).

Every glyph is constructed from geometric primitives — vertical stems, thin
bars, slab serifs, diagonal strokes and contrast-modulated curved strokes —
and compiled into a genuine, installable TrueType (.ttf) file with fontTools.

The website loads this exact file as a webfont and hands out the exact same
file on "download", so what you see is what you get: your own font.
"""

import math
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

# ----------------------------------------------------------------------------
# Metrics (units per em = 1000). Small x-height + high stroke contrast give the
# transitional / "Mrs Eaves spirit" flavour.
# ----------------------------------------------------------------------------
EM   = 1000
BASE = 0
CAP  = 700          # cap height
XH   = 424          # x-height (deliberately small)
ASC  = 745          # ascender
DESC = -220         # descender
OS   = 11           # overshoot for round glyphs

STEM  = 118         # thick vertical stem
THIN  = 30          # thin horizontal / thin curve
HAIR  = 24          # hairline
SERH  = 22          # serif slab height
SEXT  = 48          # serif extension each side of a stem
DIAGT = 112         # thick diagonal
DIAGH = 34          # thin diagonal

CWMAX = 128         # max wall thickness of a capital bowl (thick sides)
LWMAX = 104         # max wall thickness of a lowercase bowl

# ----------------------------------------------------------------------------
# Geometry helpers. Everything works in y-up font units. Solid (filled)
# contours are forced clockwise; holes counter-clockwise (nonzero winding).
# ----------------------------------------------------------------------------

def _area(pts):
    a = 0.0
    n = len(pts)
    for i in range(n):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % n]
        a += x0 * y1 - x1 * y0
    return a * 0.5

def _orient(pts, clockwise=True):
    a = _area(pts)
    is_cw = a < 0
    if is_cw != clockwise:
        pts = pts[::-1]
    return pts

def solid(pts):
    return _orient(list(pts), clockwise=True)

def hole(pts):
    return _orient(list(pts), clockwise=False)

def rect(x0, x1, y0, y1):
    """Axis-aligned rectangle (as a solid contour)."""
    if x1 < x0: x0, x1 = x1, x0
    if y1 < y0: y0, y1 = y1, y0
    return solid([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])

def vstem(cx, y0, y1, w=STEM):
    return rect(cx - w / 2, cx + w / 2, y0, y1)

def hbar(x0, x1, cy, h=THIN):
    return rect(x0, x1, cy - h / 2, cy + h / 2)

def quad(p0, p1, w):
    """A thick straight stroke of width w between two points (rounded caps off)."""
    x0, y0 = p0
    x1, y1 = p1
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy) or 1.0
    nx, ny = -dy / L, dx / L
    hw = w / 2
    return solid([
        (x0 + nx * hw, y0 + ny * hw),
        (x1 + nx * hw, y1 + ny * hw),
        (x1 - nx * hw, y1 - ny * hw),
        (x0 - nx * hw, y0 - ny * hw),
    ])

def ellipse_pts(cx, cy, rx, ry, n=72, a0=0.0, a1=2 * math.pi):
    pts = []
    for i in range(n + 1):
        a = a0 + (a1 - a0) * (i / n)
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
    return pts

def ring(cx, cy, rx, ry, wside, wtb, n=80):
    """A closed bowl with thick sides (wside) and thin top/bottom (wtb)."""
    outer = ellipse_pts(cx, cy, rx, ry, n)
    inner = ellipse_pts(cx, cy, rx - wside, ry - wtb, n)
    return [solid(outer), hole(inner)]

def curve(cx, cy, rx, ry, a0, a1, wfunc, n=96):
    """
    A curved stroke following an ellipse skeleton from angle a0..a1, with a
    perpendicular full-width given by wfunc(t) where t in [0,1]. Returns one
    solid band contour.
    """
    outer, inner = [], []
    for i in range(n + 1):
        t = i / n
        a = a0 + (a1 - a0) * t
        w = wfunc(t)
        px = cx + rx * math.cos(a)
        py = cy + ry * math.sin(a)
        nx = math.cos(a) / rx
        ny = math.sin(a) / ry
        nl = math.hypot(nx, ny) or 1.0
        nx, ny = nx / nl, ny / nl
        outer.append((px + nx * w / 2, py + ny * w / 2))
        inner.append((px - nx * w / 2, py - ny * w / 2))
    return solid(outer + inner[::-1])

def contrast_w(wmax, wmin=THIN):
    """Thickness thick at left/right (|cos|=1), thin at top/bottom."""
    def f(t, a0, a1):
        a = a0 + (a1 - a0) * t
        return wmin + (wmax - wmin) * abs(math.cos(a))
    return f

def cw(a0, a1, wmax, wmin=THIN):
    def f(t):
        a = a0 + (a1 - a0) * t
        return wmin + (wmax - wmin) * abs(math.cos(a))
    return f

def serif_slab(cx, y, w=STEM, ext=SEXT, h=SERH, up=True):
    """A slab serif centred on a stem at height y."""
    y0, y1 = (y, y + h) if up else (y - h, y)
    return rect(cx - w / 2 - ext, cx + w / 2 + ext, y0, y1)

def stem_serifed(cx, y0, y1, w=STEM, top=True, bot=True, ext=SEXT):
    out = [vstem(cx, y0, y1, w)]
    if bot: out.append(serif_slab(cx, y0, w, ext, SERH, up=True))
    if top: out.append(serif_slab(cx, y1, w, ext, SERH, up=False))
    return out

def dot(cx, cy, r):
    return [solid(ellipse_pts(cx, cy, r, r, 32))]

def mirror(contours, cx):
    """Reflect solid contours horizontally about x=cx (no holes)."""
    return [solid([(2 * cx - x, y) for (x, y) in c]) for c in contours]

# ----------------------------------------------------------------------------
# Glyph library. Each function returns (advance_width, [contours]).
# Coordinates are in font units, baseline at 0.
# ----------------------------------------------------------------------------
G = {}          # name -> (advance, contours)

def glyph(name, adv):
    def deco(fn):
        G[name] = (adv, fn())
        return fn
    return deco

# ---- Uppercase -------------------------------------------------------------

@glyph("A", 700)
def _A():
    apex = (350, CAP)
    c = []
    c.append(quad((150, 0), (350, CAP), DIAGH + 8))     # left thin
    c.append(quad((350, CAP), (566, 0), DIAGT))         # right thick
    c.append(hbar(214, 486, 232, THIN + 4))             # crossbar
    c.append(rect(70, 200, 0, SERH))                    # left foot serif
    c.append(rect(506, 636, 0, SERH))                   # right foot serif
    return c

@glyph("B", 660)
def _B():
    c = stem_serifed(150, 0, CAP)
    # two bowls sharing the stem
    c.append(curve(300, 525, 210, 175, math.pi / 2, -math.pi / 2, cw(math.pi/2, -math.pi/2, CWMAX-8)))
    c.append(curve(310, 190, 232, 190, math.pi / 2, -math.pi / 2, cw(math.pi/2, -math.pi/2, CWMAX)))
    c.append(rect(150, 300, CAP - THIN - 6, CAP))       # top join
    c.append(rect(150, 320, 0, THIN + 6))               # bottom join
    c.append(rect(150, 300, 340 - 18, 340 + 18))        # waist join
    return c

@glyph("C", 690)
def _C():
    return [curve(360, 350, 250, 350, 0.30 * math.pi, 1.72 * math.pi,
                  lambda t: THIN + (CWMAX - THIN) * abs(math.cos(0.30*math.pi + (1.42*math.pi)*t)),
                  n=120)]

@glyph("D", 720)
def _D():
    c = stem_serifed(150, 0, CAP)
    c.append(curve(230, 350, 340, 350, math.pi / 2, -math.pi / 2, cw(math.pi/2, -math.pi/2, CWMAX)))
    c.append(rect(150, 320, CAP - THIN, CAP))
    c.append(rect(150, 320, 0, THIN))
    return c

@glyph("E", 620)
def _E():
    c = stem_serifed(150, 0, CAP, top=False, bot=False)
    c.append(rect(90, 210, 0, SERH + 2))
    c.append(rect(90, 210, CAP - SERH - 2, CAP))
    c.append(hbar(150, 560, CAP - THIN / 2 - 4, THIN + 8))   # top arm
    c.append(hbar(150, 520, CAP / 2, THIN))                  # mid arm
    c.append(hbar(150, 560, THIN / 2 + 4, THIN + 8))         # bottom arm
    return c

@glyph("F", 600)
def _F():
    c = stem_serifed(150, 0, CAP, top=False, bot=True)
    c.append(rect(90, 210, CAP - SERH - 2, CAP))
    c.append(hbar(150, 560, CAP - THIN / 2 - 4, THIN + 8))
    c.append(hbar(150, 520, CAP * 0.52, THIN))
    return c

@glyph("G", 720)
def _G():
    c = [curve(370, 350, 260, 350, 0.30 * math.pi, 1.74 * math.pi,
               lambda t: THIN + (CWMAX - THIN) * abs(math.cos(0.30*math.pi + (1.44*math.pi)*t)),
               n=120)]
    c.append(vstem(560, 90, 350, STEM - 20))             # inner bar
    c.append(hbar(430, 592, 350, THIN + 6))              # spur
    return c

@glyph("H", 740)
def _H():
    c = stem_serifed(150, 0, CAP)
    c += stem_serifed(590, 0, CAP)
    c.append(hbar(150, 590, CAP / 2, THIN + 6))
    return c

@glyph("I", 340)
def _I():
    return stem_serifed(170, 0, CAP)

@glyph("J", 420)
def _J():
    c = [vstem(300, 130, CAP, STEM)]
    c.append(serif_slab(300, CAP, STEM, SEXT, SERH, up=False))
    c.append(curve(180, 150, 130, 150, 0, -math.pi, cw(0, -math.pi, CWMAX - 6), n=64))
    return c

@glyph("K", 700)
def _K():
    c = stem_serifed(150, 0, CAP)
    c.append(quad((208, CAP / 2), (600, CAP), DIAGH + 6))   # upper thin
    c.append(quad((240, CAP / 2 + 20), (610, 0), DIAGT))    # lower thick
    c.append(rect(540, 660, CAP - SERH, CAP))
    c.append(rect(548, 668, 0, SERH))
    return c

@glyph("L", 600)
def _L():
    c = stem_serifed(150, 0, CAP, bot=False)
    c.append(rect(90, 210, CAP - SERH, CAP))
    c.append(rect(90, 210, 0, SERH + 2))
    c.append(hbar(150, 560, THIN / 2 + 4, THIN + 8))
    c.append(rect(500, 560, 0, SERH + 30))
    return c

@glyph("M", 860)
def _M():
    c = stem_serifed(150, 0, CAP, top=False)
    c += stem_serifed(710, 0, CAP, top=False)
    c.append(quad((150, CAP - 20), (430, 150), DIAGT))
    c.append(quad((710, CAP - 20), (430, 150), DIAGT))
    c.append(rect(96, 250, CAP - SERH, CAP))
    c.append(rect(656, 810, CAP - SERH, CAP))
    return c

@glyph("N", 760)
def _N():
    c = stem_serifed(150, 0, CAP, top=False)
    c += stem_serifed(610, 0, CAP, bot=False)
    c.append(quad((150, CAP), (610, 0), DIAGT))
    c.append(rect(96, 250, CAP - SERH, CAP))
    c.append(rect(510, 664, 0, SERH))
    return c

@glyph("O", 760)
def _O():
    return ring(380, 350, 300, 355 + OS, CWMAX, THIN, n=96)

@glyph("P", 640)
def _P():
    c = stem_serifed(150, 0, CAP)
    c.append(curve(300, 505, 220, 175, math.pi / 2, -math.pi / 2, cw(math.pi/2, -math.pi/2, CWMAX)))
    c.append(rect(150, 300, CAP - THIN, CAP))
    c.append(rect(150, 320, 330, 330 + THIN))
    return c

@glyph("Q", 770)
def _Q():
    c = ring(380, 355, 300, 355 + OS, CWMAX, THIN, n=96)
    c.append(quad((430, 150), (600, -60), DIAGT))       # tail
    return c

@glyph("R", 680)
def _R():
    c = stem_serifed(150, 0, CAP)
    c.append(curve(300, 505, 210, 175, math.pi / 2, -math.pi / 2, cw(math.pi/2, -math.pi/2, CWMAX - 4)))
    c.append(rect(150, 300, CAP - THIN, CAP))
    c.append(rect(150, 320, 330, 330 + THIN))
    c.append(quad((330, 340), (600, 0), DIAGT))         # leg
    c.append(rect(520, 640, 0, SERH))
    return c

@glyph("S", 600)
def _S():
    cx = 300
    r = math.radians
    top = curve(cx, 462, 150, 158, r(25), r(252), lambda t: 40 + 84 * t, n=90)
    bot = curve(cx, 238, 150, 158, r(72), r(-112), lambda t: 124 - 84 * t, n=90)
    return [top, bot]

@glyph("T", 640)
def _T():
    c = [vstem(320, 0, CAP - THIN, STEM)]
    c.append(serif_slab(320, 0, STEM, SEXT, SERH, up=True))
    c.append(hbar(70, 570, CAP - THIN / 2, THIN + 6))
    c.append(rect(70, 130, CAP - SERH - 24, CAP))
    c.append(rect(510, 570, CAP - SERH - 24, CAP))
    return c

@glyph("U", 740)
def _U():
    c = [vstem(150, 170, CAP, STEM), vstem(590, 170, CAP, STEM)]
    c.append(curve(370, 190, 220, 190, math.pi, 2*math.pi, cw(math.pi, 2*math.pi, THIN+6, THIN), n=64))
    c.append(serif_slab(150, CAP, STEM, SEXT, SERH, up=False))
    c.append(serif_slab(590, CAP, STEM, SEXT, SERH, up=False))
    return c

@glyph("V", 700)
def _V():
    c = [quad((110, CAP), (350, 40), DIAGT), quad((590, CAP), (350, 40), DIAGH + 8)]
    c.append(rect(56, 200, CAP - SERH, CAP))
    c.append(rect(516, 636, CAP - SERH, CAP))
    return c

@glyph("W", 980)
def _W():
    c = [quad((110, CAP), (300, 40), DIAGT), quad((450, CAP - 20), (300, 40), DIAGH + 8)]
    c += [quad((450, CAP - 20), (640, 40), DIAGT), quad((830, CAP), (640, 40), DIAGH + 8)]
    c.append(rect(56, 200, CAP - SERH, CAP))
    c.append(rect(756, 900, CAP - SERH, CAP))
    return c

@glyph("X", 700)
def _X():
    c = [quad((120, CAP), (600, 0), DIAGT), quad((600, CAP), (120, 0), DIAGH + 8)]
    c.append(rect(66, 210, CAP - SERH, CAP))
    c.append(rect(510, 654, CAP - SERH, CAP))
    c.append(rect(66, 210, 0, SERH))
    c.append(rect(510, 654, 0, SERH))
    return c

@glyph("Y", 700)
def _Y():
    c = [quad((110, CAP), (350, 330), DIAGT), quad((590, CAP), (350, 330), DIAGH + 8)]
    c.append(vstem(350, 0, 360, STEM))
    c.append(serif_slab(350, 0, STEM, SEXT, SERH, up=True))
    c.append(rect(56, 200, CAP - SERH, CAP))
    c.append(rect(516, 636, CAP - SERH, CAP))
    return c

@glyph("Z", 660)
def _Z():
    c = [quad((110, CAP - THIN), (560, THIN), DIAGT)]
    c.append(hbar(90, 570, CAP - THIN / 2, THIN + 6))
    c.append(hbar(90, 580, THIN / 2, THIN + 6))
    c.append(rect(90, 150, CAP - SERH - 20, CAP))
    c.append(rect(520, 580, 0, SERH + 20))
    return c

# ---- Lowercase -------------------------------------------------------------

@glyph("a", 500)
def _a():
    c = [vstem(400, 0, XH - 30, STEM - 8)]
    c.append(serif_slab(400, 0, STEM - 8, SEXT - 8, SERH, up=True))
    c.append(ring(238, 150, 168, 150, LWMAX - 20, THIN, n=64)[0])
    c.append(ring(238, 150, 168, 150, LWMAX - 20, THIN, n=64)[1])
    c.append(curve(250, XH - 175, 180, 130, 0.15*math.pi, 0.95*math.pi,
                   lambda t: THIN + (LWMAX-40-THIN)*abs(math.cos(0.15*math.pi+0.8*math.pi*t)), n=48))
    return c

@glyph("b", 520)
def _b():
    c = stem_serifed(150, 0, ASC, top=True, bot=False)
    c += ring(320, 150, 175, 152, LWMAX, THIN, n=72)
    c.append(rect(150, 300, 150 + 150 - THIN, 150 + 150))
    c.append(rect(150, 300, 0, THIN))
    return c

@glyph("c", 460)
def _c():
    return [curve(270, 150, 175, 150, 0.28*math.pi, 1.72*math.pi,
                  lambda t: THIN + (LWMAX-30-THIN)*abs(math.cos(0.28*math.pi+1.44*math.pi*t)), n=80)]

@glyph("d", 520)
def _d():
    c = stem_serifed(370, 0, ASC, top=True, bot=False)
    c += ring(200, 150, 175, 152, LWMAX, THIN, n=72)
    c.append(rect(220, 370, 150 + 150 - THIN, 150 + 150))
    c.append(rect(220, 370, 0, THIN))
    return c

@glyph("e", 470)
def _e():
    c = [curve(260, 150, 178, 150, 0.0, 1.72*math.pi,
               lambda t: THIN + (LWMAX-30-THIN)*abs(math.cos(1.72*math.pi*t)), n=90)]
    c.append(hbar(90, 430, 150, THIN + 8))              # crossbar
    return c

@glyph("f", 320)
def _f():
    c = [vstem(230, 0, ASC - 60, STEM - 22)]
    c.append(curve(300, ASC - 55, 90, 90, 0, 0.62*math.pi, lambda t: THIN + 26, n=40))
    c.append(hbar(70, 400, XH - THIN / 2 - 6, THIN + 8))
    c.append(serif_slab(230, 0, STEM - 22, SEXT - 10, SERH, up=True))
    return c

@glyph("g", 520)
def _g():
    c = ring(255, 150, 172, 148, LWMAX - 14, THIN, n=72)
    c.append(vstem(415, -140, XH - 20, STEM - 20))
    c.append(rect(300, 435, XH - 20 - THIN, XH - 20))
    c.append(curve(300, -150, 160, 90, math.pi, 2*math.pi, cw(math.pi, 2*math.pi, THIN+10, THIN), n=48))
    return c

@glyph("h", 520)
def _h():
    c = stem_serifed(150, 0, ASC, top=True, bot=True)
    c.append(curve(300, XH - 168, 168, 168, math.pi, 0, lambda t: STEM - 22, n=48))
    c += stem_serifed(430, 0, XH - 160, STEM - 14, top=False, bot=True)
    c.append(vstem(430, 0, XH - 150, STEM - 14))
    return c

@glyph("i", 260)
def _i():
    c = stem_serifed(150, 0, XH, STEM - 20, top=False, bot=True)
    c += dot(150, XH + 88, 52)
    return c

@glyph("j", 260)
def _j():
    c = [vstem(150, -150, XH, STEM - 20)]
    c.append(curve(60, -150, 90, 90, 0, -math.pi, cw(0, -math.pi, STEM-20), n=40))
    c += dot(150, XH + 88, 52)
    return c

@glyph("k", 480)
def _k():
    c = stem_serifed(150, 0, ASC, top=True, bot=True)
    c.append(quad((208, XH * 0.52), (440, XH), DIAGH))
    c.append(quad((240, XH * 0.52 + 10), (450, 0), DIAGT - 10))
    return c

@glyph("l", 260)
def _l():
    return stem_serifed(150, 0, ASC, top=True, bot=True)

@glyph("m", 800)
def _m():
    c = stem_serifed(150, 0, XH, top=True, bot=True, w=STEM - 16)
    c.append(curve(290, XH - 150, 140, 150, math.pi, 0, lambda t: STEM - 24, n=40))
    c += stem_serifed(430, 0, XH - 140, STEM - 16, top=False, bot=True)
    c.append(vstem(430, 0, XH - 130, STEM - 16))
    c.append(curve(570, XH - 150, 140, 150, math.pi, 0, lambda t: STEM - 24, n=40))
    c += stem_serifed(710, 0, XH - 140, STEM - 16, top=False, bot=True)
    c.append(vstem(710, 0, XH - 130, STEM - 16))
    return c

@glyph("n", 520)
def _n():
    c = stem_serifed(150, 0, XH, top=True, bot=True, w=STEM - 14)
    c.append(curve(300, XH - 165, 165, 165, math.pi, 0, lambda t: STEM - 22, n=48))
    c += stem_serifed(450, 0, XH - 150, STEM - 14, top=False, bot=True)
    c.append(vstem(450, 0, XH - 140, STEM - 14))
    return c

@glyph("o", 540)
def _o():
    return ring(270, 150, 185, 152, LWMAX, THIN, n=80)

@glyph("p", 520)
def _p():
    c = stem_serifed(150, -150, XH, top=True, bot=True)
    c += ring(320, 150, 175, 152, LWMAX, THIN, n=72)
    c.append(rect(150, 300, 150 + 150 - THIN, 150 + 150))
    c.append(rect(150, 300, 0, THIN))
    return c

@glyph("q", 520)
def _q():
    c = stem_serifed(370, -150, XH, top=True, bot=True)
    c += ring(200, 150, 175, 152, LWMAX, THIN, n=72)
    c.append(rect(220, 370, 150 + 150 - THIN, 150 + 150))
    c.append(rect(220, 370, 0, THIN))
    return c

@glyph("r", 380)
def _r():
    c = stem_serifed(150, 0, XH, top=True, bot=True, w=STEM - 14)
    c.append(curve(300, XH - 120, 150, 120, 0.05*math.pi, 0.72*math.pi, lambda t: THIN + 30, n=40))
    return c

@glyph("s", 430)
def _s():
    cx = 210
    r = math.radians
    top = curve(cx, XH * 0.70, 118, 124, r(25), r(252), lambda t: 32 + 66 * t, n=72)
    bot = curve(cx, XH * 0.30, 118, 124, r(72), r(-112), lambda t: 98 - 66 * t, n=72)
    return [top, bot]

@glyph("t", 320)
def _t():
    c = [vstem(180, 0, XH + 120, STEM - 26)]
    c.append(curve(255, 130, 100, 100, math.pi, 1.5*math.pi, lambda t: THIN + 22, n=32))
    c.append(hbar(50, 320, XH - THIN/2 - 2, THIN + 6))
    return c

@glyph("u", 520)
def _u():
    c = [vstem(150, 130, XH, STEM - 14), vstem(450, 0, XH, STEM - 14)]
    c.append(curve(300, 150, 150, 150, math.pi, 2*math.pi, cw(math.pi, 2*math.pi, STEM-22, THIN+6), n=48))
    c += stem_serifed(150, 130, XH, STEM - 14, top=True, bot=False)
    c += stem_serifed(450, 0, XH, STEM - 14, top=True, bot=True)
    return c

@glyph("v", 480)
def _v():
    return [quad((70, XH), (240, 20), DIAGT - 20), quad((410, XH), (240, 20), DIAGH)]

@glyph("w", 720)
def _w():
    c = [quad((70, XH), (210, 20), DIAGT - 26), quad((330, XH - 10), (210, 20), DIAGH)]
    c += [quad((330, XH - 10), (470, 20), DIAGT - 26), quad((610, XH), (470, 20), DIAGH)]
    return c

@glyph("x", 480)
def _x():
    return [quad((80, XH), (410, 0), DIAGT - 22), quad((410, XH), (80, 0), DIAGH)]

@glyph("y", 480)
def _y():
    c = [quad((70, XH), (250, 20), DIAGT - 22)]
    c.append(quad((410, XH), (150, -180), DIAGH))
    return c

@glyph("z", 440)
def _z():
    c = [quad((90, XH - THIN), (360, THIN), DIAGT - 26)]
    c.append(hbar(70, 380, XH - THIN/2, THIN + 4))
    c.append(hbar(70, 390, THIN/2, THIN + 4))
    return c

# ---- Numerals (old-style figures) -----------------------------------------

@glyph("zero", 520)
def _0():
    return ring(260, 150, 165, 250, STEM, THIN + 4, n=80)

@glyph("one", 380)
def _1():
    c = [vstem(210, 0, XH + 120, STEM - 20)]
    c.append(quad((110, XH + 40), (210, XH + 120), THIN + 20))
    c.append(serif_slab(210, 0, STEM - 20, SEXT, SERH, up=True))
    return c

@glyph("two", 480)
def _2():
    c = [curve(240, XH - 40, 155, 120, 1.05*math.pi, -0.15*math.pi, lambda t: THIN + 46, n=60)]
    c.append(quad((360, XH - 90), (90, THIN + 10), DIAGT - 40))
    c.append(hbar(80, 430, THIN/2, THIN + 8))
    return c

@glyph("three", 480)
def _3():
    c = [curve(235, XH - 30, 150, 118, 1.1*math.pi, -0.35*math.pi, lambda t: THIN + 40, n=56)]
    c.append(curve(220, -20, 168, 168, 0.55*math.pi, -1.15*math.pi, lambda t: THIN + 44, n=64))
    c.append(hbar(150, 300, XH*0.5, THIN + 6))
    return c

@glyph("four", 500)
def _4():
    c = [vstem(340, -180, XH + 100, STEM - 26)]
    c.append(quad((340, XH + 100), (70, 120), THIN + 20))
    c.append(hbar(70, 450, 120, THIN + 10))
    return c

@glyph("five", 480)
def _5():
    c = [vstem(160, XH*0.55, XH + 60, THIN + 20)]
    c.append(hbar(160, 380, XH + 60 - THIN/2, THIN + 8))
    c.append(rect(150, 300, XH*0.55 - 8, XH*0.55 + 8))
    c.append(curve(230, -20, 175, 175, 0.7*math.pi, -1.2*math.pi, lambda t: THIN + 44, n=64))
    return c

@glyph("six", 500)
def _6():
    c = ring(255, 130, 165, 150, STEM - 6, THIN, n=72)
    c.append(quad((300, 560), (150, 220), THIN + 30))
    return c

@glyph("seven", 470)
def _7():
    c = [hbar(70, 420, XH + 60 - THIN/2, THIN + 8)]
    c.append(quad((420, XH + 60), (180, -180), DIAGT - 44))
    return c

@glyph("eight", 500)
def _8():
    c = ring(250, XH*0.72, 128, XH*0.30, STEM - 30, THIN, n=64)
    c += ring(250, XH*0.20, 152, XH*0.34, STEM - 20, THIN, n=64)
    return c

@glyph("nine", 500)
def _9():
    c = ring(245, XH - 130, 165, 150, STEM - 6, THIN, n=72)
    c.append(quad((355, XH - 100), (200, -180), THIN + 30))
    return c

# ---- Punctuation -----------------------------------------------------------

@glyph("period", 280)
def _period():
    return dot(140, 55, 56)

@glyph("comma", 280)
def _comma():
    c = dot(140, 55, 56)
    c.append(quad((140, 40), (95, -120), THIN + 30))
    return c

@glyph("colon", 280)
def _colon():
    return dot(140, 55, 56) + dot(140, XH - 100, 56)

@glyph("semicolon", 280)
def _semicolon():
    c = dot(140, XH - 100, 56)
    c += dot(140, 55, 56)
    c.append(quad((140, 40), (95, -120), THIN + 30))
    return c

@glyph("exclam", 300)
def _exclam():
    c = [solid([(108, CAP), (192, CAP), (176, 190), (124, 190)])]
    c += dot(150, 55, 58)
    return c

@glyph("question", 480)
def _question():
    c = [curve(240, CAP - 150, 165, 150, 1.2*math.pi, -0.05*math.pi, lambda t: THIN + 42, n=56)]
    c.append(vstem(240, 200, CAP - 250, STEM - 44))
    c = mirror(c, 240)
    c += dot(240, 55, 58)
    return c

@glyph("hyphen", 360)
def _hyphen():
    return [hbar(70, 290, XH * 0.5, THIN + 10)]

@glyph("quotesingle", 200)
def _quotesingle():
    return [solid([(78, CAP), (138, CAP), (128, CAP - 150), (88, CAP - 150)])]

@glyph("quotedbl", 340)
def _quotedbl():
    return [solid([(78, CAP), (138, CAP), (128, CAP - 150), (88, CAP - 150)]),
            solid([(214, CAP), (274, CAP), (264, CAP - 150), (224, CAP - 150)])]

@glyph("parenleft", 320)
def _parenleft():
    return [curve(320, 260, 260, 460, 0.72*math.pi, 1.28*math.pi, lambda t: THIN + 18, n=48)]

@glyph("parenright", 320)
def _parenright():
    return [curve(0, 260, 260, 460, 0.28*math.pi, -0.28*math.pi, lambda t: THIN + 18, n=48)]

@glyph("ampersand", 720)
def _amp():
    # Roman "figure-eight with a tail" ampersand: small upper loop, larger
    # lower bowl, a diagonal spine and a flourished tail to the right.
    c = ring(300, 458, 118, 130, 78, THIN, n=64)          # upper loop
    c += ring(288, 176, 158, 172, 116, THIN, n=72)        # lower bowl
    c.append(quad((236, 300), (392, 560), THIN + 26))     # spine
    c.append(quad((360, 150), (628, 300), DIAGT - 40))    # tail
    return c

@glyph("slash", 360)
def _slash():
    return [quad((60, -60), (300, CAP + 40), THIN + 16)]

@glyph("space", 300)
def _space():
    return []

# ---- Ligatures (accessed via GSUB liga) -----------------------------------

@glyph("f_i", 560)
def _fi():
    c = [vstem(230, 0, ASC - 60, STEM - 22)]
    c.append(curve(300, ASC - 55, 100, 90, 0, 0.62*math.pi, lambda t: THIN + 26, n=40))
    c.append(hbar(70, 500, XH - THIN/2 - 6, THIN + 8))
    c.append(serif_slab(230, 0, STEM - 22, SEXT - 10, SERH, up=True))
    c += stem_serifed(430, 0, XH, STEM - 20, top=False, bot=True)
    c += dot(430, ASC - 55, 52)
    return c

@glyph("f_l", 560)
def _fl():
    c = [vstem(230, 0, ASC - 60, STEM - 22)]
    c.append(curve(300, ASC - 55, 100, 90, 0, 0.62*math.pi, lambda t: THIN + 26, n=40))
    c.append(hbar(70, 470, XH - THIN/2 - 6, THIN + 8))
    c.append(serif_slab(230, 0, STEM - 22, SEXT - 10, SERH, up=True))
    c += stem_serifed(430, 0, ASC, STEM - 20, top=True, bot=True)
    return c

@glyph("f_f", 600)
def _ff():
    c = [vstem(220, 0, ASC - 60, STEM - 26)]
    c.append(curve(290, ASC - 55, 90, 90, 0, 0.62*math.pi, lambda t: THIN + 24, n=40))
    c.append(hbar(60, 380, XH - THIN/2 - 6, THIN + 8))
    c.append(serif_slab(220, 0, STEM - 26, SEXT - 12, SERH, up=True))
    c.append(vstem(430, 0, ASC - 60, STEM - 26))
    c.append(curve(500, ASC - 55, 90, 90, 0, 0.62*math.pi, lambda t: THIN + 24, n=40))
    c.append(hbar(270, 590, XH - THIN/2 - 6, THIN + 8))
    c.append(serif_slab(430, 0, STEM - 26, SEXT - 12, SERH, up=True))
    return c

# ----------------------------------------------------------------------------
# .notdef
# ----------------------------------------------------------------------------
G[".notdef"] = (500, [rect(60, 440, 0, CAP), hole(rect(120, 380, 60, CAP - 60))])

# ----------------------------------------------------------------------------
# Character map
# ----------------------------------------------------------------------------
CMAP = {}
for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz":
    CMAP[ord(ch)] = ch
for d, name in zip("0123456789",
                   ["zero","one","two","three","four","five","six","seven","eight","nine"]):
    CMAP[ord(d)] = name
CMAP.update({
    ord(" "): "space", ord("."): "period", ord(","): "comma", ord(":"): "colon",
    ord(";"): "semicolon", ord("!"): "exclam", ord("?"): "question", ord("-"): "hyphen",
    ord("'"): "quotesingle", ord('"'): "quotedbl", ord("("): "parenleft",
    ord(")"): "parenright", ord("&"): "ampersand", ord("/"): "slash",
})

# ----------------------------------------------------------------------------
# Build the TTF
# ----------------------------------------------------------------------------
def round_contour(c):
    return [(int(round(x)), int(round(y))) for (x, y) in c]

def build(path_ttf):
    glyph_order = [".notdef"] + [n for n in G if n != ".notdef"]

    fb = FontBuilder(EM, isTTF=True)
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap(CMAP)

    glyphs, metrics = {}, {}
    for name in glyph_order:
        adv, contours = G[name]
        pen = TTGlyphPen(None)
        xs = []
        for c in contours:
            c = round_contour(c)
            if len(c) < 3:
                continue
            pen.moveTo(c[0])
            for pt in c[1:]:
                pen.lineTo(pt)
            pen.closePath()
            xs.extend(p[0] for p in c)
        glyphs[name] = pen.glyph()
        lsb = min(xs) if xs else 0
        metrics[name] = (adv, lsb)

    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASC, descent=DESC)
    fb.setupNameTable({
        "familyName": "Miss Eaves",
        "styleName": "Regular",
        "fullName": "Miss Eaves Regular",
        "psName": "MissEaves-Regular",
        "version": "Version 1.000",
        "copyright": "Miss Eaves. An original typeface. Free to use.",
        "manufacturer": "Miss Eaves",
        "designer": "Miss Eaves",
    })
    fb.setupOS2(sTypoAscender=ASC, sTypoDescender=DESC, sTypoLineGap=90,
                usWinAscent=ASC, usWinDescent=-DESC,
                sxHeight=XH, sCapHeight=CAP, achVendID="RAFt")
    fb.setupPost(isFixedPitch=0, underlinePosition=-130, underlineThickness=60)

    # --- GSUB ligatures ---
    feature = """
    feature liga {
        sub f i by f_i;
        sub f l by f_l;
        sub f f by f_f;
    } liga;
    """
    from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
    addOpenTypeFeaturesFromString(fb.font, feature)

    fb.font.save(path_ttf)
    return glyph_order


if __name__ == "__main__":
    import sys, os
    out = sys.argv[1] if len(sys.argv) > 1 else "fonts/ReallyAmazingFont.ttf"
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    order = build(out)
    print(f"Built {out} with {len(order)} glyphs.")
