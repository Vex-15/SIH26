import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os, time, json, glob
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import (classification_report, confusion_matrix,
                              balanced_accuracy_score, f1_score)
from sklearn.utils.class_weight import compute_class_weight
from sklearn.preprocessing import StandardScaler
import joblib

DATASET_PATH = r'C:\Users\Dell\Documents\GitHub\SIH26\Himawari_Dataset'
MODELS_DIR   = 'models'
LOGS_DIR     = 'logs'
BATCH_SIZE   = 64
EPOCHS       = 80
LR           = 1e-3
PATIENCE     = 15
RANDOM_STATE = 42
INDIA_LAT    = (6, 36)
INDIA_LON    = (68, 97)
NUM_CLASSES  = 4
SEQ_LEN      = 144
AUG_N        = 20

CLASS_MAP = {
    'Apr_WILDFIRE':         0,
    'Nov_AGRICULTURALFIRE': 1,
    'Aug_INDUSTRIALFIRE':   2,
    'Accidental_FIRE':      3,
}
CLASS_NAMES = ['Wildfire', 'Agricultural', 'Industrial', 'Accidental']
CSV_COLS    = ['ID','Year','Month','Day','Time_UTC','Lat','Lon',
               'Area_km2','Volcano','Level','Reliability','FRP_Wm2','QF','HotID']

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR,   exist_ok=True)


class DiurnalTemporalCNN(nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv1d(1, 32, kernel_size=5, padding=2),
            nn.BatchNorm1d(32), nn.ReLU(), nn.MaxPool1d(2),
            nn.Conv1d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm1d(64), nn.ReLU(), nn.MaxPool1d(2),
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm1d(128), nn.ReLU(),
            nn.AdaptiveAvgPool1d(1),
        )
        self.head = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(128, 64), nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        return self.head(self.conv(x).squeeze(-1))


