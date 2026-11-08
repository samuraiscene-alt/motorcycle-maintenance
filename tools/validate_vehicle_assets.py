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
VEHICLE_UI = ROOT / "ui-skeleton" / "vehicle-data.js"
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

def mapped_vehicle_art():
    """Find the exact per-model image sources actively used by the garage."""
    source = VEHICLE_UI.read_text(encoding="utf-8")
    block = source.split("const vehicleArtwork=Object.freeze({", 1)[1].split("});", 1)[0]
    return [
        (key, path.split("?", 1)[0])
        for key, path in re.findall(
            r"'([^']+)':\{src:'([^']+)'", block
        )
    ]


def normalize_art_path(raw):
    """Inventory paths resolve relative to ui-skeleton, matching active UI sources."""
    return (APP_DIR / raw).resolve()


def check_art_mapping(models, failures):
    listed = set()
    for item in models:
        for gen in item.get("generations", []):
            path = normalize_art_path(gen["file"])
            listed.add((item["brand"], item["model"], path))

    for key, raw in mapped_vehicle_art():
        # Ignore the deliberate generic PCX illustration; exact image files
        # are tracked independently in the manifest.
        if not raw.lower().endswith((".png", ".webp", ".jpg", ".jpeg")):
            continue
        tokens = key.split("|")
        if len(tokens) < 2:
            failures.append(f"INVALID ART KEY: {key}")
            continue
        brand, model = tokens[:2]
        resolved = normalize_art_path(raw)
        if (brand, model, resolved) not in listed:
            failures.append(f"APP IMAGE NOT INVENTORIED: {key} -> {raw}")


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

    check_art_mapping(models, failures)

    count = 0
    for item in models:
        generations = item.get("generations", [])
        if item.get("status") == "asset-present" and not generations:
            failures.append(f"NO FILE: {item['brand']} {item['model']}")
        for gen in generations:
            count += 1
            # Explicit relative paths can reference the existing root-level PNGs.
            path = normalize_art_path(gen["file"])
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
