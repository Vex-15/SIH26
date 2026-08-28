"""
Phase 3 — Model 1: Tabular Classifier (XGBoost)
================================================
5-Class Fire Classification from satellite tabular data.
Classes:
  0: Wildfire / Forest Fire
  1: Agricultural Stubble Burning
  2: Industrial Persistent Source
  3: Industrial Gas Flare
  4: Accidental Industrial Fire / Explosion

Fixes from pre-flight audit applied:
  - Target column: Target_Class (not Target_Class_5)
  - All 11 features used (not just 6)
  - Preprocessing: brightness median impute per source, land_cover_code fill 0
  - Sample weights to handle 643x class imbalance
  - models/ directory auto-created
  - early_stopping_rounds to prevent overfitting
  - P_tab_val.npy saved for Phase 6 stacking
"""

import os
import time
import numpy as np
import pandas as pd
import xgboost as xgb
import joblib
import json
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, confusion_matrix,
    balanced_accuracy_score, f1_score
)
from sklearn.utils.class_weight import compute_sample_weight

# ── Directories ───────────────────────────────────────────────────────────────
os.makedirs("models", exist_ok=True)
os.makedirs("logs",   exist_ok=True)

CLASS_NAMES = ['Wildfire', 'Agricultural', 'Industrial', 'GasFlare', 'Accidental']
CSV_PATH    = r"C:\Users\Dell\Documents\GitHub\SIH26\master_2024_training (1).csv"

# ─────────────────────────────────────────────────────────────────────────────
# 1. LOAD
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 65)
print("PHASE 3  —  XGBoost 5-Class Fire Classifier")
print("=" * 65)

t0 = time.time()
print(f"\n[1/6] Loading dataset: {CSV_PATH}")
df = pd.read_csv(CSV_PATH)
print(f"      Loaded {df.shape[0]:,} rows x {df.shape[1]} cols  ({time.time()-t0:.1f}s)")

# ─────────────────────────────────────────────────────────────────────────────
# 2. PREPROCESSING
# ─────────────────────────────────────────────────────────────────────────────
print("\n[2/6] Preprocessing ...")

# brightness: median impute per satellite source (3.55% NULLs)
# Fallback to global median if a source group has ALL-NULL brightness
before = df['brightness'].isnull().sum()
global_brightness_median = df['brightness'].median()
df['brightness'] = df.groupby('source')['brightness'].transform(
    lambda x: x.fillna(x.median() if x.notna().any() else global_brightness_median)
)
df['brightness'] = df['brightness'].fillna(global_brightness_median)  # final safety net
after = df['brightness'].isnull().sum()
print(f"      brightness NULLs: {before:,} -> {after} (per-source median + global fallback={global_brightness_median:.2f})")

# land_cover_code: fill with 0 = Unknown (0.30% NULLs)
before = df['land_cover_code'].isnull().sum()
df['land_cover_code'] = df['land_cover_code'].fillna(0.0)
after = df['land_cover_code'].isnull().sum()
print(f"      land_cover_code NULLs: {before:,} -> {after} (filled with 0 = Unknown)")

# Verify no remaining NULLs in feature cols
feature_cols = [
    'latitude', 'longitude', 'brightness', 'frp', 'elevation',
    'tropomi_no2', 'tropomi_so2', 'land_cover_code',
    'is_industrial', 'is_wildfire', 'is_gas_flare'
]
remaining_nulls = df[feature_cols].isnull().sum().sum()
print(f"      Remaining NULLs in feature matrix: {remaining_nulls}")
assert remaining_nulls == 0, "ERROR: NULLs remain in features!"

# ─────────────────────────────────────────────────────────────────────────────
# 3. FEATURE MATRIX & TARGET
# ─────────────────────────────────────────────────────────────────────────────
print("\n[3/6] Building feature matrix X and target y ...")

X = df[feature_cols].astype('float32')
y = df['Target_Class'].astype('int32')

print(f"      Feature matrix X: {X.shape}")
print("      Target y -- class distribution:")
vc = y.value_counts().sort_index()
total = len(y)
for cls, cnt in vc.items():
    print(f"        Class {cls} ({CLASS_NAMES[cls]:>12s}): {cnt:>9,}  ({100*cnt/total:.2f}%)")
print(f"      Imbalance ratio: {vc.max()/vc.min():.1f}x")

# ─────────────────────────────────────────────────────────────────────────────
# 4. TRAIN / VALIDATION SPLIT  (stratified)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[4/6] Train/Validation split (80/20, stratified) ...")

X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"      Train: {len(X_train):,}  |  Val: {len(X_val):,}")

# Class-balanced sample weights (handles 643x imbalance)
sample_weights_train = compute_sample_weight(class_weight='balanced', y=y_train)
print(f"      Sample weights applied -- min: {sample_weights_train.min():.4f}  max: {sample_weights_train.max():.2f}")

# ─────────────────────────────────────────────────────────────────────────────
# 5. XGBOOST TRAINING
# ─────────────────────────────────────────────────────────────────────────────
print("\n[5/6] Training XGBoost 5-class classifier ...")
print("      n_estimators=500, max_depth=8, lr=0.03, early_stopping=30")
print("      (will stop early if val mlogloss does not improve for 30 rounds)\n")