def load_day_vector(day_path, is_accidental=False):
    all_csvs  = glob.glob(os.path.join(day_path, '**', '*.csv'), recursive=True)
    real_csvs = [f for f in all_csvs if not os.path.basename(f).startswith('._')]
    if not real_csvs:
        return None
    frames = []
    for fp in real_csvs:
        try:
            df = pd.read_csv(fp, comment='#', header=None, names=CSV_COLS,
                             on_bad_lines='skip',
                             usecols=['Time_UTC', 'Lat', 'Lon', 'FRP_Wm2'])
            df['FRP_Wm2'] = pd.to_numeric(df['FRP_Wm2'], errors='coerce')
            df.dropna(subset=['FRP_Wm2', 'Lat', 'Lon'], inplace=True)
            if not is_accidental:
                df = df[(df['Lat'] >= INDIA_LAT[0]) & (df['Lat'] <= INDIA_LAT[1]) &
                        (df['Lon'] >= INDIA_LON[0]) & (df['Lon'] <= INDIA_LON[1])]
            if not df.empty:
                frames.append(df[['Time_UTC', 'FRP_Wm2']])
        except Exception:
            continue
    if not frames:
        return None
    data  = pd.concat(frames, ignore_index=True)
    t     = data['Time_UTC'].astype(int)
    slots = ((t % 10000) // 100 * 6 + (t % 100) // 10).clip(0, SEQ_LEN - 1).values
    frp   = data['FRP_Wm2'].values.astype(np.float32)
    frp_sum   = np.bincount(slots, weights=frp, minlength=SEQ_LEN).astype(np.float32)
    frp_count = np.bincount(slots,              minlength=SEQ_LEN).astype(np.float32)
    vec = np.divide(frp_sum, frp_count, out=np.zeros(SEQ_LEN, dtype=np.float32), where=frp_count > 0)
    return vec if vec.sum() > 0 else None


def load_class_vectors(folder_name, class_label):
    folder = os.path.join(DATASET_PATH, folder_name)
    is_acc = (folder_name == 'Accidental_FIRE')
    day_dirs = sorted([d for d in os.listdir(folder)
                       if os.path.isdir(os.path.join(folder, d))
                       and not d.startswith('.') and not d.startswith('._')])
    vecs, labs = [], []
    for d in day_dirs:
        v = load_day_vector(os.path.join(folder, d), is_accidental=is_acc)
        if v is not None:
            vecs.append(v); labs.append(class_label)
    return (np.array(vecs, dtype=np.float32), np.array(labs, dtype=np.int64))


def augment(X, y, n=AUG_N, noise_std=0.05, max_shift=6):
    rng = np.random.default_rng(RANDOM_STATE)
    Xs, ys = [X], [y]
    for _ in range(n):
        noise  = rng.normal(0, noise_std, X.shape).astype(np.float32)
        shifts = rng.integers(-max_shift, max_shift + 1, size=len(X))
        scale  = rng.uniform(0.85, 1.15, size=(len(X), 1)).astype(np.float32)
        Xnew   = np.clip(
            np.stack([np.roll(X[i], shifts[i]) for i in range(len(X))]).astype(np.float32)
            * scale + noise, 0, None)
        Xs.append(Xnew); ys.append(y.copy())
    return np.vstack(Xs), np.concatenate(ys)


class DiurnalDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.from_numpy(X).unsqueeze(1)
        self.y = torch.from_numpy(y)
    def __len__(self): return len(self.y)
    def __getitem__(self, i): return self.X[i], self.y[i]


def main():
    t0 = time.time()
    print('=' * 65)
    print('PHASE 4 -- Himawari-9 1D-CNN (4-class Diurnal Classifier)')
    print('=' * 65)

    print('\n[1/6] Loading diurnal FRP vectors (one per day-folder) ...')
    Xlist, ylist = [], []
    for fname, cls in CLASS_MAP.items():
        print(f'      {fname} (class {cls}) ...', end=' ', flush=True)
        t1 = time.time()
        Xc, yc = load_class_vectors(fname, cls)
        print(f'{len(Xc)} vectors  ({time.time()-t1:.1f}s)')
        Xlist.append(Xc); ylist.append(yc)

    X_raw = np.vstack(Xlist)
    y_raw = np.concatenate(ylist)
    print(f'\n      Total raw vectors: {len(X_raw)}')
    for i, n in enumerate(CLASS_NAMES):
        c = (y_raw == i).sum()
        print(f'        Class {i} ({n:>14s}): {c}')

    print('\n[2/6] Train/Val split (80/20 stratified, BEFORE augmentation) ...')
    Xtr_raw, Xval, ytr_raw, yval = train_test_split(
        X_raw, y_raw, test_size=0.2, random_state=RANDOM_STATE, stratify=y_raw)
    print(f'      Raw train: {len(Xtr_raw)}  |  Val (no aug): {len(Xval)}')

    print('\n[3/6] Normalizing (log1p + StandardScaler on train only) ...')
    scaler  = StandardScaler()
    Xtr_sc  = scaler.fit_transform(np.log1p(Xtr_raw)).astype(np.float32)
    Xval_sc = scaler.transform(np.log1p(Xval)).astype(np.float32)
    joblib.dump(scaler, f'{MODELS_DIR}/himawari_scaler.pkl')
    print(f'      Saved -> {MODELS_DIR}/himawari_scaler.pkl')

    print(f'\n[4/6] Augmenting train set ({AUG_N}x noise+shift+scale) ...')
    Xtrain, ytrain = augment(Xtr_sc, ytr_raw, n=AUG_N)
    print(f'      Train after augmentation: {len(Xtrain):,}')
    cw      = compute_class_weight('balanced', classes=np.unique(ytrain), y=ytrain)
    cw_tens = torch.tensor(cw, dtype=torch.float32)
    print(f'      Class weights: {[f"{w:.3f}" for w in cw]}')

    tr_loader  = DataLoader(DiurnalDataset(Xtrain, ytrain),
                            batch_size=BATCH_SIZE, shuffle=True,  num_workers=0)
    val_loader = DataLoader(DiurnalDataset(Xval_sc, yval),
                            batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'\n[5/6] Training on {device} (epochs={EPOCHS}, patience={PATIENCE}) ...\n')
    model     = DiurnalTemporalCNN(NUM_CLASSES).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5)
    criterion = nn.CrossEntropyLoss(weight=cw_tens.to(device))

    best_loss, best_epoch, patience_ctr = float('inf'), 0, 0
    for epoch in range(1, EPOCHS + 1):
        model.train()
        tr_loss, tr_ok = 0.0, 0
        for Xb, yb in tr_loader:
            Xb, yb = Xb.to(device), yb.to(device)
            optimizer.zero_grad()
            out  = model(Xb)
            loss = criterion(out, yb)
            loss.backward(); optimizer.step()
            tr_loss += loss.item() * len(yb)
            tr_ok   += (out.argmax(1) == yb).sum().item()
        tr_loss /= len(ytrain); tr_acc = tr_ok / len(ytrain)

        model.eval()
        vl_loss, vl_ok = 0.0, 0
        with torch.no_grad():
            for Xb, yb in val_loader:
                Xb, yb = Xb.to(device), yb.to(device)
                out  = model(Xb)
                loss = criterion(out, yb)
                vl_loss += loss.item() * len(yb)
                vl_ok   += (out.argmax(1) == yb).sum().item()
        vl_loss /= len(yval); vl_acc = vl_ok / len(yval)
        scheduler.step(vl_loss)

        if epoch % 5 == 0 or epoch == 1:
            print(f'  Epoch {epoch:3d}/{EPOCHS}  '
                  f'train_loss={tr_loss:.4f} acc={tr_acc*100:.1f}%  '
                  f'val_loss={vl_loss:.4f} acc={vl_acc*100:.1f}%')

        if vl_loss < best_loss:
            best_loss, best_epoch, patience_ctr = vl_loss, epoch, 0
            torch.save(model.state_dict(), f'{MODELS_DIR}/diurnal_1dcnn_best.pth')
        else:
            patience_ctr += 1
            if patience_ctr >= PATIENCE:
                print(f'\n  Early stop at epoch {epoch} (best={best_epoch})')
                break

    print(f'\n  Best epoch={best_epoch}  best_val_loss={best_loss:.4f}')

    print('\n[6/6] Evaluating on unaugmented validation set ...')
    model.load_state_dict(torch.load(
        f'{MODELS_DIR}/diurnal_1dcnn_best.pth', map_location=device))
    model.eval()
    probs_l, preds_l, true_l = [], [], []
    with torch.no_grad():
        for Xb, yb in val_loader:
            out = model(Xb.to(device))
            probs_l.append(torch.softmax(out, 1).cpu().numpy())
            preds_l.append(out.argmax(1).cpu().numpy())
            true_l.append(yb.numpy())

    P_temp = np.vstack(probs_l)
    ypred  = np.concatenate(preds_l)
    ytrue  = np.concatenate(true_l)

    std_acc  = (ypred == ytrue).mean()
    bal_acc  = balanced_accuracy_score(ytrue, ypred)
    macro_f1 = f1_score(ytrue, ypred, average='macro')

    print(f'\n{"="*65}')
    print(f'  Val samples : {len(ytrue)}  (unaugmented)')
    print(f'  Std Accuracy: {std_acc*100:.2f}%')
    print(f'  Bal Accuracy: {bal_acc*100:.2f}%  <- key metric')
    print(f'  Macro F1    : {macro_f1*100:.2f}%  <- key metric')
    print(f'\n{classification_report(ytrue, ypred, target_names=CLASS_NAMES, digits=4)}')
    cm = confusion_matrix(ytrue, ypred)
    print('Confusion Matrix (rows=actual, cols=predicted):')
    print(pd.DataFrame(cm, index=CLASS_NAMES, columns=CLASS_NAMES).to_string())

    torch.save(model.state_dict(), f'{MODELS_DIR}/diurnal_1dcnn.pth')
    np.save(f'{MODELS_DIR}/P_temp_val.npy', P_temp)
    np.save(f'{MODELS_DIR}/y_temp_val.npy', ytrue)

    cnn_to_master = {0: 0, 1: 1, 2: 2, 3: 4}
    pd.DataFrame({'cnn_class': ytrue,
                  'master_class': [cnn_to_master[c] for c in ytrue]}
                ).to_csv(f'{MODELS_DIR}/himawari_val_meta.csv', index=False)

    metrics = {
        'phase': 4, 'num_classes_cnn': 4,
        'cnn_to_master_class': cnn_to_master,
        'raw_samples': int(len(X_raw)),
        'train_after_aug': int(len(Xtrain)),
        'val_samples': int(len(ytrue)),
        'best_epoch': int(best_epoch),
        'standard_accuracy': round(float(std_acc), 4),
        'balanced_accuracy': round(float(bal_acc), 4),
        'macro_f1': round(float(macro_f1), 4),
        'P_temp_val_shape': list(P_temp.shape),
        'phase6_remap': 'CNN[:,3]->master class 4. No Gas Flare column in CNN.',
        'train_time_min': round((time.time() - t0) / 60, 2)
    }
    with open(f'{LOGS_DIR}/phase4_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f'\nSaved: P_temp_val.npy {P_temp.shape} | diurnal_1dcnn.pth | phase4_metrics.json')
    print(f'\n{"="*65}')
    print(f'  PHASE 4 COMPLETE  --  {(time.time()-t0)/60:.1f} min')
    print(f'{"="*65}')


if __name__ == '__main__':
    main()
