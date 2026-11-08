#!/usr/bin/env python3
"""Validate the 44-model catalog and independent motorcycle image inventory.

Run: python tools/validate_vehicle_assets.py
Requires Pillow: pip install Pillow
Read-only: does not change images, app storage, or user data.
"""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "vehicle-art-inventory.json"
CATALOG = ROOT / "ui-skeleton" / "vehicle-catalog.js"
APP_DIR = ROOT / "ui-skeleton"


def catalog_pairs():
    source = CATALOG.read_text(encoding="utf-8")
    block = source.split("const brands=[", 1)[1].split("const modelStyles=", 1)[0]
    found = set()
    for brand, models in re.findall(
        r"\{id:'([^']+)',label:'[^']+',models:\[(.*?)\]\}", block, re.S
    ):
        for model in re.findall(r"\['([^']+)',\d+\]", models):
            found.add((brand, model))
    return found


def main():
    try:
        from PIL import Image
    except ImportError:
        print("ERROR: Pillow required: pip install Pillow", file=sys.stderr)
        return 2

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    models = data.get("models", [])
    catalog = catalog_pairs()
    listed = [(m.get("brand"), m.get("model")) for m in models]
    failures = []

    if len(listed) != len(set(listed)):
        failures.append("DUPLICATE model in image inventory")
    if set(listed) != catalog:
        failures.append(f"CATALOG MISMATCH: missing={sorted(catalog - set(listed))}, extra={sorted(set(listed) - catalog)}")
    if data.get("totalModels") != len(models):
        failures.append("totalModels does not match inventory")
    ready = sum(m.get("status") == "asset-present" for m in models)
    pending = sum(m.get("status") == "not-created" for m in models)
    images = sum(len(m.get("generations", [])) for m in models)
    if ready != data.get("modelsWithPreparedAssets"):
        failures.append("modelsWithPreparedAssets mismatch")
    if pending != data.get("notCreatedModels"):
        failures.append("notCreatedModels mismatch")
    if images != data.get("individualImageAssetsPrepared"):
        failures.append("individualImageAssetsPrepared mismatch")

    count = 0
    for item in models:
        generations = item.get("generations", [])
        if item.get("status") == "asset-present" and not generations:
            failures.append(f"NO FILE: {item['brand']} {item['model']}")
        for gen in generations:
            count += 1
            # Explicit relative paths can reference the existing root-level PNGs.
            path = (APP_DIR / gen["file"]).resolve()
            if not path.is_relative_to(ROOT) or not path.is_file():
                failures.append(f"MISSING or OUTSIDE REPO: {gen['file']}")
                continue
            try:
                with Image.open(path) as im:
                    width, height = im.size
                    if width < 640 or height < 400:
                        failures.append(f"LOW RESOLUTION: {path.name} ({width}x{height})")
                    if "A" not in im.getbands() and "transparency" not in im.info:
                        failures.append(f"NO ALPHA: {path.name}")
                        continue
                    alpha = im.convert("RGBA").getchannel("A")
                    transparent = alpha.histogram()[:245]
                    if sum(transparent) < width * height * 0.01:
                        failures.append(f"OPAQUE BACKGROUND: {path.name}")
            except Exception as exc:
                failures.append(f"INVALID: {path.name}: {exc}")

    print(f"Catalog {len(catalog)} models; inventory {len(models)} models; {ready} art-linked models; {count} images; failures={len(failures)}")
    for msg in failures:
        print(msg)
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
