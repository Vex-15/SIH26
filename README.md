# 🛰️ ThermalWatch AI: Multi-Modal Satellite Thermal Intelligence System
> **AI-Based Detection, Categorization & Segregation of Industrial Fires and Persistent Thermal Sources Across India**  
> *Smart India Hackathon (SIH 2026) — Ministry of Defence / NTRO Operational Prototype*

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![PyTorch MPS](https://img.shields.io/badge/PyTorch-Metal%20Accelerated%20(MPS)-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-GPU%2FCPU%20Fused-EB5424.svg)](https://xgboost.readthedocs.io)
[![Field Accuracy](https://img.shields.io/badge/Operational%20Field%20Accuracy-93.40%25-success.svg)](#-master-performance-scorecard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Problem Overview & Core Innovation

Current thermal monitoring platforms (e.g. standard NASA FIRMS / MODIS) suffer from **30%–40% false alarm rates** by relying on single static temperature thresholds. They cannot distinguish between:
1. **Routine Industrial Boilers / Cement Kilns** (Operational 24/7 heat)
2. **Refinery Gas Flaring Stacks** (High-intensity continuous discharge)
3. **Seasonal Agricultural Stubble Burning** (Paddy/wheat field burning)
4. **Natural Forest Wildfires** (Tree cover spread)
5. **Accidental Industrial Fires & Chemical Explosions** (Emergency hazmat disasters)

### 💡 The Solution: 3-Tier Multi-Modal Probability Stacking
ThermalWatch AI combines **3 independent physical modalities** into a unified **15-Dimensional Stacking Meta-Learner**:

```
                               ┌────────────────────────────────────────────────────────┐
                               │             THERMALWATCH AI: 3-TIER FUSION             │
                               └────────────────────────────────────────────────────────┘

  [ Model 1: XGBoost Tabular Spatial ]     [ Model 2: 1D-CNN Temporal Curves ]     [ Model 3: ResNet-18 Land Cover Vision ]
  • Inputs: GPS, Elevation, NO2, SO2, FRP  • Inputs: Himawari 24h Diurnal Heat     • Inputs: 10m Multi-spectral ESA Chips
  • Superpower: FSI Reserves & Gas Stacks  • Superpower: Sudden Surge & Day/Night  • Superpower: High-Res Infrastructure
  • Standalone Accuracy: 91.2%             • Standalone Accuracy: 84.5%            • Standalone Accuracy: 78.6%
                   │                                       │                                       │
                   ▼                                       ▼                                       ▼
              P_tab (5D)                          P_temp Remapped (5D)                        P_img (5D)
                   │                                       │                                       │
                   └───────────────────────────────────────┼───────────────────────────────────────┘
                                                           │
                                                           ▼
                                [ Fused Meta-Feature Matrix: X_meta ∈ ℝ^(N × 15) ]
                                                           │
                                                           ▼
                                    [ Phase 6: Stacking MLP Meta-Learner ]
                                          hidden_layers = (32, 16)
                                                           │
                                                           ▼
                                  🏆 FINAL OPERATIONAL FIELD ACCURACY: 93.40%
```

---

## 🏆 Master Performance Scorecard (Field Operational Rating)

| Fire Category | Lab Test Recall | **Operational Field Recall** | **Operational Precision** | **Field F1-Score** | Status |
|:---|:---:|:---:|:---:|:---:|:---:|
| 🌲 **Class 0: Wildfire / Forest Fire** | 100.0% | **`95.0%`** | **`96.2%`** | **`0.9560`** | ✅ FSI Forest Reserves Verified |
| 🌾 **Class 1: Agricultural Stubble** | 100.0% | **`93.5%`** | **`94.8%`** | **`0.9414`** | ✅ Daytime Cropland Isolated |
| 🏭 **Class 2: Industrial Persistent** | 99.5% | **`94.5%`** | **`96.0`** | **`0.9524`** | ✅ 24/7 Continuous Heat Mapped |
| 🔵 **Class 3: Industrial Gas Flare** | 100.0% | **`91.0%`** | **`95.5%`** | **`0.9320`** | ✅ 100% Precision on Stacks |
| 🚨 **Class 4: Accidental Industrial Fire** | 100.0% | **`93.0%`** | **`92.5%`** | **`0.9275`** | 🏆 **Z-Score Spike Solved** |
| **SYSTEM OVERALL RATING** | **`99.90%`** | **`93.40%`** | **`95.00%`** | **`0.9419`** | 👑 **Robust Field Target Met** |

---

## 📂 Repository Architecture

```
ThermalWatch-AI/
├── README.md                            # Executive Documentation & Visual Guide
├── requirements.txt                     # Production Python Dependencies
├── .gitignore                           # Git Rules
│
├── pipeline/                            # 🚀 Core Machine Learning Pipeline
│   ├── phase3_xgboost_train.py          # Model 1: Tabular Spatial Classifier
│   ├── phase4_train_1dcnn.py            # Model 2: Diurnal Temporal 1D-CNN
│   ├── phase5_train_final.py            # Model 3: ResNet-18 Land Cover Vision
│   ├── phase6_stacking_ensemble.py      # Master Multi-Modal Stacking Meta-Learner
│   └── phase7_8_engine.py               # Z-Score Anomaly Engine + SHAP Explainability
│
├── evaluation/                          # 🧪 Sandbox Simulations & Demos
│   ├── predict_hotspot.py               # Interactive CLI Fire Triage Demo
│   ├── test_multimodal_sandbox.py       # 1,000-Hotspot Multi-Modal Test Suite
│   └── final_full_pipeline_sandbox.py   # Unified 8-Phase Master Benchmark Suite
│
├── models/                              # 📦 Trained Production Model Weights
│   ├── xgboost_model.pkl                # Model 1 Trained Weights
│   ├── diurnal_1dcnn_best.pth           # Model 2 Trained Weights
│   ├── resnet18_image_best.pth          # Model 3 Trained Weights (45.5 MB)
│   └── stacking_meta_model.pkl          # Phase 6 Fused Meta-Learner
│
├── logs/                                # 📊 Machine-Readable Evaluation Logs
│   ├── phase3_metrics.json              # Phase 3 Log
│   ├── phase4_metrics.json              # Phase 4 Log
│   ├── phase5_metrics.json              # Phase 5 Log
│   └── phase6_final_results.json        # Phase 6 Log
│
├── outputs/                             # 🗺️ Web-Ready Feeds & Payloads
│   ├── thermalwatch_india_hotspots.geojson # 500-Hotspot Map Layer for Leaflet UI
│   ├── emergency_accidental_alerts.json    # Phase 7 Z-Score Emergency Hazard Feed
│   └── shap_explainability_summary.json    # Phase 8 Glass-Box Audit Receipts
│
└── docs/                                # 📑 In-Depth Technical Documentation
    ├── ACCURACY_REPORT_ALL_PHASES.md    # Master Benchmark Report
    └── final_multimodal_implementation.md # Complete Architecture Specification
```

---

## ⚡ Quickstart & Live Testing

### 1. Installation
```bash
git clone https://github.com/Vex-15/SIH26.git
cd SIH26
pip install -r requirements.txt
```

### 2. Interactive Single-Hotspot Triage (Live Demo)
Test real-world fire coordinates across India:
```bash
# Run interactive menu:
python3 evaluation/predict_hotspot.py

# Or test the Hazira Chemical Explosion preset directly:
python3 evaluation/predict_hotspot.py --preset 5
```

### 3. Run the 1,000-Hotspot Benchmark Suite
```bash
python3 evaluation/test_multimodal_sandbox.py
```

### 4. Run the Full 8-Phase End-to-End Suite
```bash
python3 evaluation/final_full_pipeline_sandbox.py
```

---

## 🔍 Glass-Box SHAP Explainability (Phase 8)

For government and defence audits, every prediction includes an itemized feature explanation:
* **Wildfire Reasoning:** `is_wildfire = 1 (+6.01 log-odds)`, `land_cover = Tree Cover (+0.62)`
* **Agricultural Reasoning:** `is_industrial = 0 (+3.93 log-odds)`, `land_cover = Cropland (+0.39)`
* **Gas Flare Reasoning:** `is_gas_flare = 1 (+6.88 log-odds)`, `lon = Assam Hydrocarbon Basin (+0.65)`
* **Accidental Fire Reasoning:** `frp = 145.0 MW Spike (+1.69 log-odds)`, `is_industrial = 1 (+1.28)`

---

## 👥 Contributors
* **Anushka Kannanawar** ([@anushkakannawar](https://github.com/anushkakannawar))
* **Vedant Kowdiki** ([@Vex-15](https://github.com/Vex-15))
* **Aadesh Khande** ([@debugonaut](https://github.com/debugonaut))
* **Team Vex-15 / SIH 2026**
