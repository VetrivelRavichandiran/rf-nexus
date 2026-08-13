import pandas as pd
import numpy as np
import joblib
import os
import tensorflow as tf  # Import the main engine first

# Specific imports that are safer for Windows DLLs
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam

# 1. Configuration
DATA_PATH = r'D:\DD\TITAN_READY_DATA.csv'
SAVE_DIR = r'E:\PRF\backend\trained_models'
os.makedirs(SAVE_DIR, exist_ok=True)

perf_cols = ['Freq_GHz', 'Gain', 'Directivity', 'S11(dB)', 'Rad_eff', 'Total_eff', 'VSWR']
dim_cols = ['Patch_W', 'Patch_L', 'Feed_W', 'Slot1_W', 'Slot1_L', 'Slot2_W']

print("📂 Loading new Sub-6GHz Data...")
df = pd.read_csv(DATA_PATH)

def build_model(input_dim, output_dim):
    # Using the native tf.keras structure
    model = Sequential([
        Dense(128, activation='relu', input_shape=(input_dim,)),
        Dropout(0.1),
        Dense(256, activation='relu'),
        Dense(128, activation='relu'),
        Dense(output_dim, activation='linear')
    ])
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
    return model

# --- PART A: REVERSE MODEL ---
print("\n🧠 Training REVERSE Model (Performance -> Dimensions)...")
from sklearn.preprocessing import MinMaxScaler
scaler_X_rev = MinMaxScaler().fit(df[perf_cols])
scaler_y_rev = MinMaxScaler().fit(df[dim_cols])

X_rev_scaled = scaler_X_rev.transform(df[perf_cols])
y_rev_scaled = scaler_y_rev.transform(df[dim_cols])

rev_model = build_model(len(perf_cols), len(dim_cols))
rev_model.fit(X_rev_scaled, y_rev_scaled, epochs=50, batch_size=32, verbose=1)

# --- PART B: FORWARD MODEL ---
print("\n🔮 Training FORWARD Model (Dimensions -> Performance)...")
X_fwd_raw = df[dim_cols + ['Freq_GHz']]
scaler_X_fwd = MinMaxScaler().fit(X_fwd_raw)
scaler_y_fwd = MinMaxScaler().fit(df[perf_cols])

fwd_model = build_model(len(dim_cols) + 1, len(perf_cols))
fwd_model.fit(scaler_X_fwd.transform(X_fwd_raw), scaler_y_fwd.transform(df[perf_cols]), epochs=50, verbose=1)

# --- PART C: SAVE EVERYTHING ---
print("\n💾 Saving updated Sub-6GHz Titan assets...")
rev_model.save(os.path.join(SAVE_DIR, 'reverse_model.h5'))
fwd_model.save(os.path.join(SAVE_DIR, 'forward_model.h5'))
joblib.dump(scaler_X_rev, os.path.join(SAVE_DIR, 'scaler_X_rev.pkl'))
joblib.dump(scaler_y_rev, os.path.join(SAVE_DIR, 'scaler_y_rev.pkl'))
joblib.dump(scaler_X_fwd, os.path.join(SAVE_DIR, 'scaler_X_fwd.pkl'))
joblib.dump(scaler_y_fwd, os.path.join(SAVE_DIR, 'scaler_y_fwd.pkl'))

print("✅ TITAN UPGRADED: 1.0 - 8.0 GHz Brain is ready!")