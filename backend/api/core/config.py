import os
import sys
from pathlib import Path

# --- EXE-AWARE PATH LOGIC ---
if getattr(sys, 'frozen', False):
    # If running as an EXE, base is the temp extraction folder
    BASE_DIR = Path(sys._MEIPASS)
else:
    # If running as a script, base is the project root (E:\RF)
    # We go up two levels from core/config.py to reach project_root
    BASE_DIR = Path(__file__).resolve().parent.parent

# Asset paths
# Note: In the EXE, these folders will be at the root of the sandbox
MODELS_DIR = BASE_DIR / "trained_models"
DATASETS_DIR = BASE_DIR / "datasets"

# For exports, we want it in the SAME folder as the .exe (on the user's disk)
# Not inside the temporary sandbox which gets deleted!
if getattr(sys, 'frozen', False):
    EXE_LOCATION = Path(sys.executable).parent
    EXPORTS_DIR = EXE_LOCATION / "exports"
else:
    EXPORTS_DIR = BASE_DIR / "exports"

# Model Paths
FWD_MODEL_PATH = MODELS_DIR / "forward_model.h5"
REV_MODEL_PATH = MODELS_DIR / "reverse_model.h5"

# Scaler Paths
SCALER_X_FWD = MODELS_DIR / "scaler_X_fwd.pkl"
SCALER_Y_FWD = MODELS_DIR / "scaler_y_fwd.pkl"
SCALER_X_REV = MODELS_DIR / "scaler_X_rev.pkl"
SCALER_Y_REV = MODELS_DIR / "scaler_y_rev.pkl"

# Dataset Path
DATASET_PATH = DATASETS_DIR / "antenna_data.csv"

# Ensure directories exist (Crucial for exports)
os.makedirs(EXPORTS_DIR, exist_ok=True)