import pandas as pd
import numpy as np
import joblib
import os
from tensorflow.keras.models import load_model

# Force paths to your trained_models folder
MODEL_DIR = r'E:\PRF\backend\trained_models'

print("🔍 --- TITAN BRAIN X-RAY START --- 🔍")

try:
    # 1. Load the exact files the backend is using
    scaler_X_rev = joblib.load(os.path.join(MODEL_DIR, 'scaler_X_rev.pkl'))
    scaler_y_rev = joblib.load(os.path.join(MODEL_DIR, 'scaler_y_rev.pkl'))
    model = load_model(os.path.join(MODEL_DIR, 'reverse_model.h5'), compile=False)
    print("✅ Files Loaded Successfully.\n")

    # 2. Test Input: Standard 2.4 GHz design
    # Columns: ['Freq_GHz', 'Gain', 'Directivity', 'S11(dB)', 'Rad_eff', 'Total_eff', 'VSWR']
    test_input = [[2.4, 5.0, 6.0, -15.0, 0.85, 0.80, 1.2]]
    rev_cols = scaler_X_rev.feature_names_in_list if hasattr(scaler_X_rev, 'feature_names_in_list') else ['Freq_GHz', 'Gain', 'Directivity', 'S11(dB)', 'Rad_eff', 'Total_eff', 'VSWR']

    # Step A: Transform Input
    input_df = pd.DataFrame(test_input, columns=rev_cols)
    scaled_input = scaler_X_rev.transform(input_df)
    print(f"1. Scaled Input (Should be 0-1): \n{scaled_input}\n")

    # Step B: Raw Neural Network Prediction
    raw_pred = model.predict(scaled_input, verbose=0)
    print(f"2. Raw NN Output (Scaled Dims): \n{raw_pred}\n")

    # Step C: Final Millimeters
    final_mm = scaler_y_rev.inverse_transform(raw_pred)
    print(f"3. Final Dimensions (mm):")
    dim_names = ['Patch_W', 'Patch_L', 'Feed_W', 'Slot1_W', 'Slot1_L', 'Slot2_W']
    for name, val in zip(dim_names, final_mm[0]):
        print(f"   - {name:<10}: {val:.2f} mm")

    # Step D: The "Truth" - Scaler Ranges
    print("\n4. Scaler Limits (What the AI was trained on):")
    for col, min_v, max_v in zip(rev_cols, scaler_X_rev.data_min_, scaler_X_rev.data_max_):
        print(f"   - {col:<12}: Min={min_v:.2f}, Max={max_v:.2f}")

except Exception as e:
    print(f"❌ Diagnostic Error: {e}")

print("\n🔍 --- X-RAY COMPLETE --- 🔍")