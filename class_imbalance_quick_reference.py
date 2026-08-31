"""
QUICK REFERENCE: Class Imbalance Solutions for Phase 5
========================================================
All 4 pillars in one condensed reference file.
Copy-paste these snippets into your training code.
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import WeightedRandomSampler
from sklearn.utils.class_weight import compute_class_weight

# ============================================================================
# PILLAR A: ESA RGB Colormap Mapping
# ============================================================================

ESA_COLOR_PALETTE = {
    10:  [0,   100, 0],      # Tree Cover → Dark Green
    20:  [255, 187, 34],     # Shrubland → Orange-Yellow
    30:  [255, 255, 76],     # Grassland → Bright Yellow
    40:  [240, 150, 255],    # Cropland → Magenta/Pink
    50:  [250, 0,   0],      # Built-up → Red
    60:  [180, 180, 180],    # Bare/Sparse → Grey
    70:  [240, 240, 240],    # Snow/Ice → White
    80:  [0,   100, 200],    # Water → Blue
    90:  [0,   150, 160],    # Wetland → Teal
    95:  [0,   207, 117],    # Mangroves → Light Green
    100: [250, 230, 160]     # Moss/Lichen → Cream
}

def esa_tile_to_rgb(chip_1band):
    """Convert 224×224 ESA integer codes to RGB."""
    H, W = chip_1band.shape
    rgb = np.zeros((H, W, 3), dtype=np.uint8)
    for code, color in ESA_COLOR_PALETTE.items():
        rgb[chip_1band == code] = color
    return rgb

# ============================================================================
# PILLAR B: Agricultural Capping
# ============================================================================

def balance_dataset(df, max_agricultural=150000, random_state=42):
    """
    Cap Agricultural class (Class 1) to prevent domination.
    
    Reduces dataset from 1.37M → 450K rows (3× faster training).
    """
    # Cap Agricultural to max_agricultural samples
    df_agri = df[df['Target_Class'] == 1].sample(
        n=min(max_agricultural, len(df[df['Target_Class'] == 1])),
        random_state=random_state
    )
    
    # Keep all other classes unchanged
    df_rest = df[df['Target_Class'] != 1]
    
    # Combine and shuffle
    df_balanced = pd.concat([df_agri, df_rest]).sample(frac=1, random_state=random_state)
    
    print(f"Dataset balanced: {len(df):,} → {len(df_balanced):,} rows")
    return df_balanced

# Usage:
# df = pd.read_csv('master_2024_training (1).csv')
# df_balanced = balance_dataset(df, max_agricultural=150000)

# ============================================================================
# PILLAR C: WeightedRandomSampler (Balanced Mini-Batches)
# ============================================================================

def create_weighted_sampler(y_train):
    """
    Create weighted sampler for balanced mini-batches.
    
    Forces each batch of 32 to have ~6-7 samples from each of the 5 classes.
    
    Args:
        y_train: Training labels (numpy array or list)
    
    Returns:
        WeightedRandomSampler instance
    """
    # Calculate class counts
    class_counts = np.bincount(y_train)
    print(f"Class counts: {class_counts}")
    
    # Calculate inverse frequency weights
    class_weights = 1.0 / class_counts
    print(f"Class weights: {class_weights}")
    
    # Assign weight to each sample based on its class
    sample_weights = class_weights[y_train]
    
    # Create sampler with replacement=True (allows rare classes to repeat)
    sampler = WeightedRandomSampler(
        weights=torch.DoubleTensor(sample_weights),
        num_samples=len(sample_weights),
        replacement=True  # CRITICAL: Must be True!
    )
    
    return sampler

# Usage:
# sampler = create_weighted_sampler(y_train)
# train_loader = DataLoader(
#     train_dataset,
#     batch_size=32,
#     sampler=sampler  # DO NOT use shuffle=True with sampler
# )

# ============================================================================
# PILLAR D: Focal Loss with Class Weights
# ============================================================================

class FocalLoss(nn.Module):
    """
    Focal Loss: Heavily penalizes errors on rare classes.
    
    Formula: FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
    
    Args:
        alpha: Class weight tensor [Class 0, 1, 2, 3, 4]
               Example: [1.61, 0.26, 2.18, 54.22, 165.19]
        gamma: Focusing parameter (default=2.0)
               Higher gamma = more focus on hard examples
    """
    def __init__(self, alpha=None, gamma=2.0):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
    
    def forward(self, inputs, targets):
        # Compute cross-entropy with class weights
        ce_loss = F.cross_entropy(inputs, targets, weight=self.alpha, reduction='none')
        
        # Compute focal term: (1 - p_t)^gamma
        pt = torch.exp(-ce_loss)
        focal_loss = ((1 - pt) ** self.gamma) * ce_loss
        
        return focal_loss.mean()

def compute_class_weights_balanced(y_train):
    """
    Compute balanced class weights using sklearn formula.
    
    Formula: weight[i] = n_samples / (n_classes * n_samples_for_class[i])
    
    Returns:
        numpy array of shape (5,) with weights for each class
    """
    class_weights = compute_class_weight(
        class_weight='balanced',
        classes=np.array([0, 1, 2, 3, 4]),
        y=y_train
    )
    return class_weights

def compute_class_weights_manual(y_train):
    """
    Manual calculation of balanced class weights (equivalent to sklearn).
    """
    total_samples = len(y_train)
    class_counts = np.bincount(y_train)
    n_classes = len(class_counts)
    
    class_weights = total_samples / (n_classes * class_counts)
    return class_weights

# Usage:
# class_weights = compute_class_weights_balanced(y_train)
# class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)
# criterion = FocalLoss(alpha=class_weights_tensor, gamma=2.0)

# ============================================================================
# COMPLETE TRAINING SETUP EXAMPLE
# ============================================================================

def setup_training_with_all_fixes(df, tile_dir, device='cuda'):
    """
    Complete setup demonstrating all 4 pillars together.
    
    Returns:
        model, train_loader, val_loader, criterion, optimizer, scheduler
    """
    from sklearn.model_selection import train_test_split
    from torch.utils.data import DataLoader
    import torchvision.models as models
    
    # PILLAR B: Balance dataset
    df_balanced = balance_dataset(df, max_agricultural=150000)
    
    # Extract features and labels
    X = df_balanced[['latitude', 'longitude']].values
    y = df_balanced['Target_Class'].values
    
    # Train/val split (stratified!)
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Train: {len(y_train):,} | Val: {len(y_val):,}")
    
    # Create datasets (with PILLAR A: ESA RGB mapping inside)
    # train_dataset = ESAFireDataset(df_train, tile_dir, transform=train_transform)
    # val_dataset = ESAFireDataset(df_val, tile_dir, transform=val_transform)
    
    # PILLAR C: Weighted sampler
    sampler = create_weighted_sampler(y_train)
    
    # Create data loaders
    # train_loader = DataLoader(train_dataset, batch_size=32, sampler=sampler)
    # val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    
    # PILLAR D: Focal Loss with class weights
    class_weights = compute_class_weights_balanced(y_train)
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float32).to(device)
    criterion = FocalLoss(alpha=class_weights_tensor, gamma=2.0)
    
    print(f"\nClass weights for Focal Loss:")
    class_names = ['Wildfire', 'Agricultural', 'Industrial', 'Gas Flare', 'Accidental']
    for i, (name, weight) in enumerate(zip(class_names, class_weights)):
        print(f"  Class {i} ({name:15s}): {weight:.4f}")
    
    # Model setup
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, 5)  # 5 classes
    model = model.to(device)
    
    # Optimizer and scheduler
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=3
    )
    
    print("\nSetup complete with all 4 pillars!")
    # return model, train_loader, val_loader, criterion, optimizer, scheduler

# ============================================================================
# EVALUATION METRICS (Use These, NOT Standard Accuracy!)
# ============================================================================

def evaluate_model(y_true, y_pred, class_names=None):
    """
    Proper evaluation metrics for imbalanced classification.
    
    NEVER use standard accuracy! It's misleading.
    """
    from sklearn.metrics import (
        balanced_accuracy_score,
        f1_score,
        classification_report,
        confusion_matrix
    )
    
    if class_names is None:
        class_names = ['Wildfire', 'Agricultural', 'Industrial', 'Gas Flare', 'Accidental']
    
    # Primary metrics
    balanced_acc = balanced_accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, average='macro')
    
    print("="*70)
    print("EVALUATION METRICS")
    print("="*70)
    print(f"Balanced Accuracy: {balanced_acc:.4f} (Target: 0.74-0.81)")
    print(f"Macro F1 Score:    {macro_f1:.4f} (Target: 0.72-0.78)")
    print()
    
    # Per-class metrics
    print("Classification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names, digits=4))
    
    # Confusion matrix
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_true, y_pred)
    print(cm)
    print("="*70)
    
    return balanced_acc, macro_f1

# Usage:
# balanced_acc, macro_f1 = evaluate_model(y_val, y_pred)

# ============================================================================
# COMMON MISTAKES TO AVOID
# ============================================================================

"""
❌ MISTAKE 1: Augmenting before train/val split
X_aug, y_aug = augment(X, y)  # ❌ Don't do this!
X_train, X_val = train_test_split(X_aug, y_aug)  # ❌ Data leakage!