xgb_model = xgb.XGBClassifier(
    n_estimators          = 500,
    max_depth             = 8,
    learning_rate         = 0.03,
    subsample             = 0.85,
    colsample_bytree      = 0.8,
    min_child_weight      = 5,
    gamma                 = 0.1,
    reg_alpha             = 0.1,
    reg_lambda            = 1.0,
    objective             = 'multi:softprob',
    num_class             = 5,
    eval_metric           = 'mlogloss',
    tree_method           = 'hist',
    device                = 'cpu',
    early_stopping_rounds = 30,
    random_state          = 42,
    n_jobs                = -1,
    verbosity             = 1
)

t_train = time.time()
xgb_model.fit(
    X_train, y_train,
    sample_weight = sample_weights_train,
    eval_set      = [(X_val, y_val)],
    verbose       = 50
)
train_time = time.time() - t_train
print(f"\n      Training complete in {train_time/60:.1f} min")
print(f"      Best iteration: {xgb_model.best_iteration}")
print(f"      Best val mlogloss: {xgb_model.best_score:.4f}")

# ─────────────────────────────────────────────────────────────────────────────
# 6. EVALUATION
# ─────────────────────────────────────────────────────────────────────────────
print("\n[6/6] Evaluating on validation set ...")

y_pred        = xgb_model.predict(X_val)
P_tab_val     = xgb_model.predict_proba(X_val)

acc           = (y_pred == y_val.values).mean()
bal_acc       = balanced_accuracy_score(y_val, y_pred)
macro_f1      = f1_score(y_val, y_pred, average='macro')
weighted_f1   = f1_score(y_val, y_pred, average='weighted')

print(f"\n{'='*65}")
print(f"  VALIDATION METRICS")
print(f"{'='*65}")
print(f"  Standard Accuracy    : {acc*100:.2f}%")
print(f"  Balanced Accuracy    : {bal_acc*100:.2f}%  <- key metric (handles imbalance)")
print(f"  Macro F1-Score       : {macro_f1*100:.2f}%  <- key metric (all classes equal)")
print(f"  Weighted F1-Score    : {weighted_f1*100:.2f}%")

print(f"\n{'='*65}")
print(f"  PER-CLASS REPORT")
print(f"{'='*65}")
print(classification_report(y_val, y_pred, target_names=CLASS_NAMES, digits=4))

print(f"  CONFUSION MATRIX (rows=actual, cols=predicted)")
cm = confusion_matrix(y_val, y_pred)
cm_df = pd.DataFrame(cm, index=CLASS_NAMES, columns=CLASS_NAMES)
print(cm_df.to_string())

print(f"\n{'='*65}")
print(f"  TOP FEATURE IMPORTANCES (gain)")
print(f"{'='*65}")
imp = xgb_model.get_booster().get_score(importance_type='gain')
imp_series = pd.Series(imp).sort_values(ascending=False)
for feat, score in imp_series.items():
    bar = 'X' * int(score / imp_series.max() * 30)
    print(f"  {feat:20s}: {score:>10.2f}  {bar}")

# ─────────────────────────────────────────────────────────────────────────────
# 7. SAVE
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{'='*65}")
print("  SAVING ARTIFACTS")
print(f"{'='*65}")

joblib.dump(xgb_model, 'models/xgboost_model.pkl')
np.save('models/P_tab_val.npy', P_tab_val)
np.save('models/y_val.npy',     y_val.values)

val_indices = y_val.index.tolist()
with open('models/val_indices.json', 'w') as f:
    json.dump(val_indices, f)

metrics = {
    'model': 'XGBoost',
    'phase': 3,
    'train_rows': int(len(X_train)),
    'val_rows': int(len(X_val)),
    'features': feature_cols,
    'n_features': len(feature_cols),
    'best_iteration': int(xgb_model.best_iteration),
    'best_val_mlogloss': float(xgb_model.best_score),
    'standard_accuracy': float(round(acc, 4)),
    'balanced_accuracy': float(round(bal_acc, 4)),
    'macro_f1': float(round(macro_f1, 4)),
    'weighted_f1': float(round(weighted_f1, 4)),
    'train_time_min': float(round(train_time/60, 2)),
    'P_tab_val_shape': list(P_tab_val.shape),
    'class_names': CLASS_NAMES
}
with open('logs/phase3_metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)

print(f"  models/xgboost_model.pkl   -- Trained model")
print(f"  models/P_tab_val.npy       -- Val probabilities {P_tab_val.shape} (needed for Phase 6)")
print(f"  models/y_val.npy           -- Val ground truth  (needed for Phase 6)")
print(f"  models/val_indices.json    -- Val row indices   (needed for Phase 6)")
print(f"  logs/phase3_metrics.json   -- Metrics summary")

total_time = time.time() - t0
print(f"\n{'='*65}")
print(f"  PHASE 3 COMPLETE  --  Total time: {total_time/60:.1f} min")
print(f"{'='*65}")
