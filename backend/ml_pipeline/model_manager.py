import os
import sys
import tensorflow as tf

# Standardizing on the internal TF-Keras path for absolute stability
# This avoids the "No module named keras.src" and "LazyLoader" errors entirely
from tensorflow.python.keras.models import load_model
from tensorflow.python.keras.utils.generic_utils import CustomObjectScope

from core.config import FWD_MODEL_PATH, REV_MODEL_PATH

# Define a robust Patch class for DTypePolicy 
# This handles the 'Unknown dtype policy' error often found in .h5 files
class DTypePolicyPatch:
    def __init__(self, name="float32", **kwargs):
        self.name = name
    
    @property
    def compute_dtype(self):
        return self.name

    @property
    def variable_dtype(self):
        return self.name

    @classmethod
    def from_config(cls, config):
        return cls(**config)
        
    def get_config(self):
        return {"name": self.name}

class ModelManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._load_models()
        return cls._instance

    def get_resource_path(self, relative_path):
        """ Handles path resolution for both local dev and PyInstaller EXE """
        try:
            # PyInstaller creates a temp folder and stores path in _MEIPASS
            base_path = sys._MEIPASS
        except Exception:
            base_path = os.path.abspath(".")
        return os.path.join(base_path, str(relative_path))

    def _load_models(self):
        print("🚀 [Vision Guard] Loading Titan AI Models from Disk...")
        
        resolved_fwd_path = self.get_resource_path(FWD_MODEL_PATH)
        resolved_rev_path = self.get_resource_path(REV_MODEL_PATH)

        # Mapping 'DTypePolicy' to our Patch class to satisfy .h5 metadata checks
        custom_objects = {
            'DTypePolicy': DTypePolicyPatch
        }

        try:
            # Using the internal CustomObjectScope to bridge serialization
            with CustomObjectScope(custom_objects):
                if not os.path.exists(resolved_fwd_path):
                    raise FileNotFoundError(f"Forward model missing at: {resolved_fwd_path}")
                
                print(f"📦 Deserializing Forward Model...")
                self.forward_model = load_model(resolved_fwd_path, compile=False)
                
                if not os.path.exists(resolved_rev_path):
                    raise FileNotFoundError(f"Reverse model missing at: {resolved_rev_path}")

                print(f"📦 Deserializing Reverse Model...")
                self.reverse_model = load_model(resolved_rev_path, compile=False)
            
            print(f"✅ Titan Models Loaded Successfully!")
            
        except Exception as e:
            print(f"❌ Critical Error: Could not load .h5 models.")
            print(f"🔍 Reason: {e}")
            print(f"🔍 Attempted FWD Path: {resolved_fwd_path}")
            print(f"🔍 Attempted REV Path: {resolved_rev_path}")
            self.forward_model = None
            self.reverse_model = None

# Initialize the singleton instance for use across the API
model_manager = ModelManager()