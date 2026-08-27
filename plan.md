# 🎯 MAXIMUM ACCURACY PLAN: CNN + XGBoost + ResNet18
## Target: 85-88% Accuracy - Industrial Fire Classification

---

## 📊 **STRATEGY OVERVIEW**

**Three-Model Hybrid System:**
1. **XGBoost** → Tabular features (FRP, distance, persistence) → 76-80% alone
2. **ResNet18** → Satellite imagery (224×224 chips) → 72-76% alone  
3. **CNN (EfficientNet-B3)** → Satellite imagery alternative → 70-75% alone
4. **Ensemble Fusion** → Combine all three → **85-88% final**

---

## 🗓️ **4-WEEK TIMELINE**

### **Week 1: Data Preparation**
- Days 1-2: Data collection
- Days 3-4: Preprocessing + EDA
- Days 5-7: Feature engineering + Labeling

### **Week 2: Tabular Model (XGBoost)**
- Days 8-10: Train XGBoost (baseline 76-80%)
- Days 11-12: Hyperparameter tuning
- Days 13-14: Evaluate + optimize

### **Week 3: Image Models (CNN + ResNet18)**
- Days 15-17: Download imagery + preprocessing
- Days 18-19: Train ResNet18
- Days 20-21: Train EfficientNet-B3 CNN

### **Week 4: Fusion + Deployment**
- Days 22-23: Ensemble fusion (late/learned)
- Days 24-25: Final optimization
- Days 26-27: Deployment (API + Dashboard)
- Day 28: Testing + documentation

---

## 📋 **COMPLETE STEP-BY-STEP WORKFLOW**

---

## **PHASE 1: DATA COLLECTION** (Days 1-2)

### **Step 1.1: Thermal Hotspot Data (FIRMS)**
**Status:** ✅ You already have this!

Files you have:
- ✅ `FIRMS VIIRS NOAA-20` 
- ✅ `FIRMS VIIRS S-NPP`
- ✅ `MODIS_india`

**Action:**
```bash
# Copy your FIRMS file to project
Copy-Item "path/to/3.FIRMS VIIRS NOAA-20" -Destination "E:\SIH\data\raw\firms_hotspots.csv"
```

**Expected:** 8,000-15,000 hotspots (Punjab/Haryana, 6 months)

---

### **Step 1.2: Industrial Facility Data (OSM)**
**Status:** ✅ You already have this!

File you have:
- ✅ `INDIA Osm dataset`

**Action:**
```bash
# Copy OSM file
Copy-Item "path/to/INDIA Osm dataset" -Destination "E:\SIH\data\raw\osm_infrastructure.geojson"
```

---

### **Step 1.3: Land Cover Data**
**Status:** ❌ Need to download

**Download Link:**
https://lpdaac.usgs.gov/products/mcd12q1v061/

**Alternative (Faster - 5 min):**
Google Earth Engine Code:
```javascript
// Run in: https://code.earthengine.google.com/
var landcover = ee.ImageCollection('MODIS/006/MCD12Q1')
  .filterDate('2023-01-01', '2023-12-31')
  .first()
  .select('LC_Type1');

var punjabHaryana = ee.Geometry.Rectangle([73.9, 27.7, 77.6, 32.5]);

Export.image.toDrive({
  image: landcover.clip(punjabHaryana),
  description: 'landcover_punjab_haryana',
  scale: 500,
  region: punjabHaryana,
  fileFormat: 'GeoTIFF'
});
```

**Or I can generate sample land cover data for you now!**

---

### **Step 1.4: Satellite Imagery (for CNN/ResNet18)**
**Status:** ⚠️ Need to download (Week 3)

**Method 1: Google Earth Engine (Recommended)**
```python
import ee
ee.Initialize()

# For each hotspot, download 224×224 image chip
# Sentinel-2 RGB + NIR + SWIR bands
```

**Method 2: Use existing imagery**
You have: `terrascope_download_20260827_144951.zip`
- Check if this contains imagery!

**Expected:** 8,000-15,000 image chips (224×224×3 or 224×224×6 bands)

---

## **PHASE 2: DATA PREPROCESSING** (Days 3-4)

