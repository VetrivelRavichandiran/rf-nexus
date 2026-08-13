import numpy as np
import pandas as pd
import joblib
import os
import sys
from ml_pipeline.model_manager import model_manager
# These imports stay the same, the 'magic' happens in how we resolve them below
from core.config import SCALER_X_FWD, SCALER_Y_FWD, SCALER_X_REV, SCALER_Y_REV

# --- EXE-SAFE FILE RESOLVER ---
def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        # Local development path
        base_path = os.path.abspath(".")
    
    # Ensure we are joining correctly even if paths are strings or Path objects
    return os.path.join(base_path, str(relative_path))

# Global placeholders for scalers
scaler_X_fwd = None
scaler_y_fwd = None
scaler_X_rev = None
scaler_y_rev = None

# Load Scalers with resolved paths
try:
    scaler_X_fwd = joblib.load(get_resource_path(SCALER_X_FWD))
    scaler_y_fwd = joblib.load(get_resource_path(SCALER_Y_FWD))
    scaler_X_rev = joblib.load(get_resource_path(SCALER_X_REV))
    scaler_y_rev = joblib.load(get_resource_path(SCALER_Y_REV))
    print("✅ Titan Scalers Loaded Successfully!")
except Exception as e:
    print(f"❌ Error loading scalers: {e}")
    print(f"🔍 System attempted to find scalers in: {get_resource_path('trained_models')}")

def generate_optimized_design(targets: dict, substrate: str):
    try:
        # --- SAFETY GATE ---
        if None in [scaler_X_rev, scaler_X_fwd, model_manager.reverse_model]:
            raise Exception("AI Engine components not fully loaded. Check scaler paths.")

        # 1. Input Processing & Dynamic Normalization (Algorithm Unchanged)
        freq = float(targets.get('freq', 2.4))
        gain = float(targets.get('gain', 5.0))
        direct = float(targets.get('directivity', 6.0))
        s11 = float(targets.get('s11', -15.0))
        
        def norm_eff(k):
            v = float(targets.get(k, targets.get('radEff', 0.8)))
            return v / 100.0 if v > 1.0 else v

        rad_eff = norm_eff('radEff')
        tot_eff = norm_eff('totalEff')
        vswr = float(targets.get('vswr', 1.2))

        # --- STEP A: REVERSE PREDICTION (The Designer - Algorithm Unchanged) ---
        rev_cols = ['Freq_GHz', 'Gain', 'Directivity', 'S11(dB)', 'Rad_eff', 'Total_eff', 'VSWR']
        input_list = [freq, gain, direct, s11, rad_eff, tot_eff, vswr]
        
        raw_rev_df = pd.DataFrame([input_list], columns=rev_cols)
        scaled_rev_input = scaler_X_rev.transform(raw_rev_df)
        
        # Predict Dimensions
        scaled_dims = model_manager.reverse_model.predict(scaled_rev_input, verbose=0)
        real_dims = scaler_y_rev.inverse_transform(scaled_dims)[0]

        # Physics Alignment logic (Algorithm Unchanged)
        p_w_raw, p_l_raw = real_dims[0], real_dims[1]
        patch_w, patch_l = (p_l_raw, p_w_raw) if p_w_raw > p_l_raw else (p_w_raw, p_l_raw)

        # Manufacturing Safety Clips (Algorithm Unchanged)
        patch_w = float(np.clip(patch_w, 5.0, 60.0))
        patch_l = float(np.clip(patch_l, 5.0, 60.0))
        feed_w  = float(np.clip(real_dims[2], 0.5, 5.0))
        s1w = float(np.clip(real_dims[3], 0.1, 20.0))
        s1l = float(np.clip(real_dims[4], 0.1, 20.0))
        s2w = float(np.clip(real_dims[5], 0.1, 20.0))

        # --- STEP B: FORWARD VERIFICATION (The Verifier - Algorithm Unchanged) ---
        fwd_input_cols = ['Patch_W', 'Patch_L', 'Feed_W', 'Slot1_W', 'Slot1_L', 'Slot2_W', 'Freq_GHz']
        fwd_df = pd.DataFrame([[patch_w, patch_l, feed_w, s1w, s1l, s2w, freq]], columns=fwd_input_cols)
        
        scaled_fwd = scaler_X_fwd.transform(fwd_df)
        perf_scaled = model_manager.forward_model.predict(scaled_fwd, verbose=0)
        perf = scaler_y_fwd.inverse_transform(perf_scaled)[0]

        print(f"✅ Design Verified! Freq: {freq}GHz -> Patch_L: {patch_l:.2f}mm")

        return {
            "Patch_W": round(patch_w, 2),
            "Patch_L": round(patch_l, 2),
            "Feed_W":  round(feed_w, 2),
            "Slot1_W": round(s1w, 2),
            "Slot1_L": round(s1l, 2),
            "Slot2_W": round(s2w, 2),
            "vswr":    round(float(perf[6]), 2),
            "rad_eff": round(float(perf[4]), 2),
            "gain":    round(float(perf[1]), 2)
        }

    except Exception as e:
        print(f"❌ Titan Optimizer Error: {e}")
        return {
            "Patch_W": 0.0, 
            "Patch_L": 0.0, 
            "error": f"AI Engine Error: {str(e)}"
        }