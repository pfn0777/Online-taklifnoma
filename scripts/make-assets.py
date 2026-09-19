# -*- coding: utf-8 -*-
"""
Stitch akvarel plitalarini sayt assetlariga aylantiradi.

Kirish:  stitch/jasmine-akvarel/*-hi.png  (1024x1024, tekis krem fonda)
Chiqish: assets/*.webp                   (shaffof fon, kesilgan, kichraytirilgan)

Ishga tushirish:  python scripts/make-assets.py
"""

import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'stitch', 'jasmine-akvarel')
OUT = os.path.join(ROOT, 'assets')

FLOOD_TOLERANCE = 26        # fon rangidan qanchalik uzoqlashguncha "fon" hisoblanadi
EDGE_FEATHER = 1.1          # alfa chetini yumshatish (piksel)
ALPHA_FLOOR = 8             # shu qiymatdan past alfa butunlay 0 ga tushadi
SENTINEL = (255, 0, 255)    # flood fill belgisi — rasmda uchramaydigan rang
TARGET_LONG_EDGE = 900
WEBP_QUALITY = 82


def key_background(img):
    """Chetlardan flood fill bilan FAQAT fonga ulangan sohani shaffof qiladi.

    Rang masofasi bo'yicha global keying gulbargni ham yeb qo'yadi (gulbarg ham
    deyarli oq), shuning uchun faqat tashqi, uzluksiz fon sohasi olib tashlanadi.
    """
    rgb = img.convert('RGB')
    w, h = rgb.size

    # Chet nuqtalaridan flood fill — barcha 4 burchak va tomonlar o'rtasi
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for seed in seeds:
        if rgb.getpixel(seed) == SENTINEL:
            continue
        ImageDraw.floodfill(rgb, seed, SENTINEL, thresh=FLOOD_TOLERANCE)

    # Sentinel -> alfa 0
    mask = Image.new('L', (w, h), 255)
    mask_px = mask.load()
    rgb_px = rgb.load()
    for y in range(h):
        for x in range(w):
            if rgb_px[x, y] == SENTINEL:
                mask_px[x, y] = 0

    mask = mask.filter(ImageFilter.GaussianBlur(EDGE_FEATHER))
    mask = mask.point(lambda a: 0 if a < ALPHA_FLOOR else a)

    out = img.convert('RGBA')
    out.putalpha(mask)
    return out


def trim(img):
    box = img.getbbox()
    return img.crop(box) if box else img


def fit(img, long_edge=TARGET_LONG_EDGE):
    w, h = img.size
    scale = long_edge / float(max(w, h))
    if scale >= 1:
        return img
    return img.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)


def save(img, name):
    # Faqat WebP: sayt uni to'g'ridan-to'g'ri ishlatadi, PNG fallback'ning
    # iste'molchisi yo'q (WebP barcha maqsadli brauzerlarda qo'llab-quvvatlanadi).
    webp = os.path.join(OUT, name + '.webp')
    img.save(webp, quality=WEBP_QUALITY, method=6)
    print('  %-16s %4dx%-4d  %6.1f KB'
          % (name, img.size[0], img.size[1], os.path.getsize(webp) / 1024.0))


def build(src_name, crops):
    src = Image.open(os.path.join(SRC, src_name))
    print(src_name)
    for name, box in crops:
        piece = src.crop(box) if box else src.copy()
        save(fit(trim(key_background(piece))), name)


def main():
    if not os.path.isdir(OUT):
        os.makedirs(OUT)

    # 2x2 to'r — ajratgich chiziqlardan ichkariroq kesiladi
    build('01-floral-sheet-hi.png', [
        ('floral-tl', (4, 4, 504, 504)),
        ('floral-tr', (520, 4, 1020, 504)),
        ('floral-bl', (4, 520, 504, 1020)),
        ('floral-br', (520, 520, 1020, 1020)),
    ])

    # Ikki vertikal dasta
    build('03-sprays-hi.png', [
        ('spray-left', (0, 0, 480, 1024)),
        ('spray-right', (540, 0, 1024, 1024)),
    ])

    # Sovg'a qutisi — butun plita
    build('02-giftbox-hi.png', [('giftbox', None)])


if __name__ == '__main__':
    main()