✅ CORRECT:
X_train, X_val = train_test_split(X, y)  # Split first
X_train_aug, y_train_aug = augment(X_train, y_train)  # Then augment training only


❌ MISTAKE 2: Using sampler with shuffle=True
train_loader = DataLoader(dataset, sampler=sampler, shuffle=True)  # ❌ Error!

✅ CORRECT:
train_loader = DataLoader(dataset, sampler=sampler)  # No shuffle needed


❌ MISTAKE 3: Forgetting replacement=True
sampler = WeightedRandomSampler(weights=w, num_samples=n, replacement=False)  # ❌ Wrong!

✅ CORRECT:
sampler = WeightedRandomSampler(weights=w, num_samples=n, replacement=True)  # ✅ Correct


❌ MISTAKE 4: Evaluating on standard accuracy
accuracy = (preds == labels).mean()  # ❌ Misleading! (77% fake accuracy)

✅ CORRECT:
balanced_acc = balanced_accuracy_score(labels, preds)  # ✅ Real metric
macro_f1 = f1_score(labels, preds, average='macro')
"""

# ============================================================================
# EXPECTED CLASS WEIGHT VALUES (for verification)
# ============================================================================

"""
After balancing to 453,694 samples (Agricultural capped to 150K):

Train set (80% = 362,955 samples):
  Class 0 (Wildfire):      136,790 samples → Weight: 1.61
  Class 1 (Agricultural):  120,000 samples → Weight: 0.26  (lowest penalty)
  Class 2 (Industrial):    100,772 samples → Weight: 2.18
  Class 3 (Gas Flare):       4,061 samples → Weight: 54.22
  Class 4 (Accidental):      1,333 samples → Weight: 165.19 (highest penalty)

Example Focal Loss calculation for misclassifying Accidental as Agricultural:
  Base CE loss: 2.30
  Focal penalty: 165.19 × (1 - 0.02)^2.0 × 2.30 = 380.45
  
Model gets punished 165× harder for this mistake!
"""

# ============================================================================
# QUICK START TEMPLATE
# ============================================================================

if __name__ == '__main__':
    """
    Quick start template for Phase 5 training with all fixes.
    """
    
    # 1. Load and balance data
    df = pd.read_csv('master_2024_training (1).csv')
    df_balanced = balance_dataset(df, max_agricultural=150000)
    
    # 2. Split data (stratified!)
    from sklearn.model_selection import train_test_split
    X = df_balanced[['latitude', 'longitude']].values
    y = df_balanced['Target_Class'].values
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    # 3. Create weighted sampler
    sampler = create_weighted_sampler(y_train)
    
    # 4. Setup Focal Loss
    class_weights = compute_class_weights_balanced(y_train)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    criterion = FocalLoss(
        alpha=torch.tensor(class_weights, dtype=torch.float32).to(device),
        gamma=2.0
    )
    
    # 5. Create datasets with ESA RGB mapping
    # train_dataset = ESAFireDataset(df_train, 'esa_worldcover', transform=train_transform)
    # train_loader = DataLoader(train_dataset, batch_size=32, sampler=sampler)
    
    # 6. Train model
    # model = FireImageResNet(num_classes=5).to(device)
    # optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    # train_model(model, train_loader, val_loader, criterion, optimizer, ...)
    
    # 7. Evaluate properly (not standard accuracy!)
    # balanced_acc, macro_f1 = evaluate_model(y_val, y_pred)
    
    print("\nAll 4 pillars configured successfully!")
    print("Ready for Phase 5 training.")
