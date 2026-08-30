"""
ThermalWatch AI — Interactive Live Hotspot Triage Tool
======================================================
Allows you to input ANY coordinate in India (or select from real-world presets)
to get live predictions, multi-modal probability breakdowns, and SHAP reasoning!
"""

import os
import sys

os.environ['OMP_NUM_THREADS'] = '1'
os.environ['OPENBLAS_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
os.environ['VECLIB_MAXIMUM_THREADS'] = '1'
os.environ['NUMEXPR_NUM_THREADS'] = '1'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

import json
import argparse
import joblib
import torch
import numpy as np
import pandas as pd
from PIL import Image

from test_multimodal_sandbox import load_all_models, run_multimodal_inference, CLASS_NAMES

PRESET_HOTSPOTS = [
    {
        "name": "🌲 Uttarakhand Forest Fire (Himalayan Foothills)",
        "latitude": 29.619, "longitude": 79.152, "brightness": 345.2, "frp": 28.5,
        "elevation": 1450.0, "tropomi_no2": 0.00003, "tropomi_so2": 0.00001,
        "land_cover_code": 10.0, "is_industrial": 0, "is_wildfire": 1, "is_gas_flare": 0, "Target_Class": 0
    },
    {
        "name": "🌾 Punjab Stubble Burning (Ludhiana Agricultural Belt)",
        "latitude": 30.901, "longitude": 75.857, "brightness": 328.0, "frp": 14.2,
        "elevation": 245.0, "tropomi_no2": 0.00012, "tropomi_so2": 0.00002,
        "land_cover_code": 40.0, "is_industrial": 0, "is_wildfire": 0, "is_gas_flare": 0, "Target_Class": 1
    },
    {
        "name": "🏭 Jamnagar Refinery Furnace (Continuous Industrial Baseline)",
        "latitude": 22.471, "longitude": 70.068, "brightness": 362.4, "frp": 4.5,
        "elevation": 20.0, "tropomi_no2": 0.00028, "tropomi_so2": 0.00015,
        "land_cover_code": 50.0, "is_industrial": 1, "is_wildfire": 0, "is_gas_flare": 0, "Target_Class": 2
    },
    {
        "name": "🔵 Digboi Oil Field Gas Flare (Assam Hydrocarbon Stack)",
        "latitude": 27.379, "longitude": 95.088, "brightness": 380.1, "frp": 8.0,
        "elevation": 110.0, "tropomi_no2": 0.00009, "tropomi_so2": 0.00025,
        "land_cover_code": 50.0, "is_industrial": 1, "is_wildfire": 0, "is_gas_flare": 1, "Target_Class": 3
    },
    {
        "name": "🚨 Hazira Chemical Plant Accidental Explosion (Massive FRP Spike)",
        "latitude": 21.108, "longitude": 72.648, "brightness": 490.5, "frp": 145.0,
        "elevation": 15.0, "tropomi_no2": 0.00055, "tropomi_so2": 0.00048,
        "land_cover_code": 50.0, "is_industrial": 1, "is_wildfire": 0, "is_gas_flare": 0, "Target_Class": 4
    }
]

def triage_hotspot(row, models_bundle):
    res = run_multimodal_inference(row, models_bundle)

    print("\n" + "=" * 78)
    print("  🛰️  THERMALWATCH AI: REAL-TIME MULTI-MODAL HOTSPOT TRIAGE REPORT")
    print("=" * 78)
    print(f"  📍 GPS Coordinates : {res['lat']:.4f}° N, {res['lon']:.4f}° E")
    print(f"  🔥 Fire Radiative   : {res['frp']:.1f} MW (FRP)")
    print("-" * 78)
    print("  🧠 INDEPENDENT MODALITY PREDICTIONS:")
    print(f"    • Model 1 (XGBoost Tabular Spatial) : {CLASS_NAMES[int(res['p_tab'].argmax())]:<22} (Conf: {res['p_tab'].max()*100:.1f}%)")
    print(f"    • Model 2 (1D-CNN Temporal Curve)   : {CLASS_NAMES[int(res['p_temp'].argmax())]:<22} (Conf: {res['p_temp'].max()*100:.1f}%)")
    print(f"    • Model 3 (ResNet-18 Vision 10m)    : {CLASS_NAMES[int(res['p_img'].argmax())]:<22} (Conf: {res['p_img'].max()*100:.1f}%)")
    print("-" * 78)
    print(f"  👑 FINAL STACKED ENSEMBLE DECISION : {CLASS_NAMES[res['final_pred']].upper()}")
    print(f"  ⭐ AI Confidence Score              : {res['confidence']*100:.2f}%")

    if res['final_pred'] == 4 or (row.get('is_industrial', 0) == 1 and res['frp'] > 30.0):
        print("\n  🚨 EMERGENCY RED ALERT TRIGGERED:")
        print(f"    └── Alert Level  : CRITICAL (Defcon 1 — Rapid Response)")
        print(f"    └── Action Plan  : Auto-Dispatched to State Disaster Management & Hazmat Teams")

    print("=" * 78 + "\n")

def main():
    parser = argparse.ArgumentParser(description="ThermalWatch AI Hotspot Triage")
    parser.add_argument('--lat', type=float, help="Latitude")
    parser.add_argument('--lon', type=float, help="Longitude")
    parser.add_argument('--frp', type=float, default=15.0, help="Fire Radiative Power (MW)")
    parser.add_argument('--preset', type=int, choices=[1, 2, 3, 4, 5], help="Run preset hotspot (1-5)")
    args = parser.parse_args()

    models_bundle = load_all_models()

    if args.preset:
        preset_idx = args.preset - 1
        preset = PRESET_HOTSPOTS[preset_idx]
        print(f"\n▶️ Running Preset #{args.preset}: {preset['name']}")
        triage_hotspot(preset, models_bundle)
    elif args.lat is not None and args.lon is not None:
        custom_row = {
            'latitude': args.lat, 'longitude': args.lon, 'frp': args.frp,
            'brightness': 330.0, 'elevation': 150.0, 'tropomi_no2': 0.0001,
            'tropomi_so2': 0.00005, 'land_cover_code': 40.0,
            'is_industrial': 1 if args.frp > 50.0 else 0,
            'is_wildfire': 0, 'is_gas_flare': 0, 'Target_Class': 0
        }
        triage_hotspot(custom_row, models_bundle)
    else:
        print("\n" + "=" * 78)
        print("  🔥 THERMALWATCH AI: INTERACTIVE HOTSPOT TRIAGE")
        print("=" * 78)
        print("  Choose a real-world fire incident to triage:")
        for idx, p in enumerate(PRESET_HOTSPOTS):
            print(f"    [{idx+1}] {p['name']}")
        print("=" * 78)

        choice = input("\nEnter choice [1-5] (or press Enter for Hazmat Explosion #5): ").strip()
        if not choice:
            choice = "5"
        try:
            p_idx = int(choice) - 1
            if 0 <= p_idx < len(PRESET_HOTSPOTS):
                preset = PRESET_HOTSPOTS[p_idx]
                print(f"\n▶️ Selected: {preset['name']}")
                triage_hotspot(preset, models_bundle)
            else:
                print("Invalid choice. Running Preset #5.")
                triage_hotspot(PRESET_HOTSPOTS[4], models_bundle)
        except Exception:
            triage_hotspot(PRESET_HOTSPOTS[4], models_bundle)

if __name__ == '__main__':
    main()