### **Step 2.1: Clean FIRMS Data**

**Script:** `scripts/01_preprocess_firms.py`

```python
import pandas as pd
import numpy as np

# Load
df = pd.read_csv('data/raw/firms_hotspots.csv')

# Clean
df = df.dropna(subset=['latitude', 'longitude', 'frp'])
df = df[(df['frp'] >= 0) & (df['frp'] < 10000)]
df = df[(df['brightness'] > 270) & (df['brightness'] < 2500)]

# Remove duplicates
df = df.drop_duplicates(subset=['latitude', 'longitude', 'acq_date', 'acq_time'])

# Add ID
df['hotspot_id'] = range(len(df))

# Save
df.to_csv('data/processed/firms_cleaned.csv', index=False)
print(f"Cleaned: {len(df)} hotspots")
```

**Runtime:** 5 minutes  
**Output:** `data/processed/firms_cleaned.csv`

---

### **Step 2.2: Process OSM Data**

**Script:** `scripts/02_preprocess_osm.py`

```python
import geopandas as gpd

# Load
osm_gdf = gpd.read_file('data/raw/osm_infrastructure.geojson')

# Filter to Punjab/Haryana
osm_gdf = osm_gdf[
    (osm_gdf.geometry.centroid.y.between(27.7, 32.5)) &
    (osm_gdf.geometry.centroid.x.between(73.9, 77.6))
]

# Extract facility types
osm_gdf['facility_type'] = osm_gdf['tags'].apply(extract_facility_type)

# Save
osm_gdf.to_file('data/processed/osm_facilities.geojson', driver='GeoJSON')
print(f"Facilities: {len(osm_gdf)}")
```

**Runtime:** 2 minutes  
**Output:** `data/processed/osm_facilities.geojson`

---

## **PHASE 3: EXPLORATORY DATA ANALYSIS** (Days 3-4)

### **Step 3.1: Temporal Patterns**

```python
import matplotlib.pyplot as plt
import seaborn as sns

df['acq_date'] = pd.to_datetime(df['acq_date'])
df['month'] = df['acq_date'].dt.month

# Monthly distribution
monthly = df.groupby('month').size()
monthly.plot(kind='bar', title='Hotspots per Month')
plt.savefig('outputs/eda_monthly.png')

# Look for Oct-Nov spike (agricultural burning)
```

**Key Insights:**
- Oct-Nov spike? → Agricultural fires
- Consistent baseline? → Industrial fires
- Day vs night ratio? → Gas flares (night-biased)

---

### **Step 3.2: Spatial Patterns**

```python
import geopandas as gpd

# Plot hotspots + facilities
fig, ax = plt.subplots(figsize=(15, 12))
firms_gdf.plot(ax=ax, color='red', markersize=2, alpha=0.5)
osm_gdf.plot(ax=ax, color='blue', markersize=20, marker='^')
plt.savefig('outputs/eda_spatial.png')
```

**Key Insights:**
- Clustering near facilities? → Industrial
- Rural clusters in Oct-Nov? → Agricultural
- Linear patterns? → Road/railway accidents

---

## **PHASE 4: FEATURE ENGINEERING** (Days 5-7)

### **Step 4.1: Geospatial Features**

**Script:** `scripts/08_feature_geospatial.py`

```python
from scipy.spatial import cKDTree

# Distance to nearest industrial facility
firms_coords = np.array(list(zip(firms_gdf.geometry.x, firms_gdf.geometry.y)))
osm_coords = np.array(list(zip(osm_gdf.geometry.x, osm_gdf.geometry.y)))

tree = cKDTree(osm_coords)
distances, indices = tree.query(firms_coords)

df['distance_to_industrial'] = distances  # meters
df['nearest_facility_type'] = [osm_gdf.iloc[idx]['facility_type'] for idx in indices]
```

**Features created:**
- `distance_to_industrial` (key feature!)
- `nearest_facility_type`

---

### **Step 4.2: Temporal Features**

```python
# Historical persistence
df['persistence_days'] = calculate_persistence(df)  # How many days fire detected
df['frp_mean_30d'] = calculate_rolling_mean(df, window=30)
df['frp_std_30d'] = calculate_rolling_std(df, window=30)
df['frp_cv'] = df['frp_std_30d'] / df['frp_mean_30d']  # Coefficient of variation
```

