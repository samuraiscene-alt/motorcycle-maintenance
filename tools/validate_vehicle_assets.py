#!/usr/bin/env python3
"""Audit independent motorcycle cutouts; never change originals or user data.
Run: python tools/validate_vehicle_assets.py
Requires Pillow: pip install Pillow
"""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "vehicle-art-inventory.json"
ASSET_DIR = ROOT / "ui-skeleton"

def main():
    try:
        from PIL import Image
    except ImportError:
        print("ERROR: Pillow required: pip install Pillow", file=sys.stderr)
        return 2
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if len(data["models"]) != 40:
        print("ERROR: vehicle catalog count is not 40", file=sys.stderr)
        return 1
    failures = []
    count = 0
    for item in data["models"]:
        for gen in item.get("generations", []):
            count += 1
            path = ASSET_DIR / gen["file"]
            if not path.is_file():
                failures.append(f"MISSING: {path.name}")
                continue
            try:
                with Image.open(path) as im:
                    width, height = im.size
                    if width < 640 or height < 400:
                        failures.append(f"LOW RESOLUTION: {path.name} ({width}x{height})")
                    if not im.mode.endswith("A") and "transparency" not in im.info:
                        failures.append(f"NO ALPHA: {path.name}")
                        continue
                    alpha = im.convert("RGBA").getchannel("A")
                    transparent = alpha.histogram()[:245]
                    if sum(transparent) < width * height * 0.01:
                        failures.append(f"OPAQUE BACKGROUND: {path.name}")
            except Exception as exc:
                failures.append(f"INVALID: {path.name}: {exc}")
    print(f"Audited {len(data['models'])} models, {count} prepared individual files; failures={len(failures)}")
    for msg in failures:
        print(msg)
    return 1 if failures else 0

if __name__ == "__main__":
    raise SystemExit(main())