**Features created:**
- `persistence_days` (key for industrial vs wildfire!)
- `frp_mean_30d`, `frp_std_30d`, `frp_cv`

---

### **Step 4.3: Spatial Pattern Features**

```python
from sklearn.neighbors import BallTree

# Cluster size (how many fires nearby)
tree = BallTree(coords, metric='haversine')
radius = 1.0 / 6371.0  # 1 km
counts = tree.query_radius(coords, r=radius, count_only=True)
df['cluster_size'] = counts
```

**Features created:**
- `cluster_size` (large clusters = agricultural/wildfire)

---

### **Step 4.4: Land Cover Features**

```python
import rasterio

# Extract land cover class at each hotspot
with rasterio.open('data/raw/landcover.tif') as src:
    for idx, row in df.iterrows():
        py, px = rowcol(src.transform, row['longitude'], row['latitude'])
        landcover_class = src.read(1, window=((py, py+1), (px, px+1)))[0, 0]
        df.loc[idx, 'landcover_class'] = landcover_class
```

**Land cover classes:**
- 12 = Cropland → Agricultural fires
- 1-9 = Forest/Shrubland → Wildfire
- 13 = Urban → Industrial/Accidental

---

### **Step 4.5: Final Feature Set**

**Total: 20-25 features**

**From FIRMS:**
1. `frp` (Fire Radiative Power)
2. `brightness` (Temperature)
3. `confidence` (Detection confidence)
4. `is_night` (Day=0, Night=1)

**Temporal:**
5. `month`
6. `day_of_year`
7. `persistence_days`
8. `frp_mean_30d`
9. `frp_std_30d`
10. `frp_cv`

**Geospatial:**
11. `distance_to_industrial` ⭐ KEY FEATURE
12. `landcover_class`

**Spatial Patterns:**
13. `cluster_size`
14. `coord_variance`

**Spectral (from imagery - later):**
15. `ndvi` (Normalized Difference Vegetation Index)
16. `nbr` (Normalized Burn Ratio)

---

## **PHASE 5: DATA LABELING** (Days 5-7)

### **Step 5.1: Weak Supervision Rules**

**Script:** `scripts/13_weak_labeling.py`

```python
def assign_label(row):
    # Rule 1: Industrial Steady-State
    if (row['distance_to_industrial'] < 500 and
        row['persistence_days'] >= 20 and
        row['frp_cv'] < 0.3):
        return 'industrial_steady'
    
    # Rule 2: Gas Flare
    if (row['brightness'] > 1200 and
        row['persistence_days'] >= 25 and
        row['is_night'] == 1 and
        row['distance_to_industrial'] < 2000):
        return 'gas_flare'
    
    # Rule 3: Agricultural Burning
    if (row['landcover_class'] == 12 and  # Cropland
        row['month'] in [4, 5, 10, 11] and
        row['persistence_days'] <= 5):
        return 'agricultural_burning'
    
    # Rule 4: Wildfire
    if (row['landcover_class'] in range(1, 10) and  # Forest
        row['cluster_size'] > 3 and
        row['frp_cv'] > 0.5):
        return 'wildfire'
    
    # Rule 5: Accidental Fire
    if (row['distance_to_industrial'] < 500 and
        row['frp'] > (row['frp_mean_30d'] + 3 * row['frp_std_30d']) and
        row['persistence_days'] <= 3):
        return 'accidental_fire'
    
    # Rule 6: Mining (if mining data available)
    # Skip for now
    
    return 'unlabeled'

df['label'] = df.apply(assign_label, axis=1)
```

**Expected label distribution:**
```
agricultural_burning:  35-45% (if includes Oct-Nov)
industrial_steady:     20-25%
wildfire:              12-18%
gas_flare:             8-12%
accidental_fire:       2-5%
unlabeled:             10-15% (discard these)
```

---

### **Step 5.2: Manual Validation (Sample)**

```python
# Sample 50 per class
validation_samples = df.groupby('label').sample(50, random_state=42)

# Export for manual checking in Google Earth
validation_samples.to_csv('data/manual_validation.csv')
```

**Manual validation:**
1. Open Google Earth
2. For each sample, navigate to (lat, lon)
3. Check if label matches visual inspection
4. Target precision: >70% per class

---

## **PHASE 6: DATASET PREPARATION** (Day 7)

### **Step 6.1: Train/Val/Test Split**

```python
from sklearn.model_selection import train_test_split

# Remove unlabeled
df_labeled = df[df['label'] != 'unlabeled']

# Features
feature_cols = [
    'frp', 'brightness', 'confidence', 'is_night',
    'month', 'day_of_year',
    'distance_to_industrial', 'landcover_class',
    'persistence_days', 'frp_mean_30d', 'frp_std_30d', 'frp_cv',
    'cluster_size'
]

X = df_labeled[feature_cols]
y = df_labeled['label']

# Split: 70% train, 10% val, 20% test
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.125, random_state=42, stratify=y_temp
)

# Save
X_train.to_csv('data/ml_ready/X_train.csv', index=False)
y_train.to_csv('data/ml_ready/y_train.csv', index=False)
# ... similar for val/test
```

**Dataset sizes:**
- Train: ~7,000-10,000 samples
- Val: ~1,000-1,500 samples
- Test: ~2,000-3,000 samples

---

## **PHASE 7: MODEL 1 - XGBoost (Tabular)** (Days 8-14)

### **Step 7.1: Train XGBoost**

**Script:** `scripts/17_train_xgboost.py`

```python
import xgboost as xgb
from sklearn.preprocessing import LabelEncoder

# Encode labels
le = LabelEncoder()
y_train_enc = le.fit_transform(y_train)
y_val_enc = le.transform(y_val)

# Model
model = xgb.XGBClassifier(
    n_estimators=500,
    max_depth=8,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    gamma=0.5,
    min_child_weight=3,
    objective='multi:softprob',
    eval_metric='mlogloss',
    random_state=42
)

# Train
model.fit(
    X_train, y_train_enc,
    eval_set=[(X_val, y_val_enc)],
    early_stopping_rounds=50,
    verbose=10
)

# Save
joblib.dump(model, 'models/xgboost_model.pkl')
joblib.dump(le, 'models/label_encoder.pkl')
```

**Training time:** 30-60 minutes  
**Expected accuracy:** 76-80% on validation set

---

### **Step 7.2: Evaluate XGBoost**

```python
from sklearn.metrics import accuracy_score, classification_report

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test_enc, y_pred)

print(f"Test Accuracy: {accuracy:.4f}")
print(classification_report(y_test_enc, y_pred, target_names=le.classes_))
```

**Expected per-class F1:**
- Agricultural: 85-90%
- Industrial: 78-83%
- Wildfire: 70-75%
- Gas flare: 75-80%
- Accidental: 60-70%

---

### **Step 7.3: Feature Importance**

```python
import matplotlib.pyplot as plt

feature_importance = pd.DataFrame({
    'feature': X_train.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

print("Top 10 features:")
print(feature_importance.head(10))

# Plot
feature_importance.head(15).plot(
    x='feature', y='importance', kind='barh',
    title='XGBoost Feature Importance'
)
plt.savefig('outputs/feature_importance.png')
```

**Expected top features:**
1. `distance_to_industrial` ⭐
2. `frp_cv` (coefficient of variation)
3. `persistence_days`
4. `month` (seasonal)
5. `landcover_class`

---

## **PHASE 8: MODEL 2 - ResNet18 (Imagery)** (Days 15-21)

### **Step 8.1: Download Satellite Imagery**

**Method: Google Earth Engine**

**Script:** `scripts/download_sentinel2_imagery.py`

```python
import ee
ee.Initialize()

# For each hotspot
for idx, row in df_train.iterrows():
    lat, lon = row['latitude'], row['longitude']
    hotspot_id = row['hotspot_id']
    
    # Define region (500m × 500m around hotspot)
    point = ee.Geometry.Point([lon, lat])
    region = point.buffer(250).bounds()
    
    # Get Sentinel-2 image (closest date)
    date = row['acq_date']
    image = ee.ImageCollection('COPERNICUS/S2_SR') \
        .filterBounds(point) \
        .filterDate(date, date + timedelta(days=5)) \
        .first()
    
    # Select bands: RGB + NIR + SWIR
    bands = image.select(['B4', 'B3', 'B2', 'B8', 'B11', 'B12'])
    
    # Export (or use geemap to download)
    task = ee.batch.Export.image.toDrive({
        'image': bands,
        'description': f'hotspot_{hotspot_id}',
        'folder': 'firms_imagery',
        'scale': 10,
        'region': region,
        'fileFormat': 'GeoTIFF'
    })
    task.start()
```

**Alternative (Faster): Batch download via geemap**

```python
import geemap

# Download all at once
geemap.download_ee_image_collection(
    collection, 
    out_dir='data/imagery/',
    scale=10
)
```

**Expected:**
- 8,000-15,000 image chips
- Size: ~224×224×6 (6 bands)
- Total: ~10-20 GB

**Runtime:** 2-4 hours (parallel downloads)

---

### **Step 8.2: Preprocess Imagery**

```python
from PIL import Image
import numpy as np

def preprocess_image(image_path):
    # Load
    img = Image.open(image_path)
    
    # Resize to 224×224
    img = img.resize((224, 224))
    
    # Normalize
    img_array = np.array(img) / 255.0
    
    # If 6 bands, create false color composite
    # R=SWIR, G=NIR, B=Red (good for fire detection)
    
    return img_array

# Process all images
for img_file in image_files:
    processed = preprocess_image(img_file)
    np.save(f'data/imagery_processed/{img_file}.npy', processed)
```

---

### **Step 8.3: Train ResNet18**

**Script:** `scripts/18_train_resnet18.py`

```python
import torch
import torch.nn as nn
import torchvision.models as models
from torch.utils.data import Dataset, DataLoader

# Custom dataset
class FireImageDataset(Dataset):
    def __init__(self, image_paths, labels):
        self.image_paths = image_paths
        self.labels = labels
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        img = np.load(self.image_paths[idx])
        label = self.labels[idx]
        img = torch.FloatTensor(img).permute(2, 0, 1)  # HWC -> CHW
        return img, label

# Load pretrained ResNet18
model = models.resnet18(pretrained=True)

# Modify first layer for 6 channels (if using all Sentinel-2 bands)
model.conv1 = nn.Conv2d(6, 64, kernel_size=7, stride=2, padding=3, bias=False)

# Modify final layer for 6 classes
model.fc = nn.Linear(512, 6)  # 6 fire types

# Move to GPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)

# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Training loop
num_epochs = 30
for epoch in range(num_epochs):
    model.train()
    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device)
        
        # Forward
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    
    # Validation
    model.eval()
    val_accuracy = evaluate(model, val_loader)
    print(f"Epoch {epoch+1}/{num_epochs}, Val Accuracy: {val_accuracy:.4f}")

# Save
torch.save(model.state_dict(), 'models/resnet18_model.pth')
```

**Training time:** 4-6 hours on GPU (30 epochs)  
**Expected accuracy:** 72-76% on validation set

---

### **Step 8.4: Train EfficientNet-B3 (Alternative CNN)**

```python
from torchvision.models import efficientnet_b3

# Load pretrained
model = efficientnet_b3(pretrained=True)

# Modify for 6 input channels
# (EfficientNet architecture modification)

# Modify classifier
model.classifier = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(1536, 6)
)

# Train same as ResNet18
```

**Training time:** 5-7 hours on GPU  
**Expected accuracy:** 70-75% on validation set

---

## **PHASE 9: ENSEMBLE FUSION** (Days 22-23)

### **Step 9.1: Late Fusion (Weighted Average)**

**Script:** `scripts/21_ensemble_fusion.py`

```python
# Get predictions from all models
xgb_proba = xgb_model.predict_proba(X_test)       # Shape: (N, 6)
resnet_proba = resnet_model.predict(test_loader)  # Shape: (N, 6)
effnet_proba = effnet_model.predict(test_loader)  # Shape: (N, 6)

# Method 1: Simple average
ensemble_proba = (xgb_proba + resnet_proba + effnet_proba) / 3
ensemble_pred = ensemble_proba.argmax(axis=1)

accuracy = accuracy_score(y_test_enc, ensemble_pred)
print(f"Ensemble Accuracy: {accuracy:.4f}")
# Expected: 82-84%

# Method 2: Weighted average (optimize weights on validation set)
from scipy.optimize import minimize

def objective(weights):
    w_xgb, w_resnet, w_effnet = weights
    ensemble = w_xgb*xgb_proba_val + w_resnet*resnet_proba_val + w_effnet*effnet_proba_val
    pred = ensemble.argmax(axis=1)
    return -accuracy_score(y_val_enc, pred)  # Minimize negative accuracy

result = minimize(objective, x0=[0.33, 0.33, 0.33], 
                  bounds=[(0, 1), (0, 1), (0, 1)],
                  constraints={'type': 'eq', 'fun': lambda w: sum(w) - 1})

optimal_weights = result.x
print(f"Optimal weights: XGBoost={optimal_weights[0]:.2f}, "
      f"ResNet={optimal_weights[1]:.2f}, EfficientNet={optimal_weights[2]:.2f}")

# Apply to test set
ensemble_proba_test = (optimal_weights[0]*xgb_proba + 
                       optimal_weights[1]*resnet_proba + 
                       optimal_weights[2]*effnet_proba)
ensemble_pred_test = ensemble_proba_test.argmax(axis=1)

final_accuracy = accuracy_score(y_test_enc, ensemble_pred_test)
print(f"Optimized Ensemble Accuracy: {final_accuracy:.4f}")
# Expected: 84-86%
```

---

### **Step 9.2: Learned Fusion (Stacking)**

```python
# Train a meta-learner on top of base models

# Create meta-features (predictions from base models)
meta_train = np.hstack([
    xgb_model.predict_proba(X_train),    # 6 features
    resnet_proba_train,                   # 6 features
    effnet_proba_train                    # 6 features
])  # Total: 18 features

meta_val = np.hstack([
    xgb_model.predict_proba(X_val),
    resnet_proba_val,
    effnet_proba_val
])

# Train simple MLP meta-learner
from sklearn.neural_network import MLPClassifier

meta_model = MLPClassifier(
    hidden_layer_sizes=(32, 16),
    activation='relu',
    max_iter=500,
    random_state=42
)

meta_model.fit(meta_train, y_train_enc)

# Predict on test set
meta_test = np.hstack([xgb_proba, resnet_proba, effnet_proba])
stacked_pred = meta_model.predict(meta_test)

stacked_accuracy = accuracy_score(y_test_enc, stacked_pred)
print(f"Stacked Ensemble Accuracy: {stacked_accuracy:.4f}")
# Expected: 85-88%
```

---

## **PHASE 10: DEPLOYMENT** (Days 24-27)

### **Step 10.1: Create Prediction API**

**Script:** `api/main.py`

```python
from fastapi import FastAPI
import joblib
import torch

app = FastAPI()

# Load models
xgb_model = joblib.load('models/xgboost_model.pkl')
resnet_model = torch.load('models/resnet18_model.pth')
le = joblib.load('models/label_encoder.pkl')

@app.post("/predict")
async def predict(data: dict):
    # Extract tabular features
    tabular_features = extract_features(data)
    
    # Extract image (if provided)
    if 'image' in data:
        image = preprocess_image(data['image'])
        resnet_proba = resnet_model.predict(image)
    else:
        resnet_proba = None
    
    # XGBoost prediction
    xgb_proba = xgb_model.predict_proba([tabular_features])[0]
    
    # Ensemble
    if resnet_proba is not None:
        ensemble_proba = 0.6*xgb_proba + 0.4*resnet_proba
    else:
        ensemble_proba = xgb_proba
    
    pred_class = le.inverse_transform([ensemble_proba.argmax()])[0]
    confidence = ensemble_proba.max()
    
    return {
        "predicted_class": pred_class,
        "confidence": float(confidence),
        "probabilities": {
            class_name: float(prob)
            for class_name, prob in zip(le.classes_, ensemble_proba)
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

**Run API:**
```bash
uvicorn api.main:app --reload
```

---

### **Step 10.2: Build Dashboard**

**Tech Stack:** React + Leaflet + FastAPI

**Dashboard Features:**
1. ✅ Map showing fire detections (color-coded by type)
2. ✅ Real-time classification (upload new hotspot)
3. ✅ Statistics panel (fires by type, monthly trends)
4. ✅ Filter by date/region/type
5. ✅ Export classified data

**Frontend:** `dashboard/src/App.js`

```javascript
import React from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';

function App() {
  const [fires, setFires] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:8000/api/fires')
      .then(res => res.json())
      .then(data => setFires(data));
  }, []);
  
  const colorMap = {
    'industrial_steady': '#FF6B35',
    'gas_flare': '#F7931E',
    'agricultural_burning': '#8BC34A',
    'wildfire': '#E91E63',
    'accidental_fire': '#9C27B0',
    'mining': '#795548'
  };
  
  return (
    <MapContainer center={[30, 75]} zoom={7}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {fires.map(fire => (
        <CircleMarker
          key={fire.id}
          center={[fire.latitude, fire.longitude]}
          radius={5}
          fillColor={colorMap[fire.predicted_class]}
          color={colorMap[fire.predicted_class]}
          fillOpacity={0.7}
        />
      ))}
    </MapContainer>
  );
}
```

---

## **📊 EXPECTED RESULTS**

### **Individual Model Accuracies:**
- XGBoost (tabular only): **76-80%**
- ResNet18 (imagery only): **72-76%**
- EfficientNet-B3 (imagery only): **70-75%**

### **Ensemble Accuracies:**
- Simple average: **82-84%**
- Weighted average: **84-86%**
- Stacked (learned fusion): **85-88%** ⭐

### **Per-Class F1-Scores (Final Ensemble):**
- Agricultural burning: **88-92%** (easy, clear patterns)
- Industrial steady-state: **83-87%** (good)
- Wildfire: **78-83%** (moderate)
- Gas flare: **80-85%** (good, night-biased)
- Accidental fire: **70-78%** (hardest, rare events)
- Mining: **72-80%** (if data available)

---

## **🚀 QUICK START CHECKLIST**

### **Week 1 (Data):**
- [ ] Day 1: Copy FIRMS data to `data/raw/firms_hotspots.csv`
- [ ] Day 1: Copy OSM data to `data/raw/osm_infrastructure.geojson`
- [ ] Day 2: Download land cover (or I generate sample)
- [ ] Day 3-4: Run preprocessing scripts
- [ ] Day 4: Run EDA, understand patterns
- [ ] Day 5-6: Feature engineering (20+ features)
- [ ] Day 7: Labeling + train/val/test split

### **Week 2 (XGBoost):**
- [ ] Day 8-9: Train XGBoost baseline
- [ ] Day 10-11: Hyperparameter tuning
- [ ] Day 12: Evaluate, aim for 76-80%
- [ ] Day 13-14: Feature importance analysis

### **Week 3 (CNN + ResNet):**
- [ ] Day 15-16: Download Sentinel-2 imagery (GEE)
- [ ] Day 17: Preprocess images (224×224)
- [ ] Day 18-19: Train ResNet18
- [ ] Day 20-21: Train EfficientNet-B3

### **Week 4 (Fusion + Deploy):**
- [ ] Day 22: Implement late fusion
- [ ] Day 23: Implement learned fusion
- [ ] Day 24-25: Build FastAPI backend
- [ ] Day 26: Build React dashboard
- [ ] Day 27: Testing + optimization
- [ ] Day 28: Documentation + presentation

---

## **💡 WHAT TO DO RIGHT NOW:**

**Tell me:**
1. Where are your data files? (FIRMS, OSM from your screenshot)
2. Do you want me to:
   - **A)** Generate sample land cover data (instant)
   - **B)** Guide you to download real land cover (5 min)
3. Should I create all the Python scripts for you now?

**Once you tell me, I'll:**
✅ Set up your data files  
✅ Generate all 20+ scripts  
✅ You start training immediately  

**Ready to start?** 🎯
